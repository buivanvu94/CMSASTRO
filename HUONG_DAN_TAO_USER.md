# 🚀 HƯỚNG DẪN TẠO ADMIN USER - ĐƠN GIẢN

## ✅ Tình trạng hiện tại

- ✅ Backend đang chạy (port 5000)
- ✅ CORS đã được mở (cho phép tất cả origins)
- ✅ Debug logs đã được thêm vào auth service
- ✅ File `test-register.html` đã sẵn sàng

---

## 📋 BƯỚC 1: Xóa user cũ (nếu có)

Mở MySQL và chạy:

```sql
USE cms_db;
DELETE FROM users WHERE email = 'buivuit@gmail.com';
```

Hoặc dùng command line:

```bash
mysql -u root -p261331064 -e "USE cms_db; DELETE FROM users WHERE email = 'buivuit@gmail.com';"
```

---

## 📋 BƯỚC 2: Tạo user mới bằng HTML tool

### Cách làm:

1. **Mở file `test-register.html` trong browser** (Chrome, Edge, Firefox)
   - Đường dẫn: `D:\DU_AN_NODEJS\cmsastro\test-register.html`
   - Hoặc kéo thả file vào browser

2. **Click button "Tạo Admin User"**

3. **Đợi thông báo:**
   - ✅ Nếu thành công: Sẽ hiện thông tin user
   - ❌ Nếu lỗi: Sẽ hiện thông báo lỗi

---

## 📋 BƯỚC 3: Đăng nhập

1. **Mở trang login:**
   - URL: http://localhost:4322/login
   - Hoặc click button "Mở Trang Login" trong HTML tool

2. **Nhập thông tin:**
   - Email: `buivuit@gmail.com`
   - Password: `Buivanvu@#999`

3. **Click "Đăng nhập"**

---

## 🔍 Nếu gặp lỗi

### Lỗi: "Email already exists"
➡️ Quay lại BƯỚC 1, xóa user cũ

### Lỗi: "Invalid email or password" (401)
➡️ Kiểm tra backend logs trong terminal:
- Tìm dòng: `🔐 [AUTH] Password match result:`
- Nếu là `❌ NO`: Password không khớp
- Gửi logs cho tôi để debug

### Lỗi: "Cannot connect to backend"
➡️ Kiểm tra backend có đang chạy không:
```bash
curl http://localhost:5000/health
```

---

## 📊 Thông tin đăng nhập

| Thông tin | Giá trị |
|-----------|---------|
| **Email** | buivuit@gmail.com |
| **Password** | Buivanvu@#999 |
| **Role** | admin |
| **Status** | active |

---

## 💡 Tại sao dùng API thay vì SQL?

✅ API tự động hash password đúng cách (bcrypt)
✅ Không cần copy/paste hash thủ công
✅ Đảm bảo 100% password được lưu đúng
✅ Tạo user với đầy đủ validation

---

## 🎯 TÓM TẮT

1. Xóa user cũ (nếu có)
2. Mở `test-register.html` → Click "Tạo Admin User"
3. Mở http://localhost:4322/login → Đăng nhập

**Chỉ 3 bước! Rất đơn giản!** 🎉

---

## 📞 Nếu vẫn gặp vấn đề

Gửi cho tôi:
1. Screenshot từ `test-register.html` (response message)
2. Backend logs từ terminal (các dòng có 🔍 🔐 ✅ ❌)
3. Tôi sẽ biết chính xác vấn đề!
