import sequelize from './src/config/database.js';
import User from './src/modules/users/user.model.js';
import bcrypt from 'bcryptjs';

/**
 * Check if admin user exists and create if not
 */
async function checkAndCreateAdmin() {
  try {
    console.log('🔍 Checking database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Check if admin user exists
    const adminEmail = 'buivuit@gmail.com';
    console.log(`\n🔍 Checking if admin user exists: ${adminEmail}`);
    
    let adminUser = await User.findOne({ where: { email: adminEmail } });

    if (adminUser) {
      console.log('✅ Admin user already exists!');
      console.log('\n📋 User Details:');
      console.log(`   ID: ${adminUser.id}`);
      console.log(`   Name: ${adminUser.full_name}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   Status: ${adminUser.status}`);
      console.log(`   Created: ${adminUser.created_at}`);
    } else {
      console.log('❌ Admin user not found. Creating...');
      
      // Hash password
      const password = 'Buivanvu@#999';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create admin user
      adminUser = await User.create({
        full_name: 'Bui Van Vu',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        status: 'active'
      });

      console.log('✅ Admin user created successfully!');
      console.log('\n📋 User Details:');
      console.log(`   ID: ${adminUser.id}`);
      console.log(`   Name: ${adminUser.full_name}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   Status: ${adminUser.status}`);
    }

    console.log('\n🎉 Login Credentials:');
    console.log(`   Email: buivuit@gmail.com`);
    console.log(`   Password: Buivanvu@#999`);
    console.log(`   Login URL: http://localhost:4322/login`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.original) {
      console.error('   Database Error:', error.original.message);
    }
  } finally {
    await sequelize.close();
    console.log('\n👋 Database connection closed');
  }
}

// Run the script
checkAndCreateAdmin();
