package com.irms.table.application.service;

import com.irms.common.exception.BusinessException;
import com.irms.common.exception.ResourceNotFoundException;
import com.irms.table.application.dto.TableRequest;
import com.irms.table.domain.entity.Table;
import com.irms.table.domain.entity.TableStatus;
import com.irms.table.domain.repository.TableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TableServiceImpl implements ITableService {

    private final TableRepository tableRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Table> getTables(TableStatus status) {
        return status != null ? tableRepository.findByStatus(status) : tableRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Table getTable(Long id) {
        return tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table", id));
    }

    @Override
    @Transactional
    public Table createTable(TableRequest request) {
        ensureTableNumberIsUnique(request.getTableNumber(), null);

        Table table = Table.builder()
                .tableNumber(request.getTableNumber())
                .capacity(request.getCapacity())
                .status(request.getStatus())
                .location(request.getLocation())
                .build();

        return tableRepository.save(table);
    }

    @Override
    @Transactional
    public Table updateTable(Long id, TableRequest request) {
        Table table = getTable(id);
        ensureTableNumberIsUnique(request.getTableNumber(), id);

        table.setTableNumber(request.getTableNumber());
        table.setCapacity(request.getCapacity());
        table.setStatus(request.getStatus());
        table.setLocation(request.getLocation());

        return tableRepository.save(table);
    }

    @Override
    @Transactional
    public void deleteTable(Long id) {
        if (!tableRepository.existsById(id)) {
            throw new ResourceNotFoundException("Table", id);
        }

        tableRepository.deleteById(id);
    }

    @Override
    @Transactional
    public Table updateTableStatus(Long id, TableStatus status) {
        Table table = getTable(id);

        switch (status) {
            case AVAILABLE -> table.markAsAvailable();
            case OCCUPIED -> table.markAsOccupied();
            case RESERVED -> table.markAsReserved();
            case CLEANING -> table.markAsCleaning();
        }

        return tableRepository.save(table);
    }

    private void ensureTableNumberIsUnique(String tableNumber, Long currentTableId) {
        tableRepository.findByTableNumber(tableNumber)
                .filter(existing -> currentTableId == null || !existing.getId().equals(currentTableId))
                .ifPresent(existing -> {
                    throw new BusinessException("Số bàn đã tồn tại");
                });
    }
}
