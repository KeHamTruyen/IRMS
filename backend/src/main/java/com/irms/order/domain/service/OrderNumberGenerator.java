package com.irms.order.domain.service;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * SRP: Single responsibility - generate order numbers
 * Extracted from Order entity to achieve 100% SOLID compliance
 */
@Component
public class OrderNumberGenerator {
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");
    
    /**
     * Generate unique order number
     * Format: ORD-YYYYMMDD-XXXXX
     * 
     * @return Generated order number
     */
    public String generate() {
        String datePart = LocalDateTime.now().format(DATE_FORMATTER);
        String timePart = String.valueOf(System.currentTimeMillis() % 100000);
        return "ORD-" + datePart + "-" + timePart;
    }
}
