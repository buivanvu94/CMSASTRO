import { Op } from 'sequelize';
import Product from './product.model.js';
import ProductPrice from './product-price.model.js';
import ProductCategory from '../product-categories/product-category.model.js';
import Media from '../media/media.model.js';
import { NotFoundError, ValidationError } from '../../middlewares/errorHandler.js';
import { generateSlugFromTitle } from '../../utils/slug.js';

/**
 * Product Service
 * Business logic for product management
 */

/**
 * Check if slug exists
 * @param {string} slug - Slug to check
 * @param {number} excludeId - ID to exclude from check
 * @returns {Promise<boolean>}
 */
const slugExists = async (slug, excludeId = null) => {
  const where = { slug };
  if (excludeId) {
    where.id = { [Op.ne]: excludeId };
  }
  const count = await Product.count({ where });
  return count > 0;
};

const validateProductCategory = async (productCategoryId) => {
  if (!productCategoryId) {
    return;
  }

  const category = await ProductCategory.findByPk(productCategoryId);
  if (!category) {
    throw new ValidationError('Product category not found');
  }
};

/**
 * Find all products with pagination and filtering
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Products and pagination info
 */
export const findAll = async ({
  page = 1,
  limit = 20,
  search = '',
  productCategoryId = null,
  status = null,
  isFeatured = null
} = {}) => {
  const offset = (page - 1) * limit;

  // Build where clause
  const where = {};

  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
      { short_description: { [Op.like]: `%${search}%` } }
    ];
  }

  if (productCategoryId) {
    where.product_category_id = productCategoryId;
  }

  if (status) {
    where.status = status;
  }

  if (isFeatured !== null) {
    where.is_featured = isFeatured;
  }

  const { count, rows } = await Product.findAndCountAll({
    where,
    limit,
    offset,
    order: [['sort_order', 'ASC'], ['created_at', 'DESC']],
    include: [
      {
        model: ProductCategory,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      },
      {
        model: Media,
        as: 'featuredImage',
        attributes: ['id', 'filename', 'path', 'thumbnail_path', 'alt_text']
      },
      {
        model: ProductPrice,
        as: 'prices',
        where: { status: 'active' },
        required: false,
        order: [['is_default', 'DESC'], ['id', 'ASC']]
      }
    ]
  });

  return {
    products: rows,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit)
  };
};

/**
 * Find product by ID with relationships
 * @param {number} id - Product ID
 * @returns {Promise<Object>} - Product object
 * @throws {NotFoundError} - If product not found
 */
export const findById = async (id) => {
  const product = await Product.findByPk(id, {
    include: [
      {
        model: ProductCategory,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      },
      {
        model: Media,
        as: 'featuredImage',
        attributes: ['id', 'filename', 'path', 'thumbnail_path', 'alt_text']
      },
      {
        model: ProductPrice,
        as: 'prices',
        order: [['is_default', 'DESC'], ['id', 'ASC']]
      }
    ]
  });

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  return product;
};

/**
 * Find product by slug
 * @param {string} slug - Product slug
 * @returns {Promise<Object>} - Product object
 * @throws {NotFoundError} - If product not found
 */
export const findBySlug = async (slug) => {
  const product = await Product.findOne({
    where: { slug },
    include: [
      {
        model: ProductCategory,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      },
      {
        model: Media,
        as: 'featuredImage',
        attributes: ['id', 'filename', 'path', 'thumbnail_path', 'alt_text']
      },
      {
        model: ProductPrice,
        as: 'prices',
        where: { status: 'active' },
        required: false,
        order: [['is_default', 'DESC'], ['id', 'ASC']]
      }
    ]
  });

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  return product;
};

/**
 * Create new product with slug generation and price variants
 * @param {Object} data - Product data
 * @param {Array} prices - Array of price variant objects
 * @returns {Promise<Object>} - Created product
 */
export const create = async (data, prices = []) => {
  await validateProductCategory(data.product_category_id);

  // Generate unique slug from name
  const slug = await generateSlugFromTitle(data.name, slugExists);

  // Create product
  const product = await Product.create({
    ...data,
    slug
  });

  // Create price variants if provided
  if (prices && prices.length > 0) {
    // Ensure at least one price is default
    const hasDefault = prices.some(p => p.is_default);
    if (!hasDefault && prices.length > 0) {
      prices[0].is_default = true;
    }

    await ProductPrice.bulkCreate(
      prices.map(price => ({
        ...price,
        product_id: product.id
      }))
    );
  }

  // Fetch with relationships
  return findById(product.id);
};

/**
 * Update product with slug regeneration if name changes
 * @param {number} id - Product ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} - Updated product
 */
export const update = async (id, data) => {
  const product = await findById(id);

  if (Object.prototype.hasOwnProperty.call(data, 'product_category_id')) {
    await validateProductCategory(data.product_category_id);
  }

  // Regenerate slug if name changes and no custom slug provided
  if (data.name && data.name !== product.name && !data.slug) {
    data.slug = await generateSlugFromTitle(data.name, slugExists, id);
  }

  // If custom slug provided, check uniqueness
  if (data.slug && data.slug !== product.slug) {
    if (await slugExists(data.slug, id)) {
      throw new ValidationError('Slug already exists');
    }
  }

  // Validate gallery if provided
  if (data.gallery !== undefined) {
    if (data.gallery !== null && !Array.isArray(data.gallery)) {
      throw new ValidationError('Gallery must be an array of media IDs');
    }
  }

  await product.update(data);

  // Fetch with relationships
  return findById(product.id);
};

/**
 * Delete product (cascades to prices)
 * @param {number} id - Product ID
 * @returns {Promise<void>}
 */
export const deleteProduct = async (id) => {
  const product = await findById(id);
  await product.destroy();
};

/**
 * Add price variant to product
 * @param {number} productId - Product ID
 * @param {Object} priceData - Price variant data
 * @returns {Promise<Object>} - Created price variant
 */
export const addPriceVariant = async (productId, priceData) => {
  // Verify product exists
  await findById(productId);

  // If this is set as default, ensure only one default exists
  if (priceData.is_default) {
    await ProductPrice.update(
      { is_default: false },
      { where: { product_id: productId } }
    );
  } else {
    // If no default exists yet, make this one default
    const existingPrices = await ProductPrice.count({
      where: { product_id: productId }
    });
    if (existingPrices === 0) {
      priceData.is_default = true;
    }
  }

  const price = await ProductPrice.create({
    ...priceData,
    product_id: productId
  });

  return price;
};

/**
 * Update price variant
 * @param {number} productId - Product ID
 * @param {number} priceId - Price variant ID
 * @param {Object} priceData - Update data
 * @returns {Promise<Object>} - Updated price variant
 */
export const updatePriceVariant = async (productId, priceId, priceData) => {
  const price = await ProductPrice.findOne({
    where: {
      id: priceId,
      product_id: productId
    }
  });

  if (!price) {
    throw new NotFoundError('Price variant not found');
  }

  // If setting as default, unset other defaults
  if (priceData.is_default && !price.is_default) {
    await ProductPrice.update(
      { is_default: false },
      {
        where: {
          product_id: productId,
          id: { [Op.ne]: priceId }
        }
      }
    );
  }

  await price.update(priceData);
  return price;
};

/**
 * Delete price variant
 * @param {number} productId - Product ID
 * @param {number} priceId - Price variant ID
 * @returns {Promise<void>}
 */
export const deletePriceVariant = async (productId, priceId) => {
  const price = await ProductPrice.findOne({
    where: {
      id: priceId,
      product_id: productId
    }
  });

  if (!price) {
    throw new NotFoundError('Price variant not found');
  }

  const wasDefault = price.is_default;
  await price.destroy();

  // If deleted price was default, set another price as default
  if (wasDefault) {
    const remainingPrice = await ProductPrice.findOne({
      where: { product_id: productId },
      order: [['id', 'ASC']]
    });

    if (remainingPrice) {
      await remainingPrice.update({ is_default: true });
    }
  }
};

/**
 * Get product statistics
 * @returns {Promise<Object>} - Statistics
 */
export const getStats = async () => {
  const total = await Product.count();

  const byStatus = await Product.findAll({
    attributes: [
      'status',
      [Product.sequelize.fn('COUNT', Product.sequelize.col('id')), 'count']
    ],
    group: ['status']
  });

  const featured = await Product.count({ where: { is_featured: true } });
  const published = await Product.count({ where: { status: 'published' } });

  return {
    total,
    byStatus: byStatus.map(s => ({
      status: s.status,
      count: parseInt(s.get('count'))
    })),
    featured,
    published
  };
};

export default {
  findAll,
  findById,
  findBySlug,
  create,
  update,
  deleteProduct,
  addPriceVariant,
  updatePriceVariant,
  deletePriceVariant,
  getStats
};
