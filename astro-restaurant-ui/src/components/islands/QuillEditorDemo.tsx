import { useState } from 'react';
import QuillEditor from './QuillEditor';
import { mediaApi } from '@/lib/api';

export default function QuillEditorDemo() {
  const [content, setContent] = useState('<h2>Chào mừng đến với Quill Editor!</h2><p>Đây là một ví dụ về rich text editor với đầy đủ tính năng.</p><p><br></p><p><strong>Các tính năng chính:</strong></p><ul><li>Định dạng văn bản (bold, italic, underline, etc.)</li><li>Headers (H1-H6)</li><li>Danh sách có thứ tự và không thứ tự</li><li>Chèn link, ảnh, video</li><li>Code blocks và blockquotes</li><li>Màu chữ và màu nền</li></ul>');
  const [showPreview, setShowPreview] = useState(false);

  const cardClass =
    'bg-gradient-to-b from-black/80 to-zinc-950/85 border border-amber-400/20 rounded-xl p-6 space-y-4 shadow-[0_12px_36px_-22px_rgba(251,191,36,0.45)] backdrop-blur';
  const titleClass = 'text-xl font-semibold text-amber-100';

  return (
    <div className="space-y-6">
      <div className={cardClass}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={titleClass}>Quill Editor Demo</h3>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 text-sm bg-amber-500/20 border border-amber-400/30 rounded-lg text-amber-100 hover:bg-amber-400/30 transition-colors"
          >
            {showPreview ? 'Ẩn Preview' : 'Xem Preview'}
          </button>
        </div>

        <QuillEditor
          value={content}
          onChange={setContent}
          placeholder="Bắt đầu viết nội dung của bạn..."
          height="500px"
          onImageUpload={async (file) => {
            try {
              const uploaded = await mediaApi.upload(file, 'demo');
              const apiBase = import.meta.env.PUBLIC_API_URL || 'https://vuapiastronhahang.nguyenluan.vn/api/v1';
              const mediaBase = apiBase.replace(/\/api\/v\d+\/?$/, '');
              const imageUrl = uploaded.path || '';
              return imageUrl.startsWith('http') ? imageUrl : `${mediaBase}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
            } catch (error) {
              console.error('Failed to upload image:', error);
              throw error;
            }
          }}
        />

        <div className="flex justify-between items-center pt-4 border-t border-amber-400/20">
          <div className="text-sm text-amber-200/60">
            Số ký tự: {content.replace(/<[^>]*>/g, '').length}
          </div>
          <button
            type="button"
            onClick={() => {
              console.log('Content:', content);
              alert('Nội dung đã được log ra console!');
            }}
            className="px-4 py-2 text-sm bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-colors"
          >
            Log Content
          </button>
        </div>
      </div>

      {showPreview && (
        <div className={cardClass}>
          <h3 className={titleClass}>Preview</h3>
          <div 
            className="prose prose-invert max-w-none text-amber-50"
            dangerouslySetInnerHTML={{ __html: content }}
            style={{
              color: 'rgb(254, 243, 199)',
            }}
          />
        </div>
      )}

      <div className={cardClass}>
        <h3 className={titleClass}>Hướng Dẫn Sử Dụng</h3>
        <div className="space-y-3 text-amber-100/90">
          <div>
            <h4 className="font-semibold text-amber-100 mb-2">Định dạng văn bản:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Sử dụng toolbar để chọn header, font, size</li>
              <li>Click các nút B, I, U để bold, italic, underline</li>
              <li>Chọn màu chữ và màu nền từ color picker</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-amber-100 mb-2">Chèn media:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Click icon ảnh để upload ảnh từ máy tính</li>
              <li>Click icon link để chèn liên kết</li>
              <li>Click icon video để nhúng video (YouTube, Vimeo)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-amber-100 mb-2">Phím tắt:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><kbd className="px-2 py-1 bg-black/50 rounded">Ctrl/Cmd + B</kbd> - Bold</li>
              <li><kbd className="px-2 py-1 bg-black/50 rounded">Ctrl/Cmd + I</kbd> - Italic</li>
              <li><kbd className="px-2 py-1 bg-black/50 rounded">Ctrl/Cmd + U</kbd> - Underline</li>
              <li><kbd className="px-2 py-1 bg-black/50 rounded">Ctrl/Cmd + K</kbd> - Link</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
