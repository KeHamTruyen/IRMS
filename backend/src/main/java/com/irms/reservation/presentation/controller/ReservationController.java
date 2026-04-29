package com.irms.reservation.presentation.controller;

import com.irms.common.dto.ApiResponse;
import com.irms.reservation.application.service.IReservationService;
import com.irms.reservation.domain.entity.Reservation;
import com.irms.reservation.domain.entity.ReservationStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
@Tag(name = "Reservations", description = "Reservation management APIs")
public class ReservationController {

    private final IReservationService reservationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('HOST', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Get reservations")
    public ResponseEntity<ApiResponse<List<Reservation>>> getReservations(
            @RequestParam(required = false) LocalDate date,
            @RequestParam(required = false) ReservationStatus status) {

        return ResponseEntity.ok(ApiResponse.success(reservationService.getReservations(date, status)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('HOST', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Create reservation")
    public ResponseEntity<ApiResponse<Reservation>> createReservation(@Valid @RequestBody Reservation reservation) {
        Reservation created = reservationService.createReservation(reservation);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Reservation created successfully"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('HOST', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Update reservation status")
    public ResponseEntity<ApiResponse<Reservation>> updateStatus(
            @PathVariable Long id,
            @RequestParam ReservationStatus status) {

        Reservation updated = reservationService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(updated, "Reservation status updated"));
    }

    @PatchMapping("/{id}/assign-table")
    @PreAuthorize("hasAnyRole('HOST', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Assign table to reservation")
    public ResponseEntity<ApiResponse<Reservation>> assignTable(
            @PathVariable Long id,
            @RequestParam Long tableId) {

        Reservation updated = reservationService.assignTable(id, tableId);
        return ResponseEntity.ok(ApiResponse.success(updated, "Table assigned successfully"));
    }
}
