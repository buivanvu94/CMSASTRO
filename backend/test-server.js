/**
 * Test script to verify server can start
 * Run: node test-server.js
 */

import app from './src/app.js';

const PORT = 5001; // Use different port for testing

const server = app.listen(PORT, () => {
  console.log('✅ Server test successful!');
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Shutting down...');
  
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

server.on('error', (error) => {
  console.error('❌ Server test failed:', error);
  process.exit(1);
});
