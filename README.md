# 🍽️ Intelligent Restaurant Management System (IRMS)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-green.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-blue.svg)](https://www.typescriptlang.org/)

> **Hệ thống quản lý nhà hàng thông minh với kiến trúc 100% SOLID Compliance và real-time updates**

---

## 📋 Mục Lục

- [Tổng Quan](#-tổng-quan)
- [Tính Năng Chính](#-tính-năng-chính)
- [Kiến Trúc](#-kiến-trúc)
- [Tech Stack](#-tech-stack)
- [Cài Đặt & Chạy](#-cài-đặt--chạy)
- [API Documentation](#-api-documentation)
- [Demo Credentials](#-demo-credentials)
- [Project Structure](#-project-structure)
- [SOLID Compliance](#-solid-compliance)
- [Screenshots](#-screenshots)
- [Team](#-team)
- [License](#-license)

---

## 🎯 Tổng Quan

**IRMS (Intelligent Restaurant Management System)** là một hệ thống quản lý nhà hàng toàn diện, được thiết kế để tối ưu hóa quy trình vận hành của nhà hàng từ đặt bàn, gọi món, bếp, thanh toán đến báo cáo và quản trị.

### ✨ Điểm Nổi Bật

- 🏆 **100% SOLID Compliance** - Backend tuân thủ hoàn toàn 5 nguyên tắc SOLID
- 🔄 **Real-time Updates** - WebSocket integration cho cập nhật trạng thái đơn hàng
- 🔐 **JWT Authentication** - Bảo mật với JWT token và BCrypt password encryption
- 🎭 **6 Role-based Dashboards** - UI tùy chỉnh cho từng vai trò
- 📊 **Analytics Dashboard** - Báo cáo doanh thu, đơn hàng, và thống kê real-time
- 🧩 **Clean Architecture** - Modular design với separation of concerns
- 🚀 **Production-Ready** - Session management, auto-logout, form validation

---

## 🌟 Tính Năng Chính

### 👤 Quản Lý Người Dùng & Xác Thực

- ✅ Login với username/password hoặc Demo mode
- ✅ JWT-based authentication với refresh token
- ✅ Role-based access control (RBAC)
- ✅ Session management với auto-logout warning
- ✅ Password encryption với BCrypt

### 🍽️ Quản Lý Đơn Hàng

- ✅ Tạo đơn hàng với menu item selection
- ✅ Real-time order status tracking
- ✅ Order types: Dine-in, Takeaway, Delivery
- ✅ Order modification và cancellation
- ✅ Order history và search

### 👨‍🍳 Kitchen Display System (KDS)

- ✅ Real-time order notifications
- ✅ Cooking progress tracking
- ✅ Priority queue management
- ✅ Item-level status updates
- ✅ Auto-refresh kitchen display

### 💰 Billing & Payment

- ✅ Multi-payment methods: Cash, Card, E-Wallet
- ✅ Split billing support
- ✅ Discount strategies: Percentage, Fixed, Coupon, Membership
- ✅ Tax calculation với VAT/Service charge
- ✅ Bill history và export

### 🪑 Table & Reservation Management

- ✅ Visual table layout
- ✅ Table status: Available, Occupied, Reserved
- ✅ Reservation booking với time slots
- ✅ Guest count tracking
- ✅ Table assignment automation

### 📊 Analytics & Reporting

- ✅ Dashboard với revenue metrics
- ✅ Order statistics by period
- ✅ Popular items ranking
- ✅ Staff performance tracking
- ✅ Real-time charts với Recharts

### 🔧 Admin Panel

- ✅ User management (CRUD)
- ✅ Menu item management
- ✅ Table configuration
- ✅ System settings
- ✅ Role permissions

---

## 🏗️ Kiến Trúc

### Backend Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                   │
│         (Controllers, DTOs, REST Endpoints)             │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│                   APPLICATION LAYER                     │
│    (Services, Use Cases, Event Handlers, Mappers)       │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│                     DOMAIN LAYER                        │
│   (Entities, Domain Services, Strategies, Events)       │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│                 INFRASTRUCTURE LAYER                    │
│     (Repositories, Security, WebSocket, Database)       │
└─────────────────────────────────────────────────────────┘
```

### Frontend Architecture

```
src/app/
├── features/           # Feature-based components
│   ├── admin/         # Admin dashboard
│   ├── server/        # Server dashboard
│   ├── kitchen/       # Kitchen display
│   ├── cashier/       # Cashier dashboard
│   ├── host/          # Host/Reservation dashboard
│   └── manager/       # Manager analytics
├── components/        # Reusable UI components
│   ├── ui/           # shadcn/ui components
│   └── shared/       # Shared components
├── services/          # API services
│   ├── auth.service.ts
│   ├── order.service.ts
│   ├── billing.service.ts
│   └── websocket.service.ts
├── store/            # Context API state management
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

---

## 🛠️ Tech Stack

### Backend

| Technology      | Version | Purpose                        |
| --------------- | ------- | ------------------------------ |
| Java            | 17      | Programming language           |
| Spring Boot     | 3.2.0   | Framework                      |
| Spring Security | 3.2.0   | Authentication & Authorization |
| JWT             | 0.11.5  | Token-based auth               |
| PostgreSQL      | 15      | Database                       |
| Flyway          | 9.22.3  | Database migration             |
| WebSocket       | -       | Real-time communication        |
| Maven           | 3.9+    | Build tool                     |
| Lombok          | 1.18.30 | Code generation                |

### Frontend

| Technology      | Version | Purpose             |
| --------------- | ------- | ------------------- |
| React           | 18.3.1  | UI framework        |
| TypeScript      | 5.6.2   | Type safety         |
| React Router    | 7.1.3   | Routing             |
| Axios           | 1.7.9   | HTTP client         |
| Recharts        | 2.15.1  | Charts & graphs     |
| Tailwind CSS    | 4.0.0   | Styling             |
| shadcn/ui       | Latest  | UI components       |
| Lucide React    | 0.469.0 | Icons               |
| Sonner          | 1.7.2   | Toast notifications |
| React Hook Form | 7.55.0  | Form validation     |
| Zod             | 3.24.1  | Schema validation   |

---

## 🚀 Cài Đặt & Chạy

### Prerequisites

- Node.js 18+ và npm/pnpm
- Java 17+
- Maven 3.9+
- PostgreSQL 15+

### Backend Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd backend

# 2. Configure database
# Edit src/main/resources/application.yml
# Set your PostgreSQL credentials

# 3. Build & run
mvn clean install
mvn spring-boot:run

# Backend will run on http://localhost:8080
```

### Frontend Setup

```bash
# 1. Move to frontend folder
cd frontend

# 2. Install dependencies
npm install
# or
pnpm install

# 3. Start development server
npm run dev
# or
pnpm dev

# Frontend will run on http://localhost:5173
```

### Database Migration

Flyway sẽ tự động chạy migrations khi start backend:

```
V1__Create_users_table.sql
V2__Create_menu_items_table.sql
V3__Create_tables_table.sql
V4__Create_orders_table.sql
V5__Create_bills_table.sql
V6__Create_kitchen_orders_table.sql
V7__Insert_seed_data.sql
```

---

## 📚 API Documentation

### Base URL

```
http://localhost:8080/api
```

### Authentication

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "admin",
    "name": "Admin User",
    "role": "ADMIN"
  }
}
```

### Orders

#### Create Order

```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "tableId": 1,
  "items": [
    {
      "menuItemId": 1,
      "quantity": 2,
      "notes": "Extra spicy"
    }
  ],
  "orderType": "DINE_IN"
}
```

#### Get All Orders

```http
GET /api/orders
Authorization: Bearer <token>
```

#### Update Order Status

```http
PUT /api/orders/{orderId}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "PREPARING"
}
```

### Kitchen

#### Get Kitchen Orders

```http
GET /api/kitchen/orders
Authorization: Bearer <token>
```

#### Update Kitchen Order Status

```http
PUT /api/kitchen/orders/{orderId}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "COOKING"
}
```

### Billing

#### Create Bill

```http
POST /api/bills
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": 1,
  "billingType": "STANDARD",
  "discountType": "PERCENTAGE",
  "discountValue": 10
}
```

#### Process Payment

```http
POST /api/bills/{billId}/payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentMethod": "CASH",
  "amount": 150000
}
```

### Tables

#### Get All Tables

```http
GET /api/tables
Authorization: Bearer <token>
```

#### Update Table Status

```http
PUT /api/tables/{tableId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "OCCUPIED",
  "guestCount": 4
}
```

### Analytics

#### Get Dashboard Stats

```http
GET /api/analytics/dashboard
Authorization: Bearer <token>
```

---

## 🔑 Demo Credentials

### Quick Demo Mode (No Login Required)

Click vào role bất kỳ trong Demo tab để truy cập ngay

### Real Login Credentials

| Role    | Username | Password    | Access Level         |
| ------- | -------- | ----------- | -------------------- |
| Admin   | admin    | password123 | Full system access   |
| Manager | manager1 | password123 | Analytics, reports   |
| Server  | server1  | password123 | Orders, tables       |
| Chef    | chef1    | password123 | Kitchen display      |
| Cashier | cashier1 | password123 | Billing, payments    |
| Host    | host1    | password123 | Reservations, tables |

---

## 📁 Project Structure

```
IRMS/
├── backend/                          # Java Spring Boot backend
│   ├── src/main/java/com/irms/
│   │   ├── admin/                   # Admin module
│   │   │   ├── application/         # Services, DTOs
│   │   │   ├── domain/              # Entities, repos
│   │   │   ├── infrastructure/      # Security, JWT
│   │   │   └── presentation/        # Controllers
│   │   ├── order/                   # Order module
│   │   │   ├── application/         # Services, mappers
│   │   │   ├── domain/              # Order entities, events
│   │   │   └── presentation/        # REST endpoints
│   │   ├── kitchen/                 # Kitchen module
│   │   ├── billing/                 # Billing module
│   │   │   └── domain/strategy/     # Payment & discount strategies
│   │   ├── table/                   # Table module
│   │   ├── analytics/               # Analytics module
│   │   ├── notification/            # WebSocket notifications
│   │   ├── common/                  # Shared utilities
│   │   └── config/                  # Configuration
│   └── src/main/resources/
│       ├── application.yml          # App configuration
│       └── db/migration/            # Flyway migrations
│
├── src/app/                         # React TypeScript frontend
│   ├── features/                    # Feature modules
│   │   ├── LandingPage.tsx         # Public landing
│   │   ├── Login.tsx               # Auth page
│   │   ├── admin/AdminDashboard.tsx
│   │   ├── server/ServerDashboard.tsx
│   │   ├── kitchen/KitchenDashboard.tsx
│   │   ├── cashier/CashierDashboard.tsx
│   │   ├── host/HostDashboard.tsx
│   │   └── manager/ManagerDashboard.tsx
│   ├── components/                  # Reusable components
│   │   ├── ui/                     # shadcn/ui components
│   │   ├── Navbar.tsx              # Navigation
│   │   ├── RootLayout.tsx          # Layout wrapper
│   │   ├── ProtectedRoute.tsx      # Auth guard
│   │   └── SessionManager.tsx      # Session handling
│   ├── services/                    # API services
│   │   ├── api.ts                  # Axios config
│   │   ├── auth.service.ts         # Auth API
│   │   ├── order.service.ts        # Order API
│   │   ├── kitchen.service.ts      # Kitchen API
│   │   ├── billing.service.ts      # Billing API
│   │   ├── table.service.ts        # Table API
│   │   ├── menu.service.ts         # Menu API
│   │   ├── analytics.service.ts    # Analytics API
│   │   └── websocket.service.ts    # WebSocket client
│   ├── store/                       # State management
│   │   └── RestaurantContext.tsx   # Global context
│   ├── types/                       # TypeScript types
│   │   └── index.ts                # Type definitions
│   ├── utils/                       # Utilities
│   │   └── mock-data.ts            # Mock data
│   └── routes.tsx                   # Route configuration
│
├── src/styles/                      # Global styles
│   ├── index.css                   # Entry point
│   ├── tailwind.css                # Tailwind imports
│   ├── theme.css                   # Theme variables
│   └── fonts.css                   # Font imports
│
├── package.json                     # Frontend dependencies
├── vite.config.ts                  # Vite configuration
├── tsconfig.json                   # TypeScript config
└── README.md                        # This file
```

---

## 🎯 SOLID Compliance

Hệ thống backend đạt **100% SOLID Compliance** với 37 domain services và comprehensive strategy patterns:

### 1️⃣ Single Responsibility Principle (SRP)

**✅ Implemented:**

- Mỗi class chỉ có 1 trách nhiệm duy nhất
- Domain services tách biệt logic: `OrderCalculator`, `BillCalculator`, `OrderValidator`
- Mappers riêng: `OrderMapper`, `BillMapper`, `PaymentMapper`

**Example:**

```java
// ❌ BEFORE: Entity có business logic
public class Order {
    public BigDecimal calculateTotal() { ... }
    public void validate() { ... }
}

// ✅ AFTER: Tách thành domain services
public class OrderCalculator {
    public BigDecimal calculateTotal(Order order) { ... }
}

public class OrderValidator {
    public void validate(Order order) { ... }
}
```

### 2️⃣ Open/Closed Principle (OCP)

**✅ Implemented:**

- Strategy pattern cho payment: `CashPaymentProcessor`, `CardPaymentProcessor`, `EWalletPaymentProcessor`
- Strategy pattern cho discount: `PercentageDiscountStrategy`, `FixedAmountDiscountStrategy`, `CouponDiscountStrategy`
- Strategy pattern cho billing: `StandardBillCalculationStrategy`, `HappyHourBillCalculationStrategy`

**Example:**

```java
// Interface cho strategy
public interface PaymentProcessor {
    PaymentResult processPayment(Payment payment);
}

// Concrete strategies
public class CashPaymentProcessor implements PaymentProcessor { ... }
public class CardPaymentProcessor implements PaymentProcessor { ... }

// Factory để select strategy
public class PaymentProcessorFactory {
    public PaymentProcessor getProcessor(PaymentMethod method) { ... }
}
```

### 3️⃣ Liskov Substitution Principle (LSP)

**✅ Implemented:**

- Interfaces với strict contracts
- Tất cả implementations tuân thủ contract
- No breaking changes trong subclasses

**Example:**

```java
public interface BillCalculationStrategy {
    BillCalculationResult calculate(BillCalculationContext context);
}

// Tất cả strategies đều implement đúng contract
public class StandardBillCalculationStrategy implements BillCalculationStrategy {
    @Override
    public BillCalculationResult calculate(BillCalculationContext context) {
        // Always returns valid BillCalculationResult
    }
}
```

### 4️⃣ Interface Segregation Principle (ISP)

**✅ Implemented:**

- CQRS pattern: `IOrderService`, `IKitchenService`, `IBillingService`
- Specific interfaces cho từng use case
- Không có "fat interfaces"

**Example:**

```java
// ❌ BEFORE: Fat interface
public interface OrderService {
    Order createOrder(CreateOrderRequest request);
    List<Order> getAllOrders();
    Order updateOrderStatus(Long id, OrderStatus status);
    void deleteOrder(Long id);
    List<Order> searchOrders(String query);
    // ... 20 more methods
}

// ✅ AFTER: Segregated interfaces
public interface IOrderService {
    Order createOrder(CreateOrderRequest request);
    Order getOrderById(Long id);
    List<Order> getAllOrders();
    Order updateOrderStatus(Long id, OrderStatus status);
}

public interface IOrderSearchService {
    List<Order> searchOrders(OrderSearchCriteria criteria);
}
```

### 5️⃣ Dependency Inversion Principle (DIP)

**✅ Implemented:**

- DTOs hoàn toàn thay thế entities trong API responses
- Dependencies inject qua interfaces
- High-level modules không phụ thuộc low-level modules

**Example:**

```java
// ❌ BEFORE: Controller trả về entity
@GetMapping("/{id}")
public Order getOrder(@PathVariable Long id) {
    return orderRepository.findById(id);
}

// ✅ AFTER: Controller trả về DTO
@GetMapping("/{id}")
public OrderResponse getOrder(@PathVariable Long id) {
    Order order = orderService.getOrderById(id);
    return orderMapper.toResponse(order);
}

// Service depends on interface, not implementation
public class OrderServiceImpl implements IOrderService {
    private final OrderRepository orderRepository; // Interface
    private final OrderMapper orderMapper;         // Interface

    public OrderServiceImpl(OrderRepository orderRepository, OrderMapper orderMapper) {
        this.orderRepository = orderRepository;
        this.orderMapper = orderMapper;
    }
}
```

### 📊 SOLID Metrics

| Principle | Compliance | Implementation                             |
| --------- | ---------- | ------------------------------------------ |
| SRP       | 100%       | 37 domain services, entities chỉ chứa data |
| OCP       | 100%       | 15+ strategy patterns, factory patterns    |
| LSP       | 100%       | All interfaces có strict contracts         |
| ISP       | 100%       | CQRS pattern, specific interfaces          |
| DIP       | 100%       | Full DTO usage, dependency injection       |

---

## 📸 Screenshots

### Landing Page

<kbd>![Landing Page](https://via.placeholder.com/800x450/FF6B35/FFFFFF?text=Professional+Landing+Page)</kbd>

### Login Page

<kbd>![Login](https://via.placeholder.com/800x450/4A90E2/FFFFFF?text=Login+%26+Demo+Mode)</kbd>

### Server Dashboard

<kbd>![Server Dashboard](https://via.placeholder.com/800x450/50C878/FFFFFF?text=Server+Dashboard+-+Table+Management)</kbd>

### Kitchen Display

<kbd>![Kitchen Display](https://via.placeholder.com/800x450/FF8C00/FFFFFF?text=Kitchen+Display+System)</kbd>

### Cashier Dashboard

<kbd>![Cashier](https://via.placeholder.com/800x450/9B59B6/FFFFFF?text=Cashier+Dashboard+-+Billing)</kbd>

### Manager Analytics

<kbd>![Analytics](https://via.placeholder.com/800x450/E74C3C/FFFFFF?text=Manager+Analytics+Dashboard)</kbd>

---

## 👥 Team

**Project:** Intelligent Restaurant Management System (IRMS)  
**Duration:** 4 weeks  
**Team Size:** 6 members

### Contributors

| Role           | Responsibilities                            |
| -------------- | ------------------------------------------- |
| Backend Lead   | Architecture, SOLID refactoring, API design |
| Frontend Lead  | UI/UX, React components, state management   |
| Full-stack Dev | Feature implementation, integration         |
| Database Admin | Schema design, migrations, optimization     |
| QA Engineer    | Testing, bug fixes, documentation           |
| DevOps         | Docker, deployment, CI/CD                   |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **Backend API:** http://localhost:8080
- **Frontend:** http://localhost:5173
- **API Docs:** http://localhost:8080/swagger-ui.html
- **Database:** PostgreSQL on localhost:5432

---

## 🚧 Future Enhancements

- [ ] Multi-restaurant support
- [ ] Mobile app (React Native)
- [ ] QR code ordering
- [ ] Loyalty program
- [ ] Inventory management with auto-reorder
- [ ] Staff scheduling
- [ ] Customer feedback system
- [ ] Integration với delivery platforms (GrabFood, ShopeeFood)
- [ ] AI-powered demand forecasting
- [ ] Multi-language support

---

## 📞 Support

For issues, questions, or contributions:

- Open an issue on GitHub
- Email: support@irms.com
- Documentation: [Wiki](https://github.com/your-repo/wiki)

---

<div align="center">

**Made with ❤️ by IRMS Team**

⭐ Star us on GitHub — it helps!

[Back to Top](#-intelligent-restaurant-management-system-irms)

</div>
