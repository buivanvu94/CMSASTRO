import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'cms_db',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: false,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
};

// Create Sequelize instance
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    pool: config.pool,
    define: config.define
  }
);

/**
 * Remove duplicated indexes produced by repeated alter-sync runs.
 * @returns {Promise<number>}
 */
const deduplicateIndexes = async () => {
  const [rows] = await sequelize.query(`
    SELECT
      TABLE_NAME,
      INDEX_NAME,
      NON_UNIQUE,
      INDEX_TYPE,
      GROUP_CONCAT(
        CONCAT(COALESCE(COLUMN_NAME, ''), ':', COALESCE(SUB_PART, 0))
        ORDER BY SEQ_IN_INDEX
        SEPARATOR ','
      ) AS index_signature
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND INDEX_NAME <> 'PRIMARY'
    GROUP BY TABLE_NAME, INDEX_NAME, NON_UNIQUE, INDEX_TYPE
  `);

  const grouped = new Map();
  for (const row of rows) {
    const key = `${row.TABLE_NAME}|${row.NON_UNIQUE}|${row.INDEX_TYPE}|${row.index_signature}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(row.INDEX_NAME);
  }

  const pickKeeper = (names) => {
    const named = names.filter((name) => /^idx_/.test(name));
    const stable = names.filter((name) => !/_\\d+$/.test(name));
    const pool = named.length > 0 ? named : (stable.length > 0 ? stable : names);
    return pool.sort((a, b) => a.length - b.length || a.localeCompare(b))[0];
  };

  const queryInterface = sequelize.getQueryInterface();
  let removed = 0;

  for (const [key, names] of grouped.entries()) {
    if (names.length <= 1) continue;

    const tableName = key.split('|')[0];
    const keep = pickKeeper(names);
    const duplicates = names.filter((name) => name !== keep);

    for (const indexName of duplicates) {
      try {
        await queryInterface.removeIndex(tableName, indexName);
        removed += 1;
      } catch (error) {
        console.warn(`Skip dropping index ${tableName}.${indexName}: ${error.message}`);
      }
    }
  }

  return removed;
};

/**
 * Test database connection
 * @returns {Promise<boolean>}
 */
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully');
    return true;
  } catch (error) {
    console.error('✗ Unable to connect to the database:', error.message);
    return false;
  }
};

/**
 * Sync database with models
 * Supports auto-migration when DB_SYNC_ALTER is enabled
 * @returns {Promise<void>}
 */
export const syncDatabase = async () => {
  try {
    // Setup model associations
    const { setupAssociations } = await import('./associations.js');
    setupAssociations();
    
    const shouldAlter = process.env.DB_SYNC_ALTER === 'true';
    const shouldForce = process.env.DB_SYNC_FORCE === 'true';
    
    if (shouldForce) {
      console.log('⚠️  FORCE MODE: Dropping and recreating all tables...');
      await sequelize.sync({ force: true });
      console.log('✓ Database recreated successfully');
    } else if (shouldAlter) {
      console.log('⚙ Synchronizing database schema (alter mode)...');
      await sequelize.sync({ alter: true });
      const removed = await deduplicateIndexes();
      if (removed > 0) {
        console.log(`Removed ${removed} duplicated indexes after alter sync`);
      }
      console.log('✓ Database schema synchronized successfully');
    } else {
      console.log('⚙ Checking database schema...');
      await sequelize.sync({ alter: false });
      console.log('✓ Database schema is up to date');
    }
  } catch (error) {
    console.error('✗ Database synchronization failed:', error.message);
    throw error;
  }
};

/**
 * Close database connection
 * @returns {Promise<void>}
 */
export const closeConnection = async () => {
  try {
    await sequelize.close();
    console.log('✓ Database connection closed');
  } catch (error) {
    console.error('✗ Error closing database connection:', error.message);
    throw error;
  }
};

export default sequelize;
