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
