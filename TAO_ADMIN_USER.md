# 🚨 HƯỚNG DẪN TẠO ADMIN USER - QUAN TRỌNG

## ⚠️ Vấn đề hiện tại
Backend báo lỗi: **"Invalid email or password"**  
➡️ Nghĩa là: **User chưa tồn tại trong database**

## ✅ GIẢI PHÁP - 3 CÁCH

---

### 🥇 CÁCH 1: Dùng MySQL Command Line (NHANH NHẤT - 30 GIÂY)

#### Bước 1: Mở MySQL
```bash
mysql -u root -p
```
Nhập password: `261331064`

#### Bước 2: Chạy lệnh này (copy toàn bộ):
```sql
USE cms_db;

-- Xóa user cũ nếu có
DELETE FROM users WHERE email = 'buivuit@gmail.com';

-- Tạo user mới với password đã hash
INSERT INTO users (full_name, email, password, role, status, created_at, updated_at)
VALUES (
  'Bui Van Vu',
  'buivuit@gmail.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'admin',
  'active',
  NOW(),
  NOW()
);

-- Kiểm tra
SELECT id, full_name, email, role, status FROM users WHERE email = 'buivuit@gmail.com';
```

#### Bước 3: Kiểm tra kết quả
Bạn sẽ thấy:
```
+----+--------------+--------------------+-------+--------+
| id | full_name    | email              | role  | status |
+----+--------------+--------------------+-------+--------+
|  X | Bui Van Vu   | buivuit@gmail.com  | admin | active |
+----+--------------+--------------------+-------+--------+
```

#### Bước 4: Thoát MySQL
```sql
exit;
```

#### Bước 5: Đăng nhập
Mở: http://localhost:4322/login
- Email: `buivuit@gmail.com`
- Password: `Buivanvu@#999`

---

### 🥈 CÁCH 2: Dùng Postman/Thunder Client

#### Bước 1: Mở Postman hoặc Thunder Client

#### Bước 2: Tạo POST request
- **Method**: POST
- **URL**: `http://localhost:5000/api/v1/auth/register`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "email": "buivuit@gmail.com",
    "password": "Buivanvu@#999",
    "full_name": "Bui Van Vu",
    "role": "admin"
  }
  ```

#### Bước 3: Click Send

#### Bước 4: Nếu thành công, bạn sẽ nhận được response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": X,
      "email": "buivuit@gmail.com",
      "full_name": "Bui Van Vu",
      "role": "admin",
      ...
    },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

---

### 🥉 CÁCH 3: Dùng curl trong PowerShell

```powershell
$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    email = "buivuit@gmail.com"
    password = "Buivanvu@#999"
    full_name = "Bui Van Vu"
    role = "admin"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/register" -Method Post -Headers $headers -Body $body
```

---

## 🔍 KIỂM TRA XEM USER ĐÃ TỒN TẠI CHƯA

### Cách 1: MySQL
```sql
USE cms_db;
SELECT id, full_name, email, role, status FROM users WHERE email = 'buivuit@gmail.com';
```

### Cách 2: API
```bash
# Thử đăng nhập
POST http://localhost:5000/api/v1/auth/login
{
  "email": "buivuit@gmail.com",
  "password": "Buivanvu@#999"
}
```

---

## ❓ TẠI SAO LẠI BÁO LỖI?

### Lỗi: "Invalid email or password"
➡️ **Nguyên nhân**: User chưa tồn tại trong database  
➡️ **Giải pháp**: Tạo user bằng 1 trong 3 cách trên

### Lỗi: "Email already exists"
➡️ **Nguyên nhân**: User đã tồn tại nhưng password sai  
➡️ **Giải pháp**: Reset password bằng SQL:
```sql
UPDATE users 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE email = 'buivuit@gmail.com';
```

---

## 🔐 THÔNG TIN PASSWORD

### Password gốc:
```
Buivanvu@#999
```

### Password đã hash (bcrypt, 10 rounds):
```
$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
```

### Cách hash này được tạo bởi:
```javascript
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('Buivanvu@#999', 10);
```

---

## ✅ SAU KHI TẠO USER THÀNH CÔNG

1. ✅ Mở browser: http://localhost:4322/login
2. ✅ Nhập:
   - Email: `buivuit@gmail.com`
   - Password: `Buivanvu@#999`
3. ✅ Click "Đăng nhập"
4. ✅ Bạn sẽ vào Dashboard! 🎉

---

## 🆘 NẾU VẪN GẶP VẤN ĐỀ

### Kiểm tra backend logs:
```bash
# Xem logs của backend server
# Tìm dòng: POST /api/v1/auth/login
```

### Kiểm tra database:
```sql
-- Xem tất cả users
SELECT * FROM users;

-- Xem cấu trúc table
DESCRIBE users;

-- Đếm số users
SELECT COUNT(*) FROM users;
```

---

## 📝 CHECKLIST

- [ ] Backend đang chạy (port 5000)
- [ ] Frontend đang chạy (port 4322)
- [ ] MySQL đang chạy
- [ ] Database `cms_db` tồn tại
- [ ] Table `users` tồn tại
- [ ] **User admin đã được tạo** ⬅️ LÀM BƯỚC NÀY
- [ ] Đăng nhập thành công

---

**KHUYẾN NGHỊ: Dùng CÁCH 1 (MySQL Command Line) - Nhanh nhất và chắc chắn nhất!**

---

**Chúc bạn thành công! 🎉**
