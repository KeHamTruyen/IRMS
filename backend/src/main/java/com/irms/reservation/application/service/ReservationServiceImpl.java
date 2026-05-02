package com.irms.reservation.application.service;

import com.irms.common.exception.BusinessException;
import com.irms.common.exception.ResourceNotFoundException;
import com.irms.reservation.domain.entity.Reservation;
import com.irms.reservation.domain.entity.ReservationStatus;
import com.irms.reservation.domain.repository.ReservationRepository;
import com.irms.table.domain.entity.Table;
import com.irms.table.domain.entity.TableStatus;
import com.irms.table.domain.repository.TableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements IReservationService {

    private final ReservationRepository reservationRepository;
    private final TableRepository tableRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Reservation> getReservations(LocalDate date, ReservationStatus status) {
        if (date != null && status != null) {
            return reservationRepository.findByReservationDateAndStatus(date, status);
        }
        if (date != null) {
            return reservationRepository.findByReservationDate(date);
        }
        if (status != null) {
            return reservationRepository.findByStatus(status);
        }
        return reservationRepository.findAll();
    }

    @Override
    @Transactional
    public Reservation createReservation(Reservation reservation) {
        if (reservation.getStatus() == null) {
            reservation.setStatus(ReservationStatus.PENDING);
        }
        return reservationRepository.save(reservation);
    }

    @Override
    @Transactional
    public Reservation updateStatus(Long id, ReservationStatus status) {
        Reservation reservation = getReservation(id);

        switch (status) {
            case CONFIRMED -> reservation.setStatus(ReservationStatus.CONFIRMED);
            case SEATED -> seatReservation(reservation);
            case CANCELLED, NO_SHOW -> closeReservation(reservation, status);
            case PENDING -> reservation.setStatus(ReservationStatus.PENDING);
        }

        return reservationRepository.save(reservation);
    }

    @Override
    @Transactional
    public Reservation assignTable(Long id, Long tableId) {
        Reservation reservation = getReservation(id);
        Table table = getTable(tableId);

        if (reservation.getStatus() == ReservationStatus.CANCELLED || reservation.getStatus() == ReservationStatus.NO_SHOW) {
            throw new BusinessException("Không thể gán bàn cho đặt bàn đã kết thúc");
        }
        if (table.getStatus() == TableStatus.OCCUPIED) {
            throw new BusinessException("Bàn đang có khách, không thể gán đặt bàn");
        }
        if (table.getStatus() == TableStatus.RESERVED && !table.getId().equals(reservation.getTableId())) {
            throw new BusinessException("Bàn đã được giữ cho khách khác");
        }

        releasePreviouslyAssignedTable(reservation, table.getId());

        reservation.setTableId(table.getId());
        if (reservation.getStatus() == ReservationStatus.PENDING) {
            reservation.setStatus(ReservationStatus.CONFIRMED);
        }
        table.markAsReserved();
        tableRepository.save(table);

        return reservationRepository.save(reservation);
    }

    private void seatReservation(Reservation reservation) {
        if (reservation.getTableId() == null) {
            throw new BusinessException("Cần gán bàn trước khi cho khách vào bàn");
        }

        Table table = getTable(reservation.getTableId());
        if (table.getStatus() == TableStatus.OCCUPIED) {
            throw new BusinessException("Bàn đang có khách");
        }

        table.markAsOccupied();
        tableRepository.save(table);
        reservation.setStatus(ReservationStatus.SEATED);
    }

    private void closeReservation(Reservation reservation, ReservationStatus status) {
        if (reservation.getTableId() != null) {
            Table table = getTable(reservation.getTableId());
            if (table.getStatus() == TableStatus.RESERVED) {
                table.markAsAvailable();
                tableRepository.save(table);
            }
        }
        reservation.setStatus(status);
    }

    private void releasePreviouslyAssignedTable(Reservation reservation, Long nextTableId) {
        Long currentTableId = reservation.getTableId();
        if (currentTableId == null || currentTableId.equals(nextTableId)) {
            return;
        }

        Table currentTable = getTable(currentTableId);
        if (currentTable.getStatus() == TableStatus.RESERVED) {
            currentTable.markAsAvailable();
            tableRepository.save(currentTable);
        }
    }

    private Reservation getReservation(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", id));
    }

    private Table getTable(Long id) {
        return tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table", id));
    }
}
