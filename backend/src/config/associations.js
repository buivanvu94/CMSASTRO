/**
 * Model Associations
 * Define relationships between models
 */

import User from '../modules/users/user.model.js';
import Media from '../modules/media/media.model.js';
import Category from '../modules/categories/category.model.js';
import ProductCategory from '../modules/product-categories/product-category.model.js';
import Post from '../modules/posts/post.model.js';
import Product from '../modules/products/product.model.js';
import ProductPrice from '../modules/products/product-price.model.js';
import Reservation from '../modules/reservations/reservation.model.js';
import ReservationReminderLog from '../modules/reservations/reservation-reminder-log.model.js';
import Menu from '../modules/menus/menu.model.js';
import MenuItem from '../modules/menus/menu-item.model.js';

/**
 * Setup all model associations
 */
export const setupAssociations = () => {
  // User <-> Media (avatar)
  User.belongsTo(Media, {
    as: 'avatar',
    foreignKey: 'avatar_id',
    onDelete: 'SET NULL'
  });

  // Media <-> User (uploader)
  Media.belongsTo(User, {
    as: 'uploader',
    foreignKey: 'uploaded_by',
    onDelete: 'SET NULL'
  });
  User.hasMany(Media, {
    as: 'uploads',
    foreignKey: 'uploaded_by'
  });

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

  // Post <-> Category
  Post.belongsTo(Category, {
    as: 'category',
    foreignKey: 'category_id',
    onDelete: 'SET NULL'
  });
  Category.hasMany(Post, {
    as: 'posts',
    foreignKey: 'category_id'
  });

  // Post <-> User (author)
  Post.belongsTo(User, {
    as: 'author',
    foreignKey: 'author_id',
    onDelete: 'CASCADE'
  });
  User.hasMany(Post, {
    as: 'posts',
    foreignKey: 'author_id'
  });

  // Post <-> Media (featured image)
  Post.belongsTo(Media, {
    as: 'featuredImage',
    foreignKey: 'featured_image_id',
    onDelete: 'SET NULL'
  });

  // Product <-> Category
  ProductCategory.belongsTo(ProductCategory, {
    as: 'parent',
    foreignKey: 'parent_id',
    onDelete: 'SET NULL'
  });
  ProductCategory.hasMany(ProductCategory, {
    as: 'children',
    foreignKey: 'parent_id'
  });

  ProductCategory.belongsTo(Media, {
    as: 'image',
    foreignKey: 'image_id',
    onDelete: 'SET NULL'
  });

  Product.belongsTo(ProductCategory, {
    as: 'category',
    foreignKey: 'product_category_id',
    onDelete: 'SET NULL'
  });
  ProductCategory.hasMany(Product, {
    as: 'products',
    foreignKey: 'product_category_id'
  });

  // Product <-> Media (featured image)
  Product.belongsTo(Media, {
    as: 'featuredImage',
    foreignKey: 'featured_image_id',
    onDelete: 'SET NULL'
  });

  // Product <-> ProductPrice
  Product.hasMany(ProductPrice, {
    as: 'prices',
    foreignKey: 'product_id',
    onDelete: 'CASCADE'
  });
  ProductPrice.belongsTo(Product, {
    as: 'product',
    foreignKey: 'product_id',
    onDelete: 'CASCADE'
  });

  // Reservation <-> User (handler)
  Reservation.belongsTo(User, {
    as: 'handler',
    foreignKey: 'handler_id',
    onDelete: 'SET NULL'
  });
  User.hasMany(Reservation, {
    as: 'handledReservations',
    foreignKey: 'handler_id'
  });

  // Reservation <-> Reminder logs
  Reservation.hasMany(ReservationReminderLog, {
    as: 'reminderLogs',
    foreignKey: 'reservation_id',
    onDelete: 'CASCADE'
  });
  ReservationReminderLog.belongsTo(Reservation, {
    as: 'reservation',
    foreignKey: 'reservation_id',
    onDelete: 'CASCADE'
  });

  // Menu <-> MenuItem
  Menu.hasMany(MenuItem, {
    as: 'items',
    foreignKey: 'menu_id',
    onDelete: 'CASCADE'
  });
  MenuItem.belongsTo(Menu, {
    as: 'menu',
    foreignKey: 'menu_id',
    onDelete: 'CASCADE'
  });

  // MenuItem self-reference (parent-child)
  MenuItem.belongsTo(MenuItem, {
    as: 'parent',
    foreignKey: 'parent_id',
    onDelete: 'CASCADE'
  });
  MenuItem.hasMany(MenuItem, {
    as: 'children',
    foreignKey: 'parent_id'
  });

  console.log('✓ Model associations configured');
};

export default setupAssociations;
