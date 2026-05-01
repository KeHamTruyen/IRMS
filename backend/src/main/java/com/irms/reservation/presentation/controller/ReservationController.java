package com.irms.reservation.presentation.controller;

import com.irms.common.dto.ApiResponse;
import com.irms.common.exception.ResourceNotFoundException;
import com.irms.reservation.domain.entity.Reservation;
import com.irms.reservation.domain.entity.ReservationStatus;
import com.irms.reservation.domain.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationRepository reservationRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('HOST', 'SERVER', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<Reservation>>> getReservations(
            @RequestParam(required = false) LocalDate date,
            @RequestParam(required = false) ReservationStatus status) {
        List<Reservation> reservations;
        if (date != null && status != null) {
            reservations = reservationRepository.findByReservationDateAndStatus(date, status);
        } else if (date != null) {
            reservations = reservationRepository.findByReservationDate(date);
        } else if (status != null) {
            reservations = reservationRepository.findByStatus(status);
        } else {
            reservations = reservationRepository.findAll();
        }
        return ResponseEntity.ok(ApiResponse.success(reservations));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('HOST', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Reservation>> createReservation(@RequestBody Reservation reservation) {
        Reservation saved = reservationRepository.save(reservation);
        return ResponseEntity.ok(ApiResponse.success(saved, "Reservation created"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('HOST', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Reservation>> updateStatus(
            @PathVariable Long id,
            @RequestParam ReservationStatus status) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", id));
        reservation.setStatus(status);
        return ResponseEntity.ok(ApiResponse.success(reservationRepository.save(reservation)));
    }

    @PatchMapping("/{id}/table")
    @PreAuthorize("hasAnyRole('HOST', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Reservation>> assignTable(
            @PathVariable Long id,
            @RequestParam Long tableId) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", id));
        reservation.setTableId(tableId);
        return ResponseEntity.ok(ApiResponse.success(reservationRepository.save(reservation)));
    }
}
