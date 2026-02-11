# Hướng Dẫn Sử Dụng Quill Editor

## Tổng Quan

Quill Editor đã được tích hợp vào giao diện admin cho việc tạo và chỉnh sửa **Posts** và **Products** với đầy đủ các tính năng rich text editing.

## Tính Năng Đã Tích Hợp

### 1. Định Dạng Văn Bản
- **Headers**: H1, H2, H3, H4, H5, H6
- **Font**: Sans-serif, Serif, Monospace, Arial, Times New Roman, Courier
- **Size**: Small, Normal, Large, Huge
- **Text Style**: Bold, Italic, Underline, Strikethrough
- **Color**: Màu chữ và màu nền
- **Script**: Subscript (chỉ số dưới), Superscript (chỉ số trên)

### 2. Định Dạng Đoạn Văn
- **Alignment**: Căn trái, giữa, phải, đều
- **Lists**: Danh sách có thứ tự và không thứ tự
- **Indent**: Tăng/giảm lề
- **Blockquote**: Trích dẫn
- **Code Block**: Khối mã nguồn

### 3. Media
- **Link**: Chèn và chỉnh sửa liên kết
- **Image**: Upload ảnh trực tiếp từ máy tính
- **Video**: Nhúng video (YouTube, Vimeo, etc.)

### 4. Tính Năng Đặc Biệt
- **Upload Ảnh Tự Động**: Khi chèn ảnh, file sẽ được upload lên server tự động
- **Clean Format**: Xóa định dạng
- **Paste từ Word/Google Docs**: Tự động làm sạch định dạng không cần thiết

## Cách Sử Dụng

### Tạo Post Mới
1. Truy cập: `/admin/posts/new`
2. Điền tiêu đề và các thông tin cơ bản
3. Sử dụng Quill Editor để viết nội dung:
   - Sử dụng toolbar để định dạng văn bản
   - Click icon ảnh để upload ảnh
   - Click icon link để chèn liên kết
   - Click icon video để nhúng video

### Chỉnh Sửa Post
1. Truy cập: `/admin/posts/[id]`
2. Nội dung hiện tại sẽ được load vào editor
3. Chỉnh sửa và lưu

### Tạo/Chỉnh Sửa Product
1. Truy cập: `/admin/products/new` hoặc `/admin/products/[id]`
2. Sử dụng Quill Editor trong phần "Description"
3. Tương tự như Posts

## Upload Ảnh

Khi click vào icon ảnh trong toolbar:
1. Chọn file ảnh từ máy tính
2. Ảnh sẽ được upload tự động lên server
3. URL ảnh sẽ được chèn vào nội dung
4. Hiển thị "Đang tải ảnh..." trong quá trình upload

## Phím Tắt

- **Ctrl/Cmd + B**: Bold
- **Ctrl/Cmd + I**: Italic
- **Ctrl/Cmd + U**: Underline
- **Ctrl/Cmd + K**: Chèn link
- **Ctrl/Cmd + Z**: Undo
- **Ctrl/Cmd + Y**: Redo

## Giao Diện

Editor được thiết kế với theme tối phù hợp với giao diện admin:
- Background: Đen với độ trong suốt
- Border: Vàng amber
- Text: Màu vàng nhạt
- Hover effects: Vàng amber sáng

## Component QuillEditor

### Props

```typescript
interface QuillEditorProps {
  value: string;              // Nội dung HTML
  onChange: (value: string) => void;  // Callback khi nội dung thay đổi
  placeholder?: string;       // Placeholder text (mặc định: "Viết nội dung tại đây...")
  height?: string;           // Chiều cao editor (mặc định: "400px")
  onImageUpload?: (file: File) => Promise<string>;  // Custom image upload handler
}
```

### Sử Dụng Trong Component Khác

```tsx
import QuillEditor from '@/components/islands/QuillEditor';

<QuillEditor
  value={content}
  onChange={(value) => setContent(value)}
  placeholder="Viết nội dung..."
  height="500px"
  onImageUpload={async (file) => {
    // Upload file và trả về URL
    const uploaded = await mediaApi.upload(file, 'posts');
    return uploaded.url;
  }}
/>
```

## Styling

CSS được định nghĩa trong: `src/styles/quill-custom.css`

Các class chính:
- `.ql-toolbar.ql-snow`: Toolbar
- `.ql-container.ql-snow`: Container
- `.ql-editor`: Editor content area

## Troubleshooting

### Editor không hiển thị
- Kiểm tra console để xem lỗi
- Đảm bảo component được render với `client:load`
- Kiểm tra CSS đã được import trong BaseLayout

### Ảnh không upload được
- Kiểm tra `onImageUpload` handler
- Kiểm tra API endpoint upload
- Xem console log để debug

### Nội dung không lưu
- Kiểm tra `onChange` callback
- Đảm bảo form submit đúng cách
- Kiểm tra API endpoint save

## Files Liên Quan

- Component: `src/components/islands/QuillEditor.tsx`
- CSS: `src/styles/quill-custom.css`
- PostForm: `src/components/islands/PostForm.tsx`
- ProductForm: `src/components/islands/ProductForm.tsx`

## Dependencies

```json
{
  "quill": "^2.x.x",
  "react-quill": "^2.x.x"
}
```

## Tính Năng Có Thể Mở Rộng

1. **Table Support**: Thêm module table
2. **Emoji Picker**: Thêm emoji selector
3. **Mention**: Tag users hoặc products
4. **Image Resize**: Resize ảnh trong editor
5. **Syntax Highlighting**: Highlight code blocks
6. **Auto-save**: Tự động lưu draft
7. **Collaboration**: Real-time editing

## Lưu Ý

- Editor chỉ render ở client-side (SSR không hỗ trợ)
- Nội dung được lưu dưới dạng HTML
- Cần sanitize HTML khi hiển thị để tránh XSS
- Upload ảnh cần có API endpoint hỗ trợ
