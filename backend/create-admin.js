import sequelize from './src/config/database.js';
import User from './src/modules/users/user.model.js';
import bcrypt from 'bcryptjs';

async function createAdmin() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sync models
    await sequelize.sync();
    console.log('✅ Models synced');

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email: 'buivuit@gmail.com' }
    });

    if (existingUser) {
      console.log('⚠️  User already exists!');
      console.log('Email:', existingUser.email);
      console.log('Role:', existingUser.role);
      
      // Update to admin if not already
      if (existingUser.role !== 'admin') {
        existingUser.role = 'admin';
        await existingUser.save();
        console.log('✅ Updated user role to admin');
      }
      
      // Update password
      const hashedPassword = await bcrypt.hash('Buivanvu@#999', 10);
      existingUser.password = hashedPassword;
      await existingUser.save();
      console.log('✅ Password updated');
      
      console.log('');
      console.log('🎉 You can now login with:');
      console.log('   Email: buivuit@gmail.com');
      console.log('   Password: Buivanvu@#999');
      console.log('');
      
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Buivanvu@#999', 10);

    // Create new admin user
    const adminUser = await User.create({
      email: 'buivuit@gmail.com',
      password: hashedPassword,
      full_name: 'Bui Van Vu',
      role: 'admin',
      status: 'active'
    });

    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Name:', adminUser.full_name);
    console.log('🔑 Role:', adminUser.role);
    console.log('✅ Status:', adminUser.status);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('🎉 You can now login with:');
    console.log('   Email: buivuit@gmail.com');
    console.log('   Password: Buivanvu@#999');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createAdmin();
