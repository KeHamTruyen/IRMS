# IRMS Frontend

Frontend chính của IRMS nằm trong thư mục này và được xây bằng React + Vite.

## Cấu hình

Tạo hoặc cập nhật `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

## Chạy local

```bash
npm install
npm run dev
```

Ứng dụng chạy tại:

```text
http://localhost:5173
```

## Build

```bash
npm run build
```

Frontend hiện lấy dữ liệu từ backend, không dùng mock data ban đầu.
