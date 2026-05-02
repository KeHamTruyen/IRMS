package com.irms.reservation.presentation.controller;

import com.irms.common.dto.ApiResponse;
import com.irms.reservation.application.service.IReservationService;
import com.irms.reservation.domain.entity.Reservation;
import com.irms.reservation.domain.entity.ReservationStatus;
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

    private final IReservationService reservationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('HOST', 'SERVER', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<Reservation>>> getReservations(
            @RequestParam(required = false) LocalDate date,
            @RequestParam(required = false) ReservationStatus status) {
        return ResponseEntity.ok(ApiResponse.success(reservationService.getReservations(date, status)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('HOST', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Reservation>> createReservation(@RequestBody Reservation reservation) {
        Reservation saved = reservationService.createReservation(reservation);
        return ResponseEntity.ok(ApiResponse.success(saved, "Reservation created"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('HOST', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Reservation>> updateStatus(
            @PathVariable Long id,
            @RequestParam ReservationStatus status) {
        return ResponseEntity.ok(ApiResponse.success(reservationService.updateStatus(id, status)));
    }

    @PatchMapping("/{id}/table")
    @PreAuthorize("hasAnyRole('HOST', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Reservation>> assignTable(
            @PathVariable Long id,
            @RequestParam Long tableId) {
        return ResponseEntity.ok(ApiResponse.success(reservationService.assignTable(id, tableId)));
    }
}
