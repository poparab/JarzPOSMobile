const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

async function testPhoneSearch() {
  try {
    console.log('📞 [PhoneTest] Testing phone number search...');

    const authHeader = `token ${API_KEY}:${API_SECRET}`;

    // Test different phone search patterns
    const phoneTests = [
      '01555070692', // Full number
      '01555', // Partial number
      '015', // Shorter partial
      '692', // End part
      '1555', // Middle part
    ];

    for (const phone of phoneTests) {
      console.log(`\n📱 Testing phone search: "${phone}"`);

      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/resource/Customer`,
          {
            headers: {
              Authorization: authHeader,
              'Content-Type': 'application/json',
            },
            params: {
              fields: '["name","customer_name","mobile_no"]',
              filters: `[["mobile_no","like","%${phone}%"]]`,
              limit_page_length: 10,
            },
          },
        );

        console.log(`✅ Response status: ${response.status}`);
        console.log(`📊 Results found: ${response.data?.data?.length || 0}`);

        if (response.data?.data?.length > 0) {
          console.log('📋 Results:');
          response.data.data.forEach((customer, index) => {
            console.log(
              `  ${index + 1}. ${customer.customer_name} - ${customer.mobile_no}`,
            );
          });
        } else {
          console.log('❌ No results found');
        }
      } catch (error) {
        console.error(`❌ Error searching for "${phone}":`, error.message);
      }
    }

    // Also test the combined search (name OR phone)
    console.log('\n🔍 Testing combined search (name OR phone):');
    const combinedResponse = await axios.get(
      `${API_BASE_URL}/api/resource/Customer`,
      {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        params: {
          fields: '["name","customer_name","mobile_no"]',
          filters: `[["customer_name","like","%01555%"],["mobile_no","like","%01555%"]]`,
          or_filters: 1,
          limit_page_length: 10,
        },
      },
    );

    console.log(`✅ Combined search status: ${combinedResponse.status}`);
    console.log(
      `📊 Combined results: ${combinedResponse.data?.data?.length || 0}`,
    );

    if (combinedResponse.data?.data?.length > 0) {
      console.log('📋 Combined Results:');
      combinedResponse.data.data.forEach((customer, index) => {
        console.log(
          `  ${index + 1}. ${customer.customer_name} - ${customer.mobile_no}`,
        );
      });
    }
  } catch (error) {
    console.error('❌ [PhoneTest] Error:', error.message);
    if (error.response) {
      console.error('📄 Response status:', error.response.status);
      console.error('📄 Response data:', error.response.data);
    }
  }
}

testPhoneSearch();
