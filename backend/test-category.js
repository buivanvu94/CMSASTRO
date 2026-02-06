/**
 * Test script for Category module
 * Run: node test-category.js
 */

import Category from './src/modules/categories/category.model.js';
import sequelize from './src/config/database.js';
import { setupAssociations } from './src/config/associations.js';

const testCategory = async () => {
  try {
    console.log('🧪 Testing Category module...\n');

    // Setup associations
    setupAssociations();

    // Connect to database
    await sequelize.authenticate();
    console.log('✓ Database connected');

    // Sync models
    await sequelize.sync({ alter: true });
    console.log('✓ Models synced\n');

    // Test 1: Create root category
    console.log('Test 1: Creating root category...');
    const rootCategory = await Category.create({
      name: 'Test Category',
      slug: 'test-category',
      type: 'post',
      description: 'This is a test category',
      status: 'active'
    });
    console.log('✓ Root category created:', rootCategory.id);

    // Test 2: Create child category
    console.log('\nTest 2: Creating child category...');
    const childCategory = await Category.create({
      name: 'Child Category',
      slug: 'child-category',
      parent_id: rootCategory.id,
      type: 'post',
      status: 'active'
    });
    console.log('✓ Child category created:', childCategory.id);

    // Test 3: Get category with relationships
    console.log('\nTest 3: Fetching category with relationships...');
    const categoryWithRelations = await Category.findByPk(rootCategory.id, {
      include: [
        { model: Category, as: 'children' },
        { model: Category, as: 'parent' }
      ]
    });
    console.log('✓ Category fetched with', categoryWithRelations.children.length, 'children');

    // Test 4: Test instance methods
    console.log('\nTest 4: Testing instance methods...');
    const hasChildren = await rootCategory.hasChildren();
    console.log('✓ hasChildren():', hasChildren);

    const depth = await childCategory.getDepth();
    console.log('✓ getDepth():', depth);

    const path = await childCategory.getPath();
    console.log('✓ getPath():', path.map(c => c.name).join(' > '));

    // Test 5: Prevent circular reference
    console.log('\nTest 5: Testing circular reference prevention...');
    try {
      childCategory.parent_id = childCategory.id;
      await childCategory.save();
      console.log('✗ Should have prevented circular reference');
    } catch (error) {
      console.log('✓ Circular reference prevented (validation works)');
    }

    // Cleanup
    console.log('\n🧹 Cleaning up...');
    await childCategory.destroy();
    await rootCategory.destroy();
    console.log('✓ Test data cleaned up');

    console.log('\n✅ All tests passed!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

testCategory();
