# API Documentation

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Token Refresh

When the access token expires (401 error), use the refresh token to get a new access token.

---

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "full_name": "John Doe",
      "email": "john@example.com",
      "role": "author",
      "status": "active"
    },
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc..."
  }
}
```

### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc..."
  }
}
```

### POST /auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGc..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGc..."
  }
}
```

### POST /auth/logout
Logout and invalidate tokens.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET /auth/me
Get current user information.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "full_name": "John Doe",
    "email": "john@example.com",
    "role": "author",
    "status": "active",
    "avatar": { ... }
  }
}
```

---

## Users Endpoints

### GET /users
List all users (Admin only).

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `search` (string): Search by name or email
- `role` (string): Filter by role (admin, editor, author)
- `status` (string): Filter by status (active, inactive)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalPages": 5,
      "totalItems": 100
    }
  }
}
```

### GET /users/:id
Get user by ID (Admin or self).

**Response:** `200 OK`

### POST /users
Create new user (Admin only).

**Request Body:**
```json
{
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePass123!",
  "role": "editor",
  "status": "active",
  "avatar_id": 1
}
```

### PUT /users/:id
Update user (Admin or self).

**Request Body:** (all fields optional)
```json
{
  "full_name": "Jane Smith",
  "password": "NewPass123!",
  "avatar_id": 2
}
```

### DELETE /users/:id
Delete user (Admin only).

**Response:** `200 OK`

---

## Categories Endpoints

### GET /categories
List all categories.

**Query Parameters:**
- `page`, `limit`, `search`

### GET /categories/tree
Get hierarchical category tree.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Electronics",
      "slug": "electronics",
      "children": [
        {
          "id": 2,
          "name": "Phones",
          "slug": "phones",
          "children": []
        }
      ]
    }
  ]
}
```

### GET /categories/:id
Get category by ID.

### POST /categories
Create new category.

**Request Body:**
```json
{
  "name": "New Category",
  "slug": "new-category",
  "description": "Category description",
  "parent_id": 1,
  "image_id": 5,
  "meta_title": "SEO Title",
  "meta_description": "SEO Description",
  "meta_keywords": "keyword1, keyword2"
}
```

### PUT /categories/:id
Update category.

### DELETE /categories/:id
Delete category (children moved to parent).

### PUT /categories/reorder
Reorder categories.

**Request Body:**
```json
{
  "orders": [
    { "id": 1, "order": 0 },
    { "id": 2, "order": 1 }
  ]
}
```

---

## Posts Endpoints

### GET /posts
List posts (role-based filtering).

**Query Parameters:**
- `page`, `limit`, `search`
- `status` (string): draft, published
- `category_id` (number)
- `is_featured` (boolean)

### GET /posts/:id
Get post by ID.

### GET /posts/slug/:slug
Get post by slug.

### POST /posts
Create new post.

**Request Body:**
```json
{
  "title": "My Post",
  "slug": "my-post",
  "excerpt": "Brief summary",
  "content": "Full content here...",
  "category_id": 1,
  "featured_image_id": 3,
  "status": "published",
  "is_featured": false,
  "meta_title": "SEO Title",
  "meta_description": "SEO Description",
  "meta_keywords": "keyword1, keyword2"
}
```

### PUT /posts/:id
Update post (ownership check).

### DELETE /posts/:id
Delete post (ownership check).

### PUT /posts/:id/status
Update post status.

**Request Body:**
```json
{
  "status": "published"
}
```

---

## Products Endpoints

### GET /products
List products.

**Query Parameters:**
- `page`, `limit`, `search`
- `status` (string): active, inactive
- `category_id` (number)
- `is_featured` (boolean)

### GET /products/:id
Get product with prices.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Product Name",
    "prices": [
      {
        "id": 1,
        "name": "Small",
        "price": 19.99,
        "compare_at_price": 29.99,
        "is_default": true
      }
    ],
    "gallery": [1, 2, 3]
  }
}
```

### POST /products
Create product with prices.

**Request Body:**
```json
{
  "name": "New Product",
  "slug": "new-product",
  "description": "Product description",
  "category_id": 1,
  "featured_image_id": 5,
  "gallery": [5, 6, 7],
  "status": "active",
  "is_featured": false,
  "prices": [
    {
      "name": "Small",
      "price": 19.99,
      "compare_at_price": 29.99,
      "is_default": true
    }
  ]
}
```

### PUT /products/:id
Update product.

### DELETE /products/:id
Delete product (cascades to prices).

### POST /products/:id/prices
Add price variant.

### PUT /products/:id/prices/:priceId
Update price variant.

### DELETE /products/:id/prices/:priceId
Delete price variant.

---

## Media Endpoints

### GET /media
List media files.

**Query Parameters:**
- `page`, `limit`, `search`
- `type` (string): image, video, document
- `folder` (string)

### GET /media/:id
Get media by ID.

### POST /media/upload
Upload single file.

**Request:** `multipart/form-data`
- `file`: File to upload
- `alt_text` (optional)
- `caption` (optional)
- `folder` (optional)

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "filename": "image-123.jpg",
    "url": "/uploads/2024/01/image-123.jpg",
    "thumbnail_url": "/uploads/2024/01/image-123-thumb.jpg",
    "type": "image",
    "size": 102400,
    "mime_type": "image/jpeg"
  }
}
```

### POST /media/upload/multiple
Upload multiple files.

**Request:** `multipart/form-data`
- `files`: Array of files

### PUT /media/:id
Update media metadata.

**Request Body:**
```json
{
  "alt_text": "Updated alt text",
  "caption": "Updated caption",
  "folder": "2024/01"
}
```

### DELETE /media/:id
Delete media file.

### DELETE /media/bulk
Bulk delete media.

**Request Body:**
```json
{
  "ids": [1, 2, 3]
}
```

### GET /media/folders
List all folders.

---

## Reservations Endpoints

### GET /reservations
List reservations.

**Query Parameters:**
- `page`, `limit`
- `status` (string): pending, confirmed, completed, cancelled
- `date_from`, `date_to` (ISO date)

### GET /reservations/:id
Get reservation by ID.

### POST /reservations
Create reservation (public endpoint).

**Request Body:**
```json
{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "1234567890",
  "reservation_date": "2024-12-25T19:00:00Z",
  "party_size": 4,
  "special_requests": "Window seat please"
}
```

### PUT /reservations/:id
Update reservation.

### PUT /reservations/:id/status
Update reservation status.

**Request Body:**
```json
{
  "status": "confirmed"
}
```

### DELETE /reservations/:id
Delete reservation.

### GET /reservations/calendar
Get calendar view (grouped by date).

---

## Contacts Endpoints

### GET /contacts
List contacts.

**Query Parameters:**
- `page`, `limit`
- `status` (string): new, read, replied

### GET /contacts/:id
Get contact by ID.

### POST /contacts
Submit contact form (public endpoint).

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "0987654321",
  "subject": "Inquiry",
  "message": "I have a question..."
}
```

### PUT /contacts/:id/status
Update contact status.

**Request Body:**
```json
{
  "status": "read"
}
```

### DELETE /contacts/:id
Delete contact.

### DELETE /contacts/bulk
Bulk delete contacts.

**Request Body:**
```json
{
  "ids": [1, 2, 3]
}
```

---

## Menus Endpoints

### GET /menus
List all menus.

### GET /menus/:id
Get menu with nested items.

### GET /menus/location/:location
Get menu by location (e.g., "header", "footer").

### POST /menus
Create menu.

**Request Body:**
```json
{
  "name": "Main Menu",
  "location": "header"
}
```

### PUT /menus/:id
Update menu.

### DELETE /menus/:id
Delete menu (cascades to items).

### POST /menus/:id/items
Add menu item.

**Request Body:**
```json
{
  "title": "Home",
  "url": "/",
  "type": "custom",
  "parent_id": null,
  "order": 0
}
```

### PUT /menus/:id/items/:itemId
Update menu item.

### DELETE /menus/:id/items/:itemId
Delete menu item (cascades to children).

### PUT /menus/:id/items/reorder
Reorder menu items.

---

## Settings Endpoints

### GET /settings
Get all settings.

### GET /settings/:key
Get setting by key.

### PUT /settings
Update settings (bulk).

**Request Body:**
```json
{
  "site_name": "My CMS",
  "site_description": "A great CMS",
  "contact_email": "contact@example.com"
}
```

### GET /settings/group/:group
Get settings by group (e.g., "general", "contact").

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Email is required", "Email must be valid"]
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You do not have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "An error occurred while processing your request"
}
```

---

## Rate Limiting

- **Authentication endpoints**: 5 requests per 15 minutes
- **API endpoints**: 100 requests per 15 minutes
- **Sensitive operations**: 10 requests per hour

Rate limit headers:
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1640000000
```

---

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)

**Response Format:**
```json
{
  "items": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "totalItems": 100
  }
}
```

---

## File Upload

**Supported Types:**
- Images: jpg, jpeg, png, gif, webp
- Videos: mp4, webm
- Documents: pdf, doc, docx

**Size Limit:** 10MB per file

**Response includes:**
- Original file URL
- Thumbnail URL (for images)
- File metadata

---

## Best Practices

1. **Always use HTTPS** in production
2. **Store tokens securely** (httpOnly cookies or secure storage)
3. **Refresh tokens** before they expire
4. **Handle errors gracefully** on the client
5. **Implement retry logic** for failed requests
6. **Use pagination** for large datasets
7. **Validate input** on both client and server
8. **Log errors** for debugging

---

**API Version:** 1.0  
**Last Updated:** 2024
