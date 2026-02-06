# Implementation Plan

## Backend Implementation

- [ ] 1. Project Setup and Core Infrastructure
- [x] 1.1 Initialize Node.js project with Express



  - Create package.json with all dependencies
  - Set up project folder structure (src/config, src/middlewares, src/modules, src/utils)
  - Create .env.example file with all required environment variables


  - _Requirements: All_

- [x] 1.2 Configure database connection with Sequelize

  - Create database.js config file with Sequelize initialization


  - Set up connection pooling and logging
  - Implement syncDatabase function with auto-migration support
  - _Requirements: 11.1, 11.2_




- [x] 1.3 Create base middleware stack

  - Implement error handling middleware with consistent error response format
  - Set up CORS, Helmet, Morgan logging middlewares
  - Create request body parsing middleware


  - _Requirements: All_

- [x] 1.4 Implement authentication middleware



  - Create JWT token verification middleware
  - Implement token extraction from Authorization header
  - Handle token expiration and invalid token errors



  - _Requirements: 1.3, 1.4_

- [x] 1.5 Implement role-based authorization middleware


  - Create role checking middleware (admin, editor, author)
  - Implement resource ownership checking
  - _Requirements: 1.5, 15.1, 15.2, 15.3, 15.4, 15.5_






- [x] 1.6 Create utility functions

  - Implement slug generation utility with Vietnamese character conversion
  - Create response formatter utility
  - Implement logger utility

  - _Requirements: 3.1, 4.1, 19.1, 19.2, 19.3_


- [x] 1.7 Write property test for slug generation


  - **Property 12: Category slug generation**
  - **Validates: Requirements 3.1, 19.1, 19.2, 19.3**


- [ ] 2. User and Authentication Module
- [x] 2.1 Create User model with Sequelize


  - Define User schema with all fields (id, full_name, email, password, avatar_id, role, status)
  - Set up model validations (email format, role enum, status enum)
  - Create associations (belongsTo Media for avatar)
  - _Requirements: 2.1, 2.2_

- [x] 2.2 Implement User service layer


  - Create findAll with pagination and search
  - Implement findById with avatar relationship
  - Create user creation with password encryption (bcrypt)
  - Implement user update with password handling
  - Create user deletion with cascade handling
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2.3 Write property test for user password encryption


  - **Property 7: User creation encrypts passwords**
  - **Validates: Requirements 2.1**




- [x] 2.4 Write property test for user updates
  - **Property 9: User updates persist correctly**

  - **Validates: Requirements 2.3**

- [x] 2.5 Create User controller with REST endpoints
  - GET /users - List users (admin only)
  - GET /users/:id - Get user details (admin or self)
  - POST /users - Create user (admin only)



  - PUT /users/:id - Update user (admin or self)

  - DELETE /users/:id - Delete user (admin only)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2.6 Implement Auth service
  - Create login function with credential validation
  - Implement JWT token generation (access + refresh)
  - Create token refresh logic
  - Implement logout with token invalidation
  - Create getCurrentUser function
  - _Requirements: 1.1, 1.2, 1.3, 1.6_



- [x] 2.7 Write property test for authentication
  - **Property 1: Valid credentials generate tokens**


  - **Validates: Requirements 1.1**

- [x] 2.8 Write property test for invalid credentials
  - **Property 2: Invalid credentials are rejected**
  - **Validates: Requirements 1.2**



- [x] 2.9 Write property test for token refresh

  - **Property 3: Token refresh extends session**
  - **Validates: Requirements 1.3**


- [x] 2.10 Create Auth controller with endpoints
  - POST /auth/login - User login
  - POST /auth/register - User registration
  - POST /auth/refresh - Refresh access token
  - POST /auth/logout - User logout
  - GET /auth/me - Get current user
  - _Requirements: 1.1, 1.2, 1.3, 1.6_

- [x] 2.11 Write property test for authorization
  - **Property 4: Unauthenticated requests are blocked**
  - **Property 5: Unauthorized access is prevented**

  - **Validates: Requirements 1.4, 1.5**

- [ ] 3. Media Module
- [x] 3.1 Create Media model



  - Define Media schema with all fields
  - Set up associations (belongsTo User for uploader)
  - _Requirements: 9.1, 9.2, 9.3, 9.8_

- [x] 3.2 Implement file upload middleware with Multer
  - Configure memory storage
  - Set up file type validation (MIME type checking)






  - Implement file size limit (10MB)
  - Create file filter for allowed types
  - _Requirements: 9.3, 9.4, 13.1, 13.2_

- [x] 3.3 Implement Media service layer
  - Create upload function with file processing
  - Implement thumbnail generation with Sharp (300x300px)
  - Create directory structure (year/month organization)
  - Implement unique filename generation
  - Create findAll with pagination and filtering
  - Implement findById
  - Create update for metadata (alt_text, caption, folder)
  - Implement delete with file cleanup
  - Create deleteMultiple for bulk operations


  - Implement getFolders function
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 13.3, 13.4_

- [x] 3.4 Write property test for thumbnail generation


  - **Property 47: Image thumbnail generation**
  - **Validates: Requirements 9.1**

- [x] 3.5 Write property test for file organization
  - **Property 48: File organization by date**
  - **Validates: Requirements 9.2, 13.4**

- [x] 3.6 Write property test for file type validation
  - **Property 49: File type validation**
  - **Validates: Requirements 9.3, 13.1, 13.2**





- [x] 3.7 Write property test for unique filename generation
  - **Property 54: Unique filename generation**
  - **Validates: Requirements 13.3**


- [x] 3.8 Create Media controller with endpoints
  - GET /media - List media with pagination
  - GET /media/:id - Get media details
  - POST /media/upload - Upload single file
  - POST /media/upload/multiple - Upload multiple files
  - PUT /media/:id - Update media metadata



  - DELETE /media/:id - Delete media
  - DELETE /media/bulk - Bulk delete
  - GET /media/folders - List folders

  - POST /media/folders - Create folder
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_


- [x] 3.9 Write property test for media deletion
  - **Property 51: Media deletion removes files**

  - **Validates: Requirements 9.6**


- [ ] 4. Category Module
- [x] 4.1 Create Category model
  - Define Category schema with self-referencing parent_id
  - Set up associations (belongsTo self for parent, hasMany self for children, belongsTo Media for image)
  - Create slug field with unique constraint
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 4.2 Implement Category service layer
  - Create findAll with pagination and filtering
  - Implement findTree for hierarchical structure
  - Create findById with relationships
  - Implement create with slug generation and parent validation
  - Create update with circular reference prevention
  - Implement delete with children handling (move to parent)
  - Create reorder function
  - Implement generateUniqueSlug helper
  - Create getDescendants helper for circular reference checking
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 4.3 Write property test for category tree structure



  - **Property 14: Category tree structure is correct**






  - **Validates: Requirements 3.3**





- [x] 4.4 Write property test for parent-child relationships
  - **Property 13: Parent-child relationships are established**



  - **Validates: Requirements 3.2**

- [x] 4.5 Write property test for category deletion
  - **Property 15: Category deletion moves children**


  - **Validates: Requirements 3.6**

- [x] 4.6 Create Category controller with endpoints

  - GET /categories - List categories

  - GET /categories/tree - Get tree structure
  - GET /categories/:id - Get category details
  - POST /categories - Create category
  - PUT /categories/:id - Update category


  - DELETE /categories/:id - Delete category
  - PUT /categories/reorder - Reorder categories
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_


- [ ] 5. Post Module
- [x] 5.1 Create Post model
  - Define Post schema with all fields
  - Set up associations (belongsTo Category, belongsTo User as author, belongsTo Media as featuredImage)
  - Create beforeSave hook to set published_at on publish
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_


- [x] 5.2 Implement Post service layer
  - Create findAll with pagination, filtering, and role-based access
  - Implement findById with relationships
  - Create findBySlug

  - Implement create with slug generation




  - Create update with slug regeneration
  - Implement delete


  - Create updateStatus function
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10_

- [x] 5.3 Write property test for post slug uniqueness
  - **Property 17: Post slug uniqueness**
  - **Validates: Requirements 4.1, 4.2, 19.4**




- [x] 5.4 Write property test for publishing timestamp
  - **Property 18: Publishing sets timestamp**
  - **Validates: Requirements 4.3, 20.2**

- [x] 5.5 Write property test for draft posts
  - **Property 19: Draft posts have no publish timestamp**
  - **Validates: Requirements 4.4**

- [x] 5.6 Write property test for author access control
  - **Property 24: Author sees only own posts**
  - **Property 25: Editors see all posts**
  - **Validates: Requirements 4.9, 4.10, 15.1, 15.2**

- [x] 5.7 Create Post controller with endpoints
  - GET /posts - List posts with role-based filtering
  - GET /posts/:id - Get post details
  - GET /posts/slug/:slug - Get post by slug
  - POST /posts - Create post
  - PUT /posts/:id - Update post with ownership check
  - DELETE /posts/:id - Delete post with ownership check
  - PUT /posts/:id/status - Update post status

  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10_

- [x] 5.8 Write property test for post search

  - **Property 22: Post search filters correctly**
  - **Validates: Requirements 4.7**




- [ ] 6. Product Module
- [x] 6.1 Create Product and ProductPrice models



  - Define Product schema with gallery JSON field
  - Define ProductPrice schema

  - Set up associations (Product hasMany ProductPrice, Product belongsTo Category, Product belongsTo Media)
  - _Requirements: 5.1, 5.2, 5.3, 5.4_



- [x] 6.2 Implement Product service layer
  - Create findAll with pagination and filtering
  - Implement findById with prices and relationships
  - Create findBySlug
  - Implement create with price variants
  - Create update with gallery management
  - Implement delete with cascade to prices
  - Create price variant CRUD operations
  - Implement default price handling (ensure only one default)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [x] 6.3 Write property test for price variants
  - **Property 26: Product price variants storage**
  - **Validates: Requirements 5.2**

- [x] 6.4 Write property test for default price
  - **Property 27: Single default price variant**
  - **Validates: Requirements 5.3**

- [x] 6.5 Write property test for gallery storage
  - **Property 28: Gallery stored as JSON array**
  - **Validates: Requirements 5.4, 18.1**

- [x] 6.6 Write property test for product deletion
  - **Property 30: Product deletion cascades to prices**
  - **Validates: Requirements 5.6**



- [x] 6.7 Create Product controller with endpoints
  - GET /products - List products
  - GET /products/:id - Get product details
  - GET /products/slug/:slug - Get product by slug


  - POST /products - Create product with prices
  - PUT /products/:id - Update product
  - DELETE /products/:id - Delete product
  - POST /products/:id/prices - Add price variant
  - PUT /products/:id/prices/:priceId - Update price variant
  - DELETE /products/:id/prices/:priceId - Delete price variant
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [ ] 7. Reservation Module
- [ ] 7.1 Create Reservation model
  - Define Reservation schema with all fields
  - Set up associations (belongsTo User as handler)
  - Create validation for party_size (1-50)
  - _Requirements: 6.1, 6.7_





- [x] 7.2 Implement Reservation service layer

  - Create findAll with pagination and filtering
  - Implement findById
  - Create public create function (no auth required)
  - Implement update
  - Create updateStatus function
  - Implement delete
  - Create getCalendar function (group by date)

  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 7.3 Write property test for reservation creation



  - **Property 33: Reservation creation defaults to pending**
  - **Validates: Requirements 6.1**

- [x] 7.4 Write property test for status transitions




  - **Property 35: Reservation status transitions**
  - **Validates: Requirements 6.3, 6.4, 6.5, 6.6**

- [x] 7.5 Create Reservation controller with endpoints



  - GET /reservations - List reservations
  - GET /reservations/:id - Get reservation details
  - POST /reservations - Create reservation (public)
  - PUT /reservations/:id - Update reservation
  - PUT /reservations/:id/status - Update status
  - DELETE /reservations/:id - Delete reservation
  - GET /reservations/calendar - Get calendar view
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] 8. Contact Module
- [x] 8.1 Create Contact model

  - Define Contact schema with all fields
  - Create status enum validation
  - _Requirements: 7.1, 7.2_

- [x] 8.2 Implement Contact service layer


  - Create findAll with pagination and filtering
  - Implement findById
  - Create public create function (no auth required)
  - Implement updateStatus
  - Create delete
  - Implement deleteMultiple for bulk operations
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 8.3 Write property test for contact creation



  - **Property 36: Contact creation defaults to new**
  - **Validates: Requirements 7.1**

- [x] 8.4 Write property test for bulk deletion




  - **Property 39: Bulk contact deletion**
  - **Validates: Requirements 7.6**

- [x] 8.5 Create Contact controller with endpoints



  - GET /contacts - List contacts
  - GET /contacts/:id - Get contact details
  - POST /contacts - Submit contact form (public)
  - PUT /contacts/:id/status - Update status
  - DELETE /contacts/:id - Delete contact
  - DELETE /contacts/bulk - Bulk delete
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_


- [ ] 9. Menu Module
- [x] 9.1 Create Menu and MenuItem models


  - Define Menu schema with location unique constraint
  - Define MenuItem schema with self-referencing parent_id
  - Set up associations (Menu hasMany MenuItem, MenuItem belongsTo MenuItem as parent, MenuItem hasMany MenuItem as children)
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 9.2 Implement Menu service layer


  - Create findAll
  - Implement findById with nested items
  - Create findByLocation with nested structure
  - Implement menu CRUD operations
  - Create menu item CRUD operations
  - Implement reorder function for items
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [x] 9.3 Write property test for menu item nesting




  - **Property 42: Menu item nesting**
  - **Validates: Requirements 8.3**

- [x] 9.4 Write property test for menu deletion


  - **Property 45: Menu deletion cascades to items**


  - **Property 46: Menu item deletion cascades to children**
  - **Validates: Requirements 8.6, 8.7**

- [x] 9.5 Create Menu controller with endpoints


  - GET /menus - List menus
  - GET /menus/:id - Get menu with items



  - GET /menus/location/:location - Get menu by location
  - POST /menus - Create menu
  - PUT /menus/:id - Update menu
  - DELETE /menus/:id - Delete menu
  - POST /menus/:id/items - Add menu item
  - PUT /menus/:id/items/:itemId - Update menu item
  - DELETE /menus/:id/items/:itemId - Delete menu item
  - PUT /menus/:id/items/reorder - Reorder items
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [ ] 10. Setting Module
- [x] 10.1 Create Setting model


  - Define Setting schema with key unique constraint
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 10.2 Implement Setting service layer


  - Create findAll

  - Implement findByKey
  - Create findByGroup
  - Implement update (upsert logic)
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 10.3 Create Setting controller with endpoints



  - GET /settings - Get all settings

  - GET /settings/:key - Get setting by key
  - PUT /settings - Update settings
  - GET /settings/group/:group - Get settings by group
  - _Requirements: 10.1, 10.2, 10.3, 10.4_




- [ ] 11. Application Entry Point and Server Setup
- [x] 11.1 Create app.js with Express application

  - Set up all middleware (cors, helmet, morgan, body parser)
  - Configure static file serving for uploads
  - Register all module routes
  - Add 404 handler
  - Add error handling middleware
  - _Requirements: All_

- [x] 11.2 Create server.js with startup logic


  - Import database sync function
  - Start server on configured port
  - Handle graceful shutdown
  - _Requirements: 11.1, 11.2, 11.5_


- [x] 11.3 Create validation schemas for all endpoints
  - Implement express-validator schemas for each module
  - Add validation middleware to routes
  - _Requirements: 12.1, 12.2, 13.1, 13.2_


- [x] 12. Backend Testing Setup
- [x] 12.1 Set up Jest testing framework
  - Configure Jest for Node.js
  - Set up test database


  - Create test utilities and helpers
  - _Requirements: All_

- [-] 12.2 Set up fast-check for property-based testing



  - Install and configure fast-check
  - Create custom generators for domain objects
  - Set minimum iterations to 100
  - _Requirements: All_

- [x] 13. Checkpoint - Backend Core Complete
  - Ensure all tests pass, ask the user if questions arise.

## Frontend Implementation



- [ ] 14. Frontend Project Setup
- [ ] 14.1 Initialize Astro project with React and Tailwind
  - Create Astro project with TypeScript
  - Install and configure @astrojs/react
  - Install and configure @astrojs/tailwind
  - Set up Tailwind CSS configuration
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.6_

- [ ] 14.2 Configure environment variables
  - Create .env file with PUBLIC_API_URL



  - Set up environment variable types
  - _Requirements: All_






- [ ] 14.3 Set up project structure
  - Create folder structure (components, layouts, pages, lib)
  - Organize components into ui, islands, and layout folders
  - _Requirements: All_


- [ ] 15. API Client and State Management
- [ ] 15.1 Create Axios API client with interceptors
  - Set up base Axios instance with baseURL
  - Implement request interceptor to add JWT token
  - Create response interceptor for token refresh



  - Handle 401 errors with redirect to login
  - _Requirements: 1.3, 1.4, 16.1_



- [ ] 15.2 Write property test for token refresh logic
  - **Property 3: Token refresh extends session**
  - **Validates: Requirements 1.3**



- [ ] 15.3 Create API client modules for each resource
  - Implement auth.ts (login, register, refresh, logout, me)
  - Create users.ts (CRUD operations)
  - Implement categories.ts (CRUD, tree)
  - Create posts.ts (CRUD, search, status update)
  - Implement products.ts (CRUD, price variants)
  - Create reservations.ts (CRUD, calendar, status)
  - Implement contacts.ts (CRUD, status, bulk delete)



  - Create menus.ts (CRUD, items, reorder)
  - Implement media.ts (upload, CRUD, folders)
  - Create settings.ts (get, update)
  - _Requirements: All_

- [ ] 15.4 Set up Nanostores for state management
  - Create auth store (user, token, isAuthenticated)
  - Implement ui store (loading, modals, notifications)
  - Create media store (selected media, upload progress)


  - _Requirements: 16.1, 16.3_

- [ ] 16. UI Component Library
- [ ] 16.1 Create base UI components (Astro)
  - Implement Button component with variants
  - Create Input component with validation states
  - Implement Textarea component
  - Create Select component





  - Implement Card component
  - Create Badge component with color variants




  - Implement Modal component
  - Create Table component
  - Implement Alert component
  - Create Dropdown component
  - Implement Tabs component
  - Create Pagination component
  - _Requirements: 16.4, 16.6_

- [ ] 17. Layout Components
- [ ] 17.1 Create BaseLayout
  - Implement HTML structure with meta tags
  - Add global styles
  - _Requirements: All_

- [ ] 17.2 Create AuthLayout
  - Implement centered layout for login page
  - Add branding and styling
  - _Requirements: 16.1, 16.2_


- [ ] 17.3 Create DashboardLayout with Header and Sidebar
  - Implement Header component with user menu
  - Create Sidebar component with role-based menu filtering
  - Implement responsive layout
  - _Requirements: 16.3_

- [ ] 17.4 Write property test for role-based menu filtering
  - **Property 69: Role-based menu filtering**
  - **Validates: Requirements 16.3**

- [ ] 18. Authentication Pages and Middleware
- [ ] 18.1 Create login page
  - Implement LoginForm island component
  - Add form validation
  - Handle login API call
  - Redirect to dashboard on success
  - _Requirements: 1.1, 1.2, 16.2_

- [ ] 18.2 Write property test for form validation
  - **Property 70: Form validation displays errors**
  - **Validates: Requirements 16.4**

- [ ] 18.3 Implement authentication middleware
  - Create middleware to check authentication
  - Redirect to login if not authenticated
  - Allow access to public routes
  - _Requirements: 16.1_

- [ ] 18.4 Write property test for redirect behavior
  - **Property 68: Unauthenticated page access redirects**
  - **Validates: Requirements 16.1**

- [ ] 19. Dashboard Page
- [ ] 19.1 Create dashboard index page
  - Implement statistics cards (total posts, products, reservations, contacts)
  - Add recent activity list
  - Create quick actions section
  - _Requirements: All_

- [ ] 20. Media Management Pages
- [ ] 20.1 Create MediaLibrary island component
  - Implement grid view for media files
  - Add upload functionality (single and multiple)
  - Create drag-and-drop upload zone
  - Implement search and folder filtering
  - Add pagination
  - Create delete functionality
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

- [ ] 20.2 Create MediaPicker island component
  - Implement modal media picker
  - Add selection functionality (single/multiple)
  - Create confirm selection button
  - _Requirements: 9.1, 9.7, 9.8_

- [ ] 20.3 Create media index page
  - Use MediaLibrary component in library mode
  - Add folder management
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_


- [ ] 21. Category Management Pages
- [ ] 21.1 Create CategoryTree island component
  - Implement tree view with expand/collapse
  - Add drag-and-drop for reordering
  - Create inline edit functionality
  - _Requirements: 3.3, 3.7_

- [ ] 21.2 Create CategoryForm island component
  - Implement form with all fields
  - Add parent category selector
  - Create image picker integration
  - Add SEO fields
  - _Requirements: 3.1, 3.2, 12.1, 12.2_

- [ ] 21.3 Create category pages
  - Implement categories/index.astro with CategoryTree
  - Create categories/new.astro with CategoryForm
  - Implement categories/[id].astro for editing
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [ ] 22. Post Management Pages
- [ ] 22.1 Create PostForm island component
  - Implement form with title, content, excerpt
  - Add rich text editor for content
  - Create category selector
  - Add featured image picker
  - Implement SEO fields with character counters
  - Create status selector and featured checkbox
  - Add save draft and publish buttons
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 12.1, 12.2, 17.2_

- [ ] 22.2 Create PostTable island component
  - Implement table with columns (title, category, author, status, date)
  - Add search and filter functionality
  - Create pagination
  - Add edit and delete actions
  - _Requirements: 4.7, 4.8, 4.9, 4.10_

- [ ] 22.3 Create post pages
  - Implement posts/index.astro with PostTable
  - Create posts/new.astro with PostForm
  - Implement posts/[id].astro for editing
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10_

- [ ] 23. Product Management Pages
- [ ] 23.1 Create PriceEditor island component
  - Implement price variant list
  - Add form to add new variant
  - Create edit and delete actions
  - Implement default price toggle
  - _Requirements: 5.2, 5.3, 5.5_

- [ ] 23.2 Create ProductForm island component
  - Implement form with all product fields
  - Add category selector
  - Create featured image picker
  - Implement gallery uploader
  - Add PriceEditor component
  - Create SEO fields
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 18.1, 18.2_


- [ ] 23.3 Create ProductTable island component
  - Implement table with columns (name, category, prices, status, featured)
  - Add search and filter functionality
  - Create pagination
  - Add edit and delete actions
  - _Requirements: 5.7_

- [ ] 23.4 Create product pages
  - Implement products/index.astro with ProductTable
  - Create products/new.astro with ProductForm
  - Implement products/[id].astro for editing
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [ ] 24. Reservation Management Pages
- [ ] 24.1 Create ReservationCalendar island component
  - Implement monthly calendar view
  - Add date navigation (prev/next month)
  - Create reservation cards on calendar dates
  - Implement status color coding
  - Add click to view details modal
  - Create status update actions in modal
  - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] 24.2 Create ReservationTable island component
  - Implement table with all reservation fields
  - Add filter by status and date range
  - Create pagination
  - Add status update actions
  - _Requirements: 6.1, 6.3, 6.4, 6.5, 6.6_

- [ ] 24.3 Create reservation pages
  - Implement reservations/index.astro with ReservationTable
  - Create reservations/calendar.astro with ReservationCalendar
  - Implement reservations/[id].astro for details
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] 25. Contact Management Pages
- [ ] 25.1 Create ContactTable island component
  - Implement table with contact fields
  - Add filter by status
  - Create pagination
  - Add status update actions
  - Implement bulk delete with checkboxes
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ] 25.2 Create contact pages
  - Implement contacts/index.astro with ContactTable
  - Create contacts/[id].astro for details
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ] 26. Menu Management Pages
- [ ] 26.1 Create MenuBuilder island component
  - Implement nested menu item list
  - Add drag-and-drop for reordering
  - Create add item form
  - Implement edit and delete actions
  - Add link type selector (internal/custom)
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_


- [ ] 26.2 Create menu pages
  - Implement menus/index.astro with menu list
  - Create menus/[id].astro with MenuBuilder
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [ ] 27. User Management Pages
- [ ] 27.1 Create UserForm island component
  - Implement form with user fields
  - Add role selector
  - Create status toggle
  - Add avatar picker
  - _Requirements: 2.1, 2.3_

- [ ] 27.2 Create UserTable island component
  - Implement table with user fields
  - Add filter by role and status
  - Create pagination
  - Add edit and delete actions
  - _Requirements: 2.2_

- [ ] 27.3 Create user pages
  - Implement users/index.astro with UserTable (admin only)
  - Create users/profile.astro for self-edit
  - Implement users/[id].astro for admin edit
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 28. Settings Page
- [ ] 28.1 Create SettingsForm island component
  - Implement grouped settings display
  - Add edit functionality for each setting
  - Create save button
  - _Requirements: 10.1, 10.2, 10.3_

- [ ] 28.2 Create settings page
  - Implement settings/index.astro with SettingsForm
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 29. Error Handling and Loading States
- [ ] 29.1 Implement error handling in all island components
  - Add try-catch blocks for API calls
  - Display user-friendly error messages
  - _Requirements: 16.6_

- [ ] 29.2 Write property test for error messages
  - **Property 71: API error messages are user-friendly**
  - **Validates: Requirements 16.6**

- [ ] 29.3 Add loading states to all interactive components
  - Implement loading indicators
  - Disable buttons during processing
  - Add skeleton loaders for data fetching
  - _Requirements: 16.5_

- [ ] 30. Frontend Testing Setup
- [ ] 30.1 Set up Vitest testing framework
  - Configure Vitest for Astro/React
  - Set up React Testing Library
  - Create test utilities
  - _Requirements: All_


- [ ] 30.2 Set up fast-check for frontend property testing
  - Install and configure fast-check
  - Create custom generators for UI data
  - Set minimum iterations to 100
  - _Requirements: All_

- [ ] 31. Final Checkpoint - All Tests Pass
  - Ensure all tests pass, ask the user if questions arise.

## Integration and Polish

- [ ] 32. End-to-End Testing
- [ ] 32.1 Write E2E test for authentication flow
  - Test login, token refresh, logout
  - _Requirements: 1.1, 1.2, 1.3, 1.6_

- [ ] 32.2 Write E2E test for post creation flow
  - Test create post, upload image, publish
  - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6_

- [ ] 32.3 Write E2E test for product management flow
  - Test create product with variants and gallery
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 32.4 Write E2E test for media upload flow
  - Test upload, thumbnail generation, delete
  - _Requirements: 9.1, 9.2, 9.3, 9.5, 9.6_

- [ ] 33. Performance Optimization
- [ ] 33.1 Add database indexes
  - Create indexes on slug, email, status, category_id, author_id fields
  - _Requirements: All_

- [ ] 33.2 Optimize API queries
  - Review and optimize Sequelize includes
  - Prevent N+1 queries
  - _Requirements: All_

- [ ] 33.3 Optimize frontend bundle size
  - Code splitting for large components
  - Lazy load islands
  - _Requirements: All_

- [ ] 34. Security Hardening
- [ ] 34.1 Review and strengthen security measures
  - Verify bcrypt salt rounds >= 10
  - Check JWT secret strength
  - Review CORS configuration
  - Verify input sanitization
  - _Requirements: All_

- [ ] 34.2 Add rate limiting
  - Implement rate limiting on auth endpoints
  - _Requirements: 1.1, 1.2_

- [ ] 35. Documentation
- [ ] 35.1 Write API documentation
  - Document all endpoints with examples
  - _Requirements: All_

- [ ] 35.2 Write deployment guide
  - Document environment setup
  - Create deployment checklist
  - _Requirements: All_

- [ ] 35.3 Write user guide
  - Document admin panel features
  - Create user workflows
  - _Requirements: All_
