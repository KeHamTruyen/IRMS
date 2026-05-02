ALTER TABLE inventory_items
    ALTER COLUMN quantity TYPE DECIMAL(10, 2) USING quantity::DECIMAL(10, 2),
    ALTER COLUMN threshold TYPE DECIMAL(10, 2) USING threshold::DECIMAL(10, 2);
