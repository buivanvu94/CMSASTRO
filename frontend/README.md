# CMS Frontend - Admin Panel

Admin panel frontend được xây dựng với Astro, React, và Tailwind CSS.

## Tech Stack

- **Astro** - Framework chính
- **React** - Interactive components (Islands)
- **Tailwind CSS** - Styling
- **Nanostores** - State management
- **Axios** - HTTP client
- **TypeScript** - Type safety

## Project Structure

```
src/
├── components/
│   ├── ui/          # Reusable UI components (Astro)
│   ├── islands/     # Interactive React components
│   └── layout/      # Layout components
├── layouts/         # Page layouts
├── pages/           # Astro pages (routes)
├── lib/             # Utilities and API clients
├── stores/          # Nanostores state management
└── styles/          # Global styles

## Getting Started

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file:

```env
PUBLIC_API_URL=http://localhost:5000/api
```

### Development

```bash
npm run dev
```

Server sẽ chạy tại `http://localhost:4321`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Features

- 🔐 Authentication with JWT
- 👥 User management
- 📝 Post management with rich text editor
- 🛍️ Product management with variants
- 📁 Media library with upload
- 📂 Category management with tree structure
- 📅 Reservation calendar
- 📧 Contact form management
- 🍔 Menu builder
- ⚙️ Settings management
- 🎨 Role-based access control

## Development Guidelines

### Component Organization

- **UI Components** (`components/ui/`): Reusable Astro components (Button, Input, Card, etc.)
- **Islands** (`components/islands/`): Interactive React components with client-side JavaScript
- **Layouts** (`layouts/`): Page layout templates

### State Management

Use Nanostores for global state:

```typescript
import { atom } from 'nanostores';

export const $user = atom(null);
```

### API Calls

Use the API client from `lib/api/`:

```typescript
import { authApi } from '@/lib/api/auth';

const user = await authApi.login(email, password);
```

## License

MIT
