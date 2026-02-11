import { useEffect, useRef, useState } from 'react';

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
  onImageUpload?: (file: File) => Promise<string>;
}

export default function QuillEditor({
  value,
  onChange,
  placeholder = 'Viết nội dung tại đây...',
  height = '400px',
  onImageUpload,
}: QuillEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !editorRef.current) return;

    // Dynamic import Quill only on client side
    import('quill').then(({ default: Quill }) => {
      if (quillRef.current) return; // Already initialized

      // Register custom fonts
      const Font = Quill.import('formats/font') as any;
      Font.whitelist = ['sans-serif', 'serif', 'monospace', 'arial', 'times-new-roman', 'courier'];
      Quill.register(Font, true);

      // Register custom sizes
      const Size = Quill.import('formats/size') as any;
      Size.whitelist = ['small', 'normal', 'large', 'huge'];
      Quill.register(Size, true);

      // Initialize Quill with full toolbar
      const quill = new Quill(editorRef.current!, {
        theme: 'snow',
        placeholder,
        modules: {
          toolbar: {
            container: [
              // Text formatting
              [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
              [{ 'font': Font.whitelist }],
              [{ 'size': Size.whitelist }],
              
              // Text style
              ['bold', 'italic', 'underline', 'strike'],
              [{ 'color': [] }, { 'background': [] }],
              [{ 'script': 'sub'}, { 'script': 'super' }],
              
              // Paragraph formatting
              [{ 'align': [] }],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              [{ 'indent': '-1'}, { 'indent': '+1' }],
              ['blockquote', 'code-block'],
              
              // Media
              ['link', 'image', 'video'],
              
              // Clear formatting
              ['clean']
            ],
            handlers: {
              image: imageHandler,
            }
          },
          clipboard: {
            matchVisual: false,
          }
        },
      });

      // Custom image handler
      function imageHandler(this: any) {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) return;

          // Show loading
          const range = quill.getSelection(true);
          quill.insertText(range.index, 'Đang tải ảnh...');
          quill.setSelection(range.index + 15);

          try {
            let imageUrl: string;

            if (onImageUpload) {
              // Use custom upload handler
              imageUrl = await onImageUpload(file);
            } else {
              // Convert to base64 as fallback
              imageUrl = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.readAsDataURL(file);
              });
            }

            // Remove loading text and insert image
            quill.deleteText(range.index, 15);
            quill.insertEmbed(range.index, 'image', imageUrl);
            quill.setSelection(range.index + 1);
          } catch (error) {
            console.error('Failed to upload image:', error);
            quill.deleteText(range.index, 15);
            alert('Không thể tải ảnh lên. Vui lòng thử lại.');
          }
        };
      }

      // Set initial content
      if (value) {
        quill.root.innerHTML = value;
      }

      // Listen for changes
      quill.on('text-change', () => {
        const html = quill.root.innerHTML;
        onChange(html === '<p><br></p>' ? '' : html);
      });

      quillRef.current = quill;
    });

    return () => {
      if (quillRef.current) {
        quillRef.current = null;
      }
    };
  }, [isClient]);

  // Update content when value changes externally
  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      const selection = quillRef.current.getSelection();
      quillRef.current.root.innerHTML = value || '';
      if (selection) {
        quillRef.current.setSelection(selection);
      }
    }
  }, [value]);

  if (!isClient) {
    return (
      <div 
        className="w-full px-4 py-3 rounded-lg bg-black/75 border border-amber-400/25 text-amber-200/60"
        style={{ minHeight: height }}
      >
        Đang tải editor...
      </div>
    );
  }

  return (
    <div className="quill-editor-wrapper" style={{ '--editor-height': height } as any}>
      <style>{`
        .quill-editor-wrapper .ql-editor {
          min-height: var(--editor-height, 400px);
        }
      `}</style>
      <div ref={editorRef} />
    </div>
  );
}
