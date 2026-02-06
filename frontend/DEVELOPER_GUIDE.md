# CMS Admin Panel - Developer Guide

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

Access the admin panel at `http://localhost:4321`

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── islands/          # React interactive components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── MediaLibrary.tsx
│   │   │   ├── MediaPicker.tsx
│   │   │   ├── CategoryTree.tsx
│   │   │   ├── CategoryForm.tsx
│   │   │   ├── PostForm.tsx
│   │   │   ├── PostTable.tsx
│   │   │   ├── PriceEditor.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   ├── ProductTable.tsx
│   │   │   ├── ReservationTable.tsx
│   │   │   ├── ContactTable.tsx
│   │   │   ├── UserForm.tsx
│   │   │   ├── UserTable.tsx
│   │   │   └── SettingsForm.tsx
│   │   ├── layout/           # Layout components
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   └── ui/               # Reusable UI components
│   │       ├── Button.astro
│   │       ├── Input.astro
│   │       ├── Modal.tsx
│   │       ├── Pagination.tsx
│   │       └── ... (8 more)
│   ├── layouts/              # Page layouts
│   │   ├── BaseLayout.astro
│   │   ├── AuthLayout.astro
│   │   └── DashboardLayout.astro
│   ├── lib/
│   │   └── api/              # API client modules
│   │       ├── client.ts     # Axios instance
│   │       ├── auth.ts
│   │       ├── users.ts
│   │       ├── categories.ts
│   │       ├── posts.ts
│   │       ├── products.ts
│   │       ├── reservations.ts
│   │       ├── contacts.ts
│   │       ├── media.ts
│   │       ├── settings.ts
│   │       └── index.ts
│   ├── stores/               # Nanostores state
│   │   ├── auth.ts
│   │   ├── ui.ts
│   │   ├── media.ts
│   │   └── index.ts
│   ├── pages/                # Routes
│   │   ├── index.astro       # Redirect to dashboard
│   │   ├── login.astro
│   │   ├── dashboard.astro
│   │   ├── categories/
│   │   ├── posts/
│   │   ├── products/
│   │   ├── reservations/
│   │   ├── contacts/
│   │   ├── media/
│   │   ├── users/
│   │   └── settings/
│   └── middleware.ts         # Auth middleware
└── .env                      # Environment variables
```

## Environment Variables

```env
PUBLIC_API_URL=http://localhost:3000/api
```

## Authentication Flow

1. User visits protected route
2. Middleware checks for token in localStorage
3. If no token → redirect to `/login`
4. Login form submits credentials
5. Backend returns access + refresh tokens
6. Tokens stored in localStorage
7. Axios interceptor adds token to requests
8. Auto-refresh on 401 errors

## API Client Usage

```typescript
import { postsApi } from '@/lib/api';

// Get all posts
const response = await postsApi.getAll({ page: 1, limit: 20 });

// Get single post
const post = await postsApi.getById(1);

// Create post
await postsApi.create({ title: 'New Post', content: '...' });

// Update post
await postsApi.update(1, { title: 'Updated' });

// Delete post
await postsApi.delete(1);
```

## State Management

```typescript
import { useStore } from '@nanostores/react';
import { $user, $isAuthenticated } from '@/stores/auth';

function MyComponent() {
  const user = useStore($user);
  const isAuthenticated = useStore($isAuthenticated);
  
  return <div>Welcome {user?.full_name}</div>;
}
```

## Creating New Pages

### 1. Create Page File

```astro
---
// src/pages/my-feature/index.astro
import DashboardLayout from '@/layouts/DashboardLayout.astro';
import MyTable from '@/components/islands/MyTable';
---

<DashboardLayout title="My Feature - CMS Admin">
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">My Feature</h1>
      <p class="mt-1 text-sm text-gray-500">Description</p>
    </div>

    <MyTable client:load />
  </div>
</DashboardLayout>
```

### 2. Create Island Component

```typescript
// src/components/islands/MyTable.tsx
import { useState, useEffect } from 'react';
import { myApi } from '@/lib/api';
import Pagination from '@/components/ui/Pagination';

export default function MyTable() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadItems();
  }, []);
  
  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await myApi.getAll();
      setItems(response.data.items);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Your table content */}
    </div>
  );
}
```

### 3. Add to Sidebar Menu

```typescript
// src/components/layout/Sidebar.tsx
const menuItems = [
  // ... existing items
  {
    name: 'My Feature',
    href: '/my-feature',
    icon: '📋',
    roles: ['admin', 'editor']
  }
];
```

## Common Patterns

### Loading State

```typescript
{loading ? (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
) : (
  // Content
)}
```

### Error Handling

```typescript
try {
  await api.create(data);
  alert('Success!');
} catch (error: any) {
  console.error('Failed:', error);
  alert(error.response?.data?.message || 'Failed to save');
}
```

### Pagination

```typescript
<Pagination
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
/>
```

### Status Badges

```typescript
const getStatusBadge = (status: string) => {
  const colors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

<span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(status)}`}>
  {status}
</span>
```

### Media Picker Integration

```typescript
import MediaPicker from './MediaPicker';

const [showMediaPicker, setShowMediaPicker] = useState(false);
const [selectedImage, setSelectedImage] = useState(null);

const handleImageSelect = (media) => {
  setSelectedImage(media);
  setFormData(prev => ({ ...prev, image_id: media?.id }));
  setShowMediaPicker(false);
};

// In JSX
<MediaPicker
  isOpen={showMediaPicker}
  onClose={() => setShowMediaPicker(false)}
  onSelect={handleImageSelect}
  accept="image"
  multiple={false}
/>
```

## Styling Guidelines

### Tailwind Classes

- **Containers**: `space-y-6`, `space-y-4`
- **Cards**: `bg-white border border-gray-200 rounded-lg p-6`
- **Buttons**: `px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700`
- **Inputs**: `w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500`
- **Tables**: `w-full`, `divide-y divide-gray-200`

### Color Palette

- **Primary**: Blue (blue-600, blue-700)
- **Success**: Green (green-600, green-100)
- **Warning**: Yellow (yellow-600, yellow-100)
- **Danger**: Red (red-600, red-100)
- **Neutral**: Gray (gray-50 to gray-900)

## Role-Based Access

```typescript
// In Sidebar.tsx
const filteredMenuItems = menuItems.filter(item => 
  !item.roles || item.roles.includes(user?.role)
);

// Role hierarchy
// admin: Full access
// editor: All content management
// author: Own posts only
```

## API Response Format

```typescript
// List response
{
  items: [...],
  pagination: {
    page: 1,
    limit: 20,
    totalPages: 5,
    totalItems: 100
  }
}

// Single item response
{
  id: 1,
  name: "...",
  // ... other fields
}

// Error response
{
  message: "Error description",
  errors: [...]
}
```

## Testing

```bash
# Run type check
npm run astro check

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

1. Set environment variables
2. Build: `npm run build`
3. Deploy `dist/` folder to hosting
4. Configure backend API URL

## Troubleshooting

### Token Issues
- Check localStorage for `access_token` and `refresh_token`
- Clear tokens and re-login
- Check API URL in `.env`

### CORS Errors
- Ensure backend CORS is configured
- Check API URL matches backend

### Build Errors
- Run `npm run astro check`
- Check TypeScript errors
- Verify all imports

## Next Steps

1. **Testing**: Set up Vitest and React Testing Library
2. **Rich Text Editor**: Integrate Tiptap or TinyMCE
3. **Calendar View**: Implement ReservationCalendar
4. **Menu Builder**: Implement drag-drop MenuBuilder
5. **Optimization**: Code splitting, lazy loading
6. **Analytics**: Add tracking
7. **Error Boundaries**: Add React error boundaries

## Resources

- [Astro Documentation](https://docs.astro.build/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Nanostores](https://github.com/nanostores/nanostores)
- [Axios](https://axios-http.com/)
