# CSS Loading Fix Guide

## Vấn đề
CSS không được load trên trang web, các Tailwind classes không hoạt động.

## Nguyên nhân
1. `applyBaseStyles: false` trong `astro.config.mjs` ngăn Tailwind load base styles
2. File `global.css` chưa được import vào layout
3. Path alias `@/` chưa được cấu hình trong Vite

## Giải pháp đã áp dụng

### 1. Sửa astro.config.mjs
**Trước:**
```javascript
export default defineConfig({
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false, // ❌ Sai
    }),
  ],
  output: 'static',
});
```

**Sau:**
```javascript
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  integrations: [
    react(),
    tailwind(), // ✅ Đúng - load base styles
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

### 2. Import global.css vào BaseLayout.astro
**Trước:**
```astro
---
export interface Props {
  title?: string;
  description?: string;
}
---
```

**Sau:**
```astro
---
import '../styles/global.css'; // ✅ Import CSS

export interface Props {
  title?: string;
  description?: string;
}
---
```

### 3. Kiểm tra global.css
File `src/styles/global.css` phải có:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900 antialiased;
  }
}
```

## Cách kiểm tra

### 1. Truy cập trang test
```
http://localhost:4322/test-css
```

Bạn sẽ thấy:
- Heading màu xanh lớn
- Card trắng với shadow
- 3 ô màu đỏ, xanh lá, xanh dương
- Button xanh

### 2. Truy cập trang login
```
http://localhost:4322/login
```

Bạn sẽ thấy:
- Form đăng nhập được style đẹp
- Input fields có border và focus effect
- Button xanh với hover effect

### 3. Kiểm tra trong DevTools
Mở DevTools (F12) và kiểm tra:
- Tab Network: Xem có file CSS được load không
- Tab Elements: Kiểm tra các element có classes Tailwind
- Tab Console: Không có lỗi CSS

## Nếu vẫn không hoạt động

### 1. Clear cache và rebuild
```bash
cd frontend
rm -rf node_modules/.vite
rm -rf .astro
npm run dev
```

### 2. Kiểm tra port
Server có thể chạy trên port khác nếu 4321 đang được dùng:
```
Port 4321 is in use, trying another one...
Local    http://localhost:4322/
```

### 3. Hard refresh browser
- Windows: Ctrl + Shift + R
- Mac: Cmd + Shift + R

### 4. Kiểm tra file structure
```
frontend/
├── src/
│   ├── styles/
│   │   └── global.css          ✅ Phải có
│   ├── layouts/
│   │   └── BaseLayout.astro    ✅ Import global.css
│   └── pages/
│       └── login.astro
├── astro.config.mjs            ✅ Cấu hình đúng
└── tailwind.config.mjs         ✅ Content paths đúng
```

## Lưu ý quan trọng

1. **Luôn import global.css trong BaseLayout** - Đây là layout gốc cho tất cả pages
2. **Không set applyBaseStyles: false** - Điều này sẽ ngăn Tailwind hoạt động
3. **Restart dev server sau khi thay đổi config** - Config changes cần restart
4. **Sử dụng path alias @/** - Đã được cấu hình trong tsconfig.json và astro.config.mjs

## Kết quả mong đợi

✅ Tất cả Tailwind classes hoạt động
✅ Colors, spacing, typography đều đúng
✅ Responsive design hoạt động
✅ Custom components (btn, input, card) hoạt động
✅ Hover, focus states hoạt động

## Liên hệ
Nếu vẫn gặp vấn đề, kiểm tra:
- Browser console có lỗi không
- Network tab có load CSS không
- File global.css có đúng nội dung không
