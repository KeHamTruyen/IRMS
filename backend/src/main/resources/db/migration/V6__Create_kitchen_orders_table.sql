-- Create kitchen_orders table
CREATE TABLE kitchen_orders (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    order_item_id BIGINT NOT NULL,
    menu_item_id BIGINT NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL,
    special_instructions TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    assigned_chef_id BIGINT,
    priority INTEGER,
    received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    estimated_prep_time INTEGER,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (order_item_id) REFERENCES order_items(id),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id),
    FOREIGN KEY (assigned_chef_id) REFERENCES users(id)
);

-- Create indexes
CREATE INDEX idx_kitchen_orders_status ON kitchen_orders(status);
CREATE INDEX idx_kitchen_orders_order_id ON kitchen_orders(order_id);
CREATE INDEX idx_kitchen_orders_assigned_chef_id ON kitchen_orders(assigned_chef_id);
CREATE INDEX idx_kitchen_orders_received_at ON kitchen_orders(received_at);
