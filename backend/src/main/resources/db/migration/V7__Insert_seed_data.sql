-- Insert default users
-- Admin password: 123

INSERT INTO
    users (
        username,
        password_hash,
        pin_hash,
        full_name,
        email,
        phone,
        role,
        auth_method,
        is_active
    )
VALUES (
        'admin',
        '$2a$10$SH/CVVu3EQ4eB076BgSs8uNpJJam3Pd2zm394BRZUa0PKvITpPTR6',
        NULL,
        'System Administrator',
        'admin@irms.com',
        '555-0001',
        'ADMIN',
        'PASSWORD',
        true
    ),
    (
        'manager1',
        NULL,
        '$2a$10$cVSBVVv1KfKky/GS6jcDrOwwGc5SHHsOEb/LHxSN7Q3UEJFkMr1gi',
        'John Manager',
        'manager@irms.com',
        '555-0002',
        'MANAGER',
        'PIN',
        true
    ),
    (
        'server1',
        NULL,
        '$2a$10$c2pdpEsvHQ5dAmtWf/IOceygloF9e3jk.PG2AaBsr92wAlDLhv4Le',
        'Sarah Server',
        'sarah@irms.com',
        '555-0003',
        'SERVER',
        'PIN',
        true
    ),
    (
        'server2',
        NULL,
        '$2a$10$mdRD9ilR.tRnnhpuoHc/zu1ptFXUQ1PtGhqgeubVGWZCmmwaTgyfm',
        'Mike Server',
        'mike@irms.com',
        '555-0004',
        'SERVER',
        'PIN',
        true
    ),
    (
        'chef1',
        NULL,
        '$2a$10$gzdj9jHeBBUz6BxN88R3keaxj8jSpv3OYLfYEGs0wXytQkTwmgXXi',
        'Chef Gordon',
        'gordon@irms.com',
        '555-0005',
        'CHEF',
        'PIN',
        true
    ),
    (
        'chef2',
        NULL,
        '$2a$10$BG/loFayHaxZKx3CQWD36uumbWJVoPCaa8Cjyg/s3GxzxeOO3gP4W',
        'Chef Maria',
        'maria@irms.com',
        '555-0006',
        'CHEF',
        'PIN',
        true
    ),
    (
        'cashier1',
        NULL,
        '$2a$10$YZhu9Iwj/gWM9UZ6asWE.Of4ikUEEGVxRsqAuZNW1YQWVn9B572Wi',
        'Linda Cashier',
        'linda@irms.com',
        '555-0007',
        'CASHIER',
        'PIN',
        true
    ),
    (
        'host1',
        NULL,
        '$2a$10$5/Bzv7g0GYSuDxo5bxSZAukrhcsq7a3QLKXBHEXEHpFji9rmUXy3K',
        'David Host',
        'david@irms.com',
        '555-0008',
        'HOST',
        'PIN',
        true
    );

-- Insert tables
INSERT INTO
    tables (
        table_number,
        capacity,
        status,
        location
    )
VALUES (
        'T01',
        2,
        'AVAILABLE',
        'Main Hall'
    ),
    (
        'T02',
        2,
        'AVAILABLE',
        'Main Hall'
    ),
    (
        'T03',
        4,
        'OCCUPIED',
        'Main Hall'
    ),
    (
        'T04',
        4,
        'RESERVED',
        'Main Hall'
    ),
    (
        'T05',
        4,
        'AVAILABLE',
        'Main Hall'
    ),
    (
        'T06',
        6,
        'AVAILABLE',
        'Main Hall'
    ),
    (
        'T07',
        6,
        'AVAILABLE',
        'Main Hall'
    ),
    (
        'T08',
        8,
        'OCCUPIED',
        'Private Room'
    ),
    (
        'T09',
        2,
        'AVAILABLE',
        'Terrace'
    ),
    (
        'T10',
        2,
        'AVAILABLE',
        'Terrace'
    ),
    (
        'T11',
        4,
        'AVAILABLE',
        'Terrace'
    ),
    (
        'T12',
        4,
        'AVAILABLE',
        'Terrace'
    );

-- Insert menu items
INSERT INTO
    menu_items (
        name,
        category,
        price,
        description,
        is_available,
        preparation_time,
        image_url
    )
VALUES
    -- Appetizers
    (
        'Bruschetta',
        'Appetizer',
        8.99,
        'Toasted bread with fresh tomatoes, basil, and olive oil',
        true,
        10,
        null
    ),
    (
        'Caesar Salad',
        'Appetizer',
        9.99,
        'Classic Caesar with romaine, croutons, and parmesan',
        true,
        8,
        null
    ),
    (
        'Chicken Wings',
        'Appetizer',
        12.99,
        'Spicy buffalo wings with blue cheese dip',
        true,
        15,
        null
    ),
    (
        'Garlic Bread',
        'Appetizer',
        5.99,
        'Toasted bread with garlic butter and herbs',
        true,
        5,
        null
    ),

-- Main Courses
(
    'Grilled Salmon',
    'Main Course',
    24.99,
    'Fresh Atlantic salmon with vegetables',
    true,
    25,
    null
),
(
    'Beef Steak',
    'Main Course',
    29.99,
    'Premium ribeye steak with mashed potatoes',
    true,
    30,
    null
),
(
    'Chicken Parmesan',
    'Main Course',
    18.99,
    'Breaded chicken with marinara and mozzarella',
    true,
    25,
    null
),
(
    'Pasta Carbonara',
    'Main Course',
    16.99,
    'Classic Italian pasta with bacon and cream sauce',
    true,
    20,
    null
),
(
    'Vegetarian Pizza',
    'Main Course',
    14.99,
    'Pizza with fresh vegetables and mozzarella',
    true,
    18,
    null
),
(
    'Margherita Pizza',
    'Main Course',
    13.99,
    'Classic tomato, mozzarella, and basil pizza',
    true,
    18,
    null
),

-- Desserts
(
    'Tiramisu',
    'Dessert',
    7.99,
    'Classic Italian coffee-flavored dessert',
    true,
    5,
    null
),
(
    'Chocolate Cake',
    'Dessert',
    6.99,
    'Rich chocolate cake with ganache',
    true,
    5,
    null
),
(
    'Ice Cream',
    'Dessert',
    4.99,
    'Vanilla, chocolate, or strawberry',
    true,
    3,
    null
),

-- Beverages
(
    'Coca Cola',
    'Beverage',
    2.99,
    'Classic soft drink',
    true,
    1,
    null
),
(
    'Sprite',
    'Beverage',
    2.99,
    'Lemon-lime soft drink',
    true,
    1,
    null
),
(
    'Orange Juice',
    'Beverage',
    3.99,
    'Fresh squeezed orange juice',
    true,
    2,
    null
),
(
    'Coffee',
    'Beverage',
    2.49,
    'Fresh brewed coffee',
    true,
    3,
    null
),
(
    'Iced Tea',
    'Beverage',
    2.99,
    'Refreshing iced tea',
    true,
    2,
    null
);

-- Insert orders
INSERT INTO
    orders (
        order_number,
        table_id,
        server_id,
        status,
        order_type,
        total_amount,
        notes
    )
VALUES (
        'ORD-20260427-001',
        (
            SELECT id
            FROM tables
            WHERE
                table_number = 'T03'
        ),
        (
            SELECT id
            FROM users
            WHERE
                username = 'server1'
        ),
        'CONFIRMED',
        'DINE_IN',
        42.97,
        'No peanuts for Caesar Salad'
    ),
    (
        'ORD-20260427-002',
        (
            SELECT id
            FROM tables
            WHERE
                table_number = 'T08'
        ),
        (
            SELECT id
            FROM users
            WHERE
                username = 'server2'
        ),
        'PREPARING',
        'DINE_IN',
        61.96,
        'Birthday table, serve dessert together'
    ),
    (
        'ORD-20260427-003',
        NULL,
        (
            SELECT id
            FROM users
            WHERE
                username = 'server1'
        ),
        'COMPLETED',
        'TAKEAWAY',
        19.97,
        'Customer pickup in 15 minutes'
    );

-- Insert order items
INSERT INTO
    order_items (
        order_id,
        menu_item_id,
        quantity,
        unit_price,
        subtotal,
        special_instructions,
        status
    )
VALUES (
        (
            SELECT id
            FROM orders
            WHERE
                order_number = 'ORD-20260427-001'
        ),
        (
            SELECT id
            FROM menu_items
            WHERE
                name = 'Caesar Salad'
        ),
        1,
        9.99,
        9.99,
        'No croutons',
        'READY'
    ),
    (
        (
            SELECT id
            FROM orders
            WHERE
                order_number = 'ORD-20260427-001'
        ),
        (
            SELECT id
            FROM menu_items
            WHERE
                name = 'Pasta Carbonara'
        ),
        1,
        16.99,
        16.99,
        NULL,
        'PREPARING'
    ),
    (
        (
            SELECT id
            FROM orders
            WHERE
                order_number = 'ORD-20260427-001'
        ),
        (
            SELECT id
            FROM menu_items
            WHERE
                name = 'Iced Tea'
        ),
        2,
        2.99,
        5.98,
        'Less ice',
        'SERVED'
    ),
    (
        (
            SELECT id
            FROM orders
            WHERE
                order_number = 'ORD-20260427-002'
        ),
        (
            SELECT id
            FROM menu_items
            WHERE
                name = 'Beef Steak'
        ),
        2,
        29.99,
        59.98,
        'Medium rare',
        'PREPARING'
    ),
    (
        (
            SELECT id
            FROM orders
            WHERE
                order_number = 'ORD-20260427-002'
        ),
        (
            SELECT id
            FROM menu_items
            WHERE
                name = 'Coffee'
        ),
        1,
        2.49,
        2.49,
        NULL,
        'PENDING'
    ),
    (
        (
            SELECT id
            FROM orders
            WHERE
                order_number = 'ORD-20260427-003'
        ),
        (
            SELECT id
            FROM menu_items
            WHERE
                name = 'Chicken Wings'
        ),
        1,
        12.99,
        12.99,
        NULL,
        'SERVED'
    ),
    (
        (
            SELECT id
            FROM orders
            WHERE
                order_number = 'ORD-20260427-003'
        ),
        (
            SELECT id
            FROM menu_items
            WHERE
                name = 'Coca Cola'
        ),
        2,
        2.99,
        5.98,
        NULL,
        'SERVED'
    );

-- Insert bills
INSERT INTO
    bills (
        bill_number,
        order_id,
        subtotal,
        tax,
        discount,
        service_charge,
        total_amount,
        status,
        paid_at
    )
VALUES (
        'BILL-20260427-001',
        (
            SELECT id
            FROM orders
            WHERE
                order_number = 'ORD-20260427-001'
        ),
        42.97,
        4.30,
        0.00,
        2.15,
        49.42,
        'PENDING',
        NULL
    ),
    (
        'BILL-20260427-002',
        (
            SELECT id
            FROM orders
            WHERE
                order_number = 'ORD-20260427-002'
        ),
        61.96,
        6.20,
        0.00,
        3.10,
        71.26,
        'PENDING',
        NULL
    ),
    (
        'BILL-20260427-003',
        (
            SELECT id
            FROM orders
            WHERE
                order_number = 'ORD-20260427-003'
        ),
        19.97,
        2.00,
        0.00,
        0.00,
        21.97,
        'PAID',
        CURRENT_TIMESTAMP - INTERVAL '1 hour'
    );

-- Insert payments
INSERT INTO
    payments (
        bill_id,
        amount,
        payment_method,
        status,
        transaction_id,
        processed_at,
        processed_by,
        notes
    )
VALUES (
        (
            SELECT id
            FROM bills
            WHERE
                bill_number = 'BILL-20260427-001'
        ),
        49.42,
        'CASH',
        'PENDING',
        NULL,
        NULL,
        NULL,
        'Awaiting payment at cashier'
    ),
    (
        (
            SELECT id
            FROM bills
            WHERE
                bill_number = 'BILL-20260427-002'
        ),
        71.26,
        'CREDIT_CARD',
        'PROCESSING',
        'TXN-20260427-9002',
        CURRENT_TIMESTAMP,
        (
            SELECT id
            FROM users
            WHERE
                username = 'cashier1'
        ),
        'Card authorization in progress'
    ),
    (
        (
            SELECT id
            FROM bills
            WHERE
                bill_number = 'BILL-20260427-003'
        ),
        21.97,
        'DIGITAL_WALLET',
        'COMPLETED',
        'TXN-20260427-9003',
        CURRENT_TIMESTAMP - INTERVAL '1 hour',
        (
            SELECT id
            FROM users
            WHERE
                username = 'cashier1'
        ),
        'Paid via e-wallet'
    );

-- Insert kitchen orders
INSERT INTO
    kitchen_orders (
        order_id,
        order_item_id,
        menu_item_id,
        item_name,
        quantity,
        special_instructions,
        status,
        assigned_chef_id,
        priority,
        started_at,
        completed_at,
        estimated_prep_time
    )
VALUES (
        (
            SELECT id
            FROM orders
            WHERE
                order_number = 'ORD-20260427-001'
        ),
        (
            SELECT oi.id
            FROM
                order_items oi
                JOIN orders o ON o.id = oi.order_id
                JOIN menu_items mi ON mi.id = oi.menu_item_id
            WHERE
                o.order_number = 'ORD-20260427-001'
                AND mi.name = 'Pasta Carbonara'
        ),
        (
            SELECT id
            FROM menu_items
            WHERE
                name = 'Pasta Carbonara'
        ),
        'Pasta Carbonara',
        1,
        NULL,
        'IN_PROGRESS',
        (
            SELECT id
            FROM users
            WHERE
                username = 'chef1'
        ),
        2,
        CURRENT_TIMESTAMP - INTERVAL '8 minutes',
        NULL,
        20
    ),
    (
        (
            SELECT id
            FROM orders
            WHERE
                order_number = 'ORD-20260427-002'
        ),
        (
            SELECT oi.id
            FROM
                order_items oi
                JOIN orders o ON o.id = oi.order_id
                JOIN menu_items mi ON mi.id = oi.menu_item_id
            WHERE
                o.order_number = 'ORD-20260427-002'
                AND mi.name = 'Beef Steak'
        ),
        (
            SELECT id
            FROM menu_items
            WHERE
                name = 'Beef Steak'
        ),
        'Beef Steak',
        2,
        'Medium rare',
        'PENDING',
        (
            SELECT id
            FROM users
            WHERE
                username = 'chef2'
        ),
        1,
        NULL,
        NULL,
        30
    ),
    (
        (
            SELECT id
            FROM orders
            WHERE
                order_number = 'ORD-20260427-001'
        ),
        (
            SELECT oi.id
            FROM
                order_items oi
                JOIN orders o ON o.id = oi.order_id
                JOIN menu_items mi ON mi.id = oi.menu_item_id
            WHERE
                o.order_number = 'ORD-20260427-001'
                AND mi.name = 'Caesar Salad'
        ),
        (
            SELECT id
            FROM menu_items
            WHERE
                name = 'Caesar Salad'
        ),
        'Caesar Salad',
        1,
        'No croutons',
        'READY',
        (
            SELECT id
            FROM users
            WHERE
                username = 'chef1'
        ),
        3,
        CURRENT_TIMESTAMP - INTERVAL '20 minutes',
        CURRENT_TIMESTAMP - INTERVAL '12 minutes',
        8
    );