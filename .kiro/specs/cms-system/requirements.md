# Requirements Document

## Introduction

Hệ thống quản lý nội dung (CMS) là một nền tảng web toàn diện cho phép quản lý nội dung tương tự WordPress. Hệ thống bao gồm backend API RESTful được xây dựng với Node.js, MySQL, Sequelize và frontend admin panel được xây dựng với Astro, React và Tailwind CSS. Hệ thống hỗ trợ quản lý bài viết, sản phẩm, đặt bàn, liên hệ, menu điều hướng, media library và phân quyền người dùng.

## Glossary

- **CMS**: Content Management System - Hệ thống quản lý nội dung
- **JWT**: JSON Web Token - Token xác thực người dùng
- **CRUD**: Create, Read, Update, Delete - Các thao tác cơ bản
- **SEO**: Search Engine Optimization - Tối ưu hóa công cụ tìm kiếm
- **Media**: Các file đa phương tiện (hình ảnh, tài liệu)
- **Slug**: URL-friendly identifier được tạo từ tiêu đề
- **Nested Structure**: Cấu trúc phân cấp cha-con
- **Role**: Vai trò người dùng (admin, editor, author)
- **Reservation**: Đặt bàn
- **Category**: Danh mục phân loại nội dung
- **Post**: Bài viết
- **Product**: Sản phẩm
- **Menu**: Menu điều hướng
- **Setting**: Cài đặt hệ thống
- **Contact**: Thông tin liên hệ từ khách hàng
- **Variant**: Biến thể sản phẩm (ví dụ: Size S, M, L)
- **Featured**: Nổi bật
- **Gallery**: Bộ sưu tập hình ảnh
- **Thumbnail**: Ảnh thu nhỏ
- **Migration**: Tự động đồng bộ cấu trúc database

## Requirements

### Requirement 1: User Authentication and Authorization

**User Story:** As a system user, I want to authenticate securely and have role-based access control, so that I can access features appropriate to my role.

#### Acceptance Criteria

1. WHEN a user submits valid credentials THEN the System SHALL generate a JWT access token and refresh token
2. WHEN a user submits invalid credentials THEN the System SHALL reject the login attempt and return an error message
3. WHEN an access token expires THEN the System SHALL allow token refresh using a valid refresh token
4. WHEN a user accesses a protected endpoint without authentication THEN the System SHALL return a 401 unauthorized error
5. WHEN a user attempts to access a resource beyond their role permissions THEN the System SHALL return a 403 forbidden error
6. WHEN a user logs out THEN the System SHALL invalidate their tokens

### Requirement 2: User Management

**User Story:** As an administrator, I want to manage user accounts, so that I can control who has access to the system.

#### Acceptance Criteria

1. WHEN an administrator creates a user THEN the System SHALL store the user with encrypted password and assigned role
2. WHEN an administrator views the user list THEN the System SHALL display all users with their roles and status
3. WHEN an administrator updates a user THEN the System SHALL save the changes and maintain data integrity
4. WHEN an administrator deletes a user THEN the System SHALL remove the user and handle associated data appropriately
5. WHEN a user updates their own profile THEN the System SHALL allow the update regardless of role

### Requirement 3: Category Management with Nested Structure

**User Story:** As a content manager, I want to organize content into hierarchical categories, so that I can maintain a structured content taxonomy.

#### Acceptance Criteria

1. WHEN a user creates a category THEN the System SHALL generate a unique slug from the category name
2. WHEN a user creates a category with a parent THEN the System SHALL establish the parent-child relationship
3. WHEN a user requests the category tree THEN the System SHALL return categories in hierarchical structure
4. WHEN a user attempts to set a category as its own parent THEN the System SHALL reject the operation
5. WHEN a user attempts to set a child category as parent of its ancestor THEN the System SHALL reject the operation to prevent circular references
6. WHEN a user deletes a category with children THEN the System SHALL move child categories to the deleted category's parent
7. WHEN a user reorders categories THEN the System SHALL update the sort_order field for all affected categories

### Requirement 4: Post Management

**User Story:** As a content author, I want to create and manage blog posts with rich content, so that I can publish articles on the website.

#### Acceptance Criteria

1. WHEN a user creates a post THEN the System SHALL auto-generate a unique slug from the title
2. WHEN a user creates a post with duplicate title THEN the System SHALL append a number to ensure slug uniqueness
3. WHEN a user publishes a post THEN the System SHALL set the published_at timestamp
4. WHEN a user saves a post as draft THEN the System SHALL store the post without setting published_at
5. WHEN a user assigns a category to a post THEN the System SHALL establish the relationship
6. WHEN a user uploads a featured image THEN the System SHALL associate the media with the post
7. WHEN a user searches posts THEN the System SHALL filter by title, content, category, and status
8. WHEN a user views post list THEN the System SHALL return paginated results with author and category information
9. WHEN an author views their posts THEN the System SHALL show only posts they created
10. WHEN an admin or editor views posts THEN the System SHALL show all posts

### Requirement 5: Product Management with Pricing

**User Story:** As a product manager, I want to manage products with multiple price variants, so that I can offer different pricing options.

#### Acceptance Criteria

1. WHEN a user creates a product THEN the System SHALL generate a unique slug from the product name
2. WHEN a user adds price variants to a product THEN the System SHALL store each variant with its price information
3. WHEN a user sets a default price variant THEN the System SHALL mark only one variant as default
4. WHEN a user uploads product gallery images THEN the System SHALL store the media IDs as JSON array
5. WHEN a user updates a price variant THEN the System SHALL modify only the specified variant
6. WHEN a user deletes a product THEN the System SHALL cascade delete all associated price variants
7. WHEN a user filters products THEN the System SHALL support filtering by category, status, and featured flag

### Requirement 6: Reservation System

**User Story:** As a restaurant manager, I want to manage table reservations, so that I can track and confirm customer bookings.

#### Acceptance Criteria

1. WHEN a customer submits a reservation request THEN the System SHALL create a reservation with pending status
2. WHEN a manager views the reservation calendar THEN the System SHALL display reservations grouped by date
3. WHEN a manager confirms a reservation THEN the System SHALL update the status to confirmed
4. WHEN a manager cancels a reservation THEN the System SHALL update the status to cancelled
5. WHEN a manager marks a reservation as completed THEN the System SHALL update the status to completed
6. WHEN a manager marks a reservation as no-show THEN the System SHALL update the status to no_show
7. WHEN the System receives a reservation request THEN the System SHALL validate party size is between 1 and 50

### Requirement 7: Contact Form Management

**User Story:** As a customer service representative, I want to manage contact form submissions, so that I can respond to customer inquiries.

#### Acceptance Criteria

1. WHEN a visitor submits a contact form THEN the System SHALL create a contact record with new status
2. WHEN a user views contact list THEN the System SHALL display all contacts with their status
3. WHEN a user marks a contact as read THEN the System SHALL update the status to read
4. WHEN a user marks a contact as replied THEN the System SHALL update the status to replied
5. WHEN a user marks a contact as spam THEN the System SHALL update the status to spam
6. WHEN a user deletes multiple contacts THEN the System SHALL remove all specified contacts

### Requirement 8: Menu Builder with Nested Items

**User Story:** As a site administrator, I want to build navigation menus with nested items, so that I can create complex site navigation.

#### Acceptance Criteria

1. WHEN a user creates a menu THEN the System SHALL assign it to a specific location
2. WHEN a user adds a menu item THEN the System SHALL allow linking to internal content or custom URL
3. WHEN a user creates a nested menu item THEN the System SHALL establish the parent-child relationship
4. WHEN a user reorders menu items THEN the System SHALL update the sort_order for all items
5. WHEN a user requests a menu by location THEN the System SHALL return the menu with nested items structure
6. WHEN a user deletes a menu THEN the System SHALL cascade delete all associated menu items
7. WHEN a user deletes a menu item with children THEN the System SHALL cascade delete all child items

### Requirement 9: Media Library Management

**User Story:** As a content creator, I want to upload and organize media files, so that I can use them in posts and products.

#### Acceptance Criteria

1. WHEN a user uploads an image file THEN the System SHALL generate a thumbnail at 300x300 pixels
2. WHEN a user uploads a file THEN the System SHALL organize it in year/month directory structure
3. WHEN a user uploads a file THEN the System SHALL validate the file type against allowed types
4. WHEN a user uploads a file exceeding 10MB THEN the System SHALL reject the upload
5. WHEN a user uploads multiple files THEN the System SHALL process each file and return all results
6. WHEN a user deletes a media file THEN the System SHALL remove both the original file and thumbnail
7. WHEN a user searches media THEN the System SHALL filter by filename, alt text, and folder
8. WHEN a user views media list THEN the System SHALL return paginated results with uploader information

### Requirement 10: Settings Management

**User Story:** As a system administrator, I want to configure system settings, so that I can customize the application behavior.

#### Acceptance Criteria

1. WHEN a user retrieves settings THEN the System SHALL return all key-value pairs
2. WHEN a user retrieves settings by group THEN the System SHALL return only settings in that group
3. WHEN a user updates settings THEN the System SHALL save the new values
4. WHEN a user retrieves a setting by key THEN the System SHALL return the specific setting value

### Requirement 11: Database Auto-Migration

**User Story:** As a developer, I want automatic database schema synchronization, so that the database structure stays in sync with models.

#### Acceptance Criteria

1. WHEN the application starts THEN the System SHALL authenticate the database connection
2. WHEN DB_SYNC_ALTER is enabled THEN the System SHALL synchronize the database schema with model definitions
3. WHEN the System synchronizes the database THEN the System SHALL preserve existing data
4. WHEN the System adds a new field to a model THEN the System SHALL alter the table to add the column
5. WHEN the database connection fails THEN the System SHALL log the error and exit the process

### Requirement 12: SEO Metadata Support

**User Story:** As a content manager, I want to add SEO metadata to content, so that pages are optimized for search engines.

#### Acceptance Criteria

1. WHEN a user enters an SEO title exceeding 70 characters THEN the System SHALL reject the input
2. WHEN a user enters an SEO description exceeding 160 characters THEN the System SHALL reject the input
3. WHEN a user saves content with SEO metadata THEN the System SHALL store the seo_title and seo_description fields
4. WHEN a user retrieves content THEN the System SHALL include SEO metadata in the response

### Requirement 13: File Upload Security

**User Story:** As a system administrator, I want secure file uploads, so that malicious files cannot be uploaded.

#### Acceptance Criteria

1. WHEN a user uploads a file THEN the System SHALL validate the MIME type against allowed types
2. WHEN a user uploads a disallowed file type THEN the System SHALL reject the upload with an error message
3. WHEN a user uploads a file THEN the System SHALL generate a unique filename to prevent collisions
4. WHEN the System stores uploaded files THEN the System SHALL organize them in date-based directories

### Requirement 14: Pagination Support

**User Story:** As a user, I want paginated results for large datasets, so that I can navigate through content efficiently.

#### Acceptance Criteria

1. WHEN a user requests a paginated list THEN the System SHALL return results for the specified page
2. WHEN a user requests a paginated list THEN the System SHALL include pagination metadata with total count and total pages
3. WHEN a user specifies a page size THEN the System SHALL limit results to that size
4. WHEN a user does not specify pagination parameters THEN the System SHALL use default values of page 1 and limit 20

### Requirement 15: Role-Based Content Access

**User Story:** As a system user, I want content access based on my role, so that I only see and modify content I'm authorized for.

#### Acceptance Criteria

1. WHEN an author views posts THEN the System SHALL show only posts created by that author
2. WHEN an editor or admin views posts THEN the System SHALL show all posts
3. WHEN an author attempts to edit another author's post THEN the System SHALL reject the operation
4. WHEN an editor attempts to edit any post THEN the System SHALL allow the operation
5. WHEN a non-admin user attempts to access admin-only features THEN the System SHALL reject the operation

### Requirement 16: Frontend Admin Panel

**User Story:** As a system user, I want an intuitive admin interface, so that I can manage content efficiently.

#### Acceptance Criteria

1. WHEN a user accesses a protected page without authentication THEN the System SHALL redirect to the login page
2. WHEN a user logs in successfully THEN the System SHALL redirect to the dashboard
3. WHEN a user navigates the admin panel THEN the System SHALL display a sidebar with role-appropriate menu items
4. WHEN a user submits a form THEN the System SHALL validate inputs and display error messages for invalid data
5. WHEN a user performs an action THEN the System SHALL display loading states during API requests
6. WHEN an API request fails THEN the System SHALL display user-friendly error messages

### Requirement 17: Rich Text Content Editing

**User Story:** As a content author, I want to create rich formatted content, so that I can publish visually appealing articles.

#### Acceptance Criteria

1. WHEN a user edits post content THEN the System SHALL provide a rich text editor interface
2. WHEN a user saves post content THEN the System SHALL store the HTML content
3. WHEN a user views a post THEN the System SHALL display the formatted content

### Requirement 18: Image Gallery Management

**User Story:** As a product manager, I want to add multiple images to products, so that customers can view products from different angles.

#### Acceptance Criteria

1. WHEN a user adds images to a product gallery THEN the System SHALL store the media IDs as a JSON array
2. WHEN a user removes an image from a gallery THEN the System SHALL update the JSON array
3. WHEN a user retrieves a product THEN the System SHALL include gallery images in the response

### Requirement 19: Slug Generation and Uniqueness

**User Story:** As a content creator, I want automatic URL-friendly slugs, so that content has clean URLs.

#### Acceptance Criteria

1. WHEN a user creates content with a title THEN the System SHALL generate a slug by converting Vietnamese characters to ASCII
2. WHEN a user creates content with a title THEN the System SHALL replace spaces with hyphens in the slug
3. WHEN a user creates content with a title THEN the System SHALL remove special characters from the slug
4. WHEN a slug already exists THEN the System SHALL append a number to ensure uniqueness
5. WHEN a user updates content title THEN the System SHALL regenerate the slug unless manually specified

### Requirement 20: Status Workflow Management

**User Story:** As a content manager, I want to control content publication status, so that I can manage the content lifecycle.

#### Acceptance Criteria

1. WHEN a user creates content THEN the System SHALL default the status to draft
2. WHEN a user publishes content THEN the System SHALL update the status to published and set published_at timestamp
3. WHEN a user archives content THEN the System SHALL update the status to archived
4. WHEN a user filters content by status THEN the System SHALL return only content matching that status
