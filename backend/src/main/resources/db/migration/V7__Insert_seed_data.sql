-- Insert default users (password is 'password123' for all)
-- BCrypt hash for 'password123': $2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG

INSERT INTO users (username, password_hash, full_name, email, phone, role, is_active) VALUES
('admin', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'System Administrator', 'admin@irms.com', '555-0001', 'ADMIN', true),
('manager1', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'John Manager', 'manager@irms.com', '555-0002', 'MANAGER', true),
('server1', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Sarah Server', 'sarah@irms.com', '555-0003', 'SERVER', true),
('server2', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Mike Server', 'mike@irms.com', '555-0004', 'SERVER', true),
('chef1', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Chef Gordon', 'gordon@irms.com', '555-0005', 'CHEF', true),
('chef2', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Chef Maria', 'maria@irms.com', '555-0006', 'CHEF', true),
('cashier1', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Linda Cashier', 'linda@irms.com', '555-0007', 'CASHIER', true),
('host1', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'David Host', 'david@irms.com', '555-0008', 'HOST', true);

-- Insert tables
INSERT INTO tables (table_number, capacity, status, location) VALUES
('T01', 2, 'AVAILABLE', 'Main Hall'),
('T02', 2, 'AVAILABLE', 'Main Hall'),
('T03', 4, 'AVAILABLE', 'Main Hall'),
('T04', 4, 'AVAILABLE', 'Main Hall'),
('T05', 4, 'AVAILABLE', 'Main Hall'),
('T06', 6, 'AVAILABLE', 'Main Hall'),
('T07', 6, 'AVAILABLE', 'Main Hall'),
('T08', 8, 'AVAILABLE', 'Private Room'),
('T09', 2, 'AVAILABLE', 'Terrace'),
('T10', 2, 'AVAILABLE', 'Terrace'),
('T11', 4, 'AVAILABLE', 'Terrace'),
('T12', 4, 'AVAILABLE', 'Terrace');

-- Insert menu items
INSERT INTO menu_items (name, category, price, description, is_available, preparation_time, image_url) VALUES
-- Appetizers
('Bruschetta', 'Appetizer', 8.99, 'Toasted bread with fresh tomatoes, basil, and olive oil', true, 10, null),
('Caesar Salad', 'Appetizer', 9.99, 'Classic Caesar with romaine, croutons, and parmesan', true, 8, null),
('Chicken Wings', 'Appetizer', 12.99, 'Spicy buffalo wings with blue cheese dip', true, 15, null),
('Garlic Bread', 'Appetizer', 5.99, 'Toasted bread with garlic butter and herbs', true, 5, null),

-- Main Courses
('Grilled Salmon', 'Main Course', 24.99, 'Fresh Atlantic salmon with vegetables', true, 25, null),
('Beef Steak', 'Main Course', 29.99, 'Premium ribeye steak with mashed potatoes', true, 30, null),
('Chicken Parmesan', 'Main Course', 18.99, 'Breaded chicken with marinara and mozzarella', true, 25, null),
('Pasta Carbonara', 'Main Course', 16.99, 'Classic Italian pasta with bacon and cream sauce', true, 20, null),
('Vegetarian Pizza', 'Main Course', 14.99, 'Pizza with fresh vegetables and mozzarella', true, 18, null),
('Margherita Pizza', 'Main Course', 13.99, 'Classic tomato, mozzarella, and basil pizza', true, 18, null),

-- Desserts
('Tiramisu', 'Dessert', 7.99, 'Classic Italian coffee-flavored dessert', true, 5, null),
('Chocolate Cake', 'Dessert', 6.99, 'Rich chocolate cake with ganache', true, 5, null),
('Ice Cream', 'Dessert', 4.99, 'Vanilla, chocolate, or strawberry', true, 3, null),

-- Beverages
('Coca Cola', 'Beverage', 2.99, 'Classic soft drink', true, 1, null),
('Sprite', 'Beverage', 2.99, 'Lemon-lime soft drink', true, 1, null),
('Orange Juice', 'Beverage', 3.99, 'Fresh squeezed orange juice', true, 2, null),
('Coffee', 'Beverage', 2.49, 'Fresh brewed coffee', true, 3, null),
('Iced Tea', 'Beverage', 2.99, 'Refreshing iced tea', true, 2, null);
