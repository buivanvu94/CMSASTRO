import { Op } from 'sequelize';
import ProductCategory from './product-category.model.js';
import Media from '../media/media.model.js';
import { NotFoundError, ValidationError } from '../../middlewares/errorHandler.js';
import { slugify, generateUniqueSlug as generateUniqueSlugUtil } from '../../utils/slug.js';

const slugExists = async (slug, excludeId = null) => {
  const where = { slug };
  if (excludeId) {
    where.id = { [Op.ne]: excludeId };
  }
  const count = await ProductCategory.count({ where });
  return count > 0;
};

const generateUniqueSlug = async (name, excludeId = null) => {
  const baseSlug = slugify(name);
  return generateUniqueSlugUtil(baseSlug, slugExists, excludeId);
};

const getDescendants = async (categoryId) => {
  const descendants = [];

  const findChildren = async (parentId) => {
    const children = await ProductCategory.findAll({
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

export const findAll = async ({
  page = 1,
  limit = 20,
  search = '',
  status = null,
  parentId = null
} = {}) => {
  const offset = (page - 1) * limit;
  const where = {};

  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { slug: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } }
    ];
  }

  if (status) {
    where.status = status;
  }

  if (parentId !== null) {
    where.parent_id = parentId;
  }

  const { count, rows } = await ProductCategory.findAndCountAll({
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
        model: ProductCategory,
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

export const findTree = async () => {
  const buildTree = async (parentId = null, depth = 0) => {
    const categories = await ProductCategory.findAll({
      where: { parent_id: parentId },
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

export const findById = async (id) => {
  const category = await ProductCategory.findByPk(id, {
    include: [
      {
        model: Media,
        as: 'image',
        attributes: ['id', 'path', 'thumbnail_path', 'alt_text']
      },
      {
        model: ProductCategory,
        as: 'parent',
        attributes: ['id', 'name', 'slug']
      },
      {
        model: ProductCategory,
        as: 'children',
        attributes: ['id', 'name', 'slug', 'sort_order']
      }
    ]
  });

  if (!category) {
    throw new NotFoundError('Product category not found');
  }

  return category;
};

export const findBySlug = async (slug) => {
  const category = await ProductCategory.findOne({
    where: { slug },
    include: [
      {
        model: Media,
        as: 'image',
        attributes: ['id', 'path', 'thumbnail_path', 'alt_text']
      },
      {
        model: ProductCategory,
        as: 'parent',
        attributes: ['id', 'name', 'slug']
      },
      {
        model: ProductCategory,
        as: 'children',
        attributes: ['id', 'name', 'slug', 'sort_order']
      }
    ]
  });

  if (!category) {
    throw new NotFoundError('Product category not found');
  }

  return category;
};

export const create = async (data) => {
  if (!data.slug) {
    data.slug = await generateUniqueSlug(data.name);
  } else {
    const existing = await ProductCategory.findOne({ where: { slug: data.slug } });
    if (existing) {
      throw new ValidationError('Slug already exists');
    }
  }

  if (data.parent_id) {
    const parent = await ProductCategory.findByPk(data.parent_id);
    if (!parent) {
      throw new ValidationError('Parent category not found');
    }
  }

  const category = await ProductCategory.create(data);
  return findById(category.id);
};

export const update = async (id, data) => {
  const category = await findById(id);

  if (data.name && data.name !== category.name && !data.slug) {
    data.slug = await generateUniqueSlug(data.name, id);
  }

  if (data.slug && data.slug !== category.slug) {
    const existing = await ProductCategory.findOne({
      where: {
        slug: data.slug,
        id: { [Op.ne]: id }
      }
    });
    if (existing) {
      throw new ValidationError('Slug already exists');
    }
  }

  if (data.parent_id !== undefined) {
    if (data.parent_id === id) {
      throw new ValidationError('Category cannot be its own parent');
    }

    if (data.parent_id) {
      const descendants = await getDescendants(id);
      if (descendants.includes(data.parent_id)) {
        throw new ValidationError('Cannot set a descendant category as parent');
      }

      const parent = await ProductCategory.findByPk(data.parent_id);
      if (!parent) {
        throw new ValidationError('Parent category not found');
      }
    }
  }

  await category.update(data);
  return findById(id);
};

export const deleteCategory = async (id) => {
  const category = await findById(id);

  await ProductCategory.update(
    { parent_id: category.parent_id },
    { where: { parent_id: id } }
  );

  await category.destroy();
};

export const reorder = async (items) => {
  const updates = items.map((item) =>
    ProductCategory.update(
      {
        sort_order: item.sort_order,
        parent_id: item.parent_id || null
      },
      { where: { id: item.id } }
    )
  );

  await Promise.all(updates);
};

export const getStats = async () => {
  const total = await ProductCategory.count();

  const byStatus = await ProductCategory.findAll({
    attributes: [
      'status',
      [ProductCategory.sequelize.fn('COUNT', ProductCategory.sequelize.col('id')), 'count']
    ],
    group: ['status']
  });

  return {
    total,
    byStatus: byStatus.map((s) => ({
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
