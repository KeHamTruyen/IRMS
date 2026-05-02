package com.irms.inventory.application.service;

import com.irms.kitchen.domain.entity.KitchenOrder;

public interface IInventoryDeductionService {

    void deductForKitchenOrder(KitchenOrder kitchenOrder);
}
