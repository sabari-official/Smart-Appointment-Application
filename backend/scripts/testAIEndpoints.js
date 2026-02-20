/**
 * AI Service Testing Script
 * Tests all AI endpoints with example data
 * 
 * Usage: 
 * 1. Get a valid JWT token (login as customer, provider, or admin)
 * 2. Replace TOKEN and URLS below
 * 3. Run: node scripts/testAIEndpoints.js
 */

const axios = require('axios');

// ==========================================
// CONFIGURATION
// ==========================================
const API_BASE = 'http://localhost:5000/api';

// Replace with actual JWT tokens from login
const TOKENS = {
  customer: 'your_customer_jwt_token_here',
  provider: 'your_provider_jwt_token_here',
  admin: 'your_admin_jwt_token_here',
};

const PROVIDER_ID = 'actual_provider_id_here'; // Get from database

// ==========================================
// HELPER FUNCTION
// ==========================================
async function makeRequest(method, endpoint, data = null, role = 'customer') {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: {
        Authorization: `Bearer ${TOKENS[role]}`,
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      config.data = data;
    }

    console.log(`\n📡 ${method} ${endpoint}`);
    console.log('📤 Request:', JSON.stringify(data, null, 2) || 'No body');

    const response = await axios(config);
    console.log('✅ Status:', response.status);
    console.log('📥 Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return null;
  }
}

// ==========================================
// TEST CASES
// ==========================================
async function runTests() {
  console.log('═════════════════════════════════════════════');
  console.log('🧪 AI ENDPOINTS TESTING');
  console.log('═════════════════════════════════════════════\n');

  // Test 1: Chatbot
  console.log('\n🤖 TEST 1: CHATBOT');
  console.log('─────────────────────────────────────────────');
  await makeRequest('POST', '/ai/chat', {
    message: 'How do I book an appointment?'
  }, 'customer');

  // Test 2: Provider Recommendation
  console.log('\n\n🔍 TEST 2: PROVIDER RECOMMENDATION');
  console.log('─────────────────────────────────────────────');
  await makeRequest('GET', '/ai/recommend-provider?query=cardiologist', null, 'customer');

  // Test 3: Email Generation - Confirmed
  console.log('\n\n📧 TEST 3: EMAIL GENERATION (Confirmed)');
  console.log('─────────────────────────────────────────────');
  await makeRequest('POST', '/ai/generate-email', {
    userName: 'John Doe',
    providerName: 'Dr. Sarah Smith',
    date: '2024-01-20',
    time: '2:00 PM',
    action: 'confirmed'
  }, 'customer');

  // Test 4: Email Generation - Cancelled
  console.log('\n\n📧 TEST 4: EMAIL GENERATION (Cancelled)');
  console.log('─────────────────────────────────────────────');
  await makeRequest('POST', '/ai/generate-email', {
    userName: 'Jane Doe',
    providerName: 'Dr. Robert Johnson',
    date: '2024-01-20',
    time: '3:30 PM',
    action: 'cancelled'
  }, 'customer');

  // Test 5: Email Generation - Rescheduled
  console.log('\n\n📧 TEST 5: EMAIL GENERATION (Rescheduled)');
  console.log('─────────────────────────────────────────────');
  await makeRequest('POST', '/ai/generate-email', {
    userName: 'Bob Wilson',
    providerName: 'Dr. Emily Chen',
    date: '2024-02-15',
    time: '10:00 AM',
    action: 'rescheduled'
  }, 'customer');

  // Test 6: Keyword Generation (Provider Only)
  console.log('\n\n🏷️  TEST 6: KEYWORD GENERATION (Provider)');
  console.log('─────────────────────────────────────────────');
  await makeRequest('POST', '/ai/generate-keywords', {}, 'provider');

  // Test 7: Chatbot - Provider
  console.log('\n\n🤖 TEST 7: CHATBOT (Provider Role)');
  console.log('─────────────────────────────────────────────');
  await makeRequest('POST', '/ai/chat', {
    message: 'How do I manage my appointment slots?'
  }, 'provider');

  // Test 8: Performance Analysis (Admin Only)
  console.log('\n\n📊 TEST 8: PERFORMANCE ANALYSIS (Admin)');
  console.log('─────────────────────────────────────────────');
  // Replace PROVIDER_ID with actual provider ID
  await makeRequest('GET', `/ai/analyze-provider?providerId=${PROVIDER_ID}`, null, 'admin');

  // Test 9: Admin Chat
  console.log('\n\n💬 TEST 9: ADMIN CHAT (Admin)');
  console.log('─────────────────────────────────────────────');
  await makeRequest('POST', '/ai/admin-chat', {
    query: 'What is the average rating of all providers?'
  }, 'admin');

  // Test 10: Health Check
  console.log('\n\n❤️  TEST 10: HEALTH CHECK');
  console.log('─────────────────────────────────────────────');
  await makeRequest('GET', '/ai/health', null, 'customer');

  console.log('\n\n═════════════════════════════════════════════');
  console.log('✅ All tests completed!');
  console.log('═════════════════════════════════════════════\n');
}

// ==========================================
// MANUAL TEST HELPER
// ==========================================
async function testCustom() {
  console.log('\n🔧 CUSTOM TEST');
  console.log('─────────────────────────────────────────────');
  
  // Modify this section to test specific scenarios
  const result = await makeRequest('POST', '/ai/chat', {
    message: 'I need to book an urgent appointment'
  }, 'customer');
  
  console.log('\nTest completed!');
}

// ==========================================
// RUN
// ==========================================
if (process.argv[2] === 'custom') {
  testCustom();
} else {
  runTests();
}
