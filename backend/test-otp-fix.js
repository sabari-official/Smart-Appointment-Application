const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testOTPFlow() {
  try {
    console.log('\n========== OTP FLOW TEST ==========\n');

    // Test 1: Register a new user
    console.log('1. Testing Register Endpoint...');
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
      name: 'Test User',
      username: `testuser_${Date.now()}`,
      email: `testuser_${Date.now()}@example.com`,
      password: 'TestPassword123!',
      role: 'customer',
      termsAccepted: true,
    });

    console.log('✅ Register Success:', registerResponse.data.message);
    const testEmail = registerResponse.data.data.email;
    console.log(`   Email: ${testEmail}`);
    console.log(`   Message: ${registerResponse.data.message}\n`);

    // Test 2: Check if OTP was created in database
    console.log('2. Testing Resend OTP Endpoint...');
    const resendResponse = await axios.post(`${API_BASE_URL}/auth/resend-otp`, {
      email: testEmail,
    });

    console.log('✅ Resend OTP Success:', resendResponse.data.message);
    console.log(`   Expires In: ${resendResponse.data.expiresIn} seconds\n`);

    // Note: You'll need to get the actual OTP from your email or database
    // For testing, you can check the backend console logs in development mode
    console.log('✓ Note: Check backend console for actual OTP code');
    console.log('  OTP will be shown in format: [DEV] OTP for email: XXXXXX\n');

    // Test 3: Verify OTP (with a sample code - replace with actual OTP)
    console.log('3. Important Notes:');
    console.log('   - OTP Expiry: 5 minutes');
    console.log('   - OTP Length: 6 digits');
    console.log('   - To verify: Use the 6-digit code from the email or console\n');

    console.log('========== TESTS COMPLETED ==========\n');
    console.log('✅ Both register and resend-otp endpoints are working!');
    console.log('   Next step: Check your email for the 6-digit OTP code');
    console.log('   Then verify it using the frontend OTP verification form\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

testOTPFlow();
