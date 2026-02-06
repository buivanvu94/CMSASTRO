/**
 * Reset Database Script
 * Drops all tables and recreates them from scratch
 */

import sequelize from './src/config/database.js';
import { setupAssociations } from './src/config/associations.js';

// Import all models to ensure they're registered
import './src/modules/users/user.model.js';
import './src/modules/media/media.model.js';
import './src/modules/categories/category.model.js';
import './src/modules/posts/post.model.js';
import './src/modules/products/product.model.js';
import './src/modules/products/product-price.model.js';

const resetDatabase = async () => {
  try {
    console.log('🔄 Starting database reset...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✓ Database connection established');
    
    // Setup associations
    setupAssociations();
    console.log('✓ Model associations configured');
    
    // Drop all tables
    console.log('🗑️  Dropping all tables...');
    await sequelize.drop();
    console.log('✓ All tables dropped');
    
    // Recreate all tables
    console.log('🔨 Creating all tables...');
    await sequelize.sync({ force: true });
    console.log('✓ All tables created successfully');
    
    console.log('✅ Database reset completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  }
};

resetDatabase();
