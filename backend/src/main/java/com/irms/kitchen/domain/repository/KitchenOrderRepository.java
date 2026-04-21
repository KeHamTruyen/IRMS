package com.irms.kitchen.domain.repository;

import com.irms.kitchen.domain.entity.KitchenOrder;
import com.irms.kitchen.domain.entity.KitchenOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KitchenOrderRepository extends JpaRepository<KitchenOrder, Long> {
    
    List<KitchenOrder> findByStatus(KitchenOrderStatus status);
    
    List<KitchenOrder> findByOrderId(Long orderId);

    boolean existsByOrderItemId(Long orderItemId);
    
    List<KitchenOrder> findByAssignedChefId(Long chefId);
    
    @Query("SELECT ko FROM KitchenOrder ko WHERE ko.status IN ('PENDING', 'IN_PROGRESS') ORDER BY ko.priority DESC, ko.receivedAt ASC")
    List<KitchenOrder> findActiveOrders();
}
