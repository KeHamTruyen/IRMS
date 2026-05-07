# Intelligent Restaurant Management System (IRMS)

IRMS is an MVP restaurant management system built for the Software Architecture assignment. The project focuses on architecture design and SOLID-oriented implementation for core restaurant workflows: table service, ordering, kitchen coordination, billing/payment, inventory, reservations, analytics, and role-based operation.

## Current Scope

The system implements a multi-module MVP:

- **Server/Table Service**: table list ordered by table number, active order tracking, add more items before billing, mark served, open bill, full payment, and split/partial payment.
- **Kitchen Display System**: pending kitchen tickets, item completion flow, and served/completed history.
- **Billing/Payment**: bill creation from order, service charge/tax/discount calculation, multiple payments per bill, split bill, partial payment, and remaining due calculation.
- **Inventory**: decimal inventory quantities, manual stock update, threshold status, and inventory deduction when kitchen starts preparation.
- **Menu/Admin**: menu availability, price/menu management through admin/manager screens.
- **Reservation/Host**: reservation list, create/update reservation, table assignment, reserved-table state sync, seating reserved guests, and walk-in seating.
- **Analytics/Reports**: dashboard statistics, revenue, peak-hour and best-selling item style reports.
- **Security/RBAC**: JWT authentication with active UI roles: `ADMIN`, `MANAGER`, `SERVER`, `CHEF`, `HOST`. The cashier flow is currently handled from the server/table UI.

## Architecture

The backend uses a **layered modular monolith** with internal events and a PostgreSQL database.

```text
frontend React/Vite
        |
        | REST API
        v
Spring Boot backend
  presentation/     controllers, request/response boundary
  application/      use cases, services, DTOs, mappers
  domain/           entities, domain services, strategy interfaces
  infrastructure/   security, persistence integration, configuration
        |
        v
PostgreSQL + Flyway migrations
```

Main backend modules:

```text
backend/src/main/java/com/irms
  admin/        users, roles, JWT authentication
  order/        order lifecycle, order items, domain events
  kitchen/      kitchen tickets, KDS display, prep status flow
  billing/      bill, payments, payment processors, calculators
  table/        table state and demo reset use case
  reservation/  booking and host workflow
  inventory/    stock, thresholds, menu item requirements
  analytics/    dashboard/reporting queries
  audit/        action logs
  notification/ websocket notifications
  common/       shared DTOs, exceptions, event support
```

## SOLID Notes

The codebase is structured to support SOLID principles:

- **SRP**: controllers handle HTTP only; services handle use cases; repositories handle persistence; factories/calculators/validators isolate domain rules.
- **OCP**: payment processing uses strategy-style processors such as cash/card/e-wallet processors; bill and order calculations are isolated behind domain services.
- **LSP**: service and processor implementations follow their interface contracts.
- **ISP**: focused interfaces such as `IOrderService`, `IKitchenService`, `IBillingService`, and `ITableService` avoid a single broad service contract.
- **DIP**: controllers depend on service interfaces; services depend on repository abstractions and domain services.

Pragmatic MVP safeguard: migration `V11__Create_kitchen_tickets_from_order_items.sql` adds a database trigger so every persisted `order_items` row creates a matching kitchen ticket. This protects the demo against missed event delivery and preserves data consistency.

## Tech Stack

Backend:

- Java 17
- Spring Boot 3.2.3
- Spring Security + JWT
- Spring Data JPA
- PostgreSQL
- Flyway
- Maven

Frontend:

- React + Vite
- Tailwind CSS utility classes
- Fetch-based API client

## Run Locally

### Option A. Docker Compose

From the repository root:

```bash
docker compose up --build
```

Services:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:3000
Database: localhost:5432
```

The root `docker-compose.yml` starts PostgreSQL, builds the Spring Boot backend from `backend/Dockerfile`, and builds the React/Vite frontend from `frontend/Dockerfile`. The frontend container serves static assets with Nginx and proxies `/api` requests to the backend container.

For a backend-only Docker run, `backend/docker-compose.yml` starts PostgreSQL and the backend service from inside the `backend/` directory.

### Option B. Manual Run

### 1. Database

Create a PostgreSQL database and configure `backend/.env`.

Example:

```properties
DB_HOST=localhost
DB_PORT=5432
DB_NAME=irms_db
DB_USERNAME=postgres
DB_PASSWORD=your_password
SERVER_PORT=3000
JWT_SECRET=change-this-secret-key-in-production-minimum-256-bits-required
FLYWAY_ENABLED=true
FLYWAY_BASELINE_ON_MIGRATE=true
FLYWAY_BASELINE_VERSION=7
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 2. Backend

```bash
cd backend
mvn spring-boot:run
```

Backend runs at:

```text
http://localhost:3000
```

Swagger/OpenAPI:

```text
http://localhost:3000/swagger-ui.html
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

## Demo Accounts

Seed data provides role accounts. In the UI, use the terminal/login screen for the role you need.

Common roles:

- `ADMIN`   Password:1234
- `MANAGER` Pin:1234
- `SERVER`  Pin:1234
- `CHEF`    Pin:1234
- `HOST`    Pin:1234

If local seed credentials differ, check `backend/src/main/resources/db/migration/V7__Insert_seed_data.sql`.

## Main Demo Flow

1. Login as `SERVER`.
2. For a host flow, login as `HOST` first and either:
   - create/confirm a reservation, assign a table, then seat the guest, or
   - seat a walk-in guest directly at an available table.
3. Return/login as `SERVER`.
4. Choose the occupied table.
5. Add menu items and press `Đặt món`.
6. Login as `CHEF`.
7. View pending kitchen tickets and press `Hoàn thành món`.
8. Return to `SERVER`.
9. Mark the table as served.
10. Open payment.
11. Choose either:
   - `Thu toàn bộ còn lại`, or
   - `Split bill / thu từng phần`.
12. Confirm payment. Full payment moves the table to cleaning state.

## Useful API Endpoints

Base URL:

```text
http://localhost:3000/api
```

Selected endpoints:

```http
POST   /auth/login
GET    /tables
PATCH  /tables/{id}/status?status=AVAILABLE
POST   /tables/reset-demo

GET    /orders
POST   /orders
POST   /orders/{id}/items
PATCH  /orders/{id}/status?status=PREPARING

GET    /kitchen/display
GET    /kitchen/orders
PATCH  /kitchen/order-items/{id}/start
PATCH  /kitchen/order-items/{id}/ready

GET    /bills
POST   /bills/order/{orderId}
POST   /bills/{billId}/payments

GET    /inventory-items
PATCH  /inventory-items/{id}/quantity

GET    /reservations
POST   /reservations

GET    /analytics/dashboard
GET    /analytics/sales
```

## Reset Demo State

To clear active table/order/bill/kitchen state for another demo:

```http
POST /api/tables/reset-demo
Authorization: Bearer <manager-or-admin-token>
```

This use case is implemented in `DemoResetService`.

## Verification

Backend:

```bash
cd backend
mvn -q test
```

Frontend:

```bash
cd frontend
npm run build
```

Both commands were used as the primary verification path during MVP stabilization.

## Assignment Coverage

The project supports the assignment requirements as follows:

- Context and requirements: described in `report.tex`.
- Architecture style comparison and choice: layered modular monolith with internal events.
- Module view: modules map to backend packages.
- Component-and-connector view: React client, Spring REST API, internal events, PostgreSQL.
- Allocation view: browser clients, backend server, database server.
- UML/class relationships: included in `report.tex`.
- SOLID application: documented and reflected in service/interface/factory/strategy structure.
- Reflection and division of work: included in `report.tex`.

## Known MVP Limitations

- Payment processors simulate payment success/failure; no real bank gateway.
- Kitchen ticket creation has both application-level event handling and a DB trigger safeguard.
- Reservation is functional for host workflow but does not include external customer notifications.
- Report export and advanced analytics are basic MVP-level features.

## Team Responsibility Matrix

| Member | Main Responsibility |
| --- | --- |
| Member 1 | Architecture, UML, report, interface/package conventions |
| Member 2 | Order module |
| Member 3 | Kitchen module |
| Member 4 | Billing/payment module |
| Member 5 | Frontend and integration |
| Member 6 | Database, seed data, testing, documentation |
