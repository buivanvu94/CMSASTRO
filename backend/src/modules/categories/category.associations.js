/**
 * Category Model Associations
 * Define relationships for Category model
 */

import Category from './category.model.js';
import Media from '../media/media.model.js';

/**
 * Setup Category associations
 * This is called from config/associations.js
 */
export const setupCategoryAssociations = () => {
  // Category self-reference (parent-child)
  Category.belongsTo(Category, {
    as: 'parent',
    foreignKey: 'parent_id',
    onDelete: 'SET NULL'
  });

  Category.hasMany(Category, {
    as: 'children',
    foreignKey: 'parent_id'
  });

  // Category <-> Media (image)
  Category.belongsTo(Media, {
    as: 'image',
    foreignKey: 'image_id',
    onDelete: 'SET NULL'
  });
};

export default setupCategoryAssociations;
