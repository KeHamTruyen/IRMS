package com.irms.reservation.application.service;

import com.irms.reservation.domain.entity.Reservation;
import com.irms.reservation.domain.entity.ReservationStatus;

import java.time.LocalDate;
import java.util.List;

public interface IReservationService {

    List<Reservation> getReservations(LocalDate date, ReservationStatus status);

    Reservation getReservationById(Long id);

    Reservation createReservation(Reservation reservation);

    Reservation updateStatus(Long id, ReservationStatus status);

    Reservation assignTable(Long id, Long tableId);
}
