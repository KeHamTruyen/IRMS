package com.irms.billing.domain.repository;

import com.irms.billing.domain.entity.Bill;
import com.irms.billing.domain.entity.BillStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    
    Optional<Bill> findByOrderId(Long orderId);
    
    Optional<Bill> findByBillNumber(String billNumber);
    
    List<Bill> findByStatus(BillStatus status);
    
    @Query("SELECT b FROM Bill b WHERE b.createdAt BETWEEN :startDate AND :endDate")
    List<Bill> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT SUM(b.totalAmount) FROM Bill b WHERE b.status = 'PAID' AND b.createdAt BETWEEN :startDate AND :endDate")
    Double getTotalRevenue(LocalDateTime startDate, LocalDateTime endDate);
}
