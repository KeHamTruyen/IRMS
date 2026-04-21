package com.irms.order.domain.service;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * SRP: Single responsibility - generate unique order numbers
 * Extracted from Order entity to achieve 100% SOLID compliance
 */
@Component
public class OrderNumberGenerator {
    
    private static final AtomicInteger counter = new AtomicInteger(1);
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static volatile String lastDate = LocalDate.now().format(DATE_FORMAT);
    
    /**
     * Generate a unique order number in the format ORD-yyyyMMdd-XXXX
     * 
     * @return Unique order number string
     */
    public String generate() {
        String currentDate = LocalDate.now().format(DATE_FORMAT);
        if (!currentDate.equals(lastDate)) {
            counter.set(1);
            lastDate = currentDate;
        }
        int num = counter.getAndIncrement();
        return String.format("ORD-%s-%04d", currentDate, num);
    }
}
