// Test Enhanced Search APIs
const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: `token ${API_KEY}:${API_SECRET}`,
    'Content-Type': 'application/json',
  },
});

async function testEnhancedSearchAPIs() {
  console.log('🚀 Testing Enhanced Customer Search APIs\n');

  // Test 1: Search by name
  console.log('👤 Test 1: Search customers by name...');
  try {
    const nameResponse = await axiosInstance.get(
      '/api/method/jarz_pos.api.customer.search_customers',
      {
        params: { name: 'Abdel' },
      },
    );
    console.log('✅ Name search success:', nameResponse.status);
    console.log('📊 Customers found:', nameResponse.data?.message?.length || 0);
    if (nameResponse.data?.message?.length > 0) {
      console.log(
        '👤 Sample result:',
        nameResponse.data.message[0].customer_name,
      );
    }
  } catch (error) {
    console.log(
      '❌ Name search failed:',
      error.response?.data || error.message,
    );
  }

  console.log('\n📞 Test 2: Search customers by phone...');
  try {
    const phoneResponse = await axiosInstance.get(
      '/api/method/jarz_pos.api.customer.search_customers',
      {
        params: { phone: '01555' },
      },
    );
    console.log('✅ Phone search success:', phoneResponse.status);
    console.log(
      '📊 Customers found:',
      phoneResponse.data?.message?.length || 0,
    );
    if (phoneResponse.data?.message?.length > 0) {
      console.log('📞 Sample result:', phoneResponse.data.message[0].mobile_no);
    }
  } catch (error) {
    console.log(
      '❌ Phone search failed:',
      error.response?.data || error.message,
    );
  }

  console.log('\n🔍 Test 3: Search with exact phone...');
  try {
    const exactPhoneResponse = await axiosInstance.get(
      '/api/method/jarz_pos.api.customer.search_customers',
      {
        params: { phone: '01555070692' },
      },
    );
    console.log('✅ Exact phone search success:', exactPhoneResponse.status);
    console.log(
      '📊 Customers found:',
      exactPhoneResponse.data?.message?.length || 0,
    );
    if (exactPhoneResponse.data?.message?.length > 0) {
      console.log(
        '📞 Found customer:',
        exactPhoneResponse.data.message[0].customer_name,
      );
    }
  } catch (error) {
    console.log(
      '❌ Exact phone search failed:',
      error.response?.data || error.message,
    );
  }

  console.log('\n✨ Enhanced search API tests completed!');
}

testEnhancedSearchAPIs().catch(console.error);
