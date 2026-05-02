package com.irms.table.application.service;

import com.irms.billing.domain.entity.Bill;
import com.irms.billing.domain.entity.BillStatus;
import com.irms.billing.domain.repository.BillRepository;
import com.irms.kitchen.domain.entity.KitchenOrder;
import com.irms.kitchen.domain.entity.KitchenOrderStatus;
import com.irms.kitchen.domain.repository.KitchenOrderRepository;
import com.irms.order.domain.entity.Order;
import com.irms.order.domain.entity.OrderStatus;
import com.irms.order.domain.repository.OrderRepository;
import com.irms.table.domain.entity.Table;
import com.irms.table.domain.repository.TableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class DemoResetService {

    private static final Set<OrderStatus> OPEN_ORDER_STATUSES = Set.of(
            OrderStatus.PENDING,
            OrderStatus.CONFIRMED,
            OrderStatus.PREPARING,
            OrderStatus.READY,
            OrderStatus.SERVED);

    private final TableRepository tableRepository;
    private final OrderRepository orderRepository;
    private final BillRepository billRepository;
    private final KitchenOrderRepository kitchenOrderRepository;

    @Transactional
    public void resetTableState() {
        cancelOpenOrders();
        cancelOpenBills();
        closeActiveKitchenOrders();
        markTablesAvailable();
    }

    private void cancelOpenOrders() {
        List<Order> openOrders = orderRepository.findAll().stream()
                .filter(order -> OPEN_ORDER_STATUSES.contains(order.getStatus()))
                .peek(order -> order.setStatus(OrderStatus.CANCELLED))
                .toList();

        orderRepository.saveAll(openOrders);
    }

    private void cancelOpenBills() {
        List<Bill> openBills = billRepository.findAll().stream()
                .filter(bill -> bill.getStatus() == BillStatus.PENDING || bill.getStatus() == BillStatus.PARTIALLY_PAID)
                .peek(bill -> bill.setStatus(BillStatus.CANCELLED))
                .toList();

        billRepository.saveAll(openBills);
    }

    private void closeActiveKitchenOrders() {
        List<KitchenOrder> activeKitchenOrders = kitchenOrderRepository.findAll().stream()
                .filter(order -> order.getStatus() == KitchenOrderStatus.PENDING
                        || order.getStatus() == KitchenOrderStatus.IN_PROGRESS
                        || order.getStatus() == KitchenOrderStatus.READY)
                .peek(order -> order.setStatus(KitchenOrderStatus.SERVED))
                .toList();

        kitchenOrderRepository.saveAll(activeKitchenOrders);
    }

    private void markTablesAvailable() {
        List<Table> tables = tableRepository.findAll().stream()
                .peek(Table::markAsAvailable)
                .toList();

        tableRepository.saveAll(tables);
    }
}
