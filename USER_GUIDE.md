# CMS Admin Panel - User Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard](#dashboard)
3. [Content Management](#content-management)
4. [Media Library](#media-library)
5. [Customer Management](#customer-management)
6. [System Management](#system-management)
7. [User Roles & Permissions](#user-roles--permissions)
8. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### Logging In

1. Navigate to the admin panel URL (e.g., `https://admin.yourdomain.com`)
2. Enter your email and password
3. Click "Login"

**First Time Login:**
- Use the credentials provided by your administrator
- You'll be prompted to change your password

### Dashboard Overview

After logging in, you'll see the dashboard with:
- **Statistics Cards**: Quick overview of your content
- **Recent Activity**: Latest changes and updates
- **Quick Actions**: Common tasks you can perform

---

## Dashboard

### Statistics

The dashboard displays:
- **Total Posts**: Number of published posts
- **Total Products**: Active products in catalog
- **Pending Reservations**: Reservations awaiting confirmation
- **New Contacts**: Unread contact form submissions

### Quick Actions

- Create New Post
- Upload Media
- Add Product
- View Reservations

---

## Content Management

### Categories

Categories help organize your posts and products.

#### Creating a Category

1. Go to **Categories** in the sidebar
2. Click **Add Category**
3. Fill in the details:
   - **Name**: Category name (required)
   - **Slug**: URL-friendly version (auto-generated if left empty)
   - **Description**: Brief description
   - **Parent Category**: Select if this is a subcategory
   - **Image**: Optional category image
   - **SEO Fields**: Meta title, description, keywords

4. Click **Create Category**

#### Managing Categories

- **Tree View**: See hierarchical structure
- **Expand/Collapse**: Click arrow to show/hide subcategories
- **Quick Edit**: Click pencil icon to edit name inline
- **Full Edit**: Click edit button for all fields
- **Delete**: Click trash icon (children move to parent)

### Posts

Create and manage blog posts and articles.

#### Creating a Post

1. Go to **Posts** → **New Post**
2. Fill in the details:
   - **Title**: Post title (required)
   - **Slug**: URL (auto-generated)
   - **Excerpt**: Brief summary
   - **Content**: Full post content (required)
   - **Category**: Select category
   - **Featured Image**: Choose from media library
   - **Featured Post**: Check to highlight on homepage
   - **SEO Fields**: Optimize for search engines

3. Choose action:
   - **Save as Draft**: Save without publishing
   - **Publish**: Make post live immediately

#### Managing Posts

- **Search**: Find posts by title or content
- **Filter**: By status (draft/published) or category
- **Edit**: Click edit button
- **Delete**: Click delete button (requires confirmation)

**Post Status:**
- **Draft**: Not visible to public
- **Published**: Live on website

### Products

Manage your product catalog.

#### Creating a Product

1. Go to **Products** → **New Product**
2. Fill in basic information:
   - **Name**: Product name (required)
   - **Slug**: URL (auto-generated)
   - **Description**: Product details
   - **Category**: Product category
   - **Status**: Active or Inactive
   - **Featured**: Highlight on homepage

3. Add pricing:
   - Click **Add Variant**
   - Enter variant name (e.g., "Small", "Medium", "Large")
   - Set price and optional compare-at price
   - Mark one as default
   - Add more variants as needed

4. Add images:
   - **Featured Image**: Main product image
   - **Gallery**: Additional product images

5. Fill SEO fields
6. Click **Create Product**

#### Managing Products

- **Search**: Find products by name
- **Filter**: By status or category
- **Price Variants**: Multiple pricing options per product
- **Gallery**: Multiple product images

---

## Media Library

Manage all your images, videos, and documents.

### Uploading Files

#### Single File Upload

1. Go to **Media Library**
2. Click **Upload** button
3. Select file from your computer
4. Wait for upload to complete

#### Multiple Files Upload

1. Click **Upload** button
2. Select multiple files (Ctrl/Cmd + Click)
3. Or drag and drop files into the upload zone

**Supported Formats:**
- Images: JPG, PNG, GIF, WebP
- Videos: MP4, WebM
- Documents: PDF, DOC, DOCX

**Size Limit:** 10MB per file

### Managing Media

- **Grid View**: Visual display of all files
- **Search**: Find files by name
- **Filter**: By folder or file type
- **Edit**: Update alt text and caption
- **Delete**: Remove files (requires confirmation)

### Using Media Picker

When selecting images in forms:
1. Click **Select Image** button
2. Browse or search for image
3. Click image to select
4. Click **Select** to confirm

**Multiple Selection:**
- Click multiple images
- Selected images show checkmark
- Click **Select** to confirm all

---

## Customer Management

### Reservations

Manage table reservations and bookings.

#### Viewing Reservations

1. Go to **Reservations**
2. See list of all reservations
3. Filter by status or date

**Reservation Status:**
- **Pending**: Awaiting confirmation
- **Confirmed**: Reservation confirmed
- **Completed**: Customer has visited
- **Cancelled**: Reservation cancelled

#### Managing Reservations

1. Click on reservation to view details
2. Update status using dropdown
3. Add notes if needed
4. Delete if necessary

**Best Practices:**
- Confirm reservations promptly
- Mark as completed after visit
- Keep notes for special requests

### Contacts

Manage contact form submissions.

#### Viewing Contacts

1. Go to **Contacts**
2. See list of all submissions
3. Filter by status

**Contact Status:**
- **New**: Unread message
- **Read**: Message has been viewed
- **Replied**: Response sent

#### Managing Contacts

1. Click contact to view full message
2. Update status after reading
3. Delete spam or old messages
4. Use bulk delete for multiple items

**Bulk Operations:**
- Check boxes next to contacts
- Click **Delete Selected**
- Confirm deletion

---

## System Management

### Users

Manage user accounts and permissions (Admin only).

#### Creating a User

1. Go to **Users** → **New User**
2. Fill in details:
   - **Full Name**: User's name
   - **Email**: Login email (must be unique)
   - **Password**: Strong password
   - **Role**: Select user role
   - **Status**: Active or Inactive
   - **Avatar**: Optional profile picture

3. Click **Create User**

#### Managing Users

- **Filter**: By role or status
- **Edit**: Update user information
- **Delete**: Remove user account
- **Change Password**: Update user password

### Settings

Configure site-wide settings (Admin only).

#### Updating Settings

1. Go to **Settings**
2. Settings are grouped by category:
   - **General**: Site name, description
   - **Contact**: Email, phone, address
   - **Social**: Social media links

3. Update values as needed
4. Click **Save Settings**

**Settings Groups:**
- **General**: Basic site information
- **Contact**: Contact information
- **Social**: Social media profiles

---

## User Roles & Permissions

### Admin

**Full Access:**
- All content management
- User management
- System settings
- Delete any content

**Use Cases:**
- Site administrators
- Technical staff

### Editor

**Content Management:**
- Create, edit, delete all posts
- Manage all products
- Manage categories
- Upload media
- Manage reservations and contacts

**Restrictions:**
- Cannot manage users
- Cannot change settings

**Use Cases:**
- Content managers
- Marketing team

### Author

**Limited Access:**
- Create and edit own posts
- Upload media
- View own content

**Restrictions:**
- Cannot edit others' posts
- Cannot manage products
- Cannot access system settings

**Use Cases:**
- Blog writers
- Contributors

---

## Tips & Best Practices

### Content Creation

**Posts:**
- Write compelling titles (50-60 characters)
- Use clear, concise excerpts
- Add featured images for better engagement
- Fill in SEO fields for better search rankings
- Use categories to organize content
- Save drafts before publishing

**Products:**
- Use high-quality images
- Write detailed descriptions
- Set up price variants for options
- Add multiple gallery images
- Keep inventory status updated
- Use SEO fields effectively

### Media Management

**Organization:**
- Use descriptive filenames
- Add alt text for accessibility
- Use folders to organize files
- Delete unused media regularly
- Optimize images before upload

**Best Practices:**
- Keep file sizes reasonable
- Use appropriate formats (JPG for photos, PNG for graphics)
- Add captions for context
- Use consistent naming conventions

### SEO Optimization

**Meta Titles:**
- Keep under 60 characters
- Include primary keyword
- Make it compelling

**Meta Descriptions:**
- Keep under 160 characters
- Include call-to-action
- Summarize content

**Keywords:**
- Use relevant keywords
- Separate with commas
- Don't overuse (3-5 keywords)

### Security

**Passwords:**
- Use strong, unique passwords
- Change passwords regularly
- Never share credentials

**Account Safety:**
- Log out when finished
- Don't save passwords on shared computers
- Report suspicious activity

### Performance

**Images:**
- Compress before uploading
- Use appropriate dimensions
- Delete unused files

**Content:**
- Keep posts focused and concise
- Use headings for structure
- Break up long paragraphs

---

## Keyboard Shortcuts

- **Ctrl/Cmd + S**: Save (in forms)
- **Esc**: Close modals
- **Ctrl/Cmd + K**: Search (when available)

---

## Troubleshooting

### Can't Login

- Check email and password
- Ensure Caps Lock is off
- Contact administrator if locked out

### Upload Fails

- Check file size (max 10MB)
- Verify file format is supported
- Try different browser

### Changes Not Saving

- Check internet connection
- Ensure all required fields are filled
- Try refreshing the page

### Page Not Loading

- Refresh the page
- Clear browser cache
- Try different browser
- Contact support if persists

---

## Getting Help

### Support Channels

- **Email**: support@yourdomain.com
- **Phone**: +1-XXX-XXX-XXXX
- **Documentation**: docs.yourdomain.com

### Reporting Issues

When reporting issues, include:
- What you were trying to do
- What happened instead
- Screenshots if possible
- Browser and device information

---

## Glossary

- **Slug**: URL-friendly version of a name
- **Featured**: Highlighted content on homepage
- **Draft**: Unpublished content
- **SEO**: Search Engine Optimization
- **Meta Tags**: Information for search engines
- **CRUD**: Create, Read, Update, Delete
- **Media Library**: Central file storage
- **Role**: User permission level

---

**Version:** 1.0  
**Last Updated:** 2024

For the latest updates and detailed documentation, visit: docs.yourdomain.com
