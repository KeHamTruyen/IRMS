package com.irms.table.presentation.controller;

import com.irms.common.dto.ApiResponse;
import com.irms.common.exception.ResourceNotFoundException;
import com.irms.table.domain.entity.Table;
import com.irms.table.domain.entity.TableStatus;
import com.irms.table.domain.repository.TableRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
@Tag(name = "Tables", description = "Table management APIs")
public class TableController {
    
    private final TableRepository tableRepository;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('SERVER', 'HOST', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Get all tables")
    public ResponseEntity<ApiResponse<List<Table>>> getAllTables(
            @RequestParam(required = false) TableStatus status) {
        
        List<Table> tables = status != null 
                ? tableRepository.findByStatus(status)
                : tableRepository.findAll();
        
        return ResponseEntity.ok(ApiResponse.success(tables));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SERVER', 'HOST', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Get table by ID")
    public ResponseEntity<ApiResponse<Table>> getTable(@PathVariable Long id) {
        Table table = tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table", id));
        return ResponseEntity.ok(ApiResponse.success(table));
    }
    
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SERVER', 'HOST', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Update table status")
    public ResponseEntity<ApiResponse<Table>> updateTableStatus(
            @PathVariable Long id,
            @RequestParam TableStatus status) {
        
        Table table = tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table", id));
        
        switch (status) {
            case AVAILABLE -> table.markAsAvailable();
            case OCCUPIED -> table.markAsOccupied();
            case RESERVED -> table.markAsReserved();
            case CLEANING -> table.markAsCleaning();
        }
        
        Table updated = tableRepository.save(table);
        
        return ResponseEntity.ok(ApiResponse.success(updated, "Table status updated"));
    }
}
