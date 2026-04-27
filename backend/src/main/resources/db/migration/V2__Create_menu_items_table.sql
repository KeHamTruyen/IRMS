-- Create menu_items table
CREATE TABLE menu_items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    preparation_time INTEGER,
    image_url VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_menu_items_is_available ON menu_items(is_available);

-- Create inventory_items table
CREATE TABLE inventory_items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    threshold INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'IN_STOCK',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_inventory_items_category ON inventory_items(category);
CREATE INDEX idx_inventory_items_status ON inventory_items(status);
