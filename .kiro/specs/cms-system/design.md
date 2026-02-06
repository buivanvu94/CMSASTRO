# Design Document

## Overview

The CMS System is a full-stack web application consisting of a RESTful API backend and a modern admin panel frontend. The backend is built with Node.js, Express, Sequelize ORM, and MySQL database. The frontend is built with Astro framework, React for interactive components (islands), and Tailwind CSS for styling.

The system follows a modular architecture where each domain (users, posts, products, etc.) is organized as a self-contained module with its own model, service, controller, and validation logic. Authentication is handled via JWT tokens with role-based access control. The database schema is automatically synchronized with model definitions on application startup.

## Architecture

### Backend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│                    (Frontend / API Clients)                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     Middleware Layer                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   CORS   │  │  Helmet  │  │  Morgan  │  │   Auth   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │   Role   │  │ Validate │  │  Upload  │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     Controller Layer                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │   User   │  │ Category │  │   Post   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Product  │  │Reserv.   │  │ Contact  │  │   Menu   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐                                │
│  │  Media   │  │ Setting  │                                │
│  └──────────┘  └──────────┘                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                           │
│  (Business Logic, Data Validation, Complex Operations)      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                       Model Layer                            │
│              (Sequelize ORM, Associations)                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                          │
│                      (MySQL Database)                        │
└─────────────────────────────────────────────────────────────┘
```

### Frontend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Pages                                │
│  (Astro Pages - SSR/SSG, Routing, Layout Composition)       │
│  /login, /dashboard, /posts, /products, /media, etc.        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                        Layouts                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  BaseLayout  │  │  AuthLayout  │  │DashboardLayout│     │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         ▼                               ▼
┌──────────────────────┐      ┌──────────────────────┐
│  Static Components   │      │  Interactive Islands │
│  (Astro Components)  │      │  (React Components)  │
│  - Header            │      │  - LoginForm         │
│  - Sidebar           │      │  - PostForm          │
│  - Footer            │      │  - MediaLibrary      │
│  - UI Components     │      │  - CategoryTree      │
└──────────────────────┘      │  - ReservationCal    │
                              └──────────┬───────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │    State Stores      │
                              │   (Nanostores)       │
                              │  - auth              │
                              │  - ui                │
                              │  - media             │
                              └──────────┬───────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │     API Client       │
                              │   (Axios + JWT)      │
                              └──────────────────────┘
```

## Components and Interfaces

### Backend Modules

#### 1. Auth Module
- **Controller**: Handles login, register, refresh token, logout, get current user
- **Service**: JWT generation, token validation, password hashing
- **Validation**: Email format, password strength

#### 2. User Module
- **Model**: User entity with fields: id, full_name, email, password, avatar_id, role, status
- **Service**: CRUD operations, password encryption, user search
- **Controller**: REST endpoints for user management
- **Validation**: Email uniqueness, role enum, status enum

#### 3. Category Module
- **Model**: Category entity with self-referencing parent_id for nested structure
- **Service**: Tree building, circular reference prevention, slug generation, reordering
- **Controller**: CRUD, tree view, reorder endpoint
- **Validation**: Name length, slug uniqueness, parent existence

#### 4. Post Module
- **Model**: Post entity with relationships to Category, User, Media
- **Service**: CRUD, slug generation, SEO metadata, filtering, pagination
- **Controller**: REST endpoints, status update, slug-based retrieval
- **Validation**: Title required, SEO limits, status enum

#### 5. Product Module
- **Models**: Product and ProductPrice entities
- **Service**: CRUD with price variants, gallery management, default price handling
- **Controller**: Product CRUD, price variant management
- **Validation**: Name required, price positive, gallery JSON array

#### 6. Reservation Module
- **Model**: Reservation entity with customer info and status workflow
- **Service**: CRUD, calendar view, status transitions
- **Controller**: Public creation endpoint, calendar endpoint, status update
- **Validation**: Party size range, date/time format, phone format

#### 7. Contact Module
- **Model**: Contact entity with status tracking
- **Service**: CRUD, status management, bulk delete
- **Controller**: Public submission endpoint, status update, bulk operations
- **Validation**: Name required, email format, message required

#### 8. Menu Module
- **Models**: Menu and MenuItem entities with nested structure
- **Service**: Menu building, item reordering, nested item management
- **Controller**: Menu CRUD, item CRUD, location-based retrieval
- **Validation**: Location uniqueness, menu existence

#### 9. Media Module
- **Model**: Media entity with file metadata
- **Service**: File upload, thumbnail generation, folder organization, file deletion
- **Controller**: Upload endpoints, CRUD, folder listing
- **Validation**: File type, file size, MIME type

#### 10. Setting Module
- **Model**: Setting entity with key-value pairs
- **Service**: Get/set settings, group filtering
- **Controller**: Settings retrieval and update
- **Validation**: Key uniqueness

### Frontend Components

#### Static Components (Astro)
- **Header**: Top navigation bar with user info
- **Sidebar**: Navigation menu with role-based filtering
- **Footer**: Footer information
- **UI Components**: Button, Input, Textarea, Select, Card, Badge, Modal, Table, Alert, Dropdown, Tabs, Pagination

#### Interactive Islands (React)
- **LoginForm**: Authentication form with validation
- **PostForm**: Rich text editor, category selector, media picker, SEO fields
- **ProductForm**: Product details, price variants editor, gallery uploader
- **CategoryTree**: Drag-and-drop tree view for category management
- **MediaLibrary**: Grid view, upload, search, folder filter, pagination
- **MediaPicker**: Modal for selecting media from library
- **ReservationCalendar**: Monthly calendar view with status indicators
- **MenuBuilder**: Drag-and-drop menu item organizer
- **SettingsForm**: Key-value settings editor

### API Client Structure

```typescript
// Base client with interceptors
const apiClient = axios.create({
  baseURL: import.meta.env.PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor: Add JWT token
apiClient.interceptors.request.use(config => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: Handle token refresh
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Attempt token refresh
      const refreshed = await refreshAccessToken();
      if (refreshed) return apiClient.request(error.config);
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## Data Models

### Database Schema

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
  gallery JSON NULL,
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
  variant_name VARCHAR(100) NULL,
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
  source VARCHAR(50) NULL,
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
  location VARCHAR(50) NOT NULL UNIQUE,
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
  linkable_type VARCHAR(50) NULL,
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
  size INT NOT NULL,
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

### Sequelize Model Associations

```javascript
// Category self-reference
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parent_id' });
Category.hasMany(Category, { as: 'children', foreignKey: 'parent_id' });
Category.belongsTo(Media, { as: 'image', foreignKey: 'image_id' });

// Post associations
Post.belongsTo(Category, { as: 'category', foreignKey: 'category_id' });
Post.belongsTo(User, { as: 'author', foreignKey: 'author_id' });
Post.belongsTo(Media, { as: 'featuredImage', foreignKey: 'featured_image_id' });

// Product associations
Product.belongsTo(Category, { as: 'category', foreignKey: 'category_id' });
Product.belongsTo(Media, { as: 'featuredImage', foreignKey: 'featured_image_id' });
Product.hasMany(ProductPrice, { as: 'prices', foreignKey: 'product_id' });

// Menu associations
Menu.hasMany(MenuItem, { as: 'items', foreignKey: 'menu_id' });
MenuItem.belongsTo(MenuItem, { as: 'parent', foreignKey: 'parent_id' });
MenuItem.hasMany(MenuItem, { as: 'children', foreignKey: 'parent_id' });

// Media associations
Media.belongsTo(User, { as: 'uploader', foreignKey: 'uploaded_by' });
User.belongsTo(Media, { as: 'avatar', foreignKey: 'avatar_id' });
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Authentication Properties

**Property 1: Valid credentials generate tokens**
*For any* valid username and password combination, when a user logs in, the system should return both a valid JWT access token and a valid JWT refresh token.
**Validates: Requirements 1.1**

**Property 2: Invalid credentials are rejected**
*For any* invalid credential combination (wrong password, non-existent email, malformed input), the login attempt should be rejected with an appropriate error message.
**Validates: Requirements 1.2**

**Property 3: Token refresh extends session**
*For any* valid refresh token, when the access token expires, the system should issue a new access token without requiring re-authentication.
**Validates: Requirements 1.3**

**Property 4: Unauthenticated requests are blocked**
*For any* protected endpoint, when accessed without a valid authentication token, the system should return a 401 unauthorized error.
**Validates: Requirements 1.4**

**Property 5: Unauthorized access is prevented**
*For any* user role and protected resource, when the user attempts to access a resource beyond their permissions, the system should return a 403 forbidden error.
**Validates: Requirements 1.5**

**Property 6: Logout invalidates tokens**
*For any* authenticated session, when a user logs out, their access and refresh tokens should become invalid for subsequent requests.
**Validates: Requirements 1.6**

### User Management Properties

**Property 7: User creation encrypts passwords**
*For any* valid user data with a plaintext password, when an administrator creates the user, the stored password should be encrypted and not match the plaintext input.
**Validates: Requirements 2.1**

**Property 8: User list includes complete data**
*For any* user list request, the response should include all users with their role, status, and profile information.
**Validates: Requirements 2.2**

**Property 9: User updates persist correctly**
*For any* valid user update data, when an administrator updates a user, the changes should be persisted and retrievable in subsequent requests.
**Validates: Requirements 2.3**

**Property 10: User deletion handles associations**
*For any* user with associated content, when the user is deleted, the system should either cascade delete or nullify foreign key references appropriately.
**Validates: Requirements 2.4**

**Property 11: Self-profile updates are allowed**
*For any* authenticated user regardless of role, when updating their own profile, the operation should succeed.
**Validates: Requirements 2.5**

### Category Management Properties

**Property 12: Category slug generation**
*For any* category name including Vietnamese characters, when creating a category, the system should generate a URL-friendly slug with ASCII characters, hyphens instead of spaces, and no special characters.
**Validates: Requirements 3.1, 19.1, 19.2, 19.3**

**Property 13: Parent-child relationships are established**
*For any* valid parent category and new child category, when creating the child with a parent_id, the relationship should be established and retrievable.
**Validates: Requirements 3.2**

**Property 14: Category tree structure is correct**
*For any* set of categories with parent-child relationships, when requesting the category tree, the response should have a properly nested hierarchical structure.
**Validates: Requirements 3.3**

**Property 15: Category deletion moves children**
*For any* category with child categories, when the category is deleted, all child categories should be moved to the deleted category's parent (or become root categories if no parent exists).
**Validates: Requirements 3.6**

**Property 16: Category reordering updates sort order**
*For any* reordering operation on categories, the sort_order field should be updated for all affected categories to reflect the new order.
**Validates: Requirements 3.7**

### Post Management Properties

**Property 17: Post slug uniqueness**
*For any* post title, when creating a post, if a slug already exists, the system should append a number to ensure uniqueness.
**Validates: Requirements 4.1, 4.2, 19.4**

**Property 18: Publishing sets timestamp**
*For any* post, when the status is changed to published, the published_at timestamp should be set to the current time.
**Validates: Requirements 4.3, 20.2**

**Property 19: Draft posts have no publish timestamp**
*For any* post saved as draft, the published_at field should be null.
**Validates: Requirements 4.4**

**Property 20: Post-category relationship**
*For any* valid category and post, when assigning the category to the post, the relationship should be established and the category should be included in post retrieval.
**Validates: Requirements 4.5**

**Property 21: Featured image association**
*For any* valid media file and post, when setting the featured image, the media should be associated with the post and included in post retrieval.
**Validates: Requirements 4.6**

**Property 22: Post search filters correctly**
*For any* search query, the results should only include posts that match the search criteria in title, content, category, or status fields.
**Validates: Requirements 4.7**

**Property 23: Post list pagination**
*For any* post list request with pagination parameters, the response should include the correct page of results and pagination metadata (total, page, limit, totalPages).
**Validates: Requirements 4.8, 14.1, 14.2, 14.3**

**Property 24: Author sees only own posts**
*For any* user with author role, when viewing the post list, only posts created by that author should be returned.
**Validates: Requirements 4.9, 15.1**

**Property 25: Editors see all posts**
*For any* user with editor or admin role, when viewing the post list, all posts should be returned regardless of author.
**Validates: Requirements 4.10, 15.2**

### Product Management Properties

**Property 26: Product price variants storage**
*For any* product with multiple price variants, when creating the product, all variants should be stored with their respective price information and retrievable with the product.
**Validates: Requirements 5.2**

**Property 27: Single default price variant**
*For any* product with multiple price variants, when setting a variant as default, only that variant should have is_default=true and all others should have is_default=false.
**Validates: Requirements 5.3**

**Property 28: Gallery stored as JSON array**
*For any* product with gallery images, the media IDs should be stored as a JSON array and retrievable as an array.
**Validates: Requirements 5.4, 18.1**

**Property 29: Price variant updates are isolated**
*For any* product with multiple price variants, when updating one variant, the other variants should remain unchanged.
**Validates: Requirements 5.5**

**Property 30: Product deletion cascades to prices**
*For any* product with price variants, when the product is deleted, all associated price variants should also be deleted.
**Validates: Requirements 5.6**

**Property 31: Product filtering works correctly**
*For any* product filter criteria (category, status, featured), the results should only include products matching all specified criteria.
**Validates: Requirements 5.7**

**Property 32: Gallery image removal updates array**
*For any* product gallery, when removing an image, the media ID should be removed from the JSON array and the array should remain valid.
**Validates: Requirements 18.2**

### Reservation Properties

**Property 33: Reservation creation defaults to pending**
*For any* valid reservation data, when a customer submits a reservation, it should be created with status='pending'.
**Validates: Requirements 6.1**

**Property 34: Calendar groups by date**
*For any* month and year, when requesting the reservation calendar, reservations should be grouped by date with all reservations for each date together.
**Validates: Requirements 6.2**

**Property 35: Reservation status transitions**
*For any* reservation, when a manager updates the status, the new status should be persisted and retrievable (pending→confirmed, confirmed→completed, confirmed→cancelled, confirmed→no_show).
**Validates: Requirements 6.3, 6.4, 6.5, 6.6**

### Contact Management Properties

**Property 36: Contact creation defaults to new**
*For any* valid contact form submission, when created, the contact should have status='new'.
**Validates: Requirements 7.1**

**Property 37: Contact list includes all contacts**
*For any* contact list request, all contacts should be returned with their status information.
**Validates: Requirements 7.2**

**Property 38: Contact status updates**
*For any* contact, when a user updates the status (new→read, read→replied, any→spam), the new status should be persisted.
**Validates: Requirements 7.3, 7.4, 7.5**

**Property 39: Bulk contact deletion**
*For any* set of contact IDs, when performing bulk delete, all specified contacts should be removed from the database.
**Validates: Requirements 7.6**

### Menu Management Properties

**Property 40: Menu location assignment**
*For any* menu, when created, it should be assigned to the specified location and retrievable by that location.
**Validates: Requirements 8.1**

**Property 41: Menu item linking flexibility**
*For any* menu item, it should support either internal content linking (linkable_type and linkable_id) or custom URL, but not require both.
**Validates: Requirements 8.2**

**Property 42: Menu item nesting**
*For any* valid parent menu item and child menu item, when creating the child with a parent_id, the nested relationship should be established.
**Validates: Requirements 8.3**

**Property 43: Menu item reordering**
*For any* reordering operation on menu items, the sort_order field should be updated for all affected items.
**Validates: Requirements 8.4**

**Property 44: Menu retrieval includes nested structure**
*For any* menu location, when requesting the menu, the response should include all menu items in a properly nested tree structure.
**Validates: Requirements 8.5**

**Property 45: Menu deletion cascades to items**
*For any* menu with menu items, when the menu is deleted, all associated menu items should also be deleted.
**Validates: Requirements 8.6**

**Property 46: Menu item deletion cascades to children**
*For any* menu item with child items, when the item is deleted, all child items should also be deleted.
**Validates: Requirements 8.7**

### Media Management Properties

**Property 47: Image thumbnail generation**
*For any* uploaded image file, the system should generate a thumbnail at 300x300 pixels and store the thumbnail path.
**Validates: Requirements 9.1**

**Property 48: File organization by date**
*For any* uploaded file, it should be stored in a directory structure of /uploads/YYYY/MM/ based on the upload date.
**Validates: Requirements 9.2, 13.4**

**Property 49: File type validation**
*For any* file upload, the MIME type should be validated against the allowed types list, and disallowed types should be rejected.
**Validates: Requirements 9.3, 13.1, 13.2**

**Property 50: Multiple file upload processing**
*For any* set of valid files in a multiple upload request, each file should be processed and the results for all files should be returned.
**Validates: Requirements 9.5**

**Property 51: Media deletion removes files**
*For any* media record, when deleted, both the original file and thumbnail (if exists) should be removed from the filesystem.
**Validates: Requirements 9.6**

**Property 52: Media search filters correctly**
*For any* search query, the results should only include media files that match the search criteria in filename, alt_text, or folder fields.
**Validates: Requirements 9.7**

**Property 53: Media list pagination**
*For any* media list request with pagination parameters, the response should include the correct page of results with uploader information and pagination metadata.
**Validates: Requirements 9.8**

**Property 54: Unique filename generation**
*For any* uploaded file, the system should generate a unique filename to prevent collisions with existing files.
**Validates: Requirements 13.3**

### Settings Properties

**Property 55: Settings retrieval returns all**
*For any* settings retrieval request without filters, all key-value pairs should be returned.
**Validates: Requirements 10.1**

**Property 56: Settings group filtering**
*For any* settings group, when filtering by group, only settings belonging to that group should be returned.
**Validates: Requirements 10.2**

**Property 57: Settings updates persist**
*For any* valid settings update data, the new values should be persisted and retrievable in subsequent requests.
**Validates: Requirements 10.3**

**Property 58: Single setting retrieval**
*For any* valid setting key, when retrieving by key, the specific setting value should be returned.
**Validates: Requirements 10.4**

### Database Migration Properties

**Property 59: Schema sync preserves data**
*For any* existing data in the database, when the schema is synchronized with model definitions, the existing data should remain intact.
**Validates: Requirements 11.3**

### SEO Metadata Properties

**Property 60: SEO metadata storage**
*For any* content (post, product, category) with SEO metadata, the seo_title and seo_description fields should be stored and retrievable.
**Validates: Requirements 12.3**

**Property 61: SEO metadata included in responses**
*For any* content retrieval, if SEO metadata exists, it should be included in the response.
**Validates: Requirements 12.4**

### Content Status Properties

**Property 62: New content defaults to draft**
*For any* newly created content (post, product), the status should default to 'draft' if not specified.
**Validates: Requirements 20.1**

**Property 63: Archive status transition**
*For any* content, when the status is changed to archived, the status should be persisted as 'archived'.
**Validates: Requirements 20.3**

**Property 64: Status filtering**
*For any* content list request with status filter, only content matching that status should be returned.
**Validates: Requirements 20.4**

### Authorization Properties

**Property 65: Author edit restrictions**
*For any* post not created by the current author, when an author attempts to edit it, the operation should be rejected with a 403 error.
**Validates: Requirements 15.3**

**Property 66: Editor edit permissions**
*For any* post, when an editor attempts to edit it, the operation should be allowed regardless of the post's author.
**Validates: Requirements 15.4**

**Property 67: Admin-only feature protection**
*For any* admin-only feature, when a non-admin user attempts to access it, the operation should be rejected with a 403 error.
**Validates: Requirements 15.5**

### Frontend Properties

**Property 68: Unauthenticated page access redirects**
*For any* protected page, when accessed without authentication, the user should be redirected to the login page.
**Validates: Requirements 16.1**

**Property 69: Role-based menu filtering**
*For any* user role, when viewing the admin sidebar, only menu items appropriate for that role should be displayed.
**Validates: Requirements 16.3**

**Property 70: Form validation displays errors**
*For any* form submission with invalid data, validation errors should be displayed for each invalid field.
**Validates: Requirements 16.4**

**Property 71: API error messages are user-friendly**
*For any* failed API request, a user-friendly error message should be displayed to the user.
**Validates: Requirements 16.6**

### Content Storage Properties

**Property 72: HTML content storage**
*For any* post with rich text content, when saved, the HTML content should be stored and retrievable without corruption.
**Validates: Requirements 17.2**

**Property 73: Content retrieval includes formatting**
*For any* post with HTML content, when retrieved, the formatted content should be included in the response.
**Validates: Requirements 17.3**

**Property 74: Gallery images included in product response**
*For any* product with gallery images, when retrieved, the gallery images should be included in the response.
**Validates: Requirements 18.3**

### Slug Generation Properties

**Property 75: Slug regeneration on title update**
*For any* content with a title change, when updated without a manually specified slug, a new slug should be generated from the new title.
**Validates: Requirements 19.5**


## Error Handling

### Backend Error Handling Strategy

#### Error Middleware
All errors are caught by a centralized error handling middleware that:
- Logs errors with appropriate severity levels
- Sanitizes error messages for production
- Returns consistent error response format
- Maps error types to appropriate HTTP status codes

#### Error Response Format
```json
{
  "success": false,
  "message": "User-friendly error message",
  "errors": {
    "field1": "Validation error for field1",
    "field2": "Validation error for field2"
  },
  "code": "ERROR_CODE"
}
```

#### Error Types
- **ValidationError (400)**: Input validation failures
- **AuthenticationError (401)**: Missing or invalid authentication
- **AuthorizationError (403)**: Insufficient permissions
- **NotFoundError (404)**: Resource not found
- **ConflictError (409)**: Duplicate resource (e.g., unique constraint violation)
- **ServerError (500)**: Unexpected server errors

#### Database Error Handling
- Connection failures: Log and exit process
- Query errors: Catch and return appropriate error response
- Constraint violations: Map to user-friendly messages
- Transaction rollback: Automatic on error

### Frontend Error Handling Strategy

#### API Error Handling
- Network errors: Display "Connection failed" message
- 401 errors: Redirect to login page
- 403 errors: Display "Access denied" message
- 404 errors: Display "Resource not found" message
- 500 errors: Display "Server error" message
- Validation errors: Display field-specific error messages

#### Form Validation
- Client-side validation before submission
- Display inline error messages for invalid fields
- Prevent submission until all fields are valid
- Server-side validation as final check

#### Loading States
- Display loading indicators during API requests
- Disable form submission during processing
- Show skeleton loaders for data fetching

## Testing Strategy

### Backend Testing

#### Unit Testing
- **Service Layer Tests**: Test business logic in isolation
  - Category tree building
  - Slug generation and uniqueness
  - Password encryption
  - Token generation and validation
  - File upload processing
  - Thumbnail generation
- **Model Tests**: Test model validations and associations
  - Field validations
  - Association queries
  - Hooks (e.g., beforeSave)
- **Utility Tests**: Test helper functions
  - Slug utility
  - Response formatter
  - File utilities

#### Property-Based Testing
The system will use **fast-check** library for property-based testing in JavaScript/TypeScript. Each property-based test will run a minimum of 100 iterations to ensure comprehensive coverage.

Property-based tests will be tagged with comments referencing the design document:
```javascript
// Feature: cms-system, Property 12: Category slug generation
// Validates: Requirements 3.1, 19.1, 19.2, 19.3
```

**Key Property Tests**:
- **Authentication Properties**: Token generation, validation, refresh
- **Slug Generation**: Vietnamese character conversion, uniqueness
- **Tree Structures**: Category and menu nesting, circular reference prevention
- **Access Control**: Role-based permissions across all resources
- **Data Integrity**: Cascade deletes, relationship establishment
- **Pagination**: Correct page calculation and metadata
- **File Upload**: Type validation, size limits, organization
- **Status Workflows**: Valid state transitions

#### Integration Testing
- **API Endpoint Tests**: Test complete request-response cycles
  - Authentication flow
  - CRUD operations for all resources
  - Filtering and pagination
  - File uploads
  - Nested resource operations
- **Database Integration**: Test with actual database
  - Schema synchronization
  - Data persistence
  - Transaction handling
  - Cascade operations

### Frontend Testing

#### Unit Testing
- **Component Tests**: Test individual React components
  - Form validation logic
  - State management
  - Event handlers
- **API Client Tests**: Test API client functions
  - Request formatting
  - Response parsing
  - Error handling
  - Token refresh logic

#### Property-Based Testing
Frontend property tests will also use **fast-check** with 100+ iterations:
- **Form Validation**: Test validation rules with random inputs
- **Data Transformation**: Test data formatting and parsing
- **State Management**: Test store updates with various actions

#### End-to-End Testing
- **User Flows**: Test complete user journeys
  - Login and authentication
  - Create and publish post
  - Upload and manage media
  - Create product with variants
  - Manage reservations
- **Cross-Browser Testing**: Ensure compatibility
- **Responsive Design**: Test on various screen sizes

### Testing Tools

**Backend**:
- **Jest**: Test runner and assertion library
- **fast-check**: Property-based testing
- **Supertest**: HTTP assertion library for API testing
- **Sequelize Test Helpers**: Database testing utilities

**Frontend**:
- **Vitest**: Fast test runner for Vite/Astro projects
- **React Testing Library**: Component testing
- **fast-check**: Property-based testing
- **MSW (Mock Service Worker)**: API mocking

### Test Coverage Goals
- **Unit Tests**: 80%+ code coverage
- **Property Tests**: All correctness properties implemented
- **Integration Tests**: All API endpoints covered
- **E2E Tests**: Critical user flows covered

### Continuous Integration
- Run all tests on every commit
- Block merges if tests fail
- Generate coverage reports
- Run property tests with increased iterations (1000+) in CI

## Implementation Notes

### Backend Implementation Priorities

1. **Database Setup**: Configure Sequelize, define models, set up associations
2. **Authentication**: Implement JWT auth, middleware, role checking
3. **Core Modules**: Implement in order of dependency
   - User module (required by others)
   - Media module (required by posts/products)
   - Category module (required by posts/products)
   - Post module
   - Product module
   - Reservation module
   - Contact module
   - Menu module
   - Setting module
4. **File Upload**: Implement multer middleware, sharp for thumbnails
5. **Validation**: Add express-validator for all endpoints
6. **Error Handling**: Centralized error middleware

### Frontend Implementation Priorities

1. **Project Setup**: Configure Astro, Tailwind, React integration
2. **Authentication**: Login page, auth store, middleware
3. **Layouts**: Base, Auth, Dashboard layouts
4. **UI Components**: Build reusable component library
5. **API Client**: Axios setup with interceptors
6. **Core Pages**: Implement in order
   - Dashboard
   - Posts management
   - Media library
   - Products management
   - Categories management
   - Reservations
   - Contacts
   - Menus
   - Users
   - Settings
7. **Interactive Islands**: Build React components for complex interactions

### Performance Considerations

- **Database Indexing**: Add indexes on frequently queried fields (slug, email, status, category_id, author_id)
- **Query Optimization**: Use Sequelize includes efficiently, avoid N+1 queries
- **Caching**: Consider Redis for session storage and frequently accessed data
- **File Storage**: Use CDN for media files in production
- **Pagination**: Always paginate large datasets
- **Image Optimization**: Generate multiple thumbnail sizes for responsive images
- **API Response Size**: Only include necessary fields in responses

### Security Considerations

- **Password Storage**: Use bcrypt with salt rounds >= 10
- **JWT Secrets**: Use strong, random secrets (32+ characters)
- **CORS**: Configure allowed origins
- **Helmet**: Use helmet middleware for security headers
- **Input Sanitization**: Validate and sanitize all user inputs
- **SQL Injection**: Use Sequelize parameterized queries
- **XSS Prevention**: Sanitize HTML content before storage
- **File Upload**: Validate MIME types, limit file sizes, scan for malware
- **Rate Limiting**: Implement rate limiting on authentication endpoints
- **HTTPS**: Enforce HTTPS in production

### Deployment Considerations

- **Environment Variables**: Use .env files, never commit secrets
- **Database Migrations**: Use Sequelize migrations for production
- **File Storage**: Use cloud storage (S3, GCS) in production
- **Process Management**: Use PM2 or similar for Node.js process management
- **Logging**: Use structured logging (Winston, Pino)
- **Monitoring**: Set up error tracking (Sentry) and performance monitoring
- **Backup**: Regular database backups
- **Scaling**: Consider horizontal scaling with load balancer

### Technology Stack Summary

**Backend**:
- Node.js (v18+)
- Express.js (v4)
- Sequelize ORM (v6)
- MySQL (v8)
- JWT (jsonwebtoken)
- Bcrypt (bcryptjs)
- Multer (file upload)
- Sharp (image processing)
- Express Validator
- Helmet (security)
- CORS
- Morgan (logging)
- Dotenv

**Frontend**:
- Astro (v5)
- React (v19) for islands
- Tailwind CSS (v4)
- Nanostores (state management)
- Axios (HTTP client)
- Lucide React (icons)
- TypeScript

**Testing**:
- Jest (backend)
- Vitest (frontend)
- fast-check (property-based testing)
- Supertest (API testing)
- React Testing Library

**Development Tools**:
- Nodemon (backend dev server)
- ESLint (linting)
- Prettier (formatting)
- Git (version control)

