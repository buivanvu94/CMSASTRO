import { useState, useEffect } from 'react';
import { productCategoriesApi } from '@/lib/api';
import MediaPicker from './MediaPicker';

interface ProductCategoryFormProps {
  categoryId?: number;
}

export default function ProductCategoryForm({ categoryId }: ProductCategoryFormProps) {
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
    name: '',
    slug: '',
    description: '',
    parent_id: null as number | null,
    image_id: null as number | null,
    seo_title: '',
    seo_description: '',
  });

  useEffect(() => {
    loadCategories();
    if (categoryId) {
      loadCategory();
    }
  }, [categoryId]);

  const loadCategories = async () => {
    try {
      const response = await productCategoriesApi.getAll({ limit: 1000 });
      setCategories((response.data || []).filter((c: any) => c.id !== categoryId));
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadCategory = async () => {
    try {
      setLoading(true);
      const response = await productCategoriesApi.getById(categoryId!);
      const category = response;
      
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        parent_id: category.parent_id,
        image_id: category.image_id,
        seo_title: category.seo_title || '',
        seo_description: category.seo_description || '',
      });

      if (category.image) {
        setSelectedImage(category.image);
      }
    } catch (error) {
      console.error('Failed to load category:', error);
      alert('Could not load category details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'parent_id' ? (value ? parseInt(value) : null) : value
    }));
  };

  const handleImageSelect = (media: any) => {
    setSelectedImage(media);
    setFormData(prev => ({ ...prev, image_id: media?.id || null }));
    setShowMediaPicker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Product category name is required');
      return;
    }

    try {
      setLoading(true);
      
      if (categoryId) {
        await productCategoriesApi.update(categoryId, formData);
        alert('Product category updated successfully');
      } else {
        await productCategoriesApi.create(formData);
        alert('Product category created successfully');
        window.location.href = '/admin/product-categories';
      }
    } catch (error: any) {
      console.error('Failed to save category:', error);
      alert(error.response?.data?.message || 'Could not save category');
    } finally {
      setLoading(false);
    }
  };

  if (loading && categoryId) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 text-base">
        {/* Basic Information */}
        <div className={cardClass}>
          <h3 className={titleClass}>Basic Information</h3>
          
          <div>
            <label className={labelClass}>
              Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
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
            <p className={subtleTextClass}>Leave empty to auto-generate from category name</p>
          </div>

          <div>
            <label className={labelClass}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={textareaClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Parent Product Category
            </label>
            <select
              name="parent_id"
              value={formData.parent_id || ''}
              onChange={handleChange}
              className={selectClass}
            >
              <option value="">No Parent (Root Product Category)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>
              Product Category Image
            </label>
            {selectedImage ? (
              <div className="flex items-start gap-4">
                <img
                  src={selectedImage.thumbnail_path || selectedImage.path}
                  alt={selectedImage.alt_text}
                  className="w-32 h-32 object-cover rounded-lg border border-amber-400/20"
                />
                <div className="flex-1">
                  <p className="text-base text-zinc-100 font-medium">{selectedImage.filename}</p>
                  <p className="text-sm text-amber-200/60 mt-1">{selectedImage.alt_text}</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setShowMediaPicker(true)}
                      className="text-base text-amber-300 hover:text-amber-200 transition-colors"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => handleImageSelect(null)}
                      className="text-base text-rose-400 hover:text-rose-300 transition-colors"
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
                className="px-4 py-2 border border-amber-400/30 rounded-lg text-amber-100 hover:bg-amber-400/10 transition-colors"
              >
                Select Image
              </button>
            )}
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
              name="seo_title"
              value={formData.seo_title}
              onChange={handleChange}
              maxLength={60}
              className={inputClass}
            />
            <p className={subtleTextClass}>
              {formData.seo_title.length}/60 characters
            </p>
          </div>

          <div>
            <label className={labelClass}>
              Meta Description
            </label>
            <textarea
              name="seo_description"
              value={formData.seo_description}
              onChange={handleChange}
              rows={3}
              maxLength={160}
              className={textareaClass}
            />
            <p className={subtleTextClass}>
              {formData.seo_description.length}/160 characters
            </p>
          </div>

        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <a
            href="/admin/product-categories"
            className="px-6 py-3 text-base border border-amber-400/30 rounded-lg text-amber-100 hover:bg-amber-400/10 transition-colors"
          >
            Cancel
          </a>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 text-base bg-amber-500 text-black rounded-lg hover:bg-amber-400 disabled:bg-zinc-700 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (categoryId ? 'Updating...' : 'Creating...') : categoryId ? 'Update Product Category' : 'Create Product Category'}
          </button>
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



