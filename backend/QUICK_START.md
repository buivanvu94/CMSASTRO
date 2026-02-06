# Quick Start Guide

## Bước 1: Cài đặt và cấu hình

1. Cài đặt dependencies:
```bash
npm install
```

2. Tạo database MySQL:
```sql
CREATE DATABASE cms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Cấu hình file `.env` (đã có sẵn):
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=cms_db
DB_USER=root
DB_PASSWORD=
DB_SYNC_ALTER=true
```

## Bước 2: Chạy server

```bash
npm run dev
```

Server sẽ chạy tại: `http://localhost:5000`

## Bước 3: Test API

### 1. Health Check
```bash
curl http://localhost:5000/health
```

### 2. Đăng ký user đầu tiên (Admin)
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Admin User",
    "email": "admin@example.com",
    "password": "Admin123!",
    "role": "admin"
  }'
```

### 3. Đăng nhập
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }'
```

Lưu `accessToken` từ response để sử dụng cho các request tiếp theo.

### 4. Lấy thông tin user hiện tại
```bash
curl http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Upload file
```bash
curl -X POST http://localhost:5000/api/v1/media/upload \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/your/image.jpg" \
  -F "folder=test"
```

### 6. Lấy danh sách media
```bash
curl http://localhost:5000/api/v1/media \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 7. Tạo category
```bash
curl -X POST http://localhost:5000/api/v1/categories \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tin tức",
    "type": "post",
    "description": "Danh mục tin tức",
    "status": "active"
  }'
```

### 8. Lấy cấu trúc cây categories
```bash
curl http://localhost:5000/api/v1/categories/tree?type=post \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 9. Tạo sub-category
```bash
curl -X POST http://localhost:5000/api/v1/categories \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Công nghệ",
    "parent_id": 1,
    "type": "post",
    "status": "active"
  }'
```

## Troubleshooting

### Lỗi kết nối database
- Kiểm tra MySQL đã chạy chưa
- Kiểm tra thông tin kết nối trong `.env`
- Kiểm tra database đã được tạo chưa

### Lỗi port đã được sử dụng
- Thay đổi `PORT` trong file `.env`
- Hoặc kill process đang sử dụng port 5000

### Lỗi upload file
- Kiểm tra thư mục `uploads` đã được tạo chưa
- Kiểm tra quyền ghi file

## Sử dụng Postman

Import collection từ file `postman_collection.json` (sẽ được tạo sau) để test API dễ dàng hơn.

## Logs

Server logs sẽ hiển thị trong console khi chạy `npm run dev`.
