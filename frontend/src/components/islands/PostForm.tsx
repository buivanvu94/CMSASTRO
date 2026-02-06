import { useState, useEffect } from 'react';
import { postsApi, categoriesApi } from '@/lib/api';
import MediaPicker from './MediaPicker';

interface PostFormProps {
  postId?: number;
}

export default function PostForm({ postId }: PostFormProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);

  const cardClass =
    'bg-gradient-to-b from-black/80 to-zinc-950/85 border border-amber-400/20 rounded-xl p-6 space-y-4 shadow-[0_12px_36px_-22px_rgba(251,191,36,0.45)] backdrop-blur';
  const titleClass = 'text-xl font-semibold text-amber-100';
  const labelClass = 'block text-base font-medium text-amber-100/90 mb-2';
  const inputClass =
    'w-full px-4 py-3 text-base rounded-lg bg-black/75 border border-amber-400/25 text-amber-50 placeholder:text-amber-200/45 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400/80 outline-none transition-colors';
  const textareaClass =
    'w-full px-4 py-3 text-base rounded-lg bg-black/75 border border-amber-400/25 text-amber-50 placeholder:text-amber-200/45 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400/80 outline-none transition-colors';
  const selectClass =
    'w-full px-4 py-3 text-base rounded-lg bg-black/75 border border-amber-400/25 text-amber-50 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400/80 outline-none transition-colors [&>option]:bg-black [&>option]:text-amber-100';
  const subtleTextClass = 'mt-2 text-sm text-amber-200/60';
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category_id: null as number | null,
    featured_image_id: null as number | null,
    status: 'draft' as 'draft' | 'published',
    is_featured: false,
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
  });

  useEffect(() => {
    loadCategories();
    if (postId) {
      loadPost();
    }
  }, [postId]);

  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getAll({ limit: 1000 });
      setCategories(response.data.items);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadPost = async () => {
    try {
      setLoading(true);
      const response = await postsApi.getById(postId!);
      const post = response.data;
      
      setFormData({
        title: post.title || '',
        slug: post.slug || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        category_id: post.category_id,
        featured_image_id: post.featured_image_id,
        status: post.status || 'draft',
        is_featured: post.is_featured || false,
        meta_title: post.meta_title || '',
        meta_description: post.meta_description || '',
        meta_keywords: post.meta_keywords || '',
      });

      if (post.featuredImage) {
        setSelectedImage(post.featuredImage);
      }
    } catch (error) {
      console.error('Failed to load post:', error);
      alert('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'category_id' ? (value ? parseInt(value) : null) : value)
    }));
  };

  const handleImageSelect = (media: any) => {
    setSelectedImage(media);
    setFormData(prev => ({ ...prev, featured_image_id: media?.id || null }));
    setShowMediaPicker(false);
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!formData.title.trim()) {
      alert('Post title is required');
      return;
    }

    if (!formData.content.trim()) {
      alert('Post content is required');
      return;
    }

    try {
      setLoading(true);
      const data = { ...formData, status };
      
      if (postId) {
        await postsApi.update(postId, data);
        alert('Post updated successfully');
      } else {
        await postsApi.create(data);
        alert('Post created successfully');
        window.location.href = '/posts';
      }
    } catch (error: any) {
      console.error('Failed to save post:', error);
      alert(error.response?.data?.message || 'Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  if (loading && postId) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6 text-base">
        {/* Main Content */}
        <div className={cardClass}>
          <h3 className={titleClass}>Post Content</h3>
          
          <div>
            <label className={labelClass}>
              Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Slug
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="Leave empty to auto-generate"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Excerpt
            </label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows={3}
              placeholder="Brief summary of the post"
              className={textareaClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Content <span className="text-rose-400">*</span>
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={15}
              required
              className={`${textareaClass} font-mono text-base`}
              placeholder="Write your post content here..."
            />
            <p className={subtleTextClass}>
              Rich text editor can be integrated later (TinyMCE, Tiptap, etc.)
            </p>
          </div>
        </div>

        {/* Post Settings */}
        <div className={cardClass}>
          <h3 className={titleClass}>Post Settings</h3>
          
          <div>
            <label className={labelClass}>
              Category
            </label>
            <select
              name="category_id"
              value={formData.category_id || ''}
              onChange={handleChange}
              className={selectClass}
            >
              <option value="">No Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>
              Featured Image
            </label>
            {selectedImage ? (
              <div className="flex items-start gap-4">
                <img
                  src={selectedImage.thumbnail_url || selectedImage.url}
                  alt={selectedImage.alt_text}
                  className="w-32 h-32 object-cover rounded-lg border border-amber-400/20"
                />
                <div className="flex-1">
                  <p className="text-base text-zinc-100 font-medium">{selectedImage.filename}</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setShowMediaPicker(true)}
                      className="text-base text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => handleImageSelect(null)}
                      className="text-base text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowMediaPicker(true)}
                className="px-4 py-2 border border-amber-400/30 rounded-lg text-amber-100 hover:bg-amber-400/10 transition-colors cursor-pointer"
              >
                Select Image
              </button>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_featured"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleChange}
              className="w-4 h-4 text-amber-400 border-zinc-600 rounded focus:ring-amber-500/40"
            />
            <label htmlFor="is_featured" className="ml-2 text-base text-zinc-100">
              Featured Post
            </label>
          </div>
        </div>

        {/* SEO Settings */}
        <div className={cardClass}>
          <h3 className={titleClass}>SEO Settings</h3>
          
          <div>
            <label className={labelClass}>
              Meta Title
            </label>
            <input
              type="text"
              name="meta_title"
              value={formData.meta_title}
              onChange={handleChange}
              maxLength={60}
              className={inputClass}
            />
            <p className={subtleTextClass}>
              {formData.meta_title.length}/60 characters
            </p>
          </div>

          <div>
            <label className={labelClass}>
              Meta Description
            </label>
            <textarea
              name="meta_description"
              value={formData.meta_description}
              onChange={handleChange}
              rows={3}
              maxLength={160}
              className={textareaClass}
            />
            <p className={subtleTextClass}>
              {formData.meta_description.length}/160 characters
            </p>
          </div>

          <div>
            <label className={labelClass}>
              Meta Keywords
            </label>
            <input
              type="text"
              name="meta_keywords"
              value={formData.meta_keywords}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <a
            href="/posts"
            className="px-6 py-3 text-base border border-amber-400/30 rounded-lg text-amber-100 hover:bg-amber-400/10 transition-colors cursor-pointer"
          >
            Cancel
          </a>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              disabled={loading}
              className="px-6 py-3 text-base border border-amber-400/30 rounded-lg text-amber-100 hover:bg-amber-400/10 disabled:bg-zinc-900 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {loading ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('published')}
              disabled={loading}
              className="px-6 py-3 text-base bg-amber-500 text-black rounded-lg hover:bg-amber-400 disabled:bg-zinc-700 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {loading ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>
      </form>

      <MediaPicker
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleImageSelect}
        accept="image"
      />
    </>
  );
}
