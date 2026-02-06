import { Op } from 'sequelize';
import Post from './post.model.js';
import Category from '../categories/category.model.js';
import User from '../users/user.model.js';
import Media from '../media/media.model.js';
import { NotFoundError, ValidationError } from '../../middlewares/errorHandler.js';
import { generateSlugFromTitle } from '../../utils/slug.js';

/**
 * Post Service
 * Business logic for post management
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
  const count = await Post.count({ where });
  return count > 0;
};

/**
 * Find all posts with pagination, filtering, and role-based access
 * @param {Object} options - Query options
 * @param {Object} user - Current user (for role-based filtering)
 * @returns {Promise<Object>} - Posts and pagination info
 */
export const findAll = async ({
  page = 1,
  limit = 20,
  search = '',
  categoryId = null,
  status = null,
  isFeatured = null,
  authorId = null
} = {}, user = null) => {
  const offset = (page - 1) * limit;

  // Build where clause
  const where = {};

  // Role-based filtering
  if (user && user.role === 'author') {
    // Authors only see their own posts
    where.author_id = user.id;
  } else if (authorId) {
    // Admins/editors can filter by author
    where.author_id = authorId;
  }

  if (search) {
    where[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { content: { [Op.like]: `%${search}%` } },
      { excerpt: { [Op.like]: `%${search}%` } }
    ];
  }

  if (categoryId) {
    where.category_id = categoryId;
  }

  if (status) {
    where.status = status;
  }

  if (isFeatured !== null) {
    where.is_featured = isFeatured;
  }

  const { count, rows } = await Post.findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']],
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      },
      {
        model: User,
        as: 'author',
        attributes: ['id', 'full_name', 'email']
      },
      {
        model: Media,
        as: 'featuredImage',
        attributes: ['id', 'filename', 'path', 'thumbnail_path', 'alt_text']
      }
    ]
  });

  return {
    posts: rows,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit)
  };
};

/**
 * Find post by ID with relationships
 * @param {number} id - Post ID
 * @returns {Promise<Object>} - Post object
 * @throws {NotFoundError} - If post not found
 */
export const findById = async (id) => {
  const post = await Post.findByPk(id, {
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      },
      {
        model: User,
        as: 'author',
        attributes: ['id', 'full_name', 'email']
      },
      {
        model: Media,
        as: 'featuredImage',
        attributes: ['id', 'filename', 'path', 'thumbnail_path', 'alt_text']
      }
    ]
  });

  if (!post) {
    throw new NotFoundError('Post not found');
  }

  return post;
};

/**
 * Find post by slug
 * @param {string} slug - Post slug
 * @returns {Promise<Object>} - Post object
 * @throws {NotFoundError} - If post not found
 */
export const findBySlug = async (slug) => {
  const post = await Post.findOne({
    where: { slug },
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      },
      {
        model: User,
        as: 'author',
        attributes: ['id', 'full_name', 'email']
      },
      {
        model: Media,
        as: 'featuredImage',
        attributes: ['id', 'filename', 'path', 'thumbnail_path', 'alt_text']
      }
    ]
  });

  if (!post) {
    throw new NotFoundError('Post not found');
  }

  return post;
};

/**
 * Create new post with slug generation
 * @param {Object} data - Post data
 * @param {number} authorId - Author user ID
 * @returns {Promise<Object>} - Created post
 */
export const create = async (data, authorId) => {
  // Generate unique slug from title
  const slug = await generateSlugFromTitle(data.title, slugExists);

  // Create post
  const post = await Post.create({
    ...data,
    slug,
    author_id: authorId
  });

  // Fetch with relationships
  return findById(post.id);
};

/**
 * Update post with slug regeneration if title changes
 * @param {number} id - Post ID
 * @param {Object} data - Update data
 * @param {Object} user - Current user (for ownership check)
 * @returns {Promise<Object>} - Updated post
 */
export const update = async (id, data, user) => {
  const post = await findById(id);

  // Check ownership (authors can only edit their own posts)
  if (user.role === 'author' && post.author_id !== user.id) {
    throw new ValidationError('You can only edit your own posts');
  }

  // Regenerate slug if title changes and no custom slug provided
  if (data.title && data.title !== post.title && !data.slug) {
    data.slug = await generateSlugFromTitle(data.title, slugExists, id);
  }

  // If custom slug provided, check uniqueness
  if (data.slug && data.slug !== post.slug) {
    if (await slugExists(data.slug, id)) {
      throw new ValidationError('Slug already exists');
    }
  }

  await post.update(data);

  // Fetch with relationships
  return findById(post.id);
};

/**
 * Delete post
 * @param {number} id - Post ID
 * @param {Object} user - Current user (for ownership check)
 * @returns {Promise<void>}
 */
export const deletePost = async (id, user) => {
  const post = await findById(id);

  // Check ownership (authors can only delete their own posts)
  if (user.role === 'author' && post.author_id !== user.id) {
    throw new ValidationError('You can only delete your own posts');
  }

  await post.destroy();
};

/**
 * Update post status
 * @param {number} id - Post ID
 * @param {string} status - New status
 * @param {Object} user - Current user (for ownership check)
 * @returns {Promise<Object>} - Updated post
 */
export const updateStatus = async (id, status, user) => {
  const post = await findById(id);

  // Check ownership (authors can only update their own posts)
  if (user.role === 'author' && post.author_id !== user.id) {
    throw new ValidationError('You can only update your own posts');
  }

  await post.update({ status });

  // Fetch with relationships
  return findById(post.id);
};

/**
 * Get post statistics
 * @returns {Promise<Object>} - Statistics
 */
export const getStats = async () => {
  const total = await Post.count();

  const byStatus = await Post.findAll({
    attributes: [
      'status',
      [Post.sequelize.fn('COUNT', Post.sequelize.col('id')), 'count']
    ],
    group: ['status']
  });

  const featured = await Post.count({ where: { is_featured: true } });
  const published = await Post.count({ where: { status: 'published' } });

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
  deletePost,
  updateStatus,
  getStats
};
