const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

// Phone number detection logic (same as frontend)
const isPhoneNumber = (input) => {
  return /^[\d\s+\-()]+$/.test(input.trim());
};

async function testImprovedSearch() {
  try {
    console.log('🧪 [ImprovedTest] Testing improved search logic...');

    const authHeader = `token ${API_KEY}:${API_SECRET}`;

    const testQueries = [
      { query: 'Abdelrahman', expectedType: 'name' },
      { query: 'Abd', expectedType: 'name' },
      { query: '01555070692', expectedType: 'phone' },
      { query: '01555', expectedType: 'phone' },
      { query: '015', expectedType: 'phone' },
      { query: '692', expectedType: 'phone' },
      { query: 'mamdouh', expectedType: 'name' },
      { query: '01144460545', expectedType: 'phone' },
    ];

    for (const test of testQueries) {
      const { query, expectedType } = test;
      const isPhone = isPhoneNumber(query);
      const detectedType = isPhone ? 'phone' : 'name';

      console.log(`\n🔍 Testing: "${query}"`);
      console.log(
        `📱 Detected as: ${detectedType} (expected: ${expectedType})`,
      );
      console.log(
        `✅ Detection correct: ${detectedType === expectedType ? 'YES' : 'NO'}`,
      );

      try {
        const filterField = isPhone ? 'mobile_no' : 'customer_name';
        const response = await axios.get(
          `${API_BASE_URL}/api/resource/Customer`,
          {
            headers: {
              Authorization: authHeader,
              'Content-Type': 'application/json',
            },
            params: {
              fields: '["name","customer_name","mobile_no"]',
              filters: `[["${filterField}","like","%${query}%"]]`,
              limit_page_length: 10,
            },
          },
        );

        console.log(`📊 Results found: ${response.data?.data?.length || 0}`);

        if (response.data?.data?.length > 0) {
          response.data.data.forEach((customer, index) => {
            console.log(
              `  ${index + 1}. ${customer.customer_name} - ${customer.mobile_no || 'No phone'}`,
            );
          });
        }
      } catch (error) {
        console.error(`❌ Error: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('❌ [ImprovedTest] Error:', error.message);
  }
}

testImprovedSearch();
