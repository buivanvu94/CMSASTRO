/**
 * Database Indexes Migration
 * Adds indexes to improve query performance
 */

const { sequelize } = require('../config/database');

async function addIndexes() {
  const queryInterface = sequelize.getQueryInterface();

  console.log('Adding database indexes...');

  try {
    // Users table indexes
    await queryInterface.addIndex('users', ['email'], {
      name: 'idx_users_email',
      unique: true,
    });
    await queryInterface.addIndex('users', ['role'], {
      name: 'idx_users_role',
    });
    await queryInterface.addIndex('users', ['status'], {
      name: 'idx_users_status',
    });

    // Categories table indexes
    await queryInterface.addIndex('categories', ['slug'], {
      name: 'idx_categories_slug',
      unique: true,
    });
    await queryInterface.addIndex('categories', ['parent_id'], {
      name: 'idx_categories_parent_id',
    });
    await queryInterface.addIndex('product_categories', ['slug'], {
      name: 'idx_product_categories_slug',
      unique: true,
    });
    await queryInterface.addIndex('product_categories', ['parent_id'], {
      name: 'idx_product_categories_parent_id',
    });

    // Posts table indexes
    await queryInterface.addIndex('posts', ['slug'], {
      name: 'idx_posts_slug',
      unique: true,
    });
    await queryInterface.addIndex('posts', ['category_id'], {
      name: 'idx_posts_category_id',
    });
    await queryInterface.addIndex('posts', ['author_id'], {
      name: 'idx_posts_author_id',
    });
    await queryInterface.addIndex('posts', ['status'], {
      name: 'idx_posts_status',
    });
    await queryInterface.addIndex('posts', ['published_at'], {
      name: 'idx_posts_published_at',
    });

    // Products table indexes
    await queryInterface.addIndex('products', ['slug'], {
      name: 'idx_products_slug',
      unique: true,
    });
    await queryInterface.addIndex('products', ['product_category_id'], {
      name: 'idx_products_product_category_id',
    });
    await queryInterface.addIndex('products', ['status'], {
      name: 'idx_products_status',
    });

    // Media table indexes
    await queryInterface.addIndex('media', ['type'], {
      name: 'idx_media_type',
    });
    await queryInterface.addIndex('media', ['folder'], {
      name: 'idx_media_folder',
    });
    await queryInterface.addIndex('media', ['uploader_id'], {
      name: 'idx_media_uploader_id',
    });

    // Reservations table indexes
    await queryInterface.addIndex('reservations', ['status'], {
      name: 'idx_reservations_status',
    });
    await queryInterface.addIndex('reservations', ['reservation_date'], {
      name: 'idx_reservations_date',
    });
    await queryInterface.addIndex('reservations', ['customer_email'], {
      name: 'idx_reservations_email',
    });

    // Contacts table indexes
    await queryInterface.addIndex('contacts', ['status'], {
      name: 'idx_contacts_status',
    });
    await queryInterface.addIndex('contacts', ['email'], {
      name: 'idx_contacts_email',
    });

    // Settings table indexes
    await queryInterface.addIndex('settings', ['key'], {
      name: 'idx_settings_key',
      unique: true,
    });
    await queryInterface.addIndex('settings', ['group'], {
      name: 'idx_settings_group',
    });

    // Menus table indexes
    await queryInterface.addIndex('menus', ['location'], {
      name: 'idx_menus_location',
      unique: true,
    });

    // Menu Items table indexes
    await queryInterface.addIndex('menu_items', ['menu_id'], {
      name: 'idx_menu_items_menu_id',
    });
    await queryInterface.addIndex('menu_items', ['parent_id'], {
      name: 'idx_menu_items_parent_id',
    });

    console.log('✓ All indexes added successfully');
  } catch (error) {
    console.error('Error adding indexes:', error.message);
    // Some indexes might already exist, continue anyway
  }
}

async function removeIndexes() {
  const queryInterface = sequelize.getQueryInterface();

  console.log('Removing database indexes...');

  const indexes = [
    { table: 'users', name: 'idx_users_email' },
    { table: 'users', name: 'idx_users_role' },
    { table: 'users', name: 'idx_users_status' },
    { table: 'categories', name: 'idx_categories_slug' },
    { table: 'categories', name: 'idx_categories_parent_id' },
    { table: 'posts', name: 'idx_posts_slug' },
    { table: 'posts', name: 'idx_posts_category_id' },
    { table: 'posts', name: 'idx_posts_author_id' },
    { table: 'posts', name: 'idx_posts_status' },
    { table: 'posts', name: 'idx_posts_published_at' },
    { table: 'products', name: 'idx_products_slug' },
    { table: 'product_categories', name: 'idx_product_categories_slug' },
    { table: 'product_categories', name: 'idx_product_categories_parent_id' },
    { table: 'products', name: 'idx_products_product_category_id' },
    { table: 'products', name: 'idx_products_status' },
    { table: 'media', name: 'idx_media_type' },
    { table: 'media', name: 'idx_media_folder' },
    { table: 'media', name: 'idx_media_uploader_id' },
    { table: 'reservations', name: 'idx_reservations_status' },
    { table: 'reservations', name: 'idx_reservations_date' },
    { table: 'reservations', name: 'idx_reservations_email' },
    { table: 'contacts', name: 'idx_contacts_status' },
    { table: 'contacts', name: 'idx_contacts_email' },
    { table: 'settings', name: 'idx_settings_key' },
    { table: 'settings', name: 'idx_settings_group' },
    { table: 'menus', name: 'idx_menus_location' },
    { table: 'menu_items', name: 'idx_menu_items_menu_id' },
    { table: 'menu_items', name: 'idx_menu_items_parent_id' },
  ];

  for (const { table, name } of indexes) {
    try {
      await queryInterface.removeIndex(table, name);
    } catch (error) {
      // Index might not exist, continue
    }
  }

  console.log('✓ All indexes removed');
}

// Run if called directly
if (require.main === module) {
  addIndexes()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { addIndexes, removeIndexes };
