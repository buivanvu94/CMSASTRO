// Simple script to create admin user via API
const http = require('http');

const data = JSON.stringify({
  email: 'buivuit@gmail.com',
  password: 'Buivanvu@#999',
  full_name: 'Bui Van Vu',
  role: 'admin'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/v1/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response:', responseData);
    
    if (res.statusCode === 201 || res.statusCode === 200) {
      console.log('');
      console.log('✅ Admin user created successfully!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email: buivuit@gmail.com');
      console.log('🔑 Password: Buivanvu@#999');
      console.log('👤 Role: admin');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      console.log('🎉 You can now login at http://localhost:4322/login');
    } else {
      console.log('');
      console.log('⚠️  Error creating user. User may already exist.');
      console.log('Try logging in with: buivuit@gmail.com / Buivanvu@#999');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
  console.log('');
  console.log('Make sure backend server is running on http://localhost:5000');
});

req.write(data);
req.end();
