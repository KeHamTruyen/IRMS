package com.irms.reservation.application.service;

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
    @Transactional(readOnly = true)
    public Reservation getReservationById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", id));
    }

    @Override
    @Transactional
    public Reservation createReservation(Reservation reservation) {
        reservation.setId(null);
        reservation.setStatus(ReservationStatus.PENDING);
        reservation.setTableId(null);
        return reservationRepository.save(reservation);
    }

    @Override
    @Transactional
    public Reservation updateStatus(Long id, ReservationStatus status) {
        Reservation reservation = getReservationById(id);
        reservation.setStatus(status);

        if ((status == ReservationStatus.CANCELLED || status == ReservationStatus.COMPLETED)
                && reservation.getTableId() != null) {
            releaseTable(reservation.getTableId());
        }

        if (status == ReservationStatus.SEATED && reservation.getTableId() != null) {
            occupyTable(reservation.getTableId());
        }

        return reservationRepository.save(reservation);
    }

    @Override
    @Transactional
    public Reservation assignTable(Long id, Long tableId) {
        Reservation reservation = getReservationById(id);
        Table table = tableRepository.findById(tableId)
                .orElseThrow(() -> new ResourceNotFoundException("Table", tableId));

        table.setStatus(TableStatus.RESERVED);
        tableRepository.save(table);

        reservation.setTableId(tableId);
        reservation.setStatus(ReservationStatus.CONFIRMED);
        return reservationRepository.save(reservation);
    }

    private void releaseTable(Long tableId) {
        tableRepository.findById(tableId).ifPresent(table -> {
            table.setStatus(TableStatus.AVAILABLE);
            tableRepository.save(table);
        });
    }

    private void occupyTable(Long tableId) {
        tableRepository.findById(tableId).ifPresent(table -> {
            table.setStatus(TableStatus.OCCUPIED);
            tableRepository.save(table);
        });
    }
}
