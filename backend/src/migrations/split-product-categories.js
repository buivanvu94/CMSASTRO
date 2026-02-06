import sequelize from '../config/database.js';

const ensureProductCategoryColumn = async (queryInterface, transaction) => {
  const table = await queryInterface.describeTable('products');

  if (!table.product_category_id) {
    await queryInterface.addColumn(
      'products',
      'product_category_id',
      {
        type: sequelize.Sequelize.INTEGER,
        allowNull: true
      },
      { transaction }
    );
  }
};

const createProductCategoriesTable = async (transaction) => {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS product_categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      parent_id INT NULL,
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(120) NOT NULL UNIQUE,
      description TEXT NULL,
      image_id INT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
      seo_title VARCHAR(70) NULL,
      seo_description VARCHAR(160) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_product_categories_parent_id (parent_id),
      INDEX idx_product_categories_status (status),
      INDEX idx_product_categories_sort_order (sort_order),
      CONSTRAINT fk_product_categories_parent_id FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE SET NULL,
      CONSTRAINT fk_product_categories_image_id FOREIGN KEY (image_id) REFERENCES media(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `, { transaction });
};

const migrateProductCategories = async (transaction) => {
  await sequelize.query(`
    INSERT INTO product_categories (id, parent_id, name, slug, description, image_id, sort_order, status, seo_title, seo_description, created_at, updated_at)
    SELECT c.id, c.parent_id, c.name, c.slug, c.description, c.image_id, c.sort_order, c.status, c.seo_title, c.seo_description, c.created_at, c.updated_at
    FROM categories c
    WHERE c.type = 'product'
    ON DUPLICATE KEY UPDATE
      parent_id = VALUES(parent_id),
      name = VALUES(name),
      slug = VALUES(slug),
      description = VALUES(description),
      image_id = VALUES(image_id),
      sort_order = VALUES(sort_order),
      status = VALUES(status),
      seo_title = VALUES(seo_title),
      seo_description = VALUES(seo_description),
      updated_at = VALUES(updated_at);
  `, { transaction });
};

const mapProductToProductCategory = async (transaction) => {
  await sequelize.query(`
    UPDATE products p
    INNER JOIN categories c ON c.id = p.category_id AND c.type = 'product'
    SET p.product_category_id = c.id
    WHERE p.product_category_id IS NULL;
  `, { transaction });
};

const addForeignKeyAndIndex = async (transaction) => {
  await sequelize.query(`
    CREATE INDEX IF NOT EXISTS idx_products_product_category_id ON products(product_category_id);
  `, { transaction });

  const [existingFk] = await sequelize.query(`
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'products'
      AND COLUMN_NAME = 'product_category_id'
      AND REFERENCED_TABLE_NAME = 'product_categories'
    LIMIT 1;
  `, { transaction });

  if (!existingFk.length) {
    await sequelize.query(`
      ALTER TABLE products
      ADD CONSTRAINT fk_products_product_category_id
      FOREIGN KEY (product_category_id) REFERENCES product_categories(id)
      ON DELETE SET NULL;
    `, { transaction });
  }
};

const run = async () => {
  const queryInterface = sequelize.getQueryInterface();
  const transaction = await sequelize.transaction();

  try {
    await ensureProductCategoryColumn(queryInterface, transaction);
    await createProductCategoriesTable(transaction);
    await migrateProductCategories(transaction);
    await mapProductToProductCategory(transaction);
    await addForeignKeyAndIndex(transaction);

    await transaction.commit();
    console.log('Product categories migration completed successfully');
  } catch (error) {
    await transaction.rollback();
    console.error('Product categories migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

run();
