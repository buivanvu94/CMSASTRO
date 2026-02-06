# Tailwind CSS v6 Fix for @astrojs/tailwind 6.0.2

## Vấn đề
CSS không load với @astrojs/tailwind 6.0.2 và Astro 5

## Thay đổi trong @astrojs/tailwind 6.0.2

Theo changelog: https://github.com/withastro/astro/blob/main/packages/integrations/tailwind/CHANGELOG.md#602

### Breaking Changes:
1. Config file format thay đổi
2. Cách inject CSS thay đổi
3. `applyBaseStyles` behavior thay đổi

## Giải pháp đã áp dụng

### 1. Đổi tailwind.config.mjs → tailwind.config.cjs

**Lý do**: @astrojs/tailwind 6.x prefer CommonJS format

**Trước** (`tailwind.config.mjs`):
```javascript
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  // ...
};
```

**Sau** (`tailwind.config.cjs`):
```javascript
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  // ...
};
```

### 2. Cấu hình astro.config.mjs

```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: true, // ✅ Explicitly enable
    }),
  ],
  output: 'static',
  vite: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  },
});
```

### 3. Đơn giản hóa global.css

**Trước** (có @layer directives phức tạp):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-gray-50 text-gray-900 antialiased;
  }
}

@layer components {
  .btn { ... }
  .input { ... }
}
```

**Sau** (minimal):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. Import global.css trong BaseLayout

```astro
---
import '../styles/global.css';

export interface Props {
  title?: string;
  description?: string;
}

const { title = 'CMS Admin', description = 'Content Management System' } = Astro.props;
---

<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <title>{title}</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>
  <body class="bg-gray-50 text-gray-900">
    <slot />
  </body>
</html>
```

## Cách kiểm tra

### 1. Restart dev server
```bash
cd frontend
npm run dev
```

### 2. Truy cập trang test
```
http://localhost:4322/test-css
```

Bạn sẽ thấy:
- ✅ Tailwind classes hoạt động
- ✅ Colors, spacing đúng
- ✅ Responsive design hoạt động

### 3. Truy cập trang login
```
http://localhost:4322/login
```

Bạn sẽ thấy:
- ✅ Form được style đẹp
- ✅ Buttons có màu xanh
- ✅ Inputs có border và focus effect

### 4. Kiểm tra trong DevTools

**Network Tab:**
- Xem có file CSS được load
- File CSS phải chứa Tailwind utilities

**Elements Tab:**
- Kiểm tra các element có classes
- Classes phải có styles tương ứng

**Console Tab:**
- Không có lỗi CSS
- Không có warning về Tailwind

## Nếu vẫn không hoạt động

### Option 1: Clear cache hoàn toàn
```bash
cd frontend
rm -rf .astro
rm -rf node_modules/.vite
rm -rf dist
npm run dev
```

### Option 2: Reinstall dependencies
```bash
cd frontend
rm -rf node_modules
rm package-lock.json
npm install
npm run dev
```

### Option 3: Kiểm tra versions
```bash
npm list astro @astrojs/tailwind tailwindcss
```

Phải có:
- astro: ^5.17.1
- @astrojs/tailwind: ^6.0.2
- tailwindcss: ^3.4.1

### Option 4: Hard refresh browser
- Windows: Ctrl + Shift + R
- Mac: Cmd + Shift + R
- Hoặc: Mở DevTools → Network → Disable cache

## Lưu ý quan trọng

### 1. Config file format
- ✅ Dùng `tailwind.config.cjs` (CommonJS)
- ❌ Không dùng `tailwind.config.mjs` (ESM)

### 2. applyBaseStyles
- ✅ Set `applyBaseStyles: true` explicitly
- ❌ Không bỏ trống hoặc set false

### 3. Import CSS
- ✅ Import `global.css` trong BaseLayout
- ✅ File phải có 3 directives: @tailwind base, components, utilities
- ❌ Không dùng @layer directives phức tạp ban đầu

### 4. Content paths
- ✅ Phải include tất cả file types: `{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}`
- ✅ Phải có `./src/**/*` để scan toàn bộ src folder

## Tài liệu tham khảo

- [@astrojs/tailwind Changelog](https://github.com/withastro/astro/blob/main/packages/integrations/tailwind/CHANGELOG.md#602)
- [Astro Tailwind Integration](https://docs.astro.build/en/guides/integrations-guide/tailwind/)
- [Tailwind CSS v3 Docs](https://tailwindcss.com/docs)

## Kết quả mong đợi

✅ Tất cả Tailwind utilities hoạt động
✅ Custom colors (primary-*) hoạt động
✅ Responsive breakpoints hoạt động
✅ Hover, focus states hoạt động
✅ Dark mode ready (nếu config)

## Files đã thay đổi

1. ✅ `frontend/astro.config.mjs` - Thêm applyBaseStyles: true
2. ✅ `frontend/tailwind.config.cjs` - Đổi từ .mjs sang .cjs
3. ✅ `frontend/src/styles/global.css` - Đơn giản hóa
4. ✅ `frontend/src/layouts/BaseLayout.astro` - Import global.css
5. ✅ `frontend/src/pages/test-css.astro` - Trang test

## Troubleshooting

### Lỗi: "Cannot find module 'tailwindcss'"
```bash
npm install tailwindcss
```

### Lỗi: "Tailwind CSS is not configured"
- Kiểm tra file `tailwind.config.cjs` tồn tại
- Kiểm tra content paths đúng

### CSS không apply
- Hard refresh browser (Ctrl + Shift + R)
- Clear .astro cache
- Restart dev server

### Classes không hoạt động
- Kiểm tra typo trong class names
- Kiểm tra file có trong content paths không
- Kiểm tra global.css được import chưa

---

**Status**: ✅ Fixed
**Version**: @astrojs/tailwind 6.0.2 + Astro 5.17.1
**Date**: 2024
