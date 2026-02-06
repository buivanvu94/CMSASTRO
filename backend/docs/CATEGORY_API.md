# Category API Documentation

## Overview

Category API hỗ trợ quản lý danh mục với cấu trúc phân cấp (nested categories). Mỗi category có thể có parent và nhiều children, tạo thành cấu trúc cây.

## Features

- ✅ Nested categories (parent-child relationships)
- ✅ Circular reference prevention
- ✅ Automatic slug generation
- ✅ Tree structure retrieval
- ✅ Drag & drop reordering support
- ✅ SEO metadata support
- ✅ Type separation (post/product)
- ✅ Soft hierarchy (children moved to parent on deletion)

## Endpoints

### 1. Get All Categories

**GET** `/api/v1/categories`

Lấy danh sách categories với pagination và filtering.

**Query Parameters:**
- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số items per page (default: 20, max: 100)
- `search` (optional): Tìm kiếm theo name, slug, description
- `type` (optional): Filter theo type (`post` hoặc `product`)
- `status` (optional): Filter theo status (`active` hoặc `inactive`)
- `parentId` (optional): Filter theo parent ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Tin tức",
      "slug": "tin-tuc",
      "description": "Danh mục tin tức",
      "parent_id": null,
      "type": "post",
      "sort_order": 0,
      "status": "active",
      "seo_title": "Tin tức",
      "seo_description": "Tin tức mới nhất",
      "created_at": "2026-02-05T10:00:00.000Z",
      "updated_at": "2026-02-05T10:00:00.000Z",
      "image": null,
      "parent": null
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

### 2. Get Category Tree

**GET** `/api/v1/categories/tree`

Lấy categories dạng cấu trúc cây (nested structure).

**Query Parameters:**
- `type` (optional): Filter theo type (`post` hoặc `product`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Tin tức",
      "slug": "tin-tuc",
      "depth": 0,
      "children": [
        {
          "id": 2,
          "name": "Công nghệ",
          "slug": "cong-nghe",
          "depth": 1,
          "children": [
            {
              "id": 3,
              "name": "AI",
              "slug": "ai",
              "depth": 2,
              "children": []
            }
          ]
        }
      ]
    }
  ]
}
```

---

### 3. Get Category by ID

**GET** `/api/v1/categories/:id`

Lấy chi tiết category theo ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Tin tức",
    "slug": "tin-tuc",
    "description": "Danh mục tin tức",
    "parent_id": null,
    "type": "post",
    "sort_order": 0,
    "status": "active",
    "image": {
      "id": 5,
      "path": "/uploads/2026/02/image.jpg",
      "thumbnail_path": "/uploads/2026/02/thumb-image.jpg",
      "alt_text": "Category image"
    },
    "parent": null,
    "children": [
      {
        "id": 2,
        "name": "Công nghệ",
        "slug": "cong-nghe",
        "sort_order": 0
      }
    ]
  }
}
```

---

### 4. Get Category by Slug

**GET** `/api/v1/categories/slug/:slug`

Lấy category theo slug.

**Response:** Giống như Get by ID

---

### 5. Create Category

**POST** `/api/v1/categories`

**Permissions:** Admin, Editor

**Request Body:**
```json
{
  "name": "Tin tức",
  "slug": "tin-tuc",  // Optional, auto-generated if not provided
  "description": "Danh mục tin tức",
  "parent_id": null,  // Optional
  "image_id": 5,      // Optional
  "type": "post",     // Required: "post" or "product"
  "sort_order": 0,    // Optional, default: 0
  "status": "active", // Optional, default: "active"
  "seo_title": "Tin tức",
  "seo_description": "Tin tức mới nhất"
}
```

**Validation Rules:**
- `name`: Required, 2-100 characters
- `slug`: Optional, lowercase alphanumeric with hyphens
- `parent_id`: Must exist if provided
- `type`: Must be "post" or "product"
- `seo_title`: Max 70 characters
- `seo_description`: Max 160 characters

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Tin tức",
    "slug": "tin-tuc",
    ...
  },
  "message": "Category created successfully"
}
```

---

### 6. Update Category

**PUT** `/api/v1/categories/:id`

**Permissions:** Admin, Editor

**Request Body:** Same as Create (all fields optional)

**Special Behaviors:**
- Slug auto-regenerated if name changes (unless slug explicitly provided)
- Prevents circular references (cannot set child as parent)
- Validates parent exists and has same type

**Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Category updated successfully"
}
```

---

### 7. Delete Category

**DELETE** `/api/v1/categories/:id`

**Permissions:** Admin only

**Behavior:**
- Children are moved to deleted category's parent (soft hierarchy)
- If deleted category is root, children become root categories

**Response:**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

---

### 8. Reorder Categories

**PUT** `/api/v1/categories/reorder`

**Permissions:** Admin, Editor

Cập nhật sort_order và parent_id cho nhiều categories cùng lúc (hỗ trợ drag & drop).

**Request Body:**
```json
{
  "items": [
    {
      "id": 1,
      "sort_order": 0,
      "parent_id": null
    },
    {
      "id": 2,
      "sort_order": 0,
      "parent_id": 1
    },
    {
      "id": 3,
      "sort_order": 1,
      "parent_id": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Categories reordered successfully"
}
```

---

### 9. Get Category Statistics

**GET** `/api/v1/categories/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 25,
    "byType": [
      { "type": "post", "count": 15 },
      { "type": "product", "count": 10 }
    ],
    "byStatus": [
      { "status": "active", "count": 20 },
      { "status": "inactive", "count": 5 }
    ]
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Category name is required"
    }
  ]
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Category not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Slug already exists"
}
```

### 422 Unprocessable Entity
```json
{
  "success": false,
  "message": "Cannot set a descendant category as parent"
}
```

---

## Business Rules

### 1. Slug Generation
- Auto-generated from name if not provided
- Vietnamese characters converted to ASCII
- Spaces replaced with hyphens
- Unique constraint enforced
- Appends number if duplicate (e.g., `tin-tuc-2`)

### 2. Circular Reference Prevention
- Category cannot be its own parent
- Category cannot have a descendant as parent
- Validated on create and update

### 3. Type Consistency
- Parent and child must have same type
- Cannot change type if has children with different type

### 4. Soft Hierarchy
- Deleting category moves children to parent
- No orphaned categories
- Maintains tree structure integrity

### 5. Sort Order
- Used for display order within same level
- Can be updated via reorder endpoint
- Default: 0

---

## Usage Examples

### Create nested structure
```bash
# 1. Create root category
curl -X POST http://localhost:5000/api/v1/categories \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Tin tức", "type": "post"}'

# 2. Create child category
curl -X POST http://localhost:5000/api/v1/categories \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Công nghệ", "parent_id": 1, "type": "post"}'

# 3. Create grandchild
curl -X POST http://localhost:5000/api/v1/categories \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "AI", "parent_id": 2, "type": "post"}'
```

### Get tree structure
```bash
curl http://localhost:5000/api/v1/categories/tree?type=post \
  -H "Authorization: Bearer TOKEN"
```

### Reorder categories
```bash
curl -X PUT http://localhost:5000/api/v1/categories/reorder \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"id": 2, "sort_order": 0, "parent_id": 1},
      {"id": 3, "sort_order": 1, "parent_id": 1}
    ]
  }'
```
