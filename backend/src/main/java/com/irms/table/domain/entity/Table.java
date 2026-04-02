package com.irms.table.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@jakarta.persistence.Table(name = "tables")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Table {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 10)
    private String tableNumber;
    
    @Column(nullable = false)
    private Integer capacity;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private TableStatus status = TableStatus.AVAILABLE;
    
    @Column(length = 50)
    private String location;
    
    public void markAsOccupied() {
        this.status = TableStatus.OCCUPIED;
    }
    
    public void markAsAvailable() {
        this.status = TableStatus.AVAILABLE;
    }
    
    public void markAsReserved() {
        this.status = TableStatus.RESERVED;
    }
    
    public void markAsCleaning() {
        this.status = TableStatus.CLEANING;
    }
    
    public boolean isAvailable() {
        return this.status == TableStatus.AVAILABLE;
    }
}
