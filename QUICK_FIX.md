# ⚡ QUICK FIX - Đăng nhập ngay

## 🎯 Vấn đề
User đã tồn tại nhưng vẫn báo 401

## ✅ GIẢI PHÁP NHANH NHẤT (2 PHÚT)

### Bước 1: Xóa user cũ
```sql
mysql -u root -p
# Password: 261331064

USE cms_db;
DELETE FROM users WHERE email = 'buivuit@gmail.com';
exit;
```

### Bước 2: Tạo user mới bằng Postman/Thunder Client

**POST** `http://localhost:5000/api/v1/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "buivuit@gmail.com",
  "password": "Buivanvu@#999",
  "full_name": "Bui Van Vu",
  "role": "admin"
}
```

**Click Send!**

### Bước 3: Đăng nhập
http://localhost:4322/login
- Email: `buivuit@gmail.com`
- Password: `Buivanvu@#999`

---

## 🔍 TẠI SAO CÁCH NÀY CHẮC CHẮN?

1. ✅ API `/register` tự động hash password đúng cách
2. ✅ Sử dụng đúng bcrypt với 10 rounds
3. ✅ Tạo user với status = 'active'
4. ✅ Không có lỗi copy/paste hash

---

## 📋 DEBUG LOGS

Tôi đã thêm debug logs vào backend. Sau khi thử đăng nhập, check backend logs để xem:

```
🔍 [AUTH] Login attempt: { email: '...', passwordLength: ... }
👤 [AUTH] User found: YES/NO
📋 [AUTH] User details: { ... }
🔐 [AUTH] Comparing passwords...
🔐 [AUTH] Password match result: ✅ YES / ❌ NO
```

Nếu thấy "Password match result: ❌ NO" thì chắc chắn là password hash không khớp!

---

## 🆘 NẾU VẪN LỖI

Gửi cho tôi backend logs sau khi đăng nhập, tôi sẽ biết chính xác vấn đề!

---

**Hãy thử ngay! 🚀**
