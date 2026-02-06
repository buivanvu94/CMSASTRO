# ⚡ Quick Start - Tạo Admin User

## 🎯 Mục tiêu
Tạo admin user để đăng nhập vào CMS

---

## 📝 Thông tin đăng nhập
- **Email**: `buivuit@gmail.com`
- **Password**: `Buivanvu@#999`

---

## 🚀 3 Bước đơn giản

### 1️⃣ Mở MySQL
```bash
mysql -u root -p
# Password: 261331064
```

### 2️⃣ Chạy SQL
```sql
USE cms_db;

INSERT INTO users (full_name, email, password, role, status, created_at, updated_at)
VALUES ('Bui Van Vu', 'buivuit@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin', 'active', NOW(), NOW());
```

### 3️⃣ Đăng nhập
Mở: http://localhost:4322/login

---

## ✅ Done!

Xem chi tiết: `SETUP_COMPLETE_GUIDE.md`
