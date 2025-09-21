#!/usr/bin/env node
const { apiClient } = require('./dist/client.js');

// Initialize API client
const client = apiClient;

async function testBackendConnection() {
  console.log('🔗 Testing Django backend connection...');

  try {
    // Test health endpoint
    const health = await client.get('/health/');
    console.log('✅ Health check:', health);

    // Test authentication endpoints exist
    console.log('\n🔐 Testing authentication endpoints...');

    try {
      // This should return 401/403 but confirm the endpoint exists
      await client.getCurrentUser();
      console.log('✅ Auth endpoints accessible');
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.log('✅ Auth endpoints working (401/403 expected without token)');
      } else {
        console.log('❌ Unexpected auth error:', error.message);
      }
    }

    console.log('\n🚀 Backend integration ready!');
    console.log('Next steps:');
    console.log('1. Test login with valid credentials');
    console.log('2. Test registration flow');
    console.log('3. Build frontend login forms');

  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure Django server is running: pnpm backend:dev');
    }
  }
}

testBackendConnection();