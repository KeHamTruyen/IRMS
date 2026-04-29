package com.irms.reservation.application.service;

import com.irms.common.exception.ResourceNotFoundException;
import com.irms.reservation.domain.entity.Reservation;
import com.irms.reservation.domain.entity.ReservationStatus;
import com.irms.reservation.domain.repository.ReservationRepository;
import com.irms.table.domain.entity.Table;
import com.irms.table.domain.entity.TableStatus;
import com.irms.table.domain.repository.TableRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReservationServiceImplTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private TableRepository tableRepository;

    @InjectMocks
    private ReservationServiceImpl reservationService;

    @Test
    void getReservationsShouldFilterByDateAndStatusWhenProvided() {
        LocalDate date = LocalDate.now();
        when(reservationRepository.findByReservationDateAndStatus(date, ReservationStatus.PENDING))
                .thenReturn(List.of(Reservation.builder().id(1L).build()));

        List<Reservation> results = reservationService.getReservations(date, ReservationStatus.PENDING);

        assertEquals(1, results.size());
        verify(reservationRepository).findByReservationDateAndStatus(date, ReservationStatus.PENDING);
    }

    @Test
    void createReservationShouldForcePendingStatusAndClearTable() {
        Reservation input = Reservation.builder()
                .id(99L)
                .customerName("Alice")
                .status(ReservationStatus.COMPLETED)
                .tableId(5L)
                .build();

        when(reservationRepository.save(any(Reservation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Reservation created = reservationService.createReservation(input);

        assertEquals(ReservationStatus.PENDING, created.getStatus());
        assertEquals(null, created.getTableId());
        assertEquals(null, created.getId());
        verify(reservationRepository).save(created);
    }

    @Test
    void assignTableShouldSetTableReservedAndReservationConfirmed() {
        Reservation reservation = Reservation.builder()
                .id(1L)
                .status(ReservationStatus.PENDING)
                .build();
        Table table = Table.builder()
                .id(10L)
                .status(TableStatus.AVAILABLE)
                .build();

        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));
        when(tableRepository.findById(10L)).thenReturn(Optional.of(table));
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Reservation updated = reservationService.assignTable(1L, 10L);

        assertEquals(10L, updated.getTableId());
        assertEquals(ReservationStatus.CONFIRMED, updated.getStatus());
        assertEquals(TableStatus.RESERVED, table.getStatus());
        verify(tableRepository).save(table);
        verify(reservationRepository).save(reservation);
    }

    @Test
    void updateStatusShouldReleaseTableWhenCancelled() {
        Reservation reservation = Reservation.builder()
                .id(1L)
                .status(ReservationStatus.CONFIRMED)
                .tableId(10L)
                .build();
        Table table = Table.builder()
                .id(10L)
                .status(TableStatus.RESERVED)
                .build();

        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));
        when(tableRepository.findById(10L)).thenReturn(Optional.of(table));
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Reservation updated = reservationService.updateStatus(1L, ReservationStatus.CANCELLED);

        assertEquals(ReservationStatus.CANCELLED, updated.getStatus());
        assertEquals(TableStatus.AVAILABLE, table.getStatus());
        verify(tableRepository).save(table);
    }

    @Test
    void getReservationByIdShouldThrowWhenMissing() {
        when(reservationRepository.findById(404L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> reservationService.getReservationById(404L));
    }
}
