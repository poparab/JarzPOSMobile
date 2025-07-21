const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

console.log('🔧 [SimpleTest] Configuration:');
console.log('📡 API_BASE_URL:', API_BASE_URL);
console.log('🔑 API_KEY:', API_KEY ? 'Set' : 'Missing');
console.log('🔐 API_SECRET:', API_SECRET ? 'Set' : 'Missing');

async function testCustomerSearch() {
  try {
    console.log('\n🧪 [SimpleTest] Testing customer search...');

    const authHeader = `token ${API_KEY}:${API_SECRET}`;
    console.log('🔐 Auth Header:', authHeader);

    // Test 1: Get all customers
    console.log('\n📋 Test 1: Get all customers');
    const allCustomersResponse = await axios.get(
      `${API_BASE_URL}/api/method/jarz_pos.api.customer.get_customers`,
      {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log(
      '✅ All customers response status:',
      allCustomersResponse.status,
    );
    console.log(
      '📊 All customers count:',
      allCustomersResponse.data?.message?.length || 0,
    );
    console.log(
      '👥 All customers data:',
      JSON.stringify(allCustomersResponse.data?.message, null, 2),
    );

    // Test 2: Search for specific customer
    console.log('\n🔍 Test 2: Search for "Abdelrahman"');
    const searchResponse = await axios.get(
      `${API_BASE_URL}/api/method/jarz_pos.api.customer.get_customers`,
      {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        params: {
          search: 'Abdelrahman',
        },
      },
    );

    console.log('✅ Search response status:', searchResponse.status);
    console.log(
      '📊 Search results count:',
      searchResponse.data?.message?.length || 0,
    );
    console.log(
      '🎯 Search results:',
      JSON.stringify(searchResponse.data?.message, null, 2),
    );

    // Test 3: Search with phone number
    console.log('\n📞 Test 3: Search for phone "01555070692"');
    const phoneSearchResponse = await axios.get(
      `${API_BASE_URL}/api/method/jarz_pos.api.customer.get_customers`,
      {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        params: {
          search: '01555070692',
        },
      },
    );

    console.log('✅ Phone search response status:', phoneSearchResponse.status);
    console.log(
      '📊 Phone search results count:',
      phoneSearchResponse.data?.message?.length || 0,
    );
    console.log(
      '📱 Phone search results:',
      JSON.stringify(phoneSearchResponse.data?.message, null, 2),
    );
  } catch (error) {
    console.error('❌ [SimpleTest] Error:', error.message);
    if (error.response) {
      console.error('📄 Response status:', error.response.status);
      console.error('📄 Response data:', error.response.data);
    }
  }
}

testCustomerSearch();
