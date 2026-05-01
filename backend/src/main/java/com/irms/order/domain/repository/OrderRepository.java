package com.irms.order.domain.repository;

import com.irms.order.domain.entity.Order;
import com.irms.order.domain.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    List<Order> findByStatus(OrderStatus status);

    List<Order> findByTableId(Long tableId);

    List<Order> findByServerId(Long serverId);

    @Query("SELECT o FROM Order o WHERE o.status IN :statuses")
    List<Order> findByStatusIn(List<OrderStatus> statuses);

    @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate")
    List<Order> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT o FROM Order o WHERE o.tableId = :tableId AND o.status NOT IN ('COMPLETED', 'CANCELLED')")
    Optional<Order> findActiveOrderByTableId(Long tableId);

    @Query(value = """
            SELECT EXTRACT(HOUR FROM o.created_at) AS hour_of_day, COUNT(*) AS total
            FROM orders o
            WHERE o.created_at BETWEEN :startDate AND :endDate
            GROUP BY hour_of_day
            ORDER BY total DESC
            """, nativeQuery = true)
    List<Object[]> countOrdersByHour(LocalDateTime startDate, LocalDateTime endDate);
}
