# ✨ Luxury Dark & Gold Theme - Complete Guide

## 🎉 Tổng quan

Toàn bộ CMS Admin đã được redesign với **Luxury Dark & Gold Theme** - một design system sang trọng, hiện đại, đẳng cấp.

---

## ✅ Đã hoàn thành

### 1. Login Page
- ✅ Dark gradient background
- ✅ Animated gold orbs
- ✅ Two-column layout
- ✅ Glass morphism effects
- ✅ Feature cards
- ✅ Modern form với gold accents
- ✅ Social login buttons

### 2. Dashboard Layout
- ✅ Dark background với gold orbs
- ✅ Grid pattern overlay
- ✅ Glass morphism structure
- ✅ Responsive layout

### 3. Sidebar
- ✅ Glass-gold background
- ✅ Gold gradient logo
- ✅ Active states với animations
- ✅ User info card
- ✅ Hover effects

---

## 🎨 Design System

### Color Palette

#### Background
```css
/* Main background */
bg-gradient-to-br from-gray-900 via-slate-900 to-black

/* Orbs */
bg-amber-500/10, bg-yellow-500/10

/* Grid */
rgba(251,191,36,0.02)
```

#### Gold Accents
```css
/* Primary gold */
amber-400: #fbbf24
yellow-500: #eab308
amber-600: #d97706

/* Light gold */
amber-200: #fde68a
amber-100: #fef3c7
```

#### Text
```css
/* Primary */
text-amber-100, text-amber-200

/* Secondary */
text-gray-400, text-gray-500

/* Muted */
text-gray-600
```

#### Glass Effects
```css
/* Standard glass */
.glass {
  backdrop-blur-xl;
  bg-white/5;
  border: 1px solid rgba(255,255,255,0.1);
}

/* Gold glass */
.glass-gold {
  backdrop-blur-xl;
  background: linear-gradient(to-br, 
    rgba(245,158,11,0.1), 
    rgba(234,179,8,0.05), 
    rgba(217,119,6,0.1)
  );
  border: 1px solid rgba(251,191,36,0.2);
}
```

### Typography

#### Headings
```tsx
// H1 - Page title
className="text-3xl font-bold text-gradient-gold"

// H2 - Section title
className="text-2xl font-semibold text-amber-100"

// H3 - Card title
className="text-xl font-medium text-amber-100"
```

#### Body Text
```tsx
// Primary
className="text-base text-gray-300"

// Secondary
className="text-sm text-gray-400"

// Muted
className="text-xs text-gray-500"
```

#### Gold Gradient Text
```tsx
className="text-gradient-gold animate-shine bg-[length:200%_auto]"
```

### Components

#### Buttons

**Primary (Gold)**
```tsx
className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 text-gray-900 font-semibold hover:from-amber-500 hover:via-yellow-600 hover:to-amber-500 transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98]"
```

**Secondary (Glass)**
```tsx
className="px-6 py-3 rounded-xl bg-white/5 border border-amber-400/20 text-amber-100 hover:bg-white/10 hover:border-amber-400/40 transition-all duration-200"
```

**Danger**
```tsx
className="px-6 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all duration-200"
```

#### Cards
```tsx
className="glass-gold rounded-2xl p-6 border border-amber-400/20 shadow-xl shadow-amber-500/10"
```

#### Inputs
```tsx
className="w-full px-4 py-3 bg-white/5 border border-amber-400/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-200"
```

#### Tables

**Container**
```tsx
className="glass-gold rounded-2xl border border-amber-400/20 overflow-hidden"
```

**Header**
```tsx
className="border-b border-amber-400/20 bg-white/5"
// TH
className="px-6 py-4 text-left text-sm font-semibold text-amber-100"
```

**Body**
```tsx
// TR
className="border-b border-amber-400/10 hover:bg-white/5 transition-colors"
// TD
className="px-6 py-4 text-sm text-gray-300"
```

#### Badges

**Status Badges**
```tsx
// Success
className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-medium"

// Warning
className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-medium"

// Danger
className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium"

// Info
className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-medium"
```

---

## 📐 Layout Structure

### Page Layout
```tsx
<div className="space-y-6">
  {/* Page Header */}
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold text-gradient-gold">
        Page Title
      </h1>
      <p className="text-gray-400 mt-1">Description</p>
    </div>
    <button className="...">Action</button>
  </div>

  {/* Content */}
  <div className="glass-gold rounded-2xl p-6 border border-amber-400/20">
    {/* Content here */}
  </div>
</div>
```

### Grid Layout
```tsx
// 2 columns
className="grid grid-cols-1 lg:grid-cols-2 gap-6"

// 3 columns
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

// 4 columns
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
```

---

## 🎭 Animations

### Shine Animation (Text)
```css
@keyframes shine {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.animate-shine {
  animation: shine 3s ease-in-out infinite;
}
```

### Pulse (Orbs, Indicators)
```tsx
className="animate-pulse"
```

### Hover Scale
```tsx
className="hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
```

### Fade In
```tsx
className="animate-fade-in"
```

---

## 📱 Responsive Design

### Breakpoints
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

### Mobile First Approach
```tsx
// Mobile: Single column
// Desktop: Two columns
className="grid grid-cols-1 lg:grid-cols-2 gap-6"

// Hide on mobile
className="hidden lg:block"

// Show only on mobile
className="lg:hidden"
```

---

## 🎯 Usage Examples

### Dashboard Stats Card
```tsx
<div className="glass-gold rounded-2xl p-6 border border-amber-400/20 hover:border-amber-400/40 transition-all duration-200 group">
  <div className="flex items-center justify-between mb-4">
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center">
      <svg className="w-6 h-6 text-white">...</svg>
    </div>
    <span className="text-xs text-green-400">+12%</span>
  </div>
  <h3 className="text-2xl font-bold text-amber-100 mb-1">1,234</h3>
  <p className="text-sm text-gray-400">Total Posts</p>
</div>
```

### Form Field
```tsx
<div>
  <label className="block text-sm font-medium text-amber-100 mb-2">
    Label <span className="text-amber-400">*</span>
  </label>
  <input
    type="text"
    className="w-full px-4 py-3 bg-white/5 border border-amber-400/20 rounded-xl text-white placeholder-gray-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
    placeholder="Enter value..."
  />
  <p className="mt-1 text-xs text-gray-500">Helper text</p>
</div>
```

### Action Buttons Group
```tsx
<div className="flex items-center gap-3">
  <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 text-gray-900 font-semibold hover:from-amber-500 hover:via-yellow-600 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20">
    Save
  </button>
  <button className="px-6 py-3 rounded-xl bg-white/5 border border-amber-400/20 text-amber-100 hover:bg-white/10 transition-all">
    Cancel
  </button>
  <button className="px-6 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all">
    Delete
  </button>
</div>
```

---

## 🔧 Customization

### Change Gold Color
Update `tailwind.config.cjs`:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          // Your custom gold shades
          400: '#your-color',
          500: '#your-color',
          600: '#your-color',
        }
      }
    }
  }
}
```

### Adjust Background Darkness
In layouts:
```astro
<!-- Lighter -->
<div class="bg-gradient-to-br from-gray-800 via-slate-800 to-gray-900">

<!-- Darker -->
<div class="bg-gradient-to-br from-black via-gray-950 to-black">
```

### Change Orb Colors
```astro
<!-- Blue orbs -->
<div class="absolute ... bg-blue-500/10 ..."></div>

<!-- Purple orbs -->
<div class="absolute ... bg-purple-500/10 ..."></div>
```

---

## 📚 Files Structure

```
frontend/
├── src/
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   ├── AuthLayout.astro ✅
│   │   └── DashboardLayout.astro ✅
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx ⏳
│   │   │   └── Sidebar.tsx ✅
│   │   ├── islands/
│   │   │   └── LoginForm.tsx ✅
│   │   └── ui/
│   │       ├── Modal.tsx ⏳
│   │       ├── Dropdown.tsx ⏳
│   │       ├── Alert.astro ⏳
│   │       └── ... (other components)
│   ├── styles/
│   │   └── global.css ✅
│   └── pages/
│       ├── login.astro ✅
│       └── ... (other pages) ⏳
├── LUXURY_LOGIN_DESIGN.md ✅
├── LUXURY_DESIGN_SUMMARY.md ✅
├── LUXURY_DASHBOARD_GUIDE.md ✅
└── LUXURY_THEME_COMPLETE.md ✅ (this file)
```

---

## 🚀 Next Steps

### Priority 1: Core Components
1. ⏳ Update Header.tsx
2. ⏳ Update Modal.tsx
3. ⏳ Update Dropdown.tsx
4. ⏳ Update Alert.astro

### Priority 2: Pages
1. ⏳ Dashboard page (stats cards)
2. ⏳ Posts list page
3. ⏳ Post form page
4. ⏳ Products list page
5. ⏳ Product form page

### Priority 3: Advanced Components
1. ⏳ CategoryTree (with gold theme)
2. ⏳ MediaLibrary (grid with gold accents)
3. ⏳ Tables (all table components)
4. ⏳ Forms (all form components)

---

## 💡 Best Practices

### 1. Consistency
- Always use `glass-gold` for cards
- Always use gold gradient for primary buttons
- Always use `rounded-xl` or `rounded-2xl`

### 2. Spacing
- Use `gap-6` between sections
- Use `gap-4` between elements
- Use `p-6` for card padding

### 3. Transitions
- Always add `transition-all duration-200`
- Use `hover:scale-[1.02]` for subtle effects
- Use `active:scale-[0.98]` for click feedback

### 4. Accessibility
- Maintain color contrast (gold on dark = good)
- Add focus states with `focus:ring-2`
- Use semantic HTML
- Add aria labels

---

## 📊 Progress

### Overall: 30%

- ✅ Login Page: 100%
- ✅ Layouts: 80% (Header pending)
- ⏳ UI Components: 20%
- ⏳ Pages: 10%
- ✅ Documentation: 100%

---

## 🎊 Result

Một CMS Admin **sang trọng, hiện đại, đẳng cấp** với:

- 🌑 Nền tối tinh tế
- ✨ Vàng ánh kim nổi bật
- 💎 Glass morphism effects
- 🎭 Smooth animations
- 📱 Fully responsive
- ♿ Accessible
- ⚡ High performance

**Perfect for**: Premium CMS, luxury brands, high-end applications, executive dashboards

---

**Theme**: Dark & Gold Luxury
**Status**: 🚧 In Progress
**Quality**: Premium
**Version**: 1.0.0

🎉 **Enjoy your luxury CMS!** 🎉
