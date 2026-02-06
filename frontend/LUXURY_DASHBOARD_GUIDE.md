# 🌟 Luxury Dashboard Design Guide

## Overview
Toàn bộ CMS Admin đã được redesign với **Dark & Gold Luxury Theme** - sang trọng, hiện đại, đẳng cấp.

---

## ✅ Đã hoàn thành

### 1. DashboardLayout.astro
- ✅ Dark gradient background (gray-900 → slate-900 → black)
- ✅ Animated gold orbs
- ✅ Grid pattern overlay
- ✅ Glass morphism structure

### 2. Sidebar.tsx
- ✅ Glass-gold background
- ✅ Gold gradient logo
- ✅ Active state với gold gradient
- ✅ Hover animations
- ✅ User info card ở footer

### 3. Header.tsx (Cần update)
Sẽ có:
- Glass-gold background
- Gold accents
- Modern notifications
- User dropdown với gold theme

---

## 🎨 Design System

### Colors
```css
/* Background */
bg-gradient-to-br from-gray-900 via-slate-900 to-black

/* Gold Accents */
amber-400, yellow-500, amber-600

/* Text */
amber-100, amber-200 (primary)
gray-400, gray-500 (secondary)

/* Glass Effects */
glass-gold: backdrop-blur-xl bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-amber-600/10
```

### Components Style

#### Cards
```tsx
className="glass-gold rounded-2xl p-6 border border-amber-400/20"
```

#### Buttons (Primary)
```tsx
className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 text-gray-900 hover:from-amber-500 hover:via-yellow-600 hover:to-amber-500"
```

#### Buttons (Secondary)
```tsx
className="bg-white/5 border border-amber-400/20 text-amber-100 hover:bg-white/10"
```

#### Inputs
```tsx
className="bg-white/5 border border-amber-400/20 text-white focus:border-amber-400 focus:ring-amber-400/20"
```

#### Tables
```tsx
// Header
className="glass-gold border-b border-amber-400/20"

// Rows
className="border-b border-amber-400/10 hover:bg-white/5"
```

#### Badges
```tsx
// Success
className="bg-green-500/20 text-green-400 border border-green-500/30"

// Warning  
className="bg-amber-500/20 text-amber-400 border border-amber-500/30"

// Danger
className="bg-red-500/20 text-red-400 border border-red-500/30"
```

---

## 📋 Header.tsx Update Template

```tsx
import { useStore } from '@nanostores/react';
import { $user } from '@/stores/auth';
import { $isSidebarOpen, toggleSidebar } from '@/stores/ui';
import Dropdown from '@/components/ui/Dropdown';

export default function Header() {
  const user = useStore($user);
  const isSidebarOpen = useStore($isSidebarOpen);

  const handleLogout = async () => {
    const { authApi, clearTokens } = await import('@/lib/api');
    try {
      await authApi.logout();
    } finally {
      clearTokens();
      window.location.href = '/login';
    }
  };

  const userMenuItems = [
    {
      label: 'Hồ sơ',
      onClick: () => (window.location.href = '/users/profile'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      label: 'Cài đặt',
      onClick: () => (window.location.href = '/settings'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    { label: '', onClick: () => {}, divider: true },
    {
      label: 'Đăng xuất',
      onClick: handleLogout,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
    },
  ];

  return (
    <header className="glass-gold border-b border-amber-400/20 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Menu button + Search */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl text-gray-400 hover:text-amber-400 hover:bg-white/5 lg:hidden transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* Search bar */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-amber-400/20 min-w-[300px]">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="bg-transparent border-none outline-none text-sm text-gray-300 placeholder-gray-500 flex-1"
              />
            </div>
          </div>

          {/* Right: Actions + User */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative p-2 rounded-xl text-gray-400 hover:text-amber-400 hover:bg-white/5 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
            </button>

            {/* User dropdown */}
            <Dropdown
              trigger={
                <div className="flex items-center gap-3 cursor-pointer hover:bg-white/5 rounded-xl px-3 py-2 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-white font-semibold">
                    {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-amber-100">{user?.full_name || 'User'}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role || 'author'}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              }
              items={userMenuItems}
              align="right"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
```

---

## 📦 UI Components Updates

### Modal.tsx
```tsx
// Background overlay
className="fixed inset-0 bg-black/60 backdrop-blur-sm"

// Modal container
className="glass-gold rounded-2xl border border-amber-400/20 shadow-2xl shadow-amber-500/10"

// Header
className="border-b border-amber-400/20 px-6 py-4"

// Title
className="text-xl font-semibold text-amber-100"

// Close button
className="text-gray-400 hover:text-amber-400 hover:bg-white/5 rounded-xl p-2"
```

### Dropdown.tsx
```tsx
// Container
className="glass-gold rounded-xl border border-amber-400/20 shadow-xl shadow-amber-500/10"

// Item
className="px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-amber-400"

// Divider
className="border-t border-amber-400/10"
```

### Alert.astro
```tsx
// Success
className="glass-gold border-l-4 border-green-500 bg-green-500/10"

// Warning
className="glass-gold border-l-4 border-amber-500 bg-amber-500/10"

// Error
className="glass-gold border-l-4 border-red-500 bg-red-500/10"

// Info
className="glass-gold border-l-4 border-blue-500 bg-blue-500/10"
```

### Pagination.tsx
```tsx
// Container
className="flex items-center gap-2"

// Button
className="px-3 py-2 rounded-xl bg-white/5 border border-amber-400/20 text-gray-300 hover:bg-white/10 hover:text-amber-400"

// Active
className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/30 text-amber-400"
```

---

## 🎯 Page Templates

### List Page (e.g., Posts, Products)
```tsx
<div className="space-y-6">
  {/* Header */}
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold text-gradient-gold">Bài viết</h1>
      <p className="text-gray-400 mt-1">Quản lý tất cả bài viết</p>
    </div>
    <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 text-gray-900 font-semibold hover:from-amber-500 hover:via-yellow-600 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20">
      Tạo mới
    </button>
  </div>

  {/* Filters */}
  <div className="glass-gold rounded-2xl p-6 border border-amber-400/20">
    {/* Filter controls */}
  </div>

  {/* Table */}
  <div className="glass-gold rounded-2xl border border-amber-400/20 overflow-hidden">
    <table className="w-full">
      <thead className="border-b border-amber-400/20">
        <tr>
          <th className="px-6 py-4 text-left text-sm font-semibold text-amber-100">
            Tiêu đề
          </th>
          {/* More columns */}
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-amber-400/10 hover:bg-white/5 transition-colors">
          <td className="px-6 py-4 text-sm text-gray-300">
            {/* Content */}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

### Form Page (e.g., Create/Edit)
```tsx
<div className="max-w-4xl mx-auto space-y-6">
  {/* Header */}
  <div>
    <h1 className="text-3xl font-bold text-gradient-gold">Tạo bài viết mới</h1>
    <p className="text-gray-400 mt-1">Điền thông tin bài viết</p>
  </div>

  {/* Form */}
  <form className="space-y-6">
    <div className="glass-gold rounded-2xl p-6 border border-amber-400/20 space-y-6">
      {/* Form fields */}
      <div>
        <label className="block text-sm font-medium text-amber-100 mb-2">
          Tiêu đề <span className="text-amber-400">*</span>
        </label>
        <input
          type="text"
          className="w-full px-4 py-3 bg-white/5 border border-amber-400/20 rounded-xl text-white placeholder-gray-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
          placeholder="Nhập tiêu đề..."
        />
      </div>
    </div>

    {/* Actions */}
    <div className="flex items-center gap-4">
      <button
        type="submit"
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 text-gray-900 font-semibold hover:from-amber-500 hover:via-yellow-600 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20"
      >
        Lưu
      </button>
      <button
        type="button"
        className="px-6 py-3 rounded-xl bg-white/5 border border-amber-400/20 text-amber-100 hover:bg-white/10 transition-all"
      >
        Hủy
      </button>
    </div>
  </form>
</div>
```

---

## 🚀 Implementation Checklist

### Layouts
- ✅ DashboardLayout.astro
- ✅ Sidebar.tsx
- ⏳ Header.tsx (template provided)

### UI Components
- ⏳ Modal.tsx
- ⏳ Dropdown.tsx
- ⏳ Alert.astro
- ⏳ Pagination.tsx
- ⏳ Tabs.tsx
- ⏳ Loading.tsx

### Pages
- ⏳ Dashboard (stats cards)
- ⏳ Posts (list + form)
- ⏳ Products (list + form)
- ⏳ Categories (tree view)
- ⏳ Media (grid view)
- ⏳ Reservations (calendar)
- ⏳ Contacts (list)
- ⏳ Users (list + form)
- ⏳ Settings (tabs)

---

## 💡 Quick Tips

### 1. Consistent Spacing
```css
gap-6 (24px) - Between sections
gap-4 (16px) - Between elements
gap-2 (8px) - Between small items
```

### 2. Border Radius
```css
rounded-3xl - Large cards
rounded-2xl - Medium cards
rounded-xl - Buttons, inputs
rounded-lg - Small elements
```

### 3. Shadows
```css
shadow-2xl shadow-amber-500/10 - Large cards
shadow-xl shadow-amber-500/20 - Elevated elements
shadow-lg shadow-amber-500/20 - Buttons
```

### 4. Transitions
```css
transition-all duration-200 - Standard
transition-colors - Color only
hover:scale-[1.02] - Subtle scale
```

---

**Status**: 🚧 In Progress
**Theme**: Dark & Gold Luxury
**Completion**: 30% (Layouts done, components pending)
