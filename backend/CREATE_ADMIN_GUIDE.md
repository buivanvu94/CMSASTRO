# 🔐 Hướng dẫn tạo Admin User

## Thông tin đăng nhập

- **Email**: `buivuit@gmail.com`
- **Password**: `Buivanvu@#999`
- **Role**: `admin`
- **Login URL**: http://localhost:4322/login

---

## ✅ CÁCH 1: Sử dụng MySQL Command Line (Khuyến nghị)

### Bước 1: Mở Command Prompt hoặc PowerShell

### Bước 2: Kết nối MySQL
```bash
mysql -u root -p261331064 cms_db
```

### Bước 3: Chạy SQL query
```sql
INSERT INTO users (full_name, email, password, role, status, created_at, updated_at)
VALUES (
  'Bui Van Vu',
  'buivuit@gmail.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'admin',
  'active',
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  role = 'admin',
  status = 'active',
  updated_at = NOW();
```

### Bước 4: Kiểm tra user đã tạo
```sql
SELECT id, full_name, email, role, status FROM users WHERE email = 'buivuit@gmail.com';
```

### Bước 5: Thoát MySQL
```sql
exit;
```

---

## ✅ CÁCH 2: Sử dụng API với Postman

### Bước 1: Mở Postman

### Bước 2: Tạo POST request
- **Method**: POST
- **URL**: `http://localhost:5000/api/v1/auth/register`
- **Headers**: 
  - `Content-Type`: `application/json`

### Bước 3: Body (raw JSON)
```json
{
  "email": "buivuit@gmail.com",
  "password": "Buivanvu@#999",
  "full_name": "Bui Van Vu",
  "role": "admin"
}
```

### Bước 4: Click Send

---

## ✅ CÁCH 3: Sử dụng curl (Command Line)

### Windows PowerShell:
```powershell
$body = @{
    email = "buivuit@gmail.com"
    password = "Buivanvu@#999"
    full_name = "Bui Van Vu"
    role = "admin"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/register" -Method Post -Body $body -ContentType "application/json"
```

### Git Bash hoặc Linux:
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "buivuit@gmail.com",
    "password": "Buivanvu@#999",
    "full_name": "Bui Van Vu",
    "role": "admin"
  }'
```

---

## ✅ CÁCH 4: Sử dụng MySQL Workbench

### Bước 1: Mở MySQL Workbench

### Bước 2: Kết nối đến database
- Host: `localhost`
- Port: `3306`
- User: `root`
- Password: `261331064`
- Database: `cms_db`

### Bước 3: Mở SQL Editor và chạy query
```sql
INSERT INTO users (full_name, email, password, role, status, created_at, updated_at)
VALUES (
  'Bui Van Vu',
  'buivuit@gmail.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'admin',
  'active',
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  role = 'admin',
  status = 'active',
  updated_at = NOW();
```

---

## ✅ CÁCH 5: Sử dụng phpMyAdmin

### Bước 1: Mở phpMyAdmin trong browser
- URL: `http://localhost/phpmyadmin` (hoặc URL phpMyAdmin của bạn)

### Bước 2: Đăng nhập
- Username: `root`
- Password: `261331064`

### Bước 3: Chọn database `cms_db`

### Bước 4: Click tab "SQL"

### Bước 5: Paste và chạy query
```sql
INSERT INTO users (full_name, email, password, role, status, created_at, updated_at)
VALUES (
  'Bui Van Vu',
  'buivuit@gmail.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'admin',
  'active',
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  role = 'admin',
  status = 'active',
  updated_at = NOW();
```

---

## 🎉 Sau khi tạo xong

1. Mở browser và truy cập: http://localhost:4322/login
2. Đăng nhập với:
   - Email: `buivuit@gmail.com`
   - Password: `Buivanvu@#999`
3. Bạn sẽ được chuyển đến Dashboard với quyền Admin

---

## ⚠️ Lưu ý

- Password đã được hash bằng bcrypt với 10 rounds
- Hash trong SQL là cho password: `Buivanvu@#999`
- Nếu user đã tồn tại, query sẽ update password và role thành admin
- Backend server phải đang chạy trên port 5000 để sử dụng API

---

## 🔍 Kiểm tra user đã tạo

Chạy query này trong MySQL:

```sql
SELECT id, full_name, email, role, status, created_at 
FROM users 
WHERE email = 'buivuit@gmail.com';
```

Kết quả mong đợi:
```
+----+--------------+--------------------+-------+--------+---------------------+
| id | full_name    | email              | role  | status | created_at          |
+----+--------------+--------------------+-------+--------+---------------------+
|  1 | Bui Van Vu   | buivuit@gmail.com  | admin | active | 2026-02-06 08:15:00 |
+----+--------------+--------------------+-------+--------+---------------------+
```

---

**Chúc bạn thành công! 🎉**
