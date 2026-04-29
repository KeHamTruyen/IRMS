-- Seed reservations
INSERT INTO reservations (customer_name, customer_phone, guest_count, reservation_date, reservation_time, status, table_id, notes)
VALUES
('Alice Johnson', '555-1010', 4, CURRENT_DATE, '19:00', 'CONFIRMED', 4, 'Window seat preferred'),
('Bob Smith', '555-2020', 6, CURRENT_DATE, '20:30', 'PENDING', NULL, 'Birthday celebration'),
('Carol White', '555-3030', 2, CURRENT_DATE + INTERVAL '1 day', '18:00', 'CONFIRMED', 9, NULL),
('David Brown', '555-4040', 8, CURRENT_DATE + INTERVAL '1 day', '19:30', 'PENDING', NULL, 'Corporate dinner');

-- Seed inventory items
INSERT INTO inventory_items (name, category, quantity, unit, min_stock, last_restocked)
VALUES
('Tomatoes', 'Vegetables', 25, 'kg', 10, CURRENT_TIMESTAMP - INTERVAL '2 days'),
('Mozzarella Cheese', 'Dairy', 5, 'kg', 8, CURRENT_TIMESTAMP - INTERVAL '1 day'),
('Salmon Fillet', 'Seafood', 15, 'kg', 5, CURRENT_TIMESTAMP - INTERVAL '1 day'),
('Beef Patty', 'Meat', 30, 'pieces', 20, CURRENT_TIMESTAMP - INTERVAL '3 days'),
('Pasta', 'Dry Goods', 8, 'kg', 10, CURRENT_TIMESTAMP - INTERVAL '5 days');
