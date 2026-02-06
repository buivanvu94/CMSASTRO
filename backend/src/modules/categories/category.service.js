import { Op } from 'sequelize';
import Category from './category.model.js';
import Media from '../media/media.model.js';
import { NotFoundError, ValidationError } from '../../middlewares/errorHandler.js';
import { slugify, generateUniqueSlug as generateUniqueSlugUtil } from '../../utils/slug.js';

/**
 * Category Service
 * Business logic for category management with nested structure support
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
  const count = await Category.count({ where });
  return count > 0;
};

/**
 * Generate unique slug for category
 * @param {string} name - Category name
 * @param {number} excludeId - ID to exclude from uniqueness check
 * @returns {Promise<string>} - Unique slug
 */
const generateUniqueSlug = async (name, excludeId = null) => {
  const baseSlug = slugify(name);
  return generateUniqueSlugUtil(baseSlug, slugExists, excludeId);
};

/**
 * Get all descendant IDs of a category (recursive)
 * @param {number} categoryId - Category ID
 * @returns {Promise<Array<number>>} - Array of descendant IDs
 */
const getDescendants = async (categoryId) => {
  const descendants = [];
  
  const findChildren = async (parentId) => {
    const children = await Category.findAll({
      where: { parent_id: parentId },
      attributes: ['id']
    });
    
    for (const child of children) {
      descendants.push(child.id);
      await findChildren(child.id);
    }
  };

  await findChildren(categoryId);
  return descendants;
};

/**
 * Find all categories with pagination and filtering
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Categories and pagination info
 */
export const findAll = async ({
  page = 1,
  limit = 20,
  search = '',
  status = null,
  parentId = null
} = {}) => {
  const offset = (page - 1) * limit;
  
  // Build where clause
  const where = {};
  
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { slug: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } }
    ];
  }
  
  where.type = 'post';
  
  if (status) {
    where.status = status;
  }
  
  if (parentId !== null) {
    where.parent_id = parentId;
  }

  const { count, rows } = await Category.findAndCountAll({
    where,
    limit,
    offset,
    order: [['sort_order', 'ASC'], ['name', 'ASC']],
    include: [
      {
        model: Media,
        as: 'image',
        attributes: ['id', 'path', 'thumbnail_path', 'alt_text']
      },
      {
        model: Category,
        as: 'parent',
        attributes: ['id', 'name', 'slug']
      }
    ]
  });

  return {
    categories: rows,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit)
  };
};

/**
 * Find categories in tree structure
 * @param {string} type - Category type (post/product)
 * @returns {Promise<Array>} - Tree structure of categories
 */
export const findTree = async () => {

  const buildTree = async (parentId = null, depth = 0) => {
    const where = { parent_id: parentId };
    where.type = 'post';

    const categories = await Category.findAll({
      where,
      order: [['sort_order', 'ASC'], ['name', 'ASC']],
      include: [
        {
          model: Media,
          as: 'image',
          attributes: ['id', 'path', 'thumbnail_path', 'alt_text']
        }
      ]
    });

    const result = [];
    for (const category of categories) {
      const categoryData = category.toJSON();
      categoryData.depth = depth;
      categoryData.children = await buildTree(category.id, depth + 1);
      result.push(categoryData);
    }

    return result;
  };

  return buildTree(null, 0);
};

/**
 * Find category by ID
 * @param {number} id - Category ID
 * @returns {Promise<Object>} - Category object
 * @throws {NotFoundError} - If category not found
 */
export const findById = async (id) => {
  const category = await Category.findByPk(id, {
    include: [
      {
        model: Media,
        as: 'image',
        attributes: ['id', 'path', 'thumbnail_path', 'alt_text']
      },
      {
        model: Category,
        as: 'parent',
        attributes: ['id', 'name', 'slug']
      },
      {
        model: Category,
        as: 'children',
        attributes: ['id', 'name', 'slug', 'sort_order']
      }
    ]
  });

  if (!category) {
    throw new NotFoundError('Category not found');
  }
  if (category.type !== 'post') {
    throw new NotFoundError('Category not found');
  }

  return category;
};

/**
 * Find category by slug
 * @param {string} slug - Category slug
 * @returns {Promise<Object>} - Category object
 * @throws {NotFoundError} - If category not found
 */
export const findBySlug = async (slug) => {
  const category = await Category.findOne({
    where: { slug },
    include: [
      {
        model: Media,
        as: 'image',
        attributes: ['id', 'path', 'thumbnail_path', 'alt_text']
      },
      {
        model: Category,
        as: 'parent',
        attributes: ['id', 'name', 'slug']
      },
      {
        model: Category,
        as: 'children',
        attributes: ['id', 'name', 'slug', 'sort_order']
      }
    ]
  });

  if (!category) {
    throw new NotFoundError('Category not found');
  }
  if (category.type !== 'post') {
    throw new NotFoundError('Category not found');
  }

  return category;
};

/**
 * Create new category
 * @param {Object} data - Category data
 * @returns {Promise<Object>} - Created category
 */
export const create = async (data) => {
  data.type = 'post';

  // Generate slug if not provided
  if (!data.slug) {
    data.slug = await generateUniqueSlug(data.name);
  } else {
    // Validate slug uniqueness
    const existing = await Category.findOne({ where: { slug: data.slug } });
    if (existing) {
      throw new ValidationError('Slug already exists');
    }
  }

  // Validate parent exists
  if (data.parent_id) {
    const parent = await Category.findByPk(data.parent_id);
    if (!parent) {
      throw new ValidationError('Parent category not found');
    }
    
    // Validate parent has same type
    if (data.type && parent.type !== data.type) {
      throw new ValidationError('Parent category must have the same type');
    }
  }

  const category = await Category.create(data);
  return findById(category.id);
};

/**
 * Update category
 * @param {number} id - Category ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} - Updated category
 */
export const update = async (id, data) => {
  const category = await findById(id);
  data.type = 'post';

  // Generate new slug if name changed
  if (data.name && data.name !== category.name && !data.slug) {
    data.slug = await generateUniqueSlug(data.name, id);
  }

  // Validate slug uniqueness if provided
  if (data.slug && data.slug !== category.slug) {
    const existing = await Category.findOne({
      where: {
        slug: data.slug,
        id: { [Op.ne]: id }
      }
    });
    if (existing) {
      throw new ValidationError('Slug already exists');
    }
  }

  // Prevent circular reference
  if (data.parent_id !== undefined) {
    // Cannot be its own parent
    if (data.parent_id === id) {
      throw new ValidationError('Category cannot be its own parent');
    }
    
    // Check if new parent is not a descendant
    if (data.parent_id) {
      const descendants = await getDescendants(id);
      if (descendants.includes(data.parent_id)) {
        throw new ValidationError('Cannot set a descendant category as parent');
      }
      
      // Validate parent exists
      const parent = await Category.findByPk(data.parent_id);
      if (!parent) {
        throw new ValidationError('Parent category not found');
      }
      
      // Validate type consistency
      if (parent.type !== 'post') {
        throw new ValidationError('Parent category must have the same type');
      }
    }
  }

  await category.update(data);
  return findById(id);
};

/**
 * Delete category
 * Move children to parent before deletion
 * @param {number} id - Category ID
 * @returns {Promise<void>}
 */
export const deleteCategory = async (id) => {
  const category = await findById(id);
  
  // Move children to this category's parent
  await Category.update(
    { parent_id: category.parent_id },
    { where: { parent_id: id } }
  );

  await category.destroy();
};

/**
 * Reorder categories
 * @param {Array} items - Array of {id, sort_order, parent_id}
 * @returns {Promise<void>}
 */
export const reorder = async (items) => {
  const updates = items.map((item) =>
    Category.update(
      {
        sort_order: item.sort_order,
        parent_id: item.parent_id || null
      },
      { where: { id: item.id } }
    )
  );
  
  await Promise.all(updates);
};

/**
 * Get category statistics
 * @returns {Promise<Object>} - Statistics
 */
export const getStats = async () => {
  const total = await Category.count();
  
  const byType = await Category.findAll({
    attributes: [
      'type',
      [Category.sequelize.fn('COUNT', Category.sequelize.col('id')), 'count']
    ],
    group: ['type']
  });
  
  const byStatus = await Category.findAll({
    attributes: [
      'status',
      [Category.sequelize.fn('COUNT', Category.sequelize.col('id')), 'count']
    ],
    group: ['status']
  });
  
  return {
    total,
    byType: byType.map(t => ({
      type: t.type,
      count: parseInt(t.get('count'))
    })),
    byStatus: byStatus.map(s => ({
      status: s.status,
      count: parseInt(s.get('count'))
    }))
  };
};

export default {
  findAll,
  findTree,
  findById,
  findBySlug,
  create,
  update,
  deleteCategory,
  reorder,
  getStats
};
