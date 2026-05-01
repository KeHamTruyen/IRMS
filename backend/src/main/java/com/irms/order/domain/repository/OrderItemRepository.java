package com.irms.order.domain.repository;

import com.irms.order.domain.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query(value = """
            SELECT oi.menu_item_id, mi.name, SUM(oi.quantity) AS total_quantity
            FROM order_items oi
            JOIN menu_items mi ON mi.id = oi.menu_item_id
            JOIN orders o ON o.id = oi.order_id
            JOIN bills b ON b.order_id = o.id
            WHERE o.created_at BETWEEN :startDate AND :endDate
              AND o.status = 'COMPLETED'
              AND b.status = 'PAID'
            GROUP BY oi.menu_item_id, mi.name
            ORDER BY total_quantity DESC
            LIMIT 10
            """, nativeQuery = true)
    List<Object[]> findTopSellingItems(LocalDateTime startDate, LocalDateTime endDate);
}
