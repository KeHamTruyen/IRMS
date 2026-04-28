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
        'Quản trị hệ thống',
        'admin@irms.com',
        '0900-000-001',
        'ADMIN',
        'PASSWORD',
        true
    ),
    (
        'manager1',
        NULL,
        '$2a$10$cVSBVVv1KfKky/GS6jcDrOwwGc5SHHsOEb/LHxSN7Q3UEJFkMr1gi',
        'Nguyễn Minh Quản Lý',
        'manager@irms.com',
        '0900-000-002',
        'MANAGER',
        'PIN',
        true
    ),
    (
        'server1',
        NULL,
        '$2a$10$c2pdpEsvHQ5dAmtWf/IOceygloF9e3jk.PG2AaBsr92wAlDLhv4Le',
        'Nguyễn An Phục Vụ',
        'server1@irms.com',
        '0900-000-003',
        'SERVER',
        'PIN',
        true
    ),
    (
        'server2',
        NULL,
        '$2a$10$mdRD9ilR.tRnnhpuoHc/zu1ptFXUQ1PtGhqgeubVGWZCmmwaTgyfm',
        'Trần Huy Phục Vụ',
        'server2@irms.com',
        '0900-000-004',
        'SERVER',
        'PIN',
        true
    ),
    (
        'chef1',
        NULL,
        '$2a$10$gzdj9jHeBBUz6BxN88R3keaxj8jSpv3OYLfYEGs0wXytQkTwmgXXi',
        'Lê Gia Bếp Trưởng',
        'chef1@irms.com',
        '0900-000-005',
        'CHEF',
        'PIN',
        true
    ),
    (
        'chef2',
        NULL,
        '$2a$10$BG/loFayHaxZKx3CQWD36uumbWJVoPCaa8Cjyg/s3GxzxeOO3gP4W',
        'Phạm Mai Bếp Nóng',
        'chef2@irms.com',
        '0900-000-006',
        'CHEF',
        'PIN',
        true
    ),
    (
        'cashier1',
        NULL,
        '$2a$10$YZhu9Iwj/gWM9UZ6asWE.Of4ikUEEGVxRsqAuZNW1YQWVn9B572Wi',
        'Lê Thanh Thu Ngân',
        'cashier@irms.com',
        '0900-000-007',
        'CASHIER',
        'PIN',
        true
    ),
    (
        'host1',
        NULL,
        '$2a$10$5/Bzv7g0GYSuDxo5bxSZAukrhcsq7a3QLKXBHEXEHpFji9rmUXy3K',
        'Phạm Hà Lễ Tân',
        'host@irms.com',
        '0900-000-008',
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
        'Sảnh chính'
    ),
    (
        'T02',
        2,
        'AVAILABLE',
        'Sảnh chính'
    ),
    (
        'T03',
        4,
        'OCCUPIED',
        'Sảnh chính'
    ),
    (
        'T04',
        4,
        'RESERVED',
        'Sảnh chính'
    ),
    (
        'T05',
        4,
        'AVAILABLE',
        'Sảnh chính'
    ),
    (
        'T06',
        6,
        'AVAILABLE',
        'Sảnh chính'
    ),
    (
        'T07',
        6,
        'AVAILABLE',
        'Khu sân vườn'
    ),
    (
        'T08',
        8,
        'OCCUPIED',
        'Phòng riêng'
    ),
    (
        'T09',
        2,
        'AVAILABLE',
        'Khu sân vườn'
    ),
    (
        'T10',
        2,
        'AVAILABLE',
        'Khu sân vườn'
    ),
    (
        'T11',
        4,
        'AVAILABLE',
        'Ban công'
    ),
    (
        'T12',
        4,
        'AVAILABLE',
        'Ban công'
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
    -- Khai vị
    (
        'Gỏi cuốn tôm thịt',
        'Khai vị',
        65000.00,
        'Gỏi cuốn tươi với tôm, thịt ba chỉ, rau thơm và nước chấm đậu phộng.',
        true,
        8,
        'https://source.unsplash.com/800x600/?spring-roll,vietnamese-food'
    ),
    (
        'Chả giò hải sản',
        'Khai vị',
        89000.00,
        'Chả giò giòn nhân tôm mực, dùng kèm rau sống và nước mắm chua ngọt.',
        true,
        12,
        'https://source.unsplash.com/800x600/?fried-spring-roll,seafood'
    ),
    (
        'Salad bò áp chảo',
        'Khai vị',
        125000.00,
        'Bò áp chảo lát mỏng trộn xà lách, cà chua bi và sốt mè rang.',
        true,
        15,
        'https://source.unsplash.com/800x600/?beef-salad'
    ),
    (
        'Khoai lang kén',
        'Khai vị',
        59000.00,
        'Khoai lang kén chiên giòn, vị ngọt nhẹ, dùng kèm sốt mayonnaise.',
        true,
        10,
        'https://source.unsplash.com/800x600/?sweet-potato-fries'
    ),

    -- Món chính
    (
        'Cá hồi sốt chanh dây',
        'Món chính',
        245000.00,
        'Cá hồi áp chảo ăn cùng rau củ nướng và sốt chanh dây chua ngọt.',
        true,
        25,
        'https://source.unsplash.com/800x600/?salmon,dinner'
    ),
    (
        'Bò lúc lắc khoai tây',
        'Món chính',
        219000.00,
        'Bò mềm xào ớt chuông, hành tây, dùng kèm khoai tây chiên và salad.',
        true,
        22,
        'https://source.unsplash.com/800x600/?beef-steak,potato'
    ),
    (
        'Cơm gà Hội An',
        'Món chính',
        135000.00,
        'Cơm nghệ, gà xé, rau răm, hành phi và nước mắm gừng.',
        true,
        18,
        'https://source.unsplash.com/800x600/?chicken-rice'
    ),
    (
        'Mì Ý cua cay',
        'Món chính',
        185000.00,
        'Mì Ý sốt cà chua cay nhẹ với thịt cua, tỏi, ớt và phô mai parmesan.',
        true,
        20,
        'https://source.unsplash.com/800x600/?spaghetti,crab'
    ),
    (
        'Pizza nấm truffle',
        'Món chính',
        229000.00,
        'Pizza đế mỏng với nấm, phô mai mozzarella và dầu truffle.',
        true,
        18,
        'https://source.unsplash.com/800x600/?mushroom-pizza'
    ),
    (
        'Bún bò Huế đặc biệt',
        'Món chính',
        129000.00,
        'Nước dùng đậm vị, bắp bò, chả cua, giò heo và rau sống.',
        true,
        15,
        'https://source.unsplash.com/800x600/?vietnamese-noodle-soup'
    ),

    -- Tráng miệng
    (
        'Tiramisu cà phê Việt',
        'Tráng miệng',
        79000.00,
        'Tiramisu kem mascarpone kết hợp cà phê phin Việt Nam.',
        true,
        5,
        'https://source.unsplash.com/800x600/?tiramisu'
    ),
    (
        'Bánh chocolate lava',
        'Tráng miệng',
        89000.00,
        'Bánh chocolate nóng chảy dùng kèm kem vanilla.',
        true,
        8,
        'https://source.unsplash.com/800x600/?chocolate-lava-cake'
    ),
    (
        'Chè khúc bạch trái cây',
        'Tráng miệng',
        69000.00,
        'Khúc bạch mềm, nhãn, hạnh nhân lát và trái cây theo mùa.',
        true,
        5,
        'https://source.unsplash.com/800x600/?fruit-dessert'
    ),

    -- Đồ uống
    (
        'Trà đào cam sả',
        'Đồ uống',
        59000.00,
        'Trà đào thơm nhẹ với cam vàng, sả tươi và đào ngâm.',
        true,
        4,
        'https://source.unsplash.com/800x600/?peach-tea'
    ),
    (
        'Cà phê sữa đá',
        'Đồ uống',
        45000.00,
        'Cà phê phin đậm vị pha sữa đặc và đá viên.',
        true,
        5,
        'https://source.unsplash.com/800x600/?vietnamese-coffee'
    ),
    (
        'Nước ép cam tươi',
        'Đồ uống',
        55000.00,
        'Cam tươi ép nguyên chất, không thêm đường.',
        true,
        3,
        'https://source.unsplash.com/800x600/?orange-juice'
    ),
    (
        'Soda chanh bạc hà',
        'Đồ uống',
        52000.00,
        'Soda mát lạnh với chanh tươi, bạc hà và syrup đường mía.',
        true,
        3,
        'https://source.unsplash.com/800x600/?lemon-mint-soda'
    ),
    (
        'Latte yến mạch đá',
        'Đồ uống',
        69000.00,
        'Espresso pha sữa yến mạch, vị béo nhẹ và ít ngọt.',
        true,
        5,
        'https://source.unsplash.com/800x600/?iced-latte'
    );

-- Insert inventory items
INSERT INTO
    inventory_items (
        name,
        category,
        unit,
        quantity,
        threshold,
        status
    )
VALUES
    (
        'Phô mai mozzarella',
        'Sữa và phô mai',
        'g',
        1200,
        500,
        'IN_STOCK'
    ),
    (
        'Bò Wagyu',
        'Thịt cá',
        'g',
        900,
        400,
        'IN_STOCK'
    ),
    (
        'Xà lách romaine',
        'Rau củ',
        'g',
        250,
        300,
        'RESTOCKING'
    ),
    (
        'Trà đào',
        'Đồ uống',
        'ml',
        0,
        600,
        'OUT_OF_STOCK'
    ),
    (
        'Bạch tuộc tươi',
        'Thịt cá',
        'g',
        640,
        300,
        'IN_STOCK'
    ),
    (
        'Mascarpone',
        'Sữa và phô mai',
        'g',
        180,
        200,
        'RESTOCKING'
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
        'READY',
        'DINE_IN',
        369000.00,
        'Khách dị ứng hành sống, kiểm tra trước khi lên món.'
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
        665000.00,
        'Bàn sinh nhật, lên món tráng miệng sau cùng.'
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
        269000.00,
        'Khách lấy mang về sau 15 phút.'
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
                name = 'Salad bò áp chảo'
        ),
        1,
        125000.00,
        125000.00,
        'Không hành tây',
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
                name = 'Mì Ý cua cay'
        ),
        1,
        185000.00,
        185000.00,
        'Ít cay',
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
                name = 'Trà đào cam sả'
        ),
        1,
        59000.00,
        59000.00,
        'Ít ngọt',
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
                name = 'Bò lúc lắc khoai tây'
        ),
        2,
        219000.00,
        438000.00,
        'Bò chín vừa',
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
                name = 'Bánh chocolate lava'
        ),
        1,
        89000.00,
        89000.00,
        'Lên sau món chính',
        'PENDING'
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
                name = 'Latte yến mạch đá'
        ),
        2,
        69000.00,
        138000.00,
        'Ít đá',
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
                name = 'Chả giò hải sản'
        ),
        1,
        89000.00,
        89000.00,
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
                name = 'Cơm gà Hội An'
        ),
        1,
        135000.00,
        135000.00,
        'Thêm nước mắm gừng',
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
                name = 'Cà phê sữa đá'
        ),
        1,
        45000.00,
        45000.00,
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
        369000.00,
        36900.00,
        0.00,
        18450.00,
        424350.00,
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
        665000.00,
        66500.00,
        0.00,
        33250.00,
        764750.00,
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
        269000.00,
        26900.00,
        10000.00,
        0.00,
        285900.00,
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
        424350.00,
        'CASH',
        'PENDING',
        NULL,
        NULL,
        NULL,
        'Chờ khách thanh toán tại bàn'
    ),
    (
        (
            SELECT id
            FROM bills
            WHERE
                bill_number = 'BILL-20260427-002'
        ),
        764750.00,
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
        'Đang chờ xác nhận từ máy POS'
    ),
    (
        (
            SELECT id
            FROM bills
            WHERE
                bill_number = 'BILL-20260427-003'
        ),
        285900.00,
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
        'Đã thanh toán bằng ví điện tử'
    );

-- Insert completed and paid orders for analytics testing
INSERT INTO
    orders (
        order_number,
        table_id,
        server_id,
        status,
        order_type,
        total_amount,
        notes,
        created_at,
        updated_at
    )
VALUES
    (
        'ORD-ANALYTICS-TODAY-001',
        (SELECT id FROM tables WHERE table_number = 'T01'),
        (SELECT id FROM users WHERE username = 'server1'),
        'COMPLETED',
        'DINE_IN',
        1250000.00,
        'Đơn hoàn thành dùng để kiểm thử doanh thu hôm nay.',
        CURRENT_DATE + INTERVAL '10 hours',
        CURRENT_DATE + INTERVAL '10 hours 45 minutes'
    ),
    (
        'ORD-ANALYTICS-TODAY-002',
        (SELECT id FROM tables WHERE table_number = 'T02'),
        (SELECT id FROM users WHERE username = 'server2'),
        'COMPLETED',
        'TAKEAWAY',
        820000.00,
        'Đơn mang về đã thanh toán trong ngày.',
        CURRENT_DATE + INTERVAL '14 hours',
        CURRENT_DATE + INTERVAL '14 hours 20 minutes'
    ),
    (
        'ORD-ANALYTICS-YESTERDAY-001',
        (SELECT id FROM tables WHERE table_number = 'T05'),
        (SELECT id FROM users WHERE username = 'server1'),
        'COMPLETED',
        'DINE_IN',
        1460000.00,
        'Đơn hoàn thành dùng để so sánh hôm qua.',
        CURRENT_DATE - INTERVAL '1 day' + INTERVAL '19 hours',
        CURRENT_DATE - INTERVAL '1 day' + INTERVAL '19 hours 35 minutes'
    ),
    (
        'ORD-ANALYTICS-LAST-WEEK-001',
        (SELECT id FROM tables WHERE table_number = 'T06'),
        (SELECT id FROM users WHERE username = 'server2'),
        'COMPLETED',
        'DINE_IN',
        960000.00,
        'Đơn hoàn thành cùng ngày tuần trước.',
        CURRENT_DATE - INTERVAL '7 days' + INTERVAL '12 hours',
        CURRENT_DATE - INTERVAL '7 days' + INTERVAL '12 hours 40 minutes'
    ),
    (
        'ORD-ANALYTICS-LAST-WEEK-002',
        (SELECT id FROM tables WHERE table_number = 'T07'),
        (SELECT id FROM users WHERE username = 'server1'),
        'COMPLETED',
        'DELIVERY',
        540000.00,
        'Đơn giao hàng đã thanh toán trong tuần trước.',
        CURRENT_DATE - INTERVAL '9 days' + INTERVAL '18 hours',
        CURRENT_DATE - INTERVAL '9 days' + INTERVAL '18 hours 20 minutes'
    ),
    (
        'ORD-ANALYTICS-THIS-MONTH-001',
        (SELECT id FROM tables WHERE table_number = 'T09'),
        (SELECT id FROM users WHERE username = 'server2'),
        'COMPLETED',
        'DINE_IN',
        1730000.00,
        'Đơn hoàn thành đầu tháng hiện tại.',
        date_trunc('month', CURRENT_DATE) + INTERVAL '5 days 13 hours',
        date_trunc('month', CURRENT_DATE) + INTERVAL '5 days 13 hours 50 minutes'
    ),
    (
        'ORD-ANALYTICS-LAST-MONTH-001',
        (SELECT id FROM tables WHERE table_number = 'T10'),
        (SELECT id FROM users WHERE username = 'server1'),
        'COMPLETED',
        'DINE_IN',
        1880000.00,
        'Đơn hoàn thành cùng kỳ tháng trước.',
        date_trunc('month', CURRENT_DATE - INTERVAL '1 month') + INTERVAL '5 days 13 hours',
        date_trunc('month', CURRENT_DATE - INTERVAL '1 month') + INTERVAL '5 days 13 hours 55 minutes'
    ),
    (
        'ORD-ANALYTICS-LAST-MONTH-002',
        (SELECT id FROM tables WHERE table_number = 'T11'),
        (SELECT id FROM users WHERE username = 'server2'),
        'COMPLETED',
        'TAKEAWAY',
        690000.00,
        'Đơn mang về đã thanh toán trong tháng trước.',
        date_trunc('month', CURRENT_DATE - INTERVAL '1 month') + INTERVAL '14 days 11 hours',
        date_trunc('month', CURRENT_DATE - INTERVAL '1 month') + INTERVAL '14 days 11 hours 15 minutes'
    ),
    (
        'ORD-ANALYTICS-PENDING-IGNORED',
        (SELECT id FROM tables WHERE table_number = 'T12'),
        (SELECT id FROM users WHERE username = 'server1'),
        'PREPARING',
        'DINE_IN',
        999000.00,
        'Đơn chưa hoàn thành, không được tính vào doanh thu phân tích.',
        CURRENT_DATE + INTERVAL '16 hours',
        CURRENT_DATE + INTERVAL '16 hours 10 minutes'
    ),
    (
        'ORD-ANALYTICS-TODAY-LUNCH-001',
        (SELECT id FROM tables WHERE table_number = 'T03'),
        (SELECT id FROM users WHERE username = 'server1'),
        'COMPLETED',
        'DINE_IN',
        675000.00,
        'Đơn bữa trưa hôm nay dùng để kiểm thử biểu đồ doanh thu và món bán chạy.',
        CURRENT_DATE + INTERVAL '12 hours 30 minutes',
        CURRENT_DATE + INTERVAL '13 hours 5 minutes'
    ),
    (
        'ORD-ANALYTICS-YESTERDAY-002',
        (SELECT id FROM tables WHERE table_number = 'T04'),
        (SELECT id FROM users WHERE username = 'server2'),
        'COMPLETED',
        'TAKEAWAY',
        735000.00,
        'Đơn mang về hôm qua dùng để kiểm thử so sánh ngày.',
        CURRENT_DATE - INTERVAL '1 day' + INTERVAL '12 hours 10 minutes',
        CURRENT_DATE - INTERVAL '1 day' + INTERVAL '12 hours 35 minutes'
    ),
    (
        'ORD-ANALYTICS-THIS-WEEK-001',
        (SELECT id FROM tables WHERE table_number = 'T08'),
        (SELECT id FROM users WHERE username = 'server1'),
        'COMPLETED',
        'DINE_IN',
        1125000.00,
        'Đơn trong tuần hiện tại dùng để kiểm thử doanh thu theo tuần.',
        CURRENT_DATE - ((EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1) * INTERVAL '1 day') + INTERVAL '18 hours',
        CURRENT_DATE - ((EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1) * INTERVAL '1 day') + INTERVAL '18 hours 45 minutes'
    ),
    (
        'ORD-ANALYTICS-THIS-MONTH-002',
        (SELECT id FROM tables WHERE table_number = 'T12'),
        (SELECT id FROM users WHERE username = 'server2'),
        'COMPLETED',
        'DELIVERY',
        905000.00,
        'Đơn giữa tháng hiện tại dùng để kiểm thử doanh thu theo tháng.',
        date_trunc('month', CURRENT_DATE) + INTERVAL '12 days 19 hours',
        date_trunc('month', CURRENT_DATE) + INTERVAL '12 days 19 hours 40 minutes'
    ),
    (
        'ORD-ANALYTICS-LAST-MONTH-003',
        (SELECT id FROM tables WHERE table_number = 'T03'),
        (SELECT id FROM users WHERE username = 'server1'),
        'COMPLETED',
        'DINE_IN',
        1020000.00,
        'Đơn tháng trước dùng để kiểm thử so sánh doanh thu theo tháng.',
        date_trunc('month', CURRENT_DATE - INTERVAL '1 month') + INTERVAL '22 days 20 hours',
        date_trunc('month', CURRENT_DATE - INTERVAL '1 month') + INTERVAL '22 days 20 hours 45 minutes'
    ),
    (
        'ORD-ANALYTICS-UNPAID-IGNORED',
        (SELECT id FROM tables WHERE table_number = 'T04'),
        (SELECT id FROM users WHERE username = 'server2'),
        'COMPLETED',
        'DINE_IN',
        555000.00,
        'Đơn đã hoàn thành nhưng bill chưa thanh toán, không được tính vào doanh thu phân tích.',
        CURRENT_DATE + INTERVAL '17 hours',
        CURRENT_DATE + INTERVAL '17 hours 25 minutes'
    );

-- Insert order items for analytics testing
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
SELECT
    o.id,
    mi.id,
    v.quantity,
    v.unit_price,
    v.subtotal,
    v.special_instructions,
    v.status
FROM (
    VALUES
        ('ORD-ANALYTICS-TODAY-001', 5, 3, 219000.00, 657000.00, 'Bò chín vừa', 'SERVED'),
        ('ORD-ANALYTICS-TODAY-001', 4, 1, 245000.00, 245000.00, NULL, 'SERVED'),
        ('ORD-ANALYTICS-TODAY-001', 2, 1, 125000.00, 125000.00, 'Ít sốt', 'SERVED'),
        ('ORD-ANALYTICS-TODAY-001', 13, 1, 59000.00, 59000.00, 'Ít ngọt', 'SERVED'),
        ('ORD-ANALYTICS-TODAY-002', 7, 2, 185000.00, 370000.00, 'Cay vừa', 'SERVED'),
        ('ORD-ANALYTICS-TODAY-002', 8, 1, 229000.00, 229000.00, NULL, 'SERVED'),
        ('ORD-ANALYTICS-TODAY-002', 17, 2, 69000.00, 138000.00, 'Ít đá', 'SERVED'),
        ('ORD-ANALYTICS-YESTERDAY-001', 4, 2, 245000.00, 490000.00, NULL, 'SERVED'),
        ('ORD-ANALYTICS-YESTERDAY-001', 5, 2, 219000.00, 438000.00, 'Bò chín vừa', 'SERVED'),
        ('ORD-ANALYTICS-YESTERDAY-001', 1, 2, 89000.00, 178000.00, NULL, 'SERVED'),
        ('ORD-ANALYTICS-YESTERDAY-001', 14, 2, 45000.00, 90000.00, 'Ít sữa', 'SERVED'),
        ('ORD-ANALYTICS-LAST-WEEK-001', 8, 2, 229000.00, 458000.00, NULL, 'SERVED'),
        ('ORD-ANALYTICS-LAST-WEEK-001', 7, 1, 185000.00, 185000.00, NULL, 'SERVED'),
        ('ORD-ANALYTICS-LAST-WEEK-001', 10, 3, 79000.00, 237000.00, NULL, 'SERVED'),
        ('ORD-ANALYTICS-LAST-WEEK-002', 9, 2, 129000.00, 258000.00, NULL, 'SERVED'),
        ('ORD-ANALYTICS-LAST-WEEK-002', 0, 2, 65000.00, 130000.00, NULL, 'SERVED'),
        ('ORD-ANALYTICS-LAST-WEEK-002', 16, 2, 52000.00, 104000.00, NULL, 'SERVED'),
        ('ORD-ANALYTICS-THIS-MONTH-001', 4, 3, 245000.00, 735000.00, NULL, 'SERVED'),
        ('ORD-ANALYTICS-THIS-MONTH-001', 5, 2, 219000.00, 438000.00, NULL, 'SERVED'),
        ('ORD-ANALYTICS-THIS-MONTH-001', 11, 2, 89000.00, 178000.00, NULL, 'SERVED'),
        ('ORD-ANALYTICS-THIS-MONTH-001', 13, 4, 59000.00, 236000.00, 'Ít ngọt', 'SERVED'),
        ('ORD-ANALYTICS-LAST-MONTH-001', 8, 4, 229000.00, 916000.00, NULL, 'SERVED'),
        ('ORD-ANALYTICS-LAST-MONTH-001', 6, 3, 135000.00, 405000.00, NULL, 'SERVED'),
        ('ORD-ANALYTICS-LAST-MONTH-001', 12, 3, 69000.00, 207000.00, NULL, 'SERVED'),
        ('ORD-ANALYTICS-LAST-MONTH-002', 7, 2, 185000.00, 370000.00, NULL, 'SERVED'),
        ('ORD-ANALYTICS-LAST-MONTH-002', 1, 2, 89000.00, 178000.00, NULL, 'SERVED'),
        ('ORD-ANALYTICS-LAST-MONTH-002', 15, 2, 55000.00, 110000.00, NULL, 'SERVED'),
        ('ORD-ANALYTICS-PENDING-IGNORED', 5, 2, 219000.00, 438000.00, 'Đang chế biến', 'PREPARING'),
        ('ORD-ANALYTICS-PENDING-IGNORED', 11, 1, 89000.00, 89000.00, NULL, 'PENDING'),
        ('ORD-ANALYTICS-TODAY-LUNCH-001', 6, 3, 135000.00, 405000.00, 'Thêm nước mắm gừng', 'SERVED'),
        ('ORD-ANALYTICS-TODAY-LUNCH-001', 0, 2, 65000.00, 130000.00, NULL, 'SERVED'),
        ('ORD-ANALYTICS-TODAY-LUNCH-001', 14, 2, 45000.00, 90000.00, 'Ít sữa', 'SERVED'),
        ('ORD-ANALYTICS-YESTERDAY-002', 9, 3, 129000.00, 387000.00, NULL, 'SERVED'),
        ('ORD-ANALYTICS-YESTERDAY-002', 12, 2, 69000.00, 138000.00, NULL, 'SERVED'),
        ('ORD-ANALYTICS-YESTERDAY-002', 13, 3, 59000.00, 177000.00, NULL, 'SERVED'),
        ('ORD-ANALYTICS-THIS-WEEK-001', 4, 2, 245000.00, 490000.00, NULL, 'SERVED'),
        ('ORD-ANALYTICS-THIS-WEEK-001', 7, 2, 185000.00, 370000.00, NULL, 'SERVED'),
        ('ORD-ANALYTICS-THIS-WEEK-001', 10, 2, 79000.00, 158000.00, NULL, 'SERVED'),
        ('ORD-ANALYTICS-THIS-MONTH-002', 5, 2, 219000.00, 438000.00, NULL, 'SERVED'),
        ('ORD-ANALYTICS-THIS-MONTH-002', 2, 2, 125000.00, 250000.00, NULL, 'SERVED'),
        ('ORD-ANALYTICS-THIS-MONTH-002', 15, 3, 55000.00, 165000.00, NULL, 'SERVED'),
        ('ORD-ANALYTICS-LAST-MONTH-003', 8, 2, 229000.00, 458000.00, NULL, 'SERVED'),
        ('ORD-ANALYTICS-LAST-MONTH-003', 6, 2, 135000.00, 270000.00, NULL, 'SERVED'),
        ('ORD-ANALYTICS-LAST-MONTH-003', 17, 3, 69000.00, 207000.00, NULL, 'SERVED'),
        ('ORD-ANALYTICS-UNPAID-IGNORED', 4, 1, 245000.00, 245000.00, NULL, 'SERVED'),
        ('ORD-ANALYTICS-UNPAID-IGNORED', 7, 1, 185000.00, 185000.00, NULL, 'SERVED')
) AS v(order_number, menu_offset, quantity, unit_price, subtotal, special_instructions, status)
JOIN orders o ON o.order_number = v.order_number
JOIN (
    SELECT
        id,
        ROW_NUMBER() OVER (ORDER BY id) - 1 AS menu_offset
    FROM menu_items
) mi ON mi.menu_offset = v.menu_offset;

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
        created_at,
        paid_at
    )
VALUES
    (
        'BILL-ANALYTICS-TODAY-001',
        (SELECT id FROM orders WHERE order_number = 'ORD-ANALYTICS-TODAY-001'),
        1100000.00,
        110000.00,
        0.00,
        40000.00,
        1250000.00,
        'PAID',
        CURRENT_DATE + INTERVAL '10 hours 45 minutes',
        CURRENT_DATE + INTERVAL '10 hours 50 minutes'
    ),
    (
        'BILL-ANALYTICS-TODAY-002',
        (SELECT id FROM orders WHERE order_number = 'ORD-ANALYTICS-TODAY-002'),
        760000.00,
        76000.00,
        16000.00,
        0.00,
        820000.00,
        'PAID',
        CURRENT_DATE + INTERVAL '14 hours 20 minutes',
        CURRENT_DATE + INTERVAL '14 hours 25 minutes'
    ),
    (
        'BILL-ANALYTICS-YESTERDAY-001',
        (SELECT id FROM orders WHERE order_number = 'ORD-ANALYTICS-YESTERDAY-001'),
        1320000.00,
        132000.00,
        20000.00,
        28000.00,
        1460000.00,
        'PAID',
        CURRENT_DATE - INTERVAL '1 day' + INTERVAL '19 hours 35 minutes',
        CURRENT_DATE - INTERVAL '1 day' + INTERVAL '19 hours 40 minutes'
    ),
    (
        'BILL-ANALYTICS-LAST-WEEK-001',
        (SELECT id FROM orders WHERE order_number = 'ORD-ANALYTICS-LAST-WEEK-001'),
        880000.00,
        88000.00,
        8000.00,
        0.00,
        960000.00,
        'PAID',
        CURRENT_DATE - INTERVAL '7 days' + INTERVAL '12 hours 40 minutes',
        CURRENT_DATE - INTERVAL '7 days' + INTERVAL '12 hours 45 minutes'
    ),
    (
        'BILL-ANALYTICS-LAST-WEEK-002',
        (SELECT id FROM orders WHERE order_number = 'ORD-ANALYTICS-LAST-WEEK-002'),
        500000.00,
        50000.00,
        10000.00,
        0.00,
        540000.00,
        'PAID',
        CURRENT_DATE - INTERVAL '9 days' + INTERVAL '18 hours 20 minutes',
        CURRENT_DATE - INTERVAL '9 days' + INTERVAL '18 hours 25 minutes'
    ),
    (
        'BILL-ANALYTICS-THIS-MONTH-001',
        (SELECT id FROM orders WHERE order_number = 'ORD-ANALYTICS-THIS-MONTH-001'),
        1580000.00,
        158000.00,
        8000.00,
        0.00,
        1730000.00,
        'PAID',
        date_trunc('month', CURRENT_DATE) + INTERVAL '5 days 13 hours 50 minutes',
        date_trunc('month', CURRENT_DATE) + INTERVAL '5 days 13 hours 55 minutes'
    ),
    (
        'BILL-ANALYTICS-LAST-MONTH-001',
        (SELECT id FROM orders WHERE order_number = 'ORD-ANALYTICS-LAST-MONTH-001'),
        1720000.00,
        172000.00,
        12000.00,
        0.00,
        1880000.00,
        'PAID',
        date_trunc('month', CURRENT_DATE - INTERVAL '1 month') + INTERVAL '5 days 13 hours 55 minutes',
        date_trunc('month', CURRENT_DATE - INTERVAL '1 month') + INTERVAL '5 days 14 hours'
    ),
    (
        'BILL-ANALYTICS-LAST-MONTH-002',
        (SELECT id FROM orders WHERE order_number = 'ORD-ANALYTICS-LAST-MONTH-002'),
        640000.00,
        64000.00,
        14000.00,
        0.00,
        690000.00,
        'PAID',
        date_trunc('month', CURRENT_DATE - INTERVAL '1 month') + INTERVAL '14 days 11 hours 15 minutes',
        date_trunc('month', CURRENT_DATE - INTERVAL '1 month') + INTERVAL '14 days 11 hours 20 minutes'
    ),
    (
        'BILL-ANALYTICS-PENDING-IGNORED',
        (SELECT id FROM orders WHERE order_number = 'ORD-ANALYTICS-PENDING-IGNORED'),
        910000.00,
        91000.00,
        2000.00,
        0.00,
        999000.00,
        'PAID',
        CURRENT_DATE + INTERVAL '16 hours 10 minutes',
        CURRENT_DATE + INTERVAL '16 hours 15 minutes'
    ),
    (
        'BILL-ANALYTICS-TODAY-LUNCH-001',
        (SELECT id FROM orders WHERE order_number = 'ORD-ANALYTICS-TODAY-LUNCH-001'),
        625000.00,
        62500.00,
        12500.00,
        0.00,
        675000.00,
        'PAID',
        CURRENT_DATE + INTERVAL '13 hours 5 minutes',
        CURRENT_DATE + INTERVAL '13 hours 10 minutes'
    ),
    (
        'BILL-ANALYTICS-YESTERDAY-002',
        (SELECT id FROM orders WHERE order_number = 'ORD-ANALYTICS-YESTERDAY-002'),
        702000.00,
        70200.00,
        37200.00,
        0.00,
        735000.00,
        'PAID',
        CURRENT_DATE - INTERVAL '1 day' + INTERVAL '12 hours 35 minutes',
        CURRENT_DATE - INTERVAL '1 day' + INTERVAL '12 hours 40 minutes'
    ),
    (
        'BILL-ANALYTICS-THIS-WEEK-001',
        (SELECT id FROM orders WHERE order_number = 'ORD-ANALYTICS-THIS-WEEK-001'),
        1018000.00,
        101800.00,
        0.00,
        5200.00,
        1125000.00,
        'PAID',
        CURRENT_DATE - ((EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1) * INTERVAL '1 day') + INTERVAL '18 hours 45 minutes',
        CURRENT_DATE - ((EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1) * INTERVAL '1 day') + INTERVAL '18 hours 50 minutes'
    ),
    (
        'BILL-ANALYTICS-THIS-MONTH-002',
        (SELECT id FROM orders WHERE order_number = 'ORD-ANALYTICS-THIS-MONTH-002'),
        853000.00,
        85300.00,
        33300.00,
        0.00,
        905000.00,
        'PAID',
        date_trunc('month', CURRENT_DATE) + INTERVAL '12 days 19 hours 40 minutes',
        date_trunc('month', CURRENT_DATE) + INTERVAL '12 days 19 hours 45 minutes'
    ),
    (
        'BILL-ANALYTICS-LAST-MONTH-003',
        (SELECT id FROM orders WHERE order_number = 'ORD-ANALYTICS-LAST-MONTH-003'),
        935000.00,
        93500.00,
        8500.00,
        0.00,
        1020000.00,
        'PAID',
        date_trunc('month', CURRENT_DATE - INTERVAL '1 month') + INTERVAL '22 days 20 hours 45 minutes',
        date_trunc('month', CURRENT_DATE - INTERVAL '1 month') + INTERVAL '22 days 20 hours 50 minutes'
    ),
    (
        'BILL-ANALYTICS-UNPAID-IGNORED',
        (SELECT id FROM orders WHERE order_number = 'ORD-ANALYTICS-UNPAID-IGNORED'),
        430000.00,
        43000.00,
        0.00,
        0.00,
        555000.00,
        'PENDING',
        CURRENT_DATE + INTERVAL '17 hours 25 minutes',
        NULL
    );

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
SELECT
    b.id,
    b.total_amount,
    'CASH',
    'COMPLETED',
    'TXN-' || b.bill_number,
    b.paid_at,
    (SELECT id FROM users WHERE username = 'cashier1'),
    'Thanh toán seed cho chức năng phân tích doanh thu'
FROM bills b
WHERE
    b.bill_number LIKE 'BILL-ANALYTICS-%'
    AND b.status = 'PAID';

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
                AND mi.name = 'Mì Ý cua cay'
        ),
        (
            SELECT id
            FROM menu_items
            WHERE
                name = 'Mì Ý cua cay'
        ),
        'Mì Ý cua cay',
        1,
        'Ít cay',
        'READY',
        (
            SELECT id
            FROM users
            WHERE
                username = 'chef1'
        ),
        2,
        CURRENT_TIMESTAMP - INTERVAL '20 minutes',
        CURRENT_TIMESTAMP - INTERVAL '5 minutes',
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
                AND mi.name = 'Bò lúc lắc khoai tây'
        ),
        (
            SELECT id
            FROM menu_items
            WHERE
                name = 'Bò lúc lắc khoai tây'
        ),
        'Bò lúc lắc khoai tây',
        2,
        'Bò chín vừa',
        'IN_PROGRESS',
        (
            SELECT id
            FROM users
            WHERE
                username = 'chef2'
        ),
        1,
        CURRENT_TIMESTAMP - INTERVAL '8 minutes',
        NULL,
        22
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
                AND mi.name = 'Bánh chocolate lava'
        ),
        (
            SELECT id
            FROM menu_items
            WHERE
                name = 'Bánh chocolate lava'
        ),
        'Bánh chocolate lava',
        1,
        'Lên sau món chính',
        'PENDING',
        (
            SELECT id
            FROM users
            WHERE
                username = 'chef1'
        ),
        3,
        NULL,
        NULL,
        8
    );
