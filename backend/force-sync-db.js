/**
 * Force Sync Database
 * WARNING: This will drop all tables and recreate them
 */

import dotenv from 'dotenv';
dotenv.config();

import sequelize from './src/config/database.js';
import { setupAssociations } from './src/config/associations.js';

// Import models
import './src/modules/users/user.model.js';
import './src/modules/media/media.model.js';
import './src/modules/categories/category.model.js';
import './src/modules/posts/post.model.js';
import './src/modules/products/product.model.js';
import './src/modules/products/product-price.model.js';
import './src/modules/reservations/reservation.model.js';
import './src/modules/contacts/contact.model.js';
import './src/modules/menus/menu.model.js';
import './src/modules/menus/menu-item.model.js';
import './src/modules/settings/setting.model.js';

const forceSync = async () => {
  try {
    console.log('[INFO] Connecting to database...');
    await sequelize.authenticate();
    console.log('[INFO] ✓ Connected');
    
    console.log('[INFO] Setting up associations...');
    setupAssociations();
    console.log('[INFO] ✓ Associations configured');
    
    console.log('[WARN] ⚠️  This will DROP ALL TABLES and recreate them!');
    console.log('[INFO] Force syncing database...');
    
    await sequelize.sync({ force: true });
    
    console.log('[INFO] ✅ Database synced successfully!');
    console.log('[INFO] All tables have been recreated.');
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('[ERROR] ❌ Failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

forceSync();
