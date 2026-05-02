CREATE UNIQUE INDEX IF NOT EXISTS uq_kitchen_orders_order_item_id
    ON kitchen_orders(order_item_id);

CREATE OR REPLACE FUNCTION create_kitchen_order_for_order_item()
RETURNS TRIGGER AS $$
DECLARE
    menu_item_name VARCHAR(100);
    menu_item_category VARCHAR(50);
    prep_time INTEGER;
    ticket_priority INTEGER;
    order_status VARCHAR(20);
BEGIN
    SELECT status
    INTO order_status
    FROM orders
    WHERE id = NEW.order_id;

    IF order_status NOT IN ('PENDING', 'CONFIRMED', 'PREPARING', 'READY') THEN
        RETURN NEW;
    END IF;

    SELECT name, category, preparation_time
    INTO menu_item_name, menu_item_category, prep_time
    FROM menu_items
    WHERE id = NEW.menu_item_id;

    ticket_priority := CASE
        WHEN UPPER(COALESCE(menu_item_category, '')) IN ('APPETIZER', 'STARTER') THEN 3
        WHEN UPPER(COALESCE(menu_item_category, '')) IN ('MAIN', 'MAIN COURSE') THEN 2
        ELSE 1
    END;

    INSERT INTO kitchen_orders (
        order_id,
        order_item_id,
        menu_item_id,
        item_name,
        quantity,
        special_instructions,
        status,
        priority,
        estimated_prep_time,
        inventory_deducted
    )
    VALUES (
        NEW.order_id,
        NEW.id,
        NEW.menu_item_id,
        menu_item_name,
        NEW.quantity,
        NEW.special_instructions,
        'PENDING',
        ticket_priority,
        prep_time,
        FALSE
    )
    ON CONFLICT (order_item_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_create_kitchen_order_for_order_item ON order_items;

CREATE TRIGGER trg_create_kitchen_order_for_order_item
AFTER INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION create_kitchen_order_for_order_item();

INSERT INTO kitchen_orders (
    order_id,
    order_item_id,
    menu_item_id,
    item_name,
    quantity,
    special_instructions,
    status,
    priority,
    estimated_prep_time,
    inventory_deducted
)
SELECT
    orders.id,
    order_items.id,
    order_items.menu_item_id,
    menu_items.name,
    order_items.quantity,
    order_items.special_instructions,
    'PENDING',
    CASE
        WHEN UPPER(COALESCE(menu_items.category, '')) IN ('APPETIZER', 'STARTER') THEN 3
        WHEN UPPER(COALESCE(menu_items.category, '')) IN ('MAIN', 'MAIN COURSE') THEN 2
        ELSE 1
    END,
    menu_items.preparation_time,
    FALSE
FROM order_items
JOIN orders ON orders.id = order_items.order_id
JOIN menu_items ON menu_items.id = order_items.menu_item_id
LEFT JOIN kitchen_orders ON kitchen_orders.order_item_id = order_items.id
WHERE orders.status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'READY')
  AND kitchen_orders.id IS NULL;
