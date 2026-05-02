package com.irms.order.domain.service;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

/**
 * SRP: Single responsibility - generate unique order numbers
 * Extracted from Order entity to achieve 100% SOLID compliance
 */
@Component
public class OrderNumberGenerator {
    
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HHmmssSSS");
    
    /**
     * Generate a unique order number in the format ORD-yyyyMMdd-XXXX
     * 
     * @return Unique order number string
     */
    public String generate() {
        return String.format(
                "ORD-%s-%s-%04d",
                LocalDate.now().format(DATE_FORMAT),
                LocalTime.now().format(TIME_FORMAT),
                Math.abs(System.nanoTime() % 10000));
    }
}
