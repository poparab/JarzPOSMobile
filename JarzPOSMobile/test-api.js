// Quick API Test Script
const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

console.log('🔧 Testing ERPNext Customer API Endpoints');
console.log('📡 Base URL:', API_BASE_URL);
console.log('🔑 API Key:', API_KEY ? 'Set' : 'Missing');
console.log('🔐 API Secret:', API_SECRET ? 'Set' : 'Missing');

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: `token ${API_KEY}:${API_SECRET}`,
    'Content-Type': 'application/json',
  },
});

async function testCustomerSearch() {
  console.log('\n🔍 Testing Customer Search...');
  try {
    const response = await axiosInstance.get('/api/resource/Customer', {
      params: {
        fields: '["name", "customer_name", "mobile_no", "email_id"]',
        filters: '[]',
        limit_page_length: 5,
      },
    });

    console.log('✅ Customer Search Success');
    console.log('📊 Response Status:', response.status);
    console.log('📦 Data Count:', response.data?.data?.length || 0);

    if (response.data?.data?.length > 0) {
      console.log('👤 Sample Customer:', response.data.data[0]);
    }

    return response.data;
  } catch (error) {
    console.log('❌ Customer Search Failed');
    console.log('🚨 Error:', error.response?.data || error.message);
    return null;
  }
}

async function testCitiesAPI() {
  console.log('\n🏙️ Testing Cities API...');
  try {
    const response = await axiosInstance.get('/api/resource/City', {
      params: {
        fields: '["name"]',
        limit_page_length: 10,
      },
    });

    console.log('✅ Cities API Success');
    console.log('📊 Response Status:', response.status);
    console.log('📦 Cities Count:', response.data?.data?.length || 0);

    if (response.data?.data?.length > 0) {
      console.log(
        '🏙️ Sample Cities:',
        response.data.data.slice(0, 3).map((c) => c.name),
      );
    }

    return response.data;
  } catch (error) {
    console.log('❌ Cities API Failed');
    console.log('🚨 Error:', error.response?.data || error.message);
    return null;
  }
}

async function testCreateCustomer() {
  console.log('\n👤 Testing Create Customer...');

  const testCustomer = {
    customer_name: `Test Customer ${Date.now()}`,
    customer_type: 'Individual',
    mobile_no: '1234567890',
    email_id: `test${Date.now()}@example.com`,
  };

  try {
    const response = await axiosInstance.post(
      '/api/resource/Customer',
      testCustomer,
    );

    console.log('✅ Create Customer Success');
    console.log('📊 Response Status:', response.status);
    console.log('👤 Created Customer:', response.data?.data?.name);

    return response.data;
  } catch (error) {
    console.log('❌ Create Customer Failed');
    console.log('🚨 Error:', error.response?.data || error.message);
    return null;
  }
}

async function runAllTests() {
  console.log('🚀 Starting API Tests...\n');

  const results = {
    customerSearch: await testCustomerSearch(),
    citiesAPI: await testCitiesAPI(),
    createCustomer: await testCreateCustomer(),
  };

  console.log('\n📋 Test Results Summary:');
  console.log(
    '🔍 Customer Search:',
    results.customerSearch ? '✅ PASS' : '❌ FAIL',
  );
  console.log('🏙️ Cities API:', results.citiesAPI ? '✅ PASS' : '❌ FAIL');
  console.log(
    '👤 Create Customer:',
    results.createCustomer ? '✅ PASS' : '❌ FAIL',
  );

  const passCount = Object.values(results).filter((r) => r !== null).length;
  console.log(`\n🎯 Overall: ${passCount}/3 tests passed`);

  if (passCount === 3) {
    console.log('🎉 All APIs are working correctly!');
  } else {
    console.log(
      '⚠️ Some APIs need attention. Check ERPNext server and credentials.',
    );
  }
}

runAllTests().catch(console.error);
