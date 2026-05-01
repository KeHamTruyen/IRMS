package com.irms.reservation.domain.repository;

import com.irms.reservation.domain.entity.Reservation;
import com.irms.reservation.domain.entity.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByStatus(ReservationStatus status);

    List<Reservation> findByReservationDate(LocalDate reservationDate);

    List<Reservation> findByReservationDateAndStatus(LocalDate reservationDate, ReservationStatus status);
}
