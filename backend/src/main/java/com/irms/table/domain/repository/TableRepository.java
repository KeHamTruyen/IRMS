package com.irms.table.domain.repository;

import com.irms.table.domain.entity.Table;
import com.irms.table.domain.entity.TableStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TableRepository extends JpaRepository<Table, Long> {
    
    Optional<Table> findByTableNumber(String tableNumber);
    
    List<Table> findByStatus(TableStatus status);
    
    List<Table> findByCapacityGreaterThanEqual(Integer capacity);
    
    List<Table> findByLocation(String location);
}
