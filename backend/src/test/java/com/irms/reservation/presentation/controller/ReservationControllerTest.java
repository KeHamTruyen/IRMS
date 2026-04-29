package com.irms.reservation.presentation.controller;

import com.irms.common.dto.ApiResponse;
import com.irms.reservation.application.service.IReservationService;
import com.irms.reservation.domain.entity.Reservation;
import com.irms.reservation.domain.entity.ReservationStatus;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReservationControllerTest {

    @Mock
    private IReservationService reservationService;

    @InjectMocks
    private ReservationController reservationController;

    @Test
    void getReservationsShouldReturnApiResponseWithData() {
        LocalDate date = LocalDate.now();
        Reservation reservation = Reservation.builder().id(1L).customerName("Alice").build();
        when(reservationService.getReservations(date, ReservationStatus.PENDING)).thenReturn(List.of(reservation));

        ResponseEntity<ApiResponse<List<Reservation>>> response =
                reservationController.getReservations(date, ReservationStatus.PENDING);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals(1, response.getBody().getData().size());
        verify(reservationService).getReservations(date, ReservationStatus.PENDING);
    }

    @Test
    void createReservationShouldReturnCreatedStatus() {
        Reservation input = Reservation.builder().customerName("Bob").build();
        Reservation created = Reservation.builder().id(10L).customerName("Bob").build();
        when(reservationService.createReservation(input)).thenReturn(created);

        ResponseEntity<ApiResponse<Reservation>> response = reservationController.createReservation(input);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Reservation created successfully", response.getBody().getMessage());
        assertEquals(10L, response.getBody().getData().getId());
        verify(reservationService).createReservation(input);
    }

    @Test
    void updateStatusShouldReturnUpdatedReservation() {
        Reservation updated = Reservation.builder().id(2L).status(ReservationStatus.CONFIRMED).build();
        when(reservationService.updateStatus(2L, ReservationStatus.CONFIRMED)).thenReturn(updated);

        ResponseEntity<ApiResponse<Reservation>> response =
                reservationController.updateStatus(2L, ReservationStatus.CONFIRMED);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Reservation status updated", response.getBody().getMessage());
        assertEquals(ReservationStatus.CONFIRMED, response.getBody().getData().getStatus());
        verify(reservationService).updateStatus(2L, ReservationStatus.CONFIRMED);
    }

    @Test
    void assignTableShouldReturnUpdatedReservation() {
        Reservation updated = Reservation.builder().id(3L).tableId(9L).status(ReservationStatus.CONFIRMED).build();
        when(reservationService.assignTable(3L, 9L)).thenReturn(updated);

        ResponseEntity<ApiResponse<Reservation>> response = reservationController.assignTable(3L, 9L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Table assigned successfully", response.getBody().getMessage());
        assertEquals(9L, response.getBody().getData().getTableId());
        verify(reservationService).assignTable(3L, 9L);
    }
}
