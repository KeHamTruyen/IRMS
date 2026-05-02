package com.irms.table.presentation.controller;

import com.irms.common.dto.ApiResponse;
import com.irms.table.application.dto.TableRequest;
import com.irms.table.application.service.DemoResetService;
import com.irms.table.application.service.ITableService;
import com.irms.table.domain.entity.Table;
import com.irms.table.domain.entity.TableStatus;
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
    
    private final ITableService tableService;
    private final DemoResetService demoResetService;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('SERVER', 'HOST', 'CHEF', 'CASHIER', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Get all tables")
    public ResponseEntity<ApiResponse<List<Table>>> getAllTables(
            @RequestParam(required = false) TableStatus status) {
        
        return ResponseEntity.ok(ApiResponse.success(tableService.getTables(status)));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SERVER', 'HOST', 'CHEF', 'CASHIER', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Get table by ID")
    public ResponseEntity<ApiResponse<Table>> getTable(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(tableService.getTable(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Create table")
    public ResponseEntity<ApiResponse<Table>> createTable(@Valid @RequestBody TableRequest request) {
        return ResponseEntity.ok(ApiResponse.success(tableService.createTable(request), "Tạo bàn thành công"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Update table")
    public ResponseEntity<ApiResponse<Table>> updateTable(
            @PathVariable Long id,
            @Valid @RequestBody TableRequest request) {

        return ResponseEntity.ok(ApiResponse.success(tableService.updateTable(id, request), "Cập nhật bàn thành công"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Delete table")
    public ResponseEntity<ApiResponse<Void>> deleteTable(@PathVariable Long id) {
        tableService.deleteTable(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa bàn thành công"));
    }
    
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SERVER', 'HOST', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Update table status")
    public ResponseEntity<ApiResponse<Table>> updateTableStatus(
            @PathVariable Long id,
            @RequestParam TableStatus status) {
        
        return ResponseEntity.ok(ApiResponse.success(tableService.updateTableStatus(id, status), "Table status updated"));
    }

    @PostMapping("/reset-demo")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Reset demo table state")
    public ResponseEntity<ApiResponse<Void>> resetDemoTableState() {
        demoResetService.resetTableState();
        return ResponseEntity.ok(ApiResponse.success(null, "Đã reset trạng thái bàn demo về trống"));
    }
}
