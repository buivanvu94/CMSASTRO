# CMS Backend API

Backend API cho hệ thống quản lý nội dung (CMS) được xây dựng với Node.js, Express, Sequelize và MySQL.

## Yêu cầu hệ thống

- Node.js >= 18.x
- MySQL >= 8.0
- npm hoặc yarn

## Cài đặt

1. Clone repository và di chuyển vào thư mục backend:
```bash
cd backend
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

4. Cấu hình database trong file `.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=cms_db
DB_USER=root
DB_PASSWORD=your_password
DB_SYNC_ALTER=true
```

5. Tạo database MySQL:
```sql
CREATE DATABASE cms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Chạy ứng dụng

### Development mode (với nodemon):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

Server sẽ chạy tại: `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /health` - Kiểm tra trạng thái server

### Authentication
- `POST /api/v1/auth/register` - Đăng ký tài khoản
- `POST /api/v1/auth/login` - Đăng nhập
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Đăng xuất
- `GET /api/v1/auth/me` - Lấy thông tin user hiện tại

### Users
- `GET /api/v1/users` - Danh sách users (Admin only)
- `GET /api/v1/users/:id` - Chi tiết user
- `POST /api/v1/users` - Tạo user (Admin only)
- `PUT /api/v1/users/:id` - Cập nhật user
- `DELETE /api/v1/users/:id` - Xóa user (Admin only)

### Media
- `GET /api/v1/media` - Danh sách media
- `GET /api/v1/media/:id` - Chi tiết media
- `POST /api/v1/media/upload` - Upload file
- `POST /api/v1/media/upload/multiple` - Upload nhiều files
- `PUT /api/v1/media/:id` - Cập nhật metadata
- `DELETE /api/v1/media/:id` - Xóa media
- `DELETE /api/v1/media/bulk` - Xóa nhiều media
- `GET /api/v1/media/folders` - Danh sách folders
- `GET /api/v1/media/stats` - Thống kê media

### Categories
- `GET /api/v1/categories` - Danh sách categories
- `GET /api/v1/categories/tree` - Cấu trúc cây categories
- `GET /api/v1/categories/:id` - Chi tiết category
- `GET /api/v1/categories/slug/:slug` - Lấy category theo slug
- `POST /api/v1/categories` - Tạo category (Admin/Editor)
- `PUT /api/v1/categories/:id` - Cập nhật category (Admin/Editor)
- `DELETE /api/v1/categories/:id` - Xóa category (Admin)
- `PUT /api/v1/categories/reorder` - Sắp xếp lại categories (Admin/Editor)
- `GET /api/v1/categories/stats` - Thống kê categories

## Testing

Chạy tests:
```bash
npm test
```

Chạy tests với watch mode:
```bash
npm run test:watch
```

## Cấu trúc thư mục

```
backend/
├── src/
│   ├── config/          # Cấu hình database, JWT, upload
│   ├── middlewares/     # Auth, error handling, upload
│   ├── modules/         # Modules theo feature (auth, users, media)
│   ├── utils/           # Utilities (logger, response, slug)
│   ├── app.js          # Express app configuration
│   └── server.js       # Server entry point
├── uploads/            # Uploaded files
├── .env.example        # Environment variables template
└── package.json
```

## Environment Variables

Xem file `.env.example` để biết danh sách đầy đủ các biến môi trường cần thiết.

## License

MIT
