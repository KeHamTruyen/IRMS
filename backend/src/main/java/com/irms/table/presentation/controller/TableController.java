package com.irms.table.presentation.controller;

import com.irms.common.dto.ApiResponse;
import com.irms.common.exception.BusinessException;
import com.irms.common.exception.ResourceNotFoundException;
import com.irms.table.application.dto.TableRequest;
import com.irms.table.domain.entity.Table;
import com.irms.table.domain.entity.TableStatus;
import com.irms.table.domain.repository.TableRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
@Tag(name = "Tables", description = "Table management APIs")
public class TableController {
    
    private final TableRepository tableRepository;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('SERVER', 'HOST', 'CHEF', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Get all tables")
    public ResponseEntity<ApiResponse<List<Table>>> getAllTables(
            @RequestParam(required = false) TableStatus status) {
        
        List<Table> tables = status != null 
                ? tableRepository.findByStatus(status)
                : tableRepository.findAll();
        
        return ResponseEntity.ok(ApiResponse.success(tables));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SERVER', 'HOST', 'CHEF', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Get table by ID")
    public ResponseEntity<ApiResponse<Table>> getTable(@PathVariable Long id) {
        Table table = tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table", id));
        return ResponseEntity.ok(ApiResponse.success(table));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Create table")
    public ResponseEntity<ApiResponse<Table>> createTable(@Valid @RequestBody TableRequest request) {
        if (tableRepository.findByTableNumber(request.getTableNumber()).isPresent()) {
            throw new BusinessException("Số bàn đã tồn tại");
        }

        Table table = Table.builder()
                .tableNumber(request.getTableNumber())
                .capacity(request.getCapacity())
                .status(request.getStatus())
                .location(request.getLocation())
                .build();

        Table created = tableRepository.save(table);
        return ResponseEntity.ok(ApiResponse.success(created, "Tạo bàn thành công"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Update table")
    public ResponseEntity<ApiResponse<Table>> updateTable(
            @PathVariable Long id,
            @Valid @RequestBody TableRequest request) {

        Table table = tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table", id));

        tableRepository.findByTableNumber(request.getTableNumber())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new BusinessException("Số bàn đã tồn tại");
                });

        table.setTableNumber(request.getTableNumber());
        table.setCapacity(request.getCapacity());
        table.setStatus(request.getStatus());
        table.setLocation(request.getLocation());

        Table updated = tableRepository.save(table);
        return ResponseEntity.ok(ApiResponse.success(updated, "Cập nhật bàn thành công"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Delete table")
    public ResponseEntity<ApiResponse<Void>> deleteTable(@PathVariable Long id) {
        if (!tableRepository.existsById(id)) {
            throw new ResourceNotFoundException("Table", id);
        }

        tableRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa bàn thành công"));
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
