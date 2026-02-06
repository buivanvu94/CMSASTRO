# 🔍 DEBUG LOGIN - STEP BY STEP

## Vấn đề
- ✅ User TỒN TẠI trong database (buivuit@gmail.com)
- ❌ Vẫn báo lỗi 401: "Invalid email or password"

## Nguyên nhân có thể
1. Password hash KHÔNG KHỚP
2. User status KHÔNG phải "active"  
3. Email trong DB khác với email đăng nhập (có space, uppercase, etc.)

---

## 🔧 GIẢI PHÁP 1: XÓA VÀ TẠO LẠI USER (KHUYẾN NGHỊ)

### Bước 1: Xóa user cũ
```sql
mysql -u root -p
# Password: 261331064

USE cms_db;
DELETE FROM users WHERE email = 'buivuit@gmail.com';
```

### Bước 2: Tạo user mới bằng API
Mở Postman hoặc Thunder Client:

**POST** `http://localhost:5000/api/v1/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "buivuit@gmail.com",
  "password": "Buivanvu@#999",
  "full_name": "Bui Van Vu",
  "role": "admin"
}
```

### Bước 3: Đăng nhập
http://localhost:4322/login
- Email: buivuit@gmail.com
- Password: Buivanvu@#999

---

## 🔧 GIẢI PHÁP 2: CẬP NHẬT PASSWORD

### Tạo hash mới
```bash
cd backend
node generate-new-hash.js
```

Copy hash mới và chạy SQL:
```sql
UPDATE users 
SET password = '<HASH_MỚI_TỪ_SCRIPT>',
    status = 'active',
    role = 'admin'
WHERE email = 'buivuit@gmail.com';
```

---

## 🔧 GIẢI PHÁP 3: KIỂM TRA CHI TIẾT

### Kiểm tra user trong DB
```sql
SELECT 
  id,
  full_name,
  email,
  CHAR_LENGTH(email) as email_length,
  role,
  status,
  LEFT(password, 30) as password_start,
  CHAR_LENGTH(password) as password_length
FROM users 
WHERE email LIKE '%buivuit%';
```

### Kiểm tra kết quả:
- ✅ email_length = 18 (không có space thừa)
- ✅ role = 'admin'
- ✅ status = 'active'
- ✅ password_length = 60 (bcrypt hash đúng format)
- ✅ password_start bắt đầu với '$2a$10$'

---

## 🔍 DEBUG BACKEND

### Thêm log vào auth.service.js

Mở file: `backend/src/modules/auth/auth.service.js`

Thêm log vào hàm `login`:

```javascript
export const login = async (email, password) => {
  console.log('🔍 Login attempt:', { email, password: '***' });
  
  // Find user by email
  const user = await findByEmail(email);
  console.log('👤 User found:', user ? 'YES' : 'NO');
  
  if (!user) {
    console.log('❌ User not found');
    throw new AuthenticationError('Invalid email or password');
  }

  console.log('📋 User details:', {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    passwordLength: user.password?.length
  });

  // Check if user is active
  if (user.status !== 'active') {
    console.log('❌ User not active:', user.status);
    throw new AuthenticationError('Account is inactive');
  }

  // Verify password
  console.log('🔐 Comparing passwords...');
  const isValidPassword = await comparePassword(password, user.password);
  console.log('🔐 Password match:', isValidPassword ? 'YES' : 'NO');
  
  if (!isValidPassword) {
    console.log('❌ Password mismatch');
    throw new AuthenticationError('Invalid email or password');
  }

  console.log('✅ Login successful');
  
  // ... rest of code
};
```

Sau đó thử đăng nhập lại và xem backend logs!

---

## 📊 EXPECTED LOGS

### Nếu user không tồn tại:
```
🔍 Login attempt: { email: 'buivuit@gmail.com', password: '***' }
👤 User found: NO
❌ User not found
```

### Nếu password sai:
```
🔍 Login attempt: { email: 'buivuit@gmail.com', password: '***' }
👤 User found: YES
📋 User details: { id: 2, email: 'buivuit@gmail.com', role: 'admin', status: 'active', passwordLength: 60 }
🔐 Comparing passwords...
🔐 Password match: NO
❌ Password mismatch
```

### Nếu thành công:
```
🔍 Login attempt: { email: 'buivuit@gmail.com', password: '***' }
👤 User found: YES
📋 User details: { id: 2, email: 'buivuit@gmail.com', role: 'admin', status: 'active', passwordLength: 60 }
🔐 Comparing passwords...
🔐 Password match: YES
✅ Login successful
```

---

## 🎯 KHUYẾN NGHỊ

**Cách nhanh nhất: XÓA VÀ TẠO LẠI USER BẰNG API**

1. Xóa user cũ trong MySQL
2. Dùng API `/auth/register` để tạo user mới
3. API sẽ tự động hash password đúng cách
4. Đăng nhập ngay lập tức

Cách này đảm bảo 100% password được hash đúng!

---

**Hãy thử GIẢI PHÁP 1 trước!** 🚀
