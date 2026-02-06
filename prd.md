# PRD: Hệ Thống Quản Lý Nội Dung (CMS)

## Metadata
- **Version:** 1.0
- **Date:** 05/02/2026
- **Stack:** Node.js + MySQL + Sequelize | Astro + Tailwind CSS

---

## 1. PROJECT OVERVIEW

### 1.1 Mục Tiêu
Xây dựng hệ thống CMS hoàn chỉnh với các tính năng quản lý nội dung tương tự WordPress:
- Quản lý danh mục & bài viết
- Quản lý sản phẩm & giá
- Hệ thống đặt bàn (Reservation)
- Quản lý thông tin liên hệ từ khách hàng
- Quản lý Menu điều hướng
- Quản lý Media (hình ảnh, tài liệu)
- Phân quyền người dùng

### 1.2 Scope

**In Scope:**
- User management & Authentication (JWT)
- Category CRUD (nested categories)
- Post/Article CRUD với rich content
- Product CRUD với variants & pricing
- Reservation system (đặt bàn)
- Contact form submissions
- Menu builder (nested menus)
- Media library management
- SEO metadata support
- Auto-migration database

**Out of Scope:**
- E-commerce checkout/payment
- Social login
- Email notifications (Phase 2)
- Multi-language (Phase 2)
- Version history/revisions
- Comments system
- Analytics dashboard

---

## 2. DATABASE SCHEMA

### 2.1 Entity Relationship Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     users       │     │   categories    │     │     posts       │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │◄────│ id (PK)         │
│ full_name       │     │ parent_id (FK)  │     │ category_id(FK) │
│ email           │     │ name            │     │ author_id (FK)  │──┐
│ password        │     │ slug            │     │ title           │  │
│ role            │     │ description     │     │ slug            │  │
│ status          │     │ image_id (FK)   │     │ content         │  │
│ created_at      │     │ type            │     │ excerpt         │  │
│ updated_at      │     │ sort_order      │     │ featured_img_id │  │
└─────────────────┘     │ status          │     │ status          │  │
         │              │ seo_title       │     │ seo_title       │  │
         │              │ seo_description │     │ seo_description │  │
         │              │ created_at      │     │ published_at    │  │
         │              │ updated_at      │     │ created_at      │  │
         │              └─────────────────┘     │ updated_at      │  │
         │                       │              └─────────────────┘  │
         │                       │                                   │
         │              ┌────────┴────────┐                          │
         │              ▼                 ▼                          │
         │     ┌─────────────────┐ ┌─────────────────┐              │
         │     │    products     │ │  product_prices │              │
         │     ├─────────────────┤ ├─────────────────┤              │
         │     │ id (PK)         │◄│ id (PK)         │              │
         │     │ category_id(FK) │ │ product_id (FK) │              │
         │     │ name            │ │ variant_name    │              │
         │     │ slug            │ │ price           │              │
         │     │ description     │ │ sale_price      │              │
         │     │ short_desc      │ │ is_default      │              │
         │     │ featured_img_id │ │ status          │              │
         │     │ gallery         │ │ created_at      │              │
         │     │ status          │ │ updated_at      │              │
         │     │ is_featured     │ └─────────────────┘              │
         │     │ sort_order      │                                   │
         │     │ seo_title       │                                   │
         │     │ seo_description │                                   │
         │     │ created_at      │                                   │
         │     │ updated_at      │                                   │
         │     └─────────────────┘                                   │
         │                                                           │
         │     ┌─────────────────┐     ┌─────────────────┐          │
         │     │  reservations   │     │    contacts     │          │
         │     ├─────────────────┤     ├─────────────────┤          │
         │     │ id (PK)         │     │ id (PK)         │          │
         │     │ customer_name   │     │ name            │          │
         │     │ customer_email  │     │ email           │          │
         │     │ customer_phone  │     │ phone           │          │
         │     │ party_size      │     │ subject         │          │
         │     │ date            │     │ message         │          │
         │     │ time            │     │ status          │          │
         │     │ special_request │     │ source          │          │
         └────►│ handled_by (FK) │     │ ip_address      │          │
               │ status          │     │ created_at      │          │
               │ note            │     │ updated_at      │          │
               │ created_at      │     └─────────────────┘          │
               │ updated_at      │                                   │
               └─────────────────┘                                   │
                                                                     │
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐ │
│     menus       │     │   menu_items    │     │     media       │ │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤ │
│ id (PK)         │◄────│ id (PK)         │     │ id (PK)         │ │
│ name            │     │ menu_id (FK)    │     │ uploaded_by(FK) │◄┘
│ location        │     │ parent_id (FK)  │     │ filename        │
│ status          │     │ title           │     │ original_name   │
│ created_at      │     │ url             │     │ mime_type       │
│ updated_at      │     │ target          │     │ size            │
└─────────────────┘     │ icon            │     │ path            │
                        │ linkable_type   │     │ thumbnail_path  │
                        │ linkable_id     │     │ alt_text        │
                        │ sort_order      │     │ caption         │
                        │ status          │     │ folder          │
                        │ created_at      │     │ created_at      │
                        │ updated_at      │     │ updated_at      │
                        └─────────────────┘     └─────────────────┘

┌─────────────────┐
│    settings     │
├─────────────────┤
│ id (PK)         │
│ key             │
│ value           │
│ group           │
│ created_at      │
│ updated_at      │
└─────────────────┘
```

### 2.2 Schema Details

#### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  avatar_id INT NULL,
  role ENUM('admin', 'editor', 'author') DEFAULT 'author',
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (avatar_id) REFERENCES media(id) ON DELETE SET NULL
);
```

#### Categories Table
```sql
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NULL,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  description TEXT NULL,
  image_id INT NULL,
  type ENUM('post', 'product') DEFAULT 'post',
  sort_order INT DEFAULT 0,
  status ENUM('active', 'inactive') DEFAULT 'active',
  seo_title VARCHAR(70) NULL,
  seo_description VARCHAR(160) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (image_id) REFERENCES media(id) ON DELETE SET NULL
);
```

#### Posts Table
```sql
CREATE TABLE posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category_id INT NULL,
  author_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(280) NOT NULL UNIQUE,
  content LONGTEXT NULL,
  excerpt TEXT NULL,
  featured_image_id INT NULL,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT FALSE,
  view_count INT DEFAULT 0,
  seo_title VARCHAR(70) NULL,
  seo_description VARCHAR(160) NULL,
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (featured_image_id) REFERENCES media(id) ON DELETE SET NULL
);
```

#### Products Table
```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category_id INT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(280) NOT NULL UNIQUE,
  description LONGTEXT NULL,
  short_description TEXT NULL,
  featured_image_id INT NULL,
  gallery JSON NULL,  -- Array of media IDs
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  seo_title VARCHAR(70) NULL,
  seo_description VARCHAR(160) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (featured_image_id) REFERENCES media(id) ON DELETE SET NULL
);
```

#### Product Prices Table
```sql
CREATE TABLE product_prices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  variant_name VARCHAR(100) NULL,  -- e.g., "Size S", "Size M", "Regular"
  price DECIMAL(12, 2) NOT NULL,
  sale_price DECIMAL(12, 2) NULL,
  is_default BOOLEAN DEFAULT FALSE,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

#### Reservations Table
```sql
CREATE TABLE reservations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_name VARCHAR(100) NOT NULL,
  customer_email VARCHAR(255) NULL,
  customer_phone VARCHAR(20) NOT NULL,
  party_size INT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  special_request TEXT NULL,
  handled_by INT NULL,
  status ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show') DEFAULT 'pending',
  note TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (handled_by) REFERENCES users(id) ON DELETE SET NULL
);
```

#### Contacts Table
```sql
CREATE TABLE contacts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NULL,
  phone VARCHAR(20) NULL,
  subject VARCHAR(255) NULL,
  message TEXT NOT NULL,
  status ENUM('new', 'read', 'replied', 'spam') DEFAULT 'new',
  source VARCHAR(50) NULL,  -- e.g., "contact_form", "landing_page"
  ip_address VARCHAR(45) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Menus Table
```sql
CREATE TABLE menus (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(50) NOT NULL UNIQUE,  -- e.g., "header", "footer", "sidebar"
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Menu Items Table
```sql
CREATE TABLE menu_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  menu_id INT NOT NULL,
  parent_id INT NULL,
  title VARCHAR(100) NOT NULL,
  url VARCHAR(500) NULL,
  target ENUM('_self', '_blank') DEFAULT '_self',
  icon VARCHAR(50) NULL,
  linkable_type VARCHAR(50) NULL,  -- 'post', 'category', 'product', 'custom'
  linkable_id INT NULL,
  sort_order INT DEFAULT 0,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES menu_items(id) ON DELETE CASCADE
);
```

#### Media Table
```sql
CREATE TABLE media (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uploaded_by INT NULL,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size INT NOT NULL,  -- in bytes
  path VARCHAR(500) NOT NULL,
  thumbnail_path VARCHAR(500) NULL,
  alt_text VARCHAR(255) NULL,
  caption TEXT NULL,
  folder VARCHAR(100) DEFAULT 'general',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);
```

#### Settings Table
```sql
CREATE TABLE settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  `key` VARCHAR(100) NOT NULL UNIQUE,
  value TEXT NULL,
  `group` VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 3. API SPECIFICATIONS

### 3.1 API Endpoints Overview

**Base URL:** `/api/v1`

#### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/login` | Đăng nhập | No |
| POST | `/auth/register` | Đăng ký | No |
| POST | `/auth/refresh` | Refresh token | Yes |
| POST | `/auth/logout` | Đăng xuất | Yes |
| GET | `/auth/me` | Thông tin user hiện tại | Yes |

#### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users` | Danh sách users | Admin |
| GET | `/users/:id` | Chi tiết user | Admin/Self |
| POST | `/users` | Tạo user | Admin |
| PUT | `/users/:id` | Cập nhật user | Admin/Self |
| DELETE | `/users/:id` | Xóa user | Admin |

#### Categories
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/categories` | Danh sách categories | Yes |
| GET | `/categories/tree` | Categories dạng tree | Yes |
| GET | `/categories/:id` | Chi tiết category | Yes |
| POST | `/categories` | Tạo category | Admin/Editor |
| PUT | `/categories/:id` | Cập nhật category | Admin/Editor |
| DELETE | `/categories/:id` | Xóa category | Admin |
| PUT | `/categories/reorder` | Sắp xếp lại | Admin/Editor |

#### Posts
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/posts` | Danh sách posts | Yes |
| GET | `/posts/:id` | Chi tiết post | Yes |
| GET | `/posts/slug/:slug` | Lấy post theo slug | Yes |
| POST | `/posts` | Tạo post | Admin/Editor/Author |
| PUT | `/posts/:id` | Cập nhật post | Admin/Editor/Owner |
| DELETE | `/posts/:id` | Xóa post | Admin/Editor/Owner |
| PUT | `/posts/:id/status` | Đổi trạng thái | Admin/Editor |

#### Products
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/products` | Danh sách products | Yes |
| GET | `/products/:id` | Chi tiết product | Yes |
| GET | `/products/slug/:slug` | Lấy product theo slug | Yes |
| POST | `/products` | Tạo product | Admin/Editor |
| PUT | `/products/:id` | Cập nhật product | Admin/Editor |
| DELETE | `/products/:id` | Xóa product | Admin |
| POST | `/products/:id/prices` | Thêm price variant | Admin/Editor |
| PUT | `/products/:id/prices/:priceId` | Cập nhật price | Admin/Editor |
| DELETE | `/products/:id/prices/:priceId` | Xóa price | Admin/Editor |

#### Reservations
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/reservations` | Danh sách reservations | Yes |
| GET | `/reservations/:id` | Chi tiết reservation | Yes |
| POST | `/reservations` | Tạo reservation (public) | No |
| PUT | `/reservations/:id` | Cập nhật reservation | Admin/Editor |
| PUT | `/reservations/:id/status` | Đổi trạng thái | Admin/Editor |
| DELETE | `/reservations/:id` | Xóa reservation | Admin |
| GET | `/reservations/calendar` | Lịch đặt bàn | Yes |

#### Contacts
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/contacts` | Danh sách contacts | Yes |
| GET | `/contacts/:id` | Chi tiết contact | Yes |
| POST | `/contacts` | Gửi contact (public) | No |
| PUT | `/contacts/:id/status` | Đổi trạng thái | Admin/Editor |
| DELETE | `/contacts/:id` | Xóa contact | Admin |
| DELETE | `/contacts/bulk` | Xóa nhiều contacts | Admin |

#### Menus
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/menus` | Danh sách menus | Yes |
| GET | `/menus/:id` | Chi tiết menu + items | Yes |
| GET | `/menus/location/:location` | Lấy menu theo vị trí | Yes |
| POST | `/menus` | Tạo menu | Admin |
| PUT | `/menus/:id` | Cập nhật menu | Admin |
| DELETE | `/menus/:id` | Xóa menu | Admin |
| POST | `/menus/:id/items` | Thêm menu item | Admin |
| PUT | `/menus/:id/items/:itemId` | Cập nhật item | Admin |
| DELETE | `/menus/:id/items/:itemId` | Xóa item | Admin |
| PUT | `/menus/:id/items/reorder` | Sắp xếp lại items | Admin |

#### Media
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/media` | Danh sách media | Yes |
| GET | `/media/:id` | Chi tiết media | Yes |
| POST | `/media/upload` | Upload file | Yes |
| POST | `/media/upload/multiple` | Upload nhiều files | Yes |
| PUT | `/media/:id` | Cập nhật metadata | Yes |
| DELETE | `/media/:id` | Xóa media | Admin/Owner |
| DELETE | `/media/bulk` | Xóa nhiều media | Admin |
| GET | `/media/folders` | Danh sách folders | Yes |
| POST | `/media/folders` | Tạo folder | Yes |

#### Settings
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/settings` | Tất cả settings | Admin |
| GET | `/settings/:key` | Lấy setting theo key | Admin |
| PUT | `/settings` | Cập nhật settings | Admin |
| GET | `/settings/group/:group` | Settings theo group | Admin |

---

### 3.2 Request/Response Examples

#### Create Post
```http
POST /api/v1/posts
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Bài viết mẫu",
  "content": "<p>Nội dung bài viết...</p>",
  "excerpt": "Tóm tắt ngắn",
  "category_id": 1,
  "featured_image_id": 5,
  "status": "published",
  "is_featured": true,
  "seo_title": "Bài viết mẫu | Website",
  "seo_description": "Mô tả SEO cho bài viết"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "title": "Bài viết mẫu",
    "slug": "bai-viet-mau",
    "content": "<p>Nội dung bài viết...</p>",
    "excerpt": "Tóm tắt ngắn",
    "category_id": 1,
    "author_id": 1,
    "featured_image_id": 5,
    "status": "published",
    "is_featured": true,
    "view_count": 0,
    "seo_title": "Bài viết mẫu | Website",
    "seo_description": "Mô tả SEO cho bài viết",
    "published_at": "2026-02-05T10:30:00.000Z",
    "created_at": "2026-02-05T10:30:00.000Z",
    "updated_at": "2026-02-05T10:30:00.000Z",
    "category": {
      "id": 1,
      "name": "Tin tức",
      "slug": "tin-tuc"
    },
    "author": {
      "id": 1,
      "full_name": "Admin"
    },
    "featured_image": {
      "id": 5,
      "path": "/uploads/2026/02/image.jpg",
      "alt_text": "Hình ảnh"
    }
  }
}
```

#### Create Product with Prices
```http
POST /api/v1/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Cà phê sữa đá",
  "description": "<p>Cà phê sữa đá truyền thống...</p>",
  "short_description": "Cà phê sữa đá thơm ngon",
  "category_id": 3,
  "featured_image_id": 10,
  "gallery": [11, 12, 13],
  "status": "published",
  "is_featured": true,
  "prices": [
    {
      "variant_name": "Size S",
      "price": 25000,
      "sale_price": null,
      "is_default": false
    },
    {
      "variant_name": "Size M",
      "price": 30000,
      "sale_price": 28000,
      "is_default": true
    },
    {
      "variant_name": "Size L",
      "price": 35000,
      "sale_price": null,
      "is_default": false
    }
  ]
}
```

#### Create Reservation (Public)
```http
POST /api/v1/reservations
Content-Type: application/json

{
  "customer_name": "Nguyễn Văn A",
  "customer_email": "email@example.com",
  "customer_phone": "0901234567",
  "party_size": 4,
  "date": "2026-02-10",
  "time": "18:30",
  "special_request": "Bàn gần cửa sổ"
}
```

#### Upload Media
```http
POST /api/v1/media/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [binary]
folder: "posts"
alt_text: "Mô tả hình ảnh"
```

#### Get Menu with Items (Tree Structure)
```http
GET /api/v1/menus/location/header
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Main Menu",
    "location": "header",
    "status": "active",
    "items": [
      {
        "id": 1,
        "title": "Trang chủ",
        "url": "/",
        "target": "_self",
        "icon": "home",
        "sort_order": 0,
        "children": []
      },
      {
        "id": 2,
        "title": "Sản phẩm",
        "url": "/san-pham",
        "target": "_self",
        "icon": "package",
        "sort_order": 1,
        "children": [
          {
            "id": 5,
            "title": "Cà phê",
            "url": "/san-pham/ca-phe",
            "target": "_self",
            "sort_order": 0,
            "children": []
          },
          {
            "id": 6,
            "title": "Trà",
            "url": "/san-pham/tra",
            "target": "_self",
            "sort_order": 1,
            "children": []
          }
        ]
      }
    ]
  }
}
```

---

## 4. BACKEND ARCHITECTURE

### 4.1 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── index.js
│   │   ├── database.js
│   │   ├── jwt.js
│   │   └── upload.js
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   ├── validate.middleware.js
│   │   ├── upload.middleware.js
│   │   └── error.middleware.js
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   └── auth.validation.js
│   │   │
│   │   ├── user/
│   │   │   ├── user.controller.js
│   │   │   ├── user.model.js
│   │   │   ├── user.service.js
│   │   │   └── user.validation.js
│   │   │
│   │   ├── category/
│   │   │   ├── category.controller.js
│   │   │   ├── category.model.js
│   │   │   ├── category.service.js
│   │   │   └── category.validation.js
│   │   │
│   │   ├── post/
│   │   │   ├── post.controller.js
│   │   │   ├── post.model.js
│   │   │   ├── post.service.js
│   │   │   └── post.validation.js
│   │   │
│   │   ├── product/
│   │   │   ├── product.controller.js
│   │   │   ├── product.model.js
│   │   │   ├── productPrice.model.js
│   │   │   ├── product.service.js
│   │   │   └── product.validation.js
│   │   │
│   │   ├── reservation/
│   │   │   ├── reservation.controller.js
│   │   │   ├── reservation.model.js
│   │   │   ├── reservation.service.js
│   │   │   └── reservation.validation.js
│   │   │
│   │   ├── contact/
│   │   │   ├── contact.controller.js
│   │   │   ├── contact.model.js
│   │   │   ├── contact.service.js
│   │   │   └── contact.validation.js
│   │   │
│   │   ├── menu/
│   │   │   ├── menu.controller.js
│   │   │   ├── menu.model.js
│   │   │   ├── menuItem.model.js
│   │   │   ├── menu.service.js
│   │   │   └── menu.validation.js
│   │   │
│   │   ├── media/
│   │   │   ├── media.controller.js
│   │   │   ├── media.model.js
│   │   │   ├── media.service.js
│   │   │   └── media.validation.js
│   │   │
│   │   └── setting/
│   │       ├── setting.controller.js
│   │       ├── setting.model.js
│   │       └── setting.service.js
│   │
│   ├── utils/
│   │   ├── response.util.js
│   │   ├── logger.util.js
│   │   ├── slug.util.js
│   │   └── file.util.js
│   │
│   ├── app.js
│   └── server.js
│
├── uploads/
│   ├── 2026/
│   │   └── 02/
│   └── thumbnails/
│
├── .env.example
├── package.json
└── README.md
```

### 4.2 Code Implementation

#### Database Configuration
```javascript
// src/config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

// Import all models
const User = require('../modules/user/user.model')(sequelize);
const Category = require('../modules/category/category.model')(sequelize);
const Post = require('../modules/post/post.model')(sequelize);
const Product = require('../modules/product/product.model')(sequelize);
const ProductPrice = require('../modules/product/productPrice.model')(sequelize);
const Reservation = require('../modules/reservation/reservation.model')(sequelize);
const Contact = require('../modules/contact/contact.model')(sequelize);
const Menu = require('../modules/menu/menu.model')(sequelize);
const MenuItem = require('../modules/menu/menuItem.model')(sequelize);
const Media = require('../modules/media/media.model')(sequelize);
const Setting = require('../modules/setting/setting.model')(sequelize);

// Define associations
// Category self-reference (parent-child)
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parent_id' });
Category.hasMany(Category, { as: 'children', foreignKey: 'parent_id' });
Category.belongsTo(Media, { as: 'image', foreignKey: 'image_id' });

// Post associations
Post.belongsTo(Category, { as: 'category', foreignKey: 'category_id' });
Post.belongsTo(User, { as: 'author', foreignKey: 'author_id' });
Post.belongsTo(Media, { as: 'featuredImage', foreignKey: 'featured_image_id' });
Category.hasMany(Post, { foreignKey: 'category_id' });
User.hasMany(Post, { foreignKey: 'author_id' });

// Product associations
Product.belongsTo(Category, { as: 'category', foreignKey: 'category_id' });
Product.belongsTo(Media, { as: 'featuredImage', foreignKey: 'featured_image_id' });
Product.hasMany(ProductPrice, { as: 'prices', foreignKey: 'product_id' });
ProductPrice.belongsTo(Product, { foreignKey: 'product_id' });
Category.hasMany(Product, { foreignKey: 'category_id' });

// Reservation associations
Reservation.belongsTo(User, { as: 'handler', foreignKey: 'handled_by' });

// Menu associations
Menu.hasMany(MenuItem, { as: 'items', foreignKey: 'menu_id' });
MenuItem.belongsTo(Menu, { foreignKey: 'menu_id' });
MenuItem.belongsTo(MenuItem, { as: 'parent', foreignKey: 'parent_id' });
MenuItem.hasMany(MenuItem, { as: 'children', foreignKey: 'parent_id' });

// Media associations
Media.belongsTo(User, { as: 'uploader', foreignKey: 'uploaded_by' });
User.hasMany(Media, { foreignKey: 'uploaded_by' });

// User avatar
User.belongsTo(Media, { as: 'avatar', foreignKey: 'avatar_id' });

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    if (process.env.DB_SYNC_ALTER === 'true') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database synced (alter mode)');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  syncDatabase,
  User,
  Category,
  Post,
  Product,
  ProductPrice,
  Reservation,
  Contact,
  Menu,
  MenuItem,
  Media,
  Setting
};
```

#### Category Model
```javascript
// src/modules/category/category.model.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { len: [2, 100] }
    },
    slug: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    image_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('post', 'product'),
      defaultValue: 'post'
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    },
    seo_title: {
      type: DataTypes.STRING(70),
      allowNull: true
    },
    seo_description: {
      type: DataTypes.STRING(160),
      allowNull: true
    }
  }, {
    tableName: 'categories',
    timestamps: true,
    underscored: true
  });

  return Category;
};
```

#### Category Service
```javascript
// src/modules/category/category.service.js
const { Category, Media } = require('../../config/database');
const { generateSlug } = require('../../utils/slug.util');
const { Op } = require('sequelize');

class CategoryService {
  async findAll(options = {}) {
    const { type, status, search, page = 1, limit = 20 } = options;
    
    const where = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    const offset = (page - 1) * limit;
    
    const { count, rows } = await Category.findAndCountAll({
      where,
      include: [
        { model: Media, as: 'image', attributes: ['id', 'path', 'alt_text'] },
        { model: Category, as: 'parent', attributes: ['id', 'name', 'slug'] }
      ],
      order: [['sort_order', 'ASC'], ['name', 'ASC']],
      limit: parseInt(limit),
      offset
    });

    return {
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  async findTree(type = null) {
    const where = { parent_id: null };
    if (type) where.type = type;

    const categories = await Category.findAll({
      where,
      include: [
        { model: Media, as: 'image', attributes: ['id', 'path', 'alt_text'] },
        {
          model: Category,
          as: 'children',
          include: [
            { model: Media, as: 'image', attributes: ['id', 'path', 'alt_text'] },
            {
              model: Category,
              as: 'children',
              include: [{ model: Media, as: 'image', attributes: ['id', 'path', 'alt_text'] }]
            }
          ]
        }
      ],
      order: [
        ['sort_order', 'ASC'],
        [{ model: Category, as: 'children' }, 'sort_order', 'ASC'],
        [{ model: Category, as: 'children' }, { model: Category, as: 'children' }, 'sort_order', 'ASC']
      ]
    });

    return categories;
  }

  async findById(id) {
    const category = await Category.findByPk(id, {
      include: [
        { model: Media, as: 'image' },
        { model: Category, as: 'parent' },
        { model: Category, as: 'children' }
      ]
    });

    if (!category) {
      throw { status: 404, message: 'Category không tồn tại' };
    }

    return category;
  }

  async create(data) {
    // Generate slug
    if (!data.slug) {
      data.slug = await this.generateUniqueSlug(data.name);
    }

    // Validate parent exists
    if (data.parent_id) {
      const parent = await Category.findByPk(data.parent_id);
      if (!parent) {
        throw { status: 400, message: 'Parent category không tồn tại' };
      }
    }

    const category = await Category.create(data);
    return this.findById(category.id);
  }

  async update(id, data) {
    const category = await this.findById(id);

    // Generate new slug if name changed
    if (data.name && data.name !== category.name && !data.slug) {
      data.slug = await this.generateUniqueSlug(data.name, id);
    }

    // Prevent circular reference
    if (data.parent_id) {
      if (data.parent_id === id) {
        throw { status: 400, message: 'Category không thể là parent của chính nó' };
      }
      
      // Check if new parent is not a child of this category
      const descendants = await this.getDescendants(id);
      if (descendants.includes(data.parent_id)) {
        throw { status: 400, message: 'Không thể chọn category con làm parent' };
      }
    }

    await category.update(data);
    return this.findById(id);
  }

  async delete(id) {
    const category = await this.findById(id);
    
    // Move children to parent
    await Category.update(
      { parent_id: category.parent_id },
      { where: { parent_id: id } }
    );

    await category.destroy();
  }

  async reorder(items) {
    const updates = items.map((item, index) => 
      Category.update(
        { sort_order: index, parent_id: item.parent_id || null },
        { where: { id: item.id } }
      )
    );
    
    await Promise.all(updates);
  }

  async generateUniqueSlug(name, excludeId = null) {
    let slug = generateSlug(name);
    let counter = 0;
    let uniqueSlug = slug;

    while (true) {
      const where = { slug: uniqueSlug };
      if (excludeId) {
        where.id = { [Op.ne]: excludeId };
      }

      const existing = await Category.findOne({ where });
      if (!existing) break;

      counter++;
      uniqueSlug = `${slug}-${counter}`;
    }

    return uniqueSlug;
  }

  async getDescendants(id) {
    const descendants = [];
    
    const findChildren = async (parentId) => {
      const children = await Category.findAll({
        where: { parent_id: parentId },
        attributes: ['id']
      });
      
      for (const child of children) {
        descendants.push(child.id);
        await findChildren(child.id);
      }
    };

    await findChildren(id);
    return descendants;
  }
}

module.exports = new CategoryService();
```

#### Post Model
```javascript
// src/modules/post/post.model.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Post = sequelize.define('Post', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { len: [2, 255] }
    },
    slug: {
      type: DataTypes.STRING(280),
      allowNull: false,
      unique: true
    },
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    },
    excerpt: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    featured_image_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'draft'
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    view_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    seo_title: {
      type: DataTypes.STRING(70),
      allowNull: true
    },
    seo_description: {
      type: DataTypes.STRING(160),
      allowNull: true
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'posts',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeSave: (post) => {
        if (post.status === 'published' && !post.published_at) {
          post.published_at = new Date();
        }
      }
    }
  });

  return Post;
};
```

#### Product Model
```javascript
// src/modules/product/product.model.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { len: [2, 255] }
    },
    slug: {
      type: DataTypes.STRING(280),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    },
    short_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    featured_image_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    gallery: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'draft'
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    seo_title: {
      type: DataTypes.STRING(70),
      allowNull: true
    },
    seo_description: {
      type: DataTypes.STRING(160),
      allowNull: true
    }
  }, {
    tableName: 'products',
    timestamps: true,
    underscored: true
  });

  return Product;
};
```

#### Product Price Model
```javascript
// src/modules/product/productPrice.model.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductPrice = sequelize.define('ProductPrice', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    variant_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: { min: 0 }
    },
    sale_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      validate: { min: 0 }
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    }
  }, {
    tableName: 'product_prices',
    timestamps: true,
    underscored: true
  });

  return ProductPrice;
};
```

#### Reservation Model
```javascript
// src/modules/reservation/reservation.model.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Reservation = sequelize.define('Reservation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    customer_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { len: [2, 100] }
    },
    customer_email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: { isEmail: true }
    },
    customer_phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    party_size: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 50 }
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    special_request: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    handled_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show'),
      defaultValue: 'pending'
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'reservations',
    timestamps: true,
    underscored: true
  });

  return Reservation;
};
```

#### Contact Model
```javascript
// src/modules/contact/contact.model.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Contact = sequelize.define('Contact', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { len: [2, 100] }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: { isEmail: true }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('new', 'read', 'replied', 'spam'),
      defaultValue: 'new'
    },
    source: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true
    }
  }, {
    tableName: 'contacts',
    timestamps: true,
    underscored: true
  });

  return Contact;
};
```

#### Menu Model
```javascript
// src/modules/menu/menu.model.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Menu = sequelize.define('Menu', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    location: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    }
  }, {
    tableName: 'menus',
    timestamps: true,
    underscored: true
  });

  return Menu;
};
```

#### Menu Item Model
```javascript
// src/modules/menu/menuItem.model.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MenuItem = sequelize.define('MenuItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    menu_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    target: {
      type: DataTypes.ENUM('_self', '_blank'),
      defaultValue: '_self'
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    linkable_type: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    linkable_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    }
  }, {
    tableName: 'menu_items',
    timestamps: true,
    underscored: true
  });

  return MenuItem;
};
```

#### Media Model
```javascript
// src/modules/media/media.model.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Media = sequelize.define('Media', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    uploaded_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    filename: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    original_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    mime_type: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    path: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    thumbnail_path: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    alt_text: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    caption: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    folder: {
      type: DataTypes.STRING(100),
      defaultValue: 'general'
    }
  }, {
    tableName: 'media',
    timestamps: true,
    underscored: true
  });

  return Media;
};
```

#### Media Service
```javascript
// src/modules/media/media.service.js
const { Media, User } = require('../../config/database');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');

class MediaService {
  async findAll(options = {}) {
    const { folder, mime_type, search, page = 1, limit = 20 } = options;
    
    const where = {};
    if (folder) where.folder = folder;
    if (mime_type) where.mime_type = { [Op.like]: `${mime_type}%` };
    if (search) {
      where[Op.or] = [
        { filename: { [Op.like]: `%${search}%` } },
        { original_name: { [Op.like]: `%${search}%` } },
        { alt_text: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;
    
    const { count, rows } = await Media.findAndCountAll({
      where,
      include: [{ model: User, as: 'uploader', attributes: ['id', 'full_name'] }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    return {
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  async findById(id) {
    const media = await Media.findByPk(id, {
      include: [{ model: User, as: 'uploader', attributes: ['id', 'full_name'] }]
    });

    if (!media) {
      throw { status: 404, message: 'Media không tồn tại' };
    }

    return media;
  }

  async upload(file, userId, options = {}) {
    const { folder = 'general', alt_text = '', caption = '' } = options;
    
    // Generate unique filename
    const ext = path.extname(file.originalname);
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`;
    
    // Create directory structure
    const uploadDir = path.join(process.cwd(), 'uploads', String(year), month);
    await fs.mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, filename);
    const relativePath = `/uploads/${year}/${month}/${filename}`;
    
    // Save file
    await fs.writeFile(filePath, file.buffer);
    
    // Generate thumbnail for images
    let thumbnailPath = null;
    if (file.mimetype.startsWith('image/')) {
      const thumbDir = path.join(process.cwd(), 'uploads', 'thumbnails', String(year), month);
      await fs.mkdir(thumbDir, { recursive: true });
      
      const thumbFilename = `thumb-${filename}`;
      const thumbPath = path.join(thumbDir, thumbFilename);
      
      await sharp(file.buffer)
        .resize(300, 300, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toFile(thumbPath);
      
      thumbnailPath = `/uploads/thumbnails/${year}/${month}/${thumbFilename}`;
    }

    // Save to database
    const media = await Media.create({
      uploaded_by: userId,
      filename,
      original_name: file.originalname,
      mime_type: file.mimetype,
      size: file.size,
      path: relativePath,
      thumbnail_path: thumbnailPath,
      alt_text,
      caption,
      folder
    });

    return this.findById(media.id);
  }

  async uploadMultiple(files, userId, options = {}) {
    const results = [];
    
    for (const file of files) {
      const media = await this.upload(file, userId, options);
      results.push(media);
    }

    return results;
  }

  async update(id, data) {
    const media = await this.findById(id);
    
    const allowedFields = ['alt_text', 'caption', 'folder'];
    const updateData = {};
    
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    await media.update(updateData);
    return this.findById(id);
  }

  async delete(id) {
    const media = await this.findById(id);
    
    // Delete physical files
    try {
      const filePath = path.join(process.cwd(), media.path);
      await fs.unlink(filePath);
      
      if (media.thumbnail_path) {
        const thumbPath = path.join(process.cwd(), media.thumbnail_path);
        await fs.unlink(thumbPath);
      }
    } catch (err) {
      console.error('Error deleting files:', err);
    }

    await media.destroy();
  }

  async deleteMultiple(ids) {
    for (const id of ids) {
      await this.delete(id);
    }
  }

  async getFolders() {
    const folders = await Media.findAll({
      attributes: ['folder'],
      group: ['folder'],
      order: [['folder', 'ASC']]
    });

    return folders.map(f => f.folder);
  }
}

module.exports = new MediaService();
```

#### Slug Utility
```javascript
// src/utils/slug.util.js
const generateSlug = (text) => {
  // Vietnamese character map
  const from = 'àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ';
  const to = 'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd';
  
  let slug = text.toLowerCase();
  
  // Replace Vietnamese characters
  for (let i = 0; i < from.length; i++) {
    slug = slug.replace(new RegExp(from[i], 'g'), to[i]);
  }
  
  // Replace special characters
  slug = slug
    .replace(/[^a-z0-9\s-]/g, '')  // Remove non-alphanumeric
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .replace(/-+/g, '-')           // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '');      // Remove leading/trailing hyphens
  
  return slug;
};

module.exports = { generateSlug };
```

#### Upload Middleware
```javascript
// src/middlewares/upload.middleware.js
const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type không được hỗ trợ'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10
  }
});

module.exports = { upload };
```

#### App Entry Point
```javascript
// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Controllers
const authController = require('./modules/auth/auth.controller');
const userController = require('./modules/user/user.controller');
const categoryController = require('./modules/category/category.controller');
const postController = require('./modules/post/post.controller');
const productController = require('./modules/product/product.controller');
const reservationController = require('./modules/reservation/reservation.controller');
const contactController = require('./modules/contact/contact.controller');
const menuController = require('./modules/menu/menu.controller');
const mediaController = require('./modules/media/media.controller');
const settingController = require('./modules/setting/setting.controller');

const errorHandler = require('./middlewares/error.middleware');

const app = express();

// Middlewares
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/auth', authController);
app.use('/api/v1/users', userController);
app.use('/api/v1/categories', categoryController);
app.use('/api/v1/posts', postController);
app.use('/api/v1/products', productController);
app.use('/api/v1/reservations', reservationController);
app.use('/api/v1/contacts', contactController);
app.use('/api/v1/menus', menuController);
app.use('/api/v1/media', mediaController);
app.use('/api/v1/settings', settingController);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route không tồn tại' });
});

// Error handler
app.use(errorHandler);

module.exports = app;
```

---

## 5. FRONTEND ARCHITECTURE

### 5.1 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.astro
│   │   │   ├── Input.astro
│   │   │   ├── Textarea.astro
│   │   │   ├── Select.astro
│   │   │   ├── Card.astro
│   │   │   ├── Badge.astro
│   │   │   ├── Modal.astro
│   │   │   ├── Table.astro
│   │   │   ├── Alert.astro
│   │   │   ├── Dropdown.astro
│   │   │   ├── Tabs.astro
│   │   │   ├── Pagination.astro
│   │   │   ├── FileUpload.astro
│   │   │   └── RichEditor.astro
│   │   │
│   │   ├── islands/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── CategoryForm.tsx
│   │   │   ├── CategoryTree.tsx
│   │   │   ├── PostForm.tsx
│   │   │   ├── PostTable.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   ├── ProductTable.tsx
│   │   │   ├── PriceEditor.tsx
│   │   │   ├── ReservationTable.tsx
│   │   │   ├── ReservationCalendar.tsx
│   │   │   ├── ContactTable.tsx
│   │   │   ├── MenuBuilder.tsx
│   │   │   ├── MediaLibrary.tsx
│   │   │   ├── MediaPicker.tsx
│   │   │   ├── ImageUploader.tsx
│   │   │   ├── RichTextEditor.tsx
│   │   │   ├── SettingsForm.tsx
│   │   │   └── ConfirmModal.tsx
│   │   │
│   │   └── layout/
│   │       ├── Header.astro
│   │       ├── Sidebar.astro
│   │       └── Footer.astro
│   │
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   ├── AuthLayout.astro
│   │   └── DashboardLayout.astro
│   │
│   ├── pages/
│   │   ├── index.astro
│   │   ├── login.astro
│   │   ├── dashboard/
│   │   │   └── index.astro
│   │   ├── categories/
│   │   │   ├── index.astro
│   │   │   ├── new.astro
│   │   │   └── [id].astro
│   │   ├── posts/
│   │   │   ├── index.astro
│   │   │   ├── new.astro
│   │   │   └── [id].astro
│   │   ├── products/
│   │   │   ├── index.astro
│   │   │   ├── new.astro
│   │   │   └── [id].astro
│   │   ├── reservations/
│   │   │   ├── index.astro
│   │   │   ├── calendar.astro
│   │   │   └── [id].astro
│   │   ├── contacts/
│   │   │   ├── index.astro
│   │   │   └── [id].astro
│   │   ├── menus/
│   │   │   ├── index.astro
│   │   │   └── [id].astro
│   │   ├── media/
│   │   │   └── index.astro
│   │   ├── users/
│   │   │   ├── index.astro
│   │   │   ├── profile.astro
│   │   │   └── [id].astro
│   │   └── settings/
│   │       └── index.astro
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   ├── users.ts
│   │   │   ├── categories.ts
│   │   │   ├── posts.ts
│   │   │   ├── products.ts
│   │   │   ├── reservations.ts
│   │   │   ├── contacts.ts
│   │   │   ├── menus.ts
│   │   │   ├── media.ts
│   │   │   └── settings.ts
│   │   │
│   │   ├── stores/
│   │   │   ├── auth.ts
│   │   │   ├── ui.ts
│   │   │   └── media.ts
│   │   │
│   │   └── utils/
│   │       ├── auth.ts
│   │       ├── cn.ts
│   │       ├── format.ts
│   │       └── validation.ts
│   │
│   ├── middleware/
│   │   └── index.ts
│   │
│   └── styles/
│       └── global.css
│
├── public/
│   └── images/
│
├── astro.config.mjs
├── tailwind.config.js
└── package.json
```

### 5.2 Frontend Code Examples

#### Sidebar Component
```astro
---
// src/components/layout/Sidebar.astro
interface Props {
  user: {
    role: string;
  };
}

const { user } = Astro.props;
const currentPath = Astro.url.pathname;

const menuItems = [
  { 
    href: '/dashboard', 
    label: 'Dashboard', 
    icon: 'LayoutDashboard',
    roles: ['admin', 'editor', 'author'] 
  },
  { 
    href: '/posts', 
    label: 'Bài viết', 
    icon: 'FileText',
    roles: ['admin', 'editor', 'author'],
    children: [
      { href: '/posts', label: 'Tất cả bài viết' },
      { href: '/posts/new', label: 'Thêm mới' },
      { href: '/categories?type=post', label: 'Danh mục' }
    ]
  },
  { 
    href: '/products', 
    label: 'Sản phẩm', 
    icon: 'Package',
    roles: ['admin', 'editor'],
    children: [
      { href: '/products', label: 'Tất cả sản phẩm' },
      { href: '/products/new', label: 'Thêm mới' },
      { href: '/categories?type=product', label: 'Danh mục' }
    ]
  },
  { 
    href: '/reservations', 
    label: 'Đặt bàn', 
    icon: 'Calendar',
    roles: ['admin', 'editor'],
    children: [
      { href: '/reservations', label: 'Danh sách' },
      { href: '/reservations/calendar', label: 'Lịch' }
    ]
  },
  { 
    href: '/contacts', 
    label: 'Liên hệ', 
    icon: 'Mail',
    roles: ['admin', 'editor'] 
  },
  { 
    href: '/media', 
    label: 'Media', 
    icon: 'Image',
    roles: ['admin', 'editor', 'author'] 
  },
  { 
    href: '/menus', 
    label: 'Menu', 
    icon: 'Menu',
    roles: ['admin'] 
  },
  { 
    href: '/users', 
    label: 'Người dùng', 
    icon: 'Users',
    roles: ['admin'] 
  },
  { 
    href: '/settings', 
    label: 'Cài đặt', 
    icon: 'Settings',
    roles: ['admin'] 
  }
];

const filteredItems = menuItems.filter(item => item.roles.includes(user.role));

const isActive = (href: string) => {
  if (href === '/dashboard') {
    return currentPath === '/dashboard';
  }
  return currentPath.startsWith(href);
};
---

<aside class="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
  <div class="p-6 border-b border-gray-200">
    <h1 class="text-xl font-bold text-gray-800">CMS Admin</h1>
  </div>
  
  <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
    {filteredItems.map(item => (
      <div class="space-y-1">
        
          href={item.href}
          class:list={[
            'flex items-center px-4 py-2.5 rounded-lg transition-colors text-sm font-medium',
            isActive(item.href)
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          ]}
        >
          <span class="w-5 h-5 mr-3">{/* Icon */}</span>
          {item.label}
        </a>
        
        {item.children && isActive(item.href) && (
          <div class="ml-8 space-y-1">
            {item.children.map(child => (
              
                href={child.href}
                class:list={[
                  'block px-4 py-2 rounded-lg text-sm transition-colors',
                  currentPath === child.href
                    ? 'text-primary-700 bg-primary-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                ]}
              >
                {child.label}
              </a>
            ))}
          </div>
        )}
      </div>
    ))}
  </nav>
</aside>
```

#### Post Form Island
```tsx
// src/components/islands/PostForm.tsx
import { useState, useEffect } from 'react';
import { postsApi } from '../../lib/api/posts';
import { categoriesApi } from '../../lib/api/categories';

interface Post {
  id?: number;
  title: string;
  content: string;
  excerpt: string;
  category_id: number | null;
  featured_image_id: number | null;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  seo_title: string;
  seo_description: string;
}

interface Props {
  initialData?: Post;
  mode: 'create' | 'edit';
}

export default function PostForm({ initialData, mode }: Props) {
  const [formData, setFormData] = useState<Post>(initialData || {
    title: '',
    content: '',
    excerpt: '',
    category_id: null,
    featured_image_id: null,
    status: 'draft',
    is_featured: false,
    seo_title: '',
    seo_description: ''
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data } = await categoriesApi.getTree('post');
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const handleChange = (field: keyof Post, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề không được để trống';
    }
    
    if (formData.seo_title && formData.seo_title.length > 70) {
      newErrors.seo_title = 'SEO title tối đa 70 ký tự';
    }
    
    if (formData.seo_description && formData.seo_description.length > 160) {
      newErrors.seo_description = 'SEO description tối đa 160 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    
    try {
      if (mode === 'create') {
        const { data } = await postsApi.create(formData);
        window.location.href = `/posts/${data.id}`;
      } else {
        await postsApi.update(initialData!.id!, formData);
        window.location.href = '/posts';
      }
    } catch (err: any) {
      setErrors({ form: err.response?.data?.message || 'Có lỗi xảy ra' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    handleChange('status', 'draft');
    handleSubmit(new Event('submit') as any);
  };

  const handlePublish = async () => {
    handleChange('status', 'published');
    handleSubmit(new Event('submit') as any);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.form && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{errors.form}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="label">Tiêu đề *</label>
            <input
              id="title"
              type="text"
              className={`input ${errors.title ? 'input-error' : ''}`}
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Nhập tiêu đề bài viết"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Content - Rich Text Editor */}
          <div>
            <label className="label">Nội dung</label>
            <div className="border border-gray-300 rounded-lg min-h-[400px]">
              {/* Rich Text Editor Component */}
              <textarea
                className="w-full h-[400px] p-4 focus:outline-none"
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                placeholder="Nhập nội dung bài viết..."
              />
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label htmlFor="excerpt" className="label">Tóm tắt</label>
            <textarea
              id="excerpt"
              rows={3}
              className="input"
              value={formData.excerpt}
              onChange={(e) => handleChange('excerpt', e.target.value)}
              placeholder="Tóm tắt ngắn về bài viết"
            />
          </div>

          {/* SEO */}
          <div className="card p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">SEO</h3>
            
            <div>
              <label htmlFor="seo_title" className="label">
                SEO Title ({formData.seo_title?.length || 0}/70)
              </label>
              <input
                id="seo_title"
                type="text"
                className={`input ${errors.seo_title ? 'input-error' : ''}`}
                value={formData.seo_title}
                onChange={(e) => handleChange('seo_title', e.target.value)}
                maxLength={70}
              />
              {errors.seo_title && (
                <p className="mt-1 text-sm text-red-600">{errors.seo_title}</p>
              )}
            </div>

            <div>
              <label htmlFor="seo_description" className="label">
                SEO Description ({formData.seo_description?.length || 0}/160)
              </label>
              <textarea
                id="seo_description"
                rows={2}
                className={`input ${errors.seo_description ? 'input-error' : ''}`}
                value={formData.seo_description}
                onChange={(e) => handleChange('seo_description', e.target.value)}
                maxLength={160}
              />
              {errors.seo_description && (
                <p className="mt-1 text-sm text-red-600">{errors.seo_description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Box */}
          <div className="card p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Xuất bản</h3>
            
            <div>
              <label className="label">Trạng thái</label>
              <select
                className="input"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value="draft">Bản nháp</option>
                <option value="published">Đã xuất bản</option>
                <option value="archived">Lưu trữ</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                id="is_featured"
                type="checkbox"
                className="w-4 h-4 text-primary-600 rounded"
                checked={formData.is_featured}
                onChange={(e) => handleChange('is_featured', e.target.checked)}
              />
              <label htmlFor="is_featured" className="ml-2 text-sm text-gray-700">
                Bài viết nổi bật
              </label>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={loading}
                className="btn btn-secondary flex-1"
              >
                Lưu nháp
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={loading}
                className="btn btn-primary flex-1"
              >
                {loading ? 'Đang lưu...' : 'Xuất bản'}
              </button>
            </div>
          </div>

          {/* Category */}
          <div className="card p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Danh mục</h3>
            <select
              className="input"
              value={formData.category_id || ''}
              onChange={(e) => handleChange('category_id', e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Featured Image */}
          <div className="card p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Ảnh đại diện</h3>
            
            {formData.featured_image_id ? (
              <div className="relative">
                <img
                  src={`${import.meta.env.PUBLIC_API_URL?.replace('/api/v1', '')}${/* image path */''}`}
                  alt="Featured"
                  className="w-full h-40 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleChange('featured_image_id', null)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowMediaPicker(true)}
                className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 hover:border-primary-500 hover:text-primary-500 transition-colors"
              >
                + Chọn ảnh
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
```

#### Media Library Island
```tsx
// src/components/islands/MediaLibrary.tsx
import { useState, useEffect, useCallback } from 'react';
import { mediaApi, type Media } from '../../lib/api/media';

interface Props {
  mode?: 'library' | 'picker';
  multiple?: boolean;
  onSelect?: (items: Media[]) => void;
  selectedIds?: number[];
}

export default function MediaLibrary({ 
  mode = 'library', 
  multiple = false,
  onSelect,
  selectedIds = []
}: Props) {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<number[]>(selectedIds);
  const [filters, setFilters] = useState({
    folder: '',
    search: '',
    page: 1
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0
  });
  const [folders, setFolders] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    loadMedia();
    loadFolders();
  }, [filters]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const response = await mediaApi.getAll(filters);
      setMedia(response.data.data);
      setPagination({
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages
      });
    } catch (err) {
      console.error('Error loading media:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFolders = async () => {
    try {
      const { data } = await mediaApi.getFolders();
      setFolders(data);
    } catch (err) {
      console.error('Error loading folders:', err);
    }
  };

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      formData.append('folder', filters.folder || 'general');

      await mediaApi.uploadMultiple(formData);
      loadMedia();
    } catch (err) {
      console.error('Error uploading:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  }, [filters.folder]);

  const handleSelect = (id: number) => {
    if (multiple) {
      setSelected(prev => 
        prev.includes(id) 
          ? prev.filter(i => i !== id)
          : [...prev, id]
      );
    } else {
      setSelected([id]);
    }
  };

  const handleConfirmSelect = () => {
    if (onSelect) {
      const selectedMedia = media.filter(m => selected.includes(m.id));
      onSelect(selectedMedia);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa?')) return;
    
    try {
      await mediaApi.delete(id);
      loadMedia();
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Folder Filter */}
          <select
            className="input w-40"
            value={filters.folder}
            onChange={(e) => setFilters(prev => ({ ...prev, folder: e.target.value, page: 1 }))}
          >
            <option value="">Tất cả thư mục</option>
            {folders.map(folder => (
              <option key={folder} value={folder}>{folder}</option>
            ))}
          </select>

          {/* Search */}
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="input w-60"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
          />
        </div>

        {/* Upload Button */}
        <label className="btn btn-primary cursor-pointer">
          <input
            type="file"
            multiple
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
          />
          {uploading ? 'Đang tải...' : '+ Tải lên'}
        </label>
      </div>

      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragActive 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <p className="text-gray-500">
          Kéo thả file vào đây hoặc click nút "Tải lên"
        </p>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Chưa có file nào
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {media.map(item => (
            <div
              key={item.id}
              onClick={() => mode === 'picker' && handleSelect(item.id)}
              className={`
                group relative rounded-lg overflow-hidden border-2 transition-all cursor-pointer
                ${selected.includes(item.id)
                  ? 'border-primary-500 ring-2 ring-primary-200'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              {/* Thumbnail */}
              {item.mime_type.startsWith('image/') ? (
                <img
                  src={`${import.meta.env.PUBLIC_API_URL?.replace('/api/v1', '')}${item.thumbnail_path || item.path}`}
                  alt={item.alt_text || item.filename}
                  className="w-full h-32 object-cover"
                />
              ) : (
                <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                  <span className="text-2xl">📄</span>
                </div>
              )}

              {/* Info */}
              <div className="p-2">
                <p className="text-xs text-gray-700 truncate">{item.original_name}</p>
                <p className="text-xs text-gray-400">{formatFileSize(item.size)}</p>
              </div>

              {/* Selection Indicator */}
              {selected.includes(item.id) && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}

              {/* Actions (Library mode) */}
              {mode === 'library' && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Open detail/edit modal
                    }}
                    className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100"
                  >
                    ✎
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    className="p-2 bg-white rounded-lg text-red-600 hover:bg-red-50"
                  >
                    🗑
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setFilters(prev => ({ ...prev, page }))}
              className={`
                w-10 h-10 rounded-lg transition-colors
                ${filters.page === page
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
                }
              `}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* Picker Confirm Button */}
      {mode === 'picker' && selected.length > 0 && (
        <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setSelected([])}
            className="btn btn-secondary"
          >
            Bỏ chọn ({selected.length})
          </button>
          <button
            type="button"
            onClick={handleConfirmSelect}
            className="btn btn-primary"
          >
            Xác nhận
          </button>
        </div>
      )}
    </div>
  );
}
```

#### Reservation Calendar Island
```tsx
// src/components/islands/ReservationCalendar.tsx
import { useState, useEffect } from 'react';
import { reservationsApi, type Reservation } from '../../lib/api/reservations';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200',
  no_show: 'bg-gray-100 text-gray-800 border-gray-200'
};

export default function ReservationCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  useEffect(() => {
    loadReservations();
  }, [currentDate]);

  const loadReservations = async () => {
    setLoading(true);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    
    try {
      const { data } = await reservationsApi.getCalendar(year, month);
      setReservations(data);
    } catch (err) {
      console.error('Error loading reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay };
  };

  const getReservationsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return reservations.filter(r => r.date === dateStr);
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startingDay }, (_, i) => i);

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await reservationsApi.updateStatus(id, status);
      loadReservations();
      setSelectedReservation(null);
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="btn btn-secondary">
            ← Trước
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="btn btn-secondary"
          >
            Hôm nay
          </button>
          <button onClick={nextMonth} className="btn btn-secondary">
            Sau →
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="card overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-gray-50 border-b">
          {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {/* Blank cells */}
          {blanks.map(i => (
            <div key={`blank-${i}`} className="min-h-[120px] border-b border-r bg-gray-50" />
          ))}

          {/* Day cells */}
          {days.map(day => {
            const dayReservations = getReservationsForDate(day);
            const isToday = 
              day === new Date().getDate() &&
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear();

            return (
              <div
                key={day}
                className={`min-h-[120px] border-b border-r p-2 ${isToday ? 'bg-primary-50' : ''}`}
              >
                <div className={`
                  text-sm font-medium mb-2
                  ${isToday ? 'text-primary-600' : 'text-gray-700'}
                `}>
                  {day}
                </div>

                <div className="space-y-1">
                  {dayReservations.slice(0, 3).map(reservation => (
                    <button
                      key={reservation.id}
                      onClick={() => setSelectedReservation(reservation)}
                      className={`
                        w-full text-left text-xs p-1 rounded border truncate
                        ${statusColors[reservation.status]}
                      `}
                    >
                      {reservation.time.slice(0, 5)} - {reservation.customer_name}
                    </button>
                  ))}
                  {dayReservations.length > 3 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{dayReservations.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded border ${color}`} />
            <span className="text-sm text-gray-600 capitalize">
              {status === 'pending' && 'Chờ xác nhận'}
              {status === 'confirmed' && 'Đã xác nhận'}
              {status === 'cancelled' && 'Đã hủy'}
              {status === 'completed' && 'Hoàn thành'}
              {status === 'no_show' && 'Không đến'}
            </span>
          </div>
        ))}
      </div>

      {/* Reservation Detail Modal */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Chi tiết đặt bàn</h3>
                <button
                  onClick={() => setSelectedReservation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Khách hàng</p>
                  <p className="font-medium">{selectedReservation.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Số điện thoại</p>
                  <p className="font-medium">{selectedReservation.customer_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ngày</p>
                  <p className="font-medium">{selectedReservation.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Giờ</p>
                  <p className="font-medium">{selectedReservation.time}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Số người</p>
                  <p className="font-medium">{selectedReservation.party_size}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Trạng thái</p>
                  <span className={`badge ${statusColors[selectedReservation.status]}`}>
                    {selectedReservation.status}
                  </span>
                </div>
              </div>

              {selectedReservation.special_request && (
                <div>
                  <p className="text-sm text-gray-500">Yêu cầu đặc biệt</p>
                  <p className="text-gray-700">{selectedReservation.special_request}</p>
                </div>
              )}

              {/* Status Actions */}
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 mb-2">Cập nhật trạng thái</p>
                <div className="flex flex-wrap gap-2">
                  {selectedReservation.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(selectedReservation.id, 'confirmed')}
                        className="btn btn-primary text-sm"
                      >
                        Xác nhận
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedReservation.id, 'cancelled')}
                        className="btn btn-danger text-sm"
                      >
                        Hủy
                      </button>
                    </>
                  )}
                  {selectedReservation.status === 'confirmed' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(selectedReservation.id, 'completed')}
                        className="btn btn-primary text-sm"
                      >
                        Hoàn thành
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedReservation.id, 'no_show')}
                        className="btn btn-secondary text-sm"
                      >
                        Không đến
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedReservation.id, 'cancelled')}
                        className="btn btn-danger text-sm"
                      >
                        Hủy
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-2">
              
                href={`/reservations/${selectedReservation.id}`}
                className="btn btn-secondary"
              >
                Chi tiết
              </a>
              <button
                onClick={() => setSelectedReservation(null)}
                className="btn btn-primary"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 6. SECURITY & ACCESS CONTROL

### 6.1 Role-Based Access Matrix

| Resource | Admin | Editor | Author |
|----------|-------|--------|--------|
| **Users** |
| View all users | ✅ | ❌ | ❌ |
| Create user | ✅ | ❌ | ❌ |
| Edit any user | ✅ | ❌ | ❌ |
| Delete user | ✅ | ❌ | ❌ |
| Edit self | ✅ | ✅ | ✅ |
| **Categories** |
| View | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ❌ |
| Edit | ✅ | ✅ | ❌ |
| Delete | ✅ | ❌ | ❌ |
| **Posts** |
| View all | ✅ | ✅ | Own |
| Create | ✅ | ✅ | ✅ |
| Edit any | ✅ | ✅ | Own |
| Delete any | ✅ | ✅ | Own |
| Publish | ✅ | ✅ | ❌ |
| **Products** |
| View | ✅ | ✅ | ❌ |
| Create | ✅ | ✅ | ❌ |
| Edit | ✅ | ✅ | ❌ |
| Delete | ✅ | ❌ | ❌ |
| **Reservations** |
| View | ✅ | ✅ | ❌ |
| Update status | ✅ | ✅ | ❌ |
| Delete | ✅ | ❌ | ❌ |
| **Contacts** |
| View | ✅ | ✅ | ❌ |
| Update status | ✅ | ✅ | ❌ |
| Delete | ✅ | ❌ | ❌ |
| **Menus** |
| Full access | ✅ | ❌ | ❌ |
| **Media** |
| View all | ✅ | ✅ | ✅ |
| Upload | ✅ | ✅ | ✅ |
| Delete any | ✅ | ❌ | Own |
| **Settings** |
| Full access | ✅ | ❌ | ❌ |

### 6.2 JWT Configuration

```javascript
// src/config/jwt.js
module.exports = {
  secret: process.env.JWT_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  accessExpiresIn: '15m',
  refreshExpiresIn: '7d',
  algorithm: 'HS256'
};
```

### 6.3 Input Validation Rules

| Field | Rules |
|-------|-------|
| Email | Valid email format |
| Password | Min 8 chars, 1 uppercase, 1 lowercase, 1 number |
| Title/Name | Min 2, Max 255 chars |
| Slug | Auto-generated, unique, alphanumeric + hyphen |
| SEO Title | Max 70 chars |
| SEO Description | Max 160 chars |
| Phone | Vietnamese phone format |
| Party Size | 1-50 |
| Price | Positive decimal |
| File Upload | Max 10MB, allowed types only |

---

## 7. IMPLEMENTATION PLAN

### Phase 1: Core Backend (8-10 days)

| Task | Hours | Priority |
|------|-------|----------|
| Project setup + dependencies | 3h | P0 |
| Database config + Auto-migration | 6h | P0 |
| Base middlewares (auth, error, validate, upload) | 6h | P0 |
| User module (model, service, controller) | 6h | P0 |
| Auth module (JWT, login, register, refresh) | 8h | P0 |
| Category module (nested tree, CRUD) | 8h | P0 |
| Post module (CRUD, slug, SEO) | 8h | P0 |
| Product module (CRUD, prices) | 10h | P0 |
| Reservation module (CRUD, calendar) | 6h | P0 |
| Contact module (CRUD, status) | 4h | P0 |
| Menu module (nested items) | 8h | P1 |
| Media module (upload, thumbnail) | 10h | P0 |
| Setting module | 3h | P1 |
| Testing + Bug fixes | 8h | P0 |

### Phase 2: Frontend (10-12 days)

| Task | Hours | Priority |
|------|-------|----------|
| Astro project setup + Tailwind | 4h | P0 |
| UI Components library | 8h | P0 |
| Layouts (Auth, Dashboard) | 6h | P0 |
| API client + interceptors | 4h | P0 |
| Auth pages (Login) | 4h | P0 |
| Middleware authentication | 4h | P0 |
| Dashboard page + stats | 6h | P0 |
| Category pages + tree | 8h | P0 |
| Post pages (list, form) | 12h | P0 |
| Product pages (list, form, prices) | 14h | P0 |
| Reservation pages + calendar | 10h | P0 |
| Contact pages | 6h | P1 |
| Menu builder | 10h | P1 |
| Media library | 12h | P0 |
| User management | 6h | P1 |
| Settings page | 4h | P1 |
| Testing + Bug fixes | 10h | P0 |

### Phase 3: Polish & Deploy (3-4 days)

| Task | Hours | Priority |
|------|-------|----------|
| Error handling refinement | 4h | P0 |
| Loading states & UX | 4h | P0 |
| Security hardening | 4h | P0 |
| Performance optimization | 4h | P1 |
| Documentation | 4h | P1 |
| Deployment setup | 6h | P0 |

**Total Estimated: 21-26 days**

---

## 8. ACCEPTANCE CRITERIA

### 8.1 Functional Requirements

| ID | Module | Requirement |
|----|--------|-------------|
| F01 | Auth | User đăng nhập với email/password |
| F02 | Auth | JWT refresh token hoạt động |
| F03 | Auth | Role-based access control |
| F04 | Category | CRUD với nested tree structure |
| F05 | Category | Phân loại theo type (post/product) |
| F06 | Post | CRUD với rich content |
| F07 | Post | Auto-generate slug từ title |
| F08 | Post | SEO metadata |
| F09 | Post | Lọc theo category, status |
| F10 | Product | CRUD với multiple price variants |
| F11 | Product | Gallery images |
| F12 | Product | Sort order |
| F13 | Reservation | Create reservation (public API) |
| F14 | Reservation | Calendar view |
| F15 | Reservation | Status workflow |
| F16 | Contact | Submit contact (public API) |
| F17 | Contact | Status management |
| F18 | Menu | Nested menu builder |
| F19 | Menu | Link to internal content |
| F20 | Media | Upload single/multiple files |
| F21 | Media | Auto thumbnail for images |
| F22 | Media | Folder organization |
| F23 | Media | Media picker component |
| F24 | Settings | Key-value configuration |
| F25 | Database | Auto-migration on startup |

### 8.2 Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NF01 | API response time | < 300ms (p95) |
| NF02 | File upload limit | 10MB |
| NF03 | Image thumbnail | 300x300px |
| NF04 | JWT access token expiry | 15 minutes |
| NF05 | JWT refresh token expiry | 7 days |
| NF06 | Page load time (LCP) | < 2s |
| NF07 | SEO title max length | 70 chars |
| NF08 | SEO description max length | 160 chars |
| NF09 | Password complexity | 8+ chars, mixed |

---

## 9. DEPENDENCIES

### Backend package.json

```json
{
  "name": "cms-backend",
  "version": "1.0.0",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "sequelize": "^6.35.2",
    "mysql2": "^3.6.5",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "express-validator": "^7.0.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.1",
    "multer": "^1.4.5-lts.1",
    "sharp": "^0.33.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

### Frontend package.json

```json
{
  "name": "cms-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "^5.0.0",
    "@astrojs/react": "^4.0.0",
    "@astrojs/tailwind": "^6.0.0",
    "@astrojs/node": "^9.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "nanostores": "^0.10.3",
    "@nanostores/react": "^0.7.2",
    "axios": "^1.6.2",
    "lucide-react": "^0.300.0"
  },
  "devDependencies": {
    "tailwindcss": "^4.0.0",
    "@types/react": "^18.2.0",
    "typescript": "^5.3.0"
  }
}
```

### Environment Variables

**Backend (.env):**
```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=cms_db
DB_USER=root
DB_PASSWORD=your_password
DB_SYNC_ALTER=true

JWT_SECRET=your-super-secret-key-min-32-characters-long
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars-long

UPLOAD_MAX_SIZE=10485760
THUMBNAIL_SIZE=300
```

**Frontend (.env):**
```env
PUBLIC_API_URL=http://localhost:3000/api/v1
```

---

## 10. ROUTING TABLE

| Path | Layout | Auth | Role | Description |
|------|--------|------|------|-------------|
| `/` | - | No | - | Redirect to /dashboard |
| `/login` | Auth | No | - | Login page |
| `/dashboard` | Dashboard | Yes | All | Dashboard overview |
| `/categories` | Dashboard | Yes | Admin/Editor | Category list |
| `/categories/new` | Dashboard | Yes | Admin/Editor | Create category |
| `/categories/[id]` | Dashboard | Yes | Admin/Editor | Edit category |
| `/posts` | Dashboard | Yes | All | Post list |
| `/posts/new` | Dashboard | Yes | All | Create post |
| `/posts/[id]` | Dashboard | Yes | Admin/Editor/Owner | Edit post |
| `/products` | Dashboard | Yes | Admin/Editor | Product list |
| `/products/new` | Dashboard | Yes | Admin/Editor | Create product |
| `/products/[id]` | Dashboard | Yes | Admin/Editor | Edit product |
| `/reservations` | Dashboard | Yes | Admin/Editor | Reservation list |
| `/reservations/calendar` | Dashboard | Yes | Admin/Editor | Calendar view |
| `/reservations/[id]` | Dashboard | Yes | Admin/Editor | Reservation detail |
| `/contacts` | Dashboard | Yes | Admin/Editor | Contact list |
| `/contacts/[id]` | Dashboard | Yes | Admin/Editor | Contact detail |
| `/menus` | Dashboard | Yes | Admin | Menu list |
| `/menus/[id]` | Dashboard | Yes | Admin | Menu builder |
| `/media` | Dashboard | Yes | All | Media library |
| `/users` | Dashboard | Yes | Admin | User list |
| `/users/profile` | Dashboard | Yes | All | Edit profile |
| `/users/[id]` | Dashboard | Yes | Admin | Edit user |
| `/settings` | Dashboard | Yes | Admin | System settings |

---

## 11. TESTING CHECKLIST

### Auth Module
- [ ] POST /auth/login - Đăng nhập thành công
- [ ] POST /auth/login - Sai mật khẩu → 401
- [ ] POST /auth/refresh - Token hợp lệ
- [ ] Middleware auth - Token expired → 401
- [ ] Middleware role - Unauthorized → 403

### Category Module
- [ ] GET /categories - Lấy danh sách
- [ ] GET /categories/tree - Lấy cấu trúc tree
- [ ] POST /categories - Tạo mới với parent
- [ ] PUT /categories/:id - Cập nhật
- [ ] DELETE /categories/:id - Xóa (move children)

### Post Module
- [ ] GET /posts - Lấy danh sách với pagination
- [ ] GET /posts - Lọc theo category, status
- [ ] POST /posts - Tạo mới với auto-slug
- [ ] PUT /posts/:id - Cập nhật
- [ ] PUT /posts/:id/status - Đổi trạng thái
- [ ] DELETE /posts/:id - Xóa

### Product Module
- [ ] POST /products - Tạo với prices
- [ ] PUT /products/:id/prices/:priceId - Cập nhật giá
- [ ] Gallery images JSON array

### Reservation Module
- [ ] POST /reservations - Public create
- [ ] GET /reservations/calendar - Lấy theo tháng
- [ ] PUT /reservations/:id/status - Workflow status

### Contact Module
- [ ] POST /contacts - Public submit
- [ ] PUT /contacts/:id/status - Đánh dấu đã đọc

### Menu Module
- [ ] POST /menus/:id/items - Thêm nested item
- [ ] PUT /menus/:id/items/reorder - Sắp xếp lại

### Media Module
- [ ] POST /media/upload - Upload single
- [ ] POST /media/upload/multiple - Upload multiple
- [ ] Thumbnail generation
- [ ] File type validation
- [ ] DELETE với file cleanup

### Auto-Migration
- [ ] Start lần đầu → tạo tables
- [ ] Thêm field → ALTER table
- [ ] Data không bị mất

---
