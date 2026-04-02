package com.irms.kitchen.application.service;

import com.irms.admin.domain.entity.User;
import com.irms.admin.domain.repository.UserRepository;
import com.irms.common.exception.BusinessException;
import com.irms.common.exception.ResourceNotFoundException;
import com.irms.kitchen.domain.entity.KitchenOrder;
import com.irms.kitchen.domain.entity.KitchenOrderStatus;
import com.irms.kitchen.domain.repository.KitchenOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Kitchen service implementation (SRP, DIP)
 * Implements business rules for kitchen workflow
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class KitchenServiceImpl implements IKitchenService {
    
    private final KitchenOrderRepository kitchenOrderRepository;
    private final UserRepository userRepository;
    
    @Override
    @Transactional(readOnly = true)
    public List<KitchenOrder> getAllKitchenOrders() {
        return kitchenOrderRepository.findAll();
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<KitchenOrder> getKitchenOrdersByStatus(KitchenOrderStatus status) {
        return kitchenOrderRepository.findByStatus(status);
    }
    
    @Override
    @Transactional
    public KitchenOrder startPreparation(Long kitchenOrderId) {
        log.info("Starting preparation for kitchen order: {}", kitchenOrderId);
        
        KitchenOrder kitchenOrder = kitchenOrderRepository.findById(kitchenOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("KitchenOrder", kitchenOrderId));
        
        // Business Rule 8: Validate status transition
        if (kitchenOrder.getStatus() != KitchenOrderStatus.PENDING) {
            throw new BusinessException(
                    String.format("Cannot start preparation for order with status: %s", 
                            kitchenOrder.getStatus())
            );
        }
        
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User chef = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        kitchenOrder.startPreparation(chef.getId());
        
        KitchenOrder updated = kitchenOrderRepository.save(kitchenOrder);
        log.info("Kitchen order {} started preparation by chef {}", kitchenOrderId, chef.getFullName());
        
        return updated;
    }
    
    @Override
    @Transactional
    public KitchenOrder markAsReady(Long kitchenOrderId) {
        log.info("Marking kitchen order as ready: {}", kitchenOrderId);
        
        KitchenOrder kitchenOrder = kitchenOrderRepository.findById(kitchenOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("KitchenOrder", kitchenOrderId));
        
        // Business Rule 8: Validate status transition IN_PROGRESS -> READY
        if (kitchenOrder.getStatus() != KitchenOrderStatus.IN_PROGRESS) {
            throw new BusinessException(
                String.format("Cannot mark as ready order with status: %s. Must be IN_PROGRESS", 
                            kitchenOrder.getStatus())
            );
        }
        
        kitchenOrder.markAsReady();
        
        KitchenOrder updated = kitchenOrderRepository.save(kitchenOrder);
        log.info("Kitchen order {} marked as READY", kitchenOrderId);
        
        return updated;
    }
    
    @Override
    @Transactional
    public KitchenOrder markAsServed(Long kitchenOrderId) {
        log.info("Marking kitchen order as served: {}", kitchenOrderId);
        
        KitchenOrder kitchenOrder = kitchenOrderRepository.findById(kitchenOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("KitchenOrder", kitchenOrderId));
        
        // Business Rule 8: Validate status transition READY -> SERVED
        if (kitchenOrder.getStatus() != KitchenOrderStatus.READY) {
            throw new BusinessException(
                    String.format("Cannot mark as served order with status: %s. Must be READY", 
                            kitchenOrder.getStatus())
            );
        }
        
        kitchenOrder.setStatus(KitchenOrderStatus.SERVED);
        
        KitchenOrder updated = kitchenOrderRepository.save(kitchenOrder);
        log.info("Kitchen order {} marked as SERVED", kitchenOrderId);
        
        return updated;
    }
}
