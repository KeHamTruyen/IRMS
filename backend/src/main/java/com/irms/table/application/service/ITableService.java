package com.irms.table.application.service;

import com.irms.table.application.dto.TableRequest;
import com.irms.table.domain.entity.Table;
import com.irms.table.domain.entity.TableStatus;

import java.util.List;

public interface ITableService {

    List<Table> getTables(TableStatus status);

    Table getTable(Long id);

    Table createTable(TableRequest request);

    Table updateTable(Long id, TableRequest request);

    void deleteTable(Long id);

    Table updateTableStatus(Long id, TableStatus status);
}
