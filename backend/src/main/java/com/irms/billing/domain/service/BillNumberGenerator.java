package com.irms.billing.domain.service;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * SRP: Single responsibility - generate bill numbers
 * Extracted from Bill entity to achieve 100% SOLID compliance
 */
@Component
public class BillNumberGenerator {
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");
    
    /**
     * Generate unique bill number
     * Format: BILL-YYYYMMDD-XXXXX
     * 
     * @return Generated bill number
     */
    public String generate() {
        String datePart = LocalDateTime.now().format(DATE_FORMATTER);
        String timePart = String.valueOf(System.currentTimeMillis() % 100000);
        return "BILL-" + datePart + "-" + timePart;
    }
}
