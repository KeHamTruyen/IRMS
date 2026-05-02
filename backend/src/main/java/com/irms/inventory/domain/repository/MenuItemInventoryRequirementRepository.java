package com.irms.inventory.domain.repository;

import com.irms.inventory.domain.entity.MenuItemInventoryRequirement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemInventoryRequirementRepository extends JpaRepository<MenuItemInventoryRequirement, Long> {

    List<MenuItemInventoryRequirement> findByMenuItemId(Long menuItemId);
}
