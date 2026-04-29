package com.irms.reservation.domain.repository;

import com.irms.reservation.domain.entity.Reservation;
import com.irms.reservation.domain.entity.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByReservationDate(LocalDate reservationDate);

    List<Reservation> findByStatus(ReservationStatus status);

    List<Reservation> findByReservationDateAndStatus(LocalDate reservationDate, ReservationStatus status);
}
