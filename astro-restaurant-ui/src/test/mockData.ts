// Mock user data
export const mockUser = {
  id: 1,
  full_name: 'Test User',
  email: 'test@example.com',
  role: 'admin' as const,
  status: 'active' as const,
  avatar_id: null,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

export const mockAuthor = {
  ...mockUser,
  id: 2,
  full_name: 'Author User',
  email: 'author@example.com',
  role: 'author' as const,
};

// Mock category data
export const mockCategory = {
  id: 1,
  name: 'Test Category',
  slug: 'test-category',
  description: 'Test description',
  parent_id: null,
  image_id: null,
  order: 0,
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

// Mock post data
export const mockPost = {
  id: 1,
  title: 'Test Post',
  slug: 'test-post',
  excerpt: 'Test excerpt',
  content: 'Test content',
  category_id: 1,
  author_id: 1,
  featured_image_id: null,
  status: 'published' as const,
  is_featured: false,
  published_at: '2024-01-01T00:00:00.000Z',
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  category: mockCategory,
  author: mockUser,
};

// Mock product data
export const mockProduct = {
  id: 1,
  name: 'Test Product',
  slug: 'test-product',
  description: 'Test description',
  category_id: 1,
  featured_image_id: null,
  gallery: [],
  status: 'active' as const,
  is_featured: false,
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  prices: [
    {
      id: 1,
      product_id: 1,
      name: 'Default',
      price: 99.99,
      compare_at_price: null,
      is_default: true,
    },
  ],
};

// Mock media data
export const mockMedia = {
  id: 1,
  filename: 'test-image.jpg',
  original_name: 'test-image.jpg',
  mime_type: 'image/jpeg',
  size: 1024,
  type: 'image' as const,
  url: '/uploads/2024/01/test-image.jpg',
  thumbnail_url: '/uploads/2024/01/test-image-thumb.jpg',
  folder: '2024/01',
  alt_text: 'Test image',
  caption: '',
  uploader_id: 1,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

// Mock reservation data
export const mockReservation = {
  id: 1,
  customer_name: 'John Doe',
  customer_email: 'john@example.com',
  customer_phone: '1234567890',
  reservation_date: '2024-12-25T19:00:00.000Z',
  party_size: 4,
  special_requests: '',
  status: 'pending' as const,
  handler_id: null,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

// Mock contact data
export const mockContact = {
  id: 1,
  name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '0987654321',
  subject: 'Test Subject',
  message: 'Test message',
  status: 'new' as const,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

// Mock API responses
export const mockPaginatedResponse = <T,>(items: T[]) => ({
  items,
  pagination: {
    page: 1,
    limit: 20,
    totalPages: 1,
    totalItems: items.length,
  },
});

export const mockApiResponse = <T,>(data: T) => ({
  data,
});
