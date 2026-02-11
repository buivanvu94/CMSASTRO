import { useState, useEffect } from 'react';
import { productsApi, productCategoriesApi, mediaApi } from '@/lib/api';
import MediaPicker from './MediaPicker';
import PriceEditor from './PriceEditor';
import QuillEditor from './QuillEditor';

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
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

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

  const validateField = (name: string, value: any) => {
    if (name === 'name' && !String(value || '').trim()) {
      return 'Tên sản phẩm là bắt buộc';
    }

    if (name === 'slug' && String(value || '').trim()) {
      const slugPattern = /^[a-z0-9-]+$/;
      if (!slugPattern.test(String(value).trim())) {
        return 'Slug chỉ gồm chữ thường, số và dấu gạch ngang';
      }
    }

    if (name === 'seo_title' && String(value || '').length > 60) {
      return 'Meta title tối đa 60 ký tự';
    }

    if (name === 'seo_description' && String(value || '').length > 160) {
      return 'Meta description tối đa 160 ký tự';
    }

    return '';
  };

  const validatePrices = (items: any[]) => {
    if (!items || items.length === 0) {
      return 'Cần ít nhất 1 đơn giá';
    }

    if (!items.some((item) => item.is_default)) {
      return 'Cần chọn 1 giá mặc định';
    }

    const invalid = items.find((item) => !Number.isFinite(Number(item.price)) || Number(item.price) < 0);
    if (invalid) {
      return 'Đơn giá phải lớn hơn hoặc bằng 0';
    }

    const invalidSale = items.find((item) => (
      item.compare_at_price !== null
      && item.compare_at_price !== undefined
      && item.compare_at_price !== ''
      && (Number(item.compare_at_price) < 0 || Number(item.compare_at_price) >= Number(item.price))
    ));

    if (invalidSale) {
      return 'Giá giảm phải nhỏ hơn đơn giá và không âm';
    }

    return '';
  };

  const validateAll = (data = formData, currentPrices = prices) => {
    const nextErrors: Record<string, string> = {};
    ['name', 'slug', 'seo_title', 'seo_description'].forEach((field) => {
      const message = validateField(field, (data as any)[field]);
      if (message) {
        nextErrors[field] = message;
      }
    });

    const priceMessage = validatePrices(currentPrices);
    if (priceMessage) {
      nextErrors.prices = priceMessage;
    }

    return nextErrors;
  };

  useEffect(() => {
    const nextErrors = validateAll(formData, prices);
    setErrors(nextErrors);
  }, [formData, prices]);

  const ensureDefaultPrice = (items: any[]) => {
    if (!items || items.length === 0) {
      return [{ name: '', price: 0, compare_at_price: null, is_default: true }];
    }

    const hasDefault = items.some((item) => item.is_default);
    if (!hasDefault) {
      return [{ ...items[0], is_default: true }, ...items.slice(1)];
    }

    return items;
  };

  const normalizeGalleryIds = (value: unknown): number[] => {
    if (Array.isArray(value)) {
      return value
        .map((item) => Number(item))
        .filter((item) => Number.isInteger(item) && item > 0);
    }

    if (typeof value === 'string' && value.trim()) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed
            .map((item) => Number(item))
            .filter((item) => Number.isInteger(item) && item > 0);
        }
      } catch {
        return [];
      }
    }

    return [];
  };

  useEffect(() => {
    loadCategories();
    if (productId) {
      loadProduct();
    } else {
      setPrices([{ name: '', price: 0, compare_at_price: null, is_default: true }]);
    }
  }, [productId]);

  const loadCategories = async () => {
    try {
      const response = await productCategoriesApi.getAll({ limit: 100 });
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
      const galleryIds = normalizeGalleryIds(product.gallery);
      
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        product_category_id: product.product_category_id,
        featured_image_id: product.featured_image_id,
        gallery: galleryIds,
        status: product.status || 'draft',
        is_featured: product.is_featured || false,
        seo_title: product.seo_title || '',
        seo_description: product.seo_description || '',
      });

      if (product.featuredImage) {
        setSelectedImage(product.featuredImage);
      }

      if (product.prices) {
        const mappedPrices = product.prices.map((price: any) => ({
          id: price.id,
          name: price.variant_name || '',
          price: Number(price.price) || 0,
          compare_at_price: price.sale_price !== null && price.sale_price !== undefined
            ? Number(price.sale_price)
            : null,
          is_default: Boolean(price.is_default)
        }));
        setPrices(ensureDefaultPrice(mappedPrices));
      } else {
        setPrices(ensureDefaultPrice([]));
      }

      // Load gallery images by IDs for edit mode preview
      if (galleryIds.length > 0) {
        const galleryMedia = await Promise.all(
          galleryIds.map(async (id: number) => {
            try {
              return await mediaApi.getById(id);
            } catch {
              return null;
            }
          })
        );
        setGalleryImages(galleryMedia.filter(Boolean));
      } else {
        setGalleryImages([]);
      }
    } catch (error) {
      console.error('Failed to load product:', error);
      const err: any = error;
      const backendMessage = err?.response?.data?.message;
      const detailMessage = err?.response?.data?.errors
        ? Object.values(err.response.data.errors)[0]
        : null;
      alert(detailMessage || backendMessage || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const normalizedValue = type === 'checkbox'
      ? checked
      : (name === 'product_category_id' ? (value ? parseInt(value, 10) : null) : value);

    setFormData((prev) => ({
      ...prev,
      [name]: normalizedValue
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleImageSelect = (media: any) => {
    setSelectedImage(media);
    setFormData(prev => ({ ...prev, featured_image_id: media?.id || null }));
    setShowMediaPicker(false);
  };

  const handleGallerySelect = (media: any[]) => {
    const merged = [...galleryImages, ...media].filter(
      (item, index, arr) => arr.findIndex((x) => x.id === item.id) === index
    );
    setGalleryImages(merged);
    setFormData(prev => ({ ...prev, gallery: merged.map(m => m.id) }));
    setShowGalleryPicker(false);
  };

  const removeGalleryImage = (index: number) => {
    const newGallery = galleryImages.filter((_, i) => i !== index);
    setGalleryImages(newGallery);
    setFormData(prev => ({ ...prev, gallery: newGallery.map(m => m.id) }));
  };

  const handlePricesChange = (items: any[]) => {
    setTouched((prev) => ({ ...prev, prices: true }));
    setPrices(items);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedForValidation = prices.length === 0 ? ensureDefaultPrice([]) : prices;
    const nextErrors = validateAll(formData, normalizedForValidation);
    setTouched({
      name: true,
      slug: true,
      seo_title: true,
      seo_description: true,
      prices: true
    });
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);
      const normalizedPrices = ensureDefaultPrice(normalizedForValidation).map((price) => ({
        variant_name: price.name?.trim() || undefined,
        price: Number(price.price) || 0,
        sale_price: price.compare_at_price ?? null,
        is_default: Boolean(price.is_default),
        status: 'active'
      }));

      const data: any = {
        name: formData.name.trim(),
        description: formData.description || '',
        gallery: formData.gallery,
        status: formData.status,
        is_featured: formData.is_featured,
        prices: normalizedPrices
      };

      if (formData.slug.trim()) {
        data.slug = formData.slug.trim();
      }
      if (formData.product_category_id !== null) {
        data.product_category_id = formData.product_category_id;
      }
      if (formData.featured_image_id !== null) {
        data.featured_image_id = formData.featured_image_id;
      }
      if (formData.seo_title.trim()) {
        data.seo_title = formData.seo_title.trim();
      }
      if (formData.seo_description.trim()) {
        data.seo_description = formData.seo_description.trim();
      }
      
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
      const backendError = error?.response?.data;
      const firstErrorMessage = backendError?.errors
        ? Object.values(backendError.errors)[0]
        : null;
      alert(firstErrorMessage || backendError?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const apiBase = import.meta.env.PUBLIC_API_URL || 'https://vuapiastronhahang.nguyenluan.vn/api/v1';
  const mediaBase = apiBase.replace(/\/api\/v\d+\/?$/, '');

  const resolveMediaSrc = (media: any): string => {
    const raw = media?.thumbnail_path || media?.path || '';
    if (!raw) return '';
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
    return `${mediaBase}${raw.startsWith('/') ? '' : '/'}${raw}`;
  };

  const handleFeaturedUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      setUploadingFeatured(true);
      const uploaded = await mediaApi.upload(files[0], 'products');
      handleImageSelect(uploaded);
    } catch (error) {
      console.error('Failed to upload featured image:', error);
      alert('Failed to upload featured image');
    } finally {
      setUploadingFeatured(false);
    }
  };

  const handleGalleryUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      setUploadingGallery(true);
      const uploaded = files.length === 1
        ? [await mediaApi.upload(files[0], 'products')]
        : await mediaApi.uploadMultiple(Array.from(files), 'products');
      handleGallerySelect(uploaded);
    } catch (error) {
      console.error('Failed to upload gallery images:', error);
      alert('Failed to upload gallery images');
    } finally {
      setUploadingGallery(false);
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
              onBlur={handleBlur}
              required
              className={`${inputClass} ${touched.name && errors.name ? 'border-rose-400 focus:border-rose-400 focus:ring-red-500/20' : ''}`}
            />
            {touched.name && errors.name && <p className="mt-2 text-sm text-rose-400">{errors.name}</p>}
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
              onBlur={handleBlur}
              placeholder="Leave empty to auto-generate"
              className={`${inputClass} ${touched.slug && errors.slug ? 'border-rose-400 focus:border-rose-400 focus:ring-red-500/20' : ''}`}
            />
            {touched.slug && errors.slug && <p className="mt-2 text-sm text-rose-400">{errors.slug}</p>}
          </div>

          <div>
            <label className={labelClass}>
              Description
            </label>
            <QuillEditor
              value={formData.description}
              onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
              placeholder="Viết mô tả sản phẩm tại đây..."
              height="400px"
              onImageUpload={async (file) => {
                try {
                  const uploaded = await mediaApi.upload(file, 'products');
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
          <PriceEditor prices={prices} onChange={handlePricesChange} />
          {touched.prices && errors.prices && (
            <p className="mt-2 text-sm text-rose-400">{errors.prices}</p>
          )}
        </div>

        {/* Images */}
        <div className={cardClass}>
          <h3 className={titleClass}>Images</h3>
          
          <div>
            <label className={labelClass}>
              Featured Image
            </label>
            {selectedImage ? (
              <div className="flex items-center gap-3 rounded-lg border border-amber-400/15 bg-black/40 p-3">
                <img
                  src={resolveMediaSrc(selectedImage)}
                  alt={selectedImage.alt_text}
                  className="w-20 h-20 object-cover rounded-md border border-amber-400/20"
                />
                <div className="flex-1">
                  <p className="text-sm text-zinc-100 font-medium truncate">{selectedImage.filename}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm">
                    <button
                      type="button"
                      onClick={() => setShowMediaPicker(true)}
                      className="text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
                    >
                      Change
                    </button>
                    <label className="text-amber-300 hover:text-amber-200 transition-colors cursor-pointer">
                      {uploadingFeatured ? 'Uploading...' : 'Upload mới'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingFeatured}
                        onChange={(e) => handleFeaturedUpload(e.target.files)}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => handleImageSelect(null)}
                      className="text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(true)}
                  className="px-4 py-3 text-base border border-amber-400/30 rounded-lg text-amber-100 hover:bg-amber-400/10 transition-colors cursor-pointer"
                >Chọn từ thư viện</button>
                <label className="px-4 py-3 text-base border border-amber-400/30 rounded-lg text-amber-100 hover:bg-amber-400/10 transition-colors cursor-pointer">
                  {uploadingFeatured ? 'Uploading...' : 'Upload ảnh đại diện'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingFeatured}
                    onChange={(e) => handleFeaturedUpload(e.target.files)}
                  />
                </label>
              </div>
            )}
          </div>

          <div>
            <label className={labelClass}>
              Gallery Images
            </label>
            {galleryImages.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
                {galleryImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={resolveMediaSrc(img)}
                      alt={img.alt_text}
                      className="w-full h-20 object-cover rounded-md border border-amber-400/20"
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            {galleryImages.length > 0 && (
              <p className="text-sm text-amber-200/70 mb-3">Đã chọn {galleryImages.length} ảnh gallery</p>
            )}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShowGalleryPicker(true)}
                className="px-4 py-3 text-base border border-amber-400/30 rounded-lg text-amber-100 hover:bg-amber-400/10 transition-colors cursor-pointer"
              >
                {galleryImages.length > 0 ? 'Chọn thêm từ thư viện' : 'Chọn gallery từ thư viện'}
              </button>
              <label className="px-4 py-3 text-base border border-amber-400/30 rounded-lg text-amber-100 hover:bg-amber-400/10 transition-colors cursor-pointer">
                {uploadingGallery ? 'Uploading...' : 'Upload gallery'}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={uploadingGallery}
                  onChange={(e) => handleGalleryUpload(e.target.files)}
                />
              </label>
            </div>
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
              onBlur={handleBlur}
              maxLength={60}
              className={`${inputClass} ${touched.seo_title && errors.seo_title ? 'border-rose-400 focus:border-rose-400 focus:ring-red-500/20' : ''}`}
            />
            <p className={subtleTextClass}>
              {formData.seo_title.length}/60 characters
            </p>
            {touched.seo_title && errors.seo_title && <p className="mt-2 text-sm text-rose-400">{errors.seo_title}</p>}
          </div>

          <div>
            <label className={labelClass}>
              Meta Description
            </label>
            <textarea
              name="seo_description"
              value={formData.seo_description}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={3}
              maxLength={160}
              className={`${textareaClass} ${touched.seo_description && errors.seo_description ? 'border-rose-400 focus:border-rose-400 focus:ring-red-500/20' : ''}`}
            />
            <p className={subtleTextClass}>
              {formData.seo_description.length}/160 characters
            </p>
            {touched.seo_description && errors.seo_description && <p className="mt-2 text-sm text-rose-400">{errors.seo_description}</p>}
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
            disabled={loading || Object.keys(errors).length > 0}
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


