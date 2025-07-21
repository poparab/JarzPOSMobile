const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

async function checkDatabase() {
  try {
    console.log('🔍 [DatabaseCheck] Checking ERPNext database...');

    const authHeader = `token ${API_KEY}:${API_SECRET}`;

    // Check ERPNext standard Customer doctype directly
    console.log('\n📋 Checking ERPNext Customer doctype...');
    const erpCustomersResponse = await axios.get(
      `${API_BASE_URL}/api/resource/Customer`,
      {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        params: {
          fields: '["name","customer_name","mobile_no"]',
          limit_page_length: 20,
        },
      },
    );

    console.log(
      '✅ ERPNext Customer response status:',
      erpCustomersResponse.status,
    );
    console.log(
      '📊 ERPNext Customer count:',
      erpCustomersResponse.data?.data?.length || 0,
    );
    console.log(
      '👥 ERPNext Customers:',
      JSON.stringify(erpCustomersResponse.data?.data, null, 2),
    );

    // Check if there are any documents at all
    console.log('\n🔍 Checking for any customers with minimal filters...');
    const minimalResponse = await axios.get(
      `${API_BASE_URL}/api/resource/Customer`,
      {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        params: {
          fields: '["name"]',
          limit_page_length: 1,
        },
      },
    );

    console.log('✅ Minimal response status:', minimalResponse.status);
    console.log(
      '📊 Any customers exist:',
      minimalResponse.data?.data?.length > 0,
    );
  } catch (error) {
    console.error('❌ [DatabaseCheck] Error:', error.message);
    if (error.response) {
      console.error('📄 Response status:', error.response.status);
      console.error('📄 Response data:', error.response.data);
    }
  }
}

checkDatabase();
