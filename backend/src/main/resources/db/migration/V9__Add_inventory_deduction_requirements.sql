ALTER TABLE kitchen_orders
    ADD COLUMN IF NOT EXISTS inventory_deducted BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS menu_item_inventory_requirements (
    id BIGSERIAL PRIMARY KEY,
    menu_item_id BIGINT NOT NULL,
    inventory_item_id BIGINT NOT NULL,
    quantity_per_menu_item INTEGER NOT NULL,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
    FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
    CONSTRAINT uq_menu_inventory_requirement UNIQUE (menu_item_id, inventory_item_id)
);

CREATE INDEX IF NOT EXISTS idx_menu_inventory_requirements_menu_item_id
    ON menu_item_inventory_requirements(menu_item_id);

INSERT INTO menu_item_inventory_requirements (menu_item_id, inventory_item_id, quantity_per_menu_item)
SELECT mi.id, ii.id, v.quantity_per_menu_item
FROM (
    VALUES
        ('Pizza nấm truffle', 'Phô mai mozzarella', 120),
        ('Bò lúc lắc khoai tây', 'Bò Wagyu', 180),
        ('Salad bò áp chảo', 'Bò Wagyu', 120),
        ('Salad bò áp chảo', 'Xà lách romaine', 80),
        ('Trà đào cam sả', 'Trà đào', 120),
        ('Tiramisu cà phê Việt', 'Mascarpone', 60),
        ('Mì Ý cua cay', 'Bạch tuộc tươi', 100)
) AS v(menu_item_name, inventory_item_name, quantity_per_menu_item)
JOIN menu_items mi ON mi.name = v.menu_item_name
JOIN inventory_items ii ON ii.name = v.inventory_item_name
ON CONFLICT (menu_item_id, inventory_item_id) DO NOTHING;
