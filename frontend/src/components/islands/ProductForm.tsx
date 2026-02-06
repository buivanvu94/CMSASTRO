import { useState, useEffect } from 'react';
import { productsApi, productCategoriesApi } from '@/lib/api';
import MediaPicker from './MediaPicker';
import PriceEditor from './PriceEditor';

interface ProductFormProps {
  productId?: number;
}

export default function ProductForm({ productId }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showGalleryPicker, setShowGalleryPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);

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
    product_category_id: null as number | null,
    featured_image_id: null as number | null,
    gallery: [] as number[],
    status: 'draft' as 'draft' | 'published' | 'archived',
    is_featured: false,
    seo_title: '',
    seo_description: '',
  });

  const [prices, setPrices] = useState<any[]>([]);

  useEffect(() => {
    loadCategories();
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadCategories = async () => {
    try {
      const response = await productCategoriesApi.getAll({ limit: 1000 });
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await productsApi.getById(productId!);
      const product = response;
      
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        product_category_id: product.product_category_id,
        featured_image_id: product.featured_image_id,
        gallery: product.gallery || [],
        status: product.status || 'draft',
        is_featured: product.is_featured || false,
        seo_title: product.seo_title || '',
        seo_description: product.seo_description || '',
      });

      if (product.featuredImage) {
        setSelectedImage(product.featuredImage);
      }

      if (product.prices) {
        setPrices(product.prices);
      }

      // Load gallery images
      if (product.gallery && product.gallery.length > 0) {
        // Gallery images would be loaded from media API
        setGalleryImages([]);
      }
    } catch (error) {
      console.error('Failed to load product:', error);
      alert('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'product_category_id' ? (value ? parseInt(value) : null) : value)
    }));
  };

  const handleImageSelect = (media: any) => {
    setSelectedImage(media);
    setFormData(prev => ({ ...prev, featured_image_id: media?.id || null }));
    setShowMediaPicker(false);
  };

  const handleGallerySelect = (media: any[]) => {
    setGalleryImages(media);
    setFormData(prev => ({ ...prev, gallery: media.map(m => m.id) }));
    setShowGalleryPicker(false);
  };

  const removeGalleryImage = (index: number) => {
    const newGallery = galleryImages.filter((_, i) => i !== index);
    setGalleryImages(newGallery);
    setFormData(prev => ({ ...prev, gallery: newGallery.map(m => m.id) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Product name is required');
      return;
    }

    if (prices.length === 0) {
      alert('At least one price variant is required');
      return;
    }

    try {
      setLoading(true);
      const data = { ...formData, prices };
      
      if (productId) {
        await productsApi.update(productId, data);
        alert('Product updated successfully');
      } else {
        await productsApi.create(data);
        alert('Product created successfully');
        window.location.href = '/admin/products';
      }
    } catch (error: any) {
      console.error('Failed to save product:', error);
      alert(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (loading && productId) {
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
          <h3 className={titleClass}>Product Information</h3>
          
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
          </div>

          <div>
            <label className={labelClass}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className={textareaClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Category
              </label>
              <select
                name="product_category_id"
                value={formData.product_category_id || ''}
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
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
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
              Featured Product
            </label>
          </div>
        </div>

        {/* Pricing */}
        <div className={cardClass}>
          <PriceEditor prices={prices} onChange={setPrices} />
        </div>

        {/* Images */}
        <div className={cardClass}>
          <h3 className={titleClass}>Images</h3>
          
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
                className="px-4 py-3 text-base border border-amber-400/30 rounded-lg text-amber-100 hover:bg-amber-400/10 transition-colors cursor-pointer"
              >
                Select Image
              </button>
            )}
          </div>

          <div>
            <label className={labelClass}>
              Gallery Images
            </label>
            {galleryImages.length > 0 ? (
              <div className="grid grid-cols-4 gap-4 mb-4">
                {galleryImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img.thumbnail_url || img.url}
                      alt={img.alt_text}
                      className="w-full h-32 object-cover rounded-lg border border-amber-400/20"
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => setShowGalleryPicker(true)}
              className="px-4 py-3 text-base border border-amber-400/30 rounded-lg text-amber-100 hover:bg-amber-400/10 transition-colors cursor-pointer"
            >
              {galleryImages.length > 0 ? 'Add More Images' : 'Select Gallery Images'}
            </button>
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
            href="/admin/products"
            className="px-6 py-3 text-base border border-amber-400/30 rounded-lg text-amber-100 hover:bg-amber-400/10 transition-colors cursor-pointer"
          >
            Cancel
          </a>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 text-base bg-amber-500 text-black rounded-lg hover:bg-amber-400 disabled:bg-zinc-700 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {loading ? 'Saving...' : productId ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>

      <MediaPicker
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleImageSelect}
        accept="image"
      />

      <MediaPicker
        isOpen={showGalleryPicker}
        onClose={() => setShowGalleryPicker(false)}
        onSelect={handleGallerySelect}
        multiple
        accept="image"
      />
    </>
  );
}

