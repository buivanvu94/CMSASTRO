# 🚀 Hướng dẫn tạo Admin User - Đơn giản nhất

## ⚡ CÁCH NHANH NHẤT (Khuyến nghị)

### Bước 1: Mở MySQL Command Line Client
- Tìm "MySQL Command Line Client" trong Start Menu
- Hoặc mở Command Prompt và gõ: `mysql -u root -p`

### Bước 2: Nhập password MySQL
```
Enter password: 261331064
```

### Bước 3: Copy và paste toàn bộ đoạn SQL này
```sql
USE cms_db;

DELETE FROM users WHERE email = 'buivuit@gmail.com';

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

SELECT id, full_name, email, role, status FROM users WHERE email = 'buivuit@gmail.com';
```

### Bước 4: Kiểm tra kết quả
Bạn sẽ thấy:
```
+----+--------------+--------------------+-------+--------+
| id | full_name    | email              | role  | status |
+----+--------------+--------------------+-------+--------+
|  1 | Bui Van Vu   | buivuit@gmail.com  | admin | active |
+----+--------------+--------------------+-------+--------+
```

### Bước 5: Thoát MySQL
```sql
exit;
```

---

## 🎉 Đăng nhập

1. Mở browser: http://localhost:4322/login
2. Nhập:
   - **Email**: `buivuit@gmail.com`
   - **Password**: `Buivanvu@#999`
3. Click "Đăng nhập"

---

## 🔧 CÁCH 2: Sử dụng MySQL Workbench

1. Mở MySQL Workbench
2. Kết nối đến database:
   - Host: `localhost`
   - Port: `3306`
   - User: `root`
   - Password: `261331064`
3. Click vào database `cms_db`
4. Mở SQL Editor (icon sấm sét ⚡)
5. Copy paste đoạn SQL ở trên
6. Click Execute (icon sấm sét hoặc Ctrl+Enter)

---

## 🔧 CÁCH 3: Sử dụng phpMyAdmin

1. Mở phpMyAdmin: http://localhost/phpmyadmin
2. Đăng nhập:
   - Username: `root`
   - Password: `261331064`
3. Click database `cms_db` bên trái
4. Click tab "SQL" ở trên
5. Copy paste đoạn SQL ở trên
6. Click "Go"

---

## ❓ Nếu gặp lỗi

### Lỗi: "Table 'users' doesn't exist"
```sql
-- Chạy lệnh này để tạo lại database
USE cms_db;
SHOW TABLES;
```

Nếu không có table `users`, backend chưa sync database. Restart backend server:
1. Tắt backend (Ctrl+C)
2. Chạy lại: `npm run dev`

### Lỗi: "Duplicate entry"
User đã tồn tại. Chạy:
```sql
UPDATE users 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    role = 'admin',
    status = 'active'
WHERE email = 'buivuit@gmail.com';
```

---

## 📋 Thông tin đăng nhập

- **Email**: `buivuit@gmail.com`
- **Password**: `Buivanvu@#999`
- **Role**: `admin`
- **Login URL**: http://localhost:4322/login

---

## ✅ Checklist

- [ ] MySQL đang chạy
- [ ] Backend server đang chạy (port 5000)
- [ ] Frontend server đang chạy (port 4322)
- [ ] Database `cms_db` tồn tại
- [ ] Table `users` tồn tại
- [ ] Admin user đã được tạo
- [ ] Có thể đăng nhập thành công

---

**Chúc bạn thành công! 🎊**
