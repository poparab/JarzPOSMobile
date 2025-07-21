const axios = require('axios');

// Test phone search with the ERPNext API directly
async function testPhoneSearch() {
  console.log('🔍 Testing phone search with ERPNext API...');

  const baseURL = 'http://192.168.1.7:8000';
  const authKey = '7eea8d8afec56b4:4695f21543bedd5';

  // Test phone search
  const phoneNumber = '01555';

  try {
    const response = await axios.get(`${baseURL}/api/resource/Customer`, {
      headers: {
        Authorization: `Basic ${Buffer.from(authKey).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      params: {
        fields:
          '["name","customer_name","mobile_no","customer_primary_address","customer_primary_contact","territory","customer_group"]',
        filters: `[["mobile_no","like","%${phoneNumber}%"]]`,
        limit_page_length: 20,
      },
    });

    console.log('✅ Phone search successful!');
    console.log('📊 Response status:', response.status);
    console.log(
      '📈 Number of customers found:',
      response.data.data?.length || 0,
    );

    if (response.data.data?.length > 0) {
      console.log('👤 Found customers:');
      response.data.data.forEach((customer, index) => {
        console.log(
          `  ${index + 1}. ${customer.customer_name} - ${customer.mobile_no}`,
        );
      });
    } else {
      console.log('ℹ️ No customers found with phone containing:', phoneNumber);
    }
  } catch (error) {
    console.error(
      '❌ Phone search failed:',
      error.response?.status,
      error.response?.statusText,
    );
    console.error('📄 Error details:', error.response?.data || error.message);
  }
}

// Test name search for comparison
async function testNameSearch() {
  console.log('\n🔍 Testing name search with ERPNext API...');

  const baseURL = 'http://192.168.1.7:8000';
  const authKey = '7eea8d8afec56b4:4695f21543bedd5';

  // Test name search
  const name = 'Abdelrahman';

  try {
    const response = await axios.get(`${baseURL}/api/resource/Customer`, {
      headers: {
        Authorization: `Basic ${Buffer.from(authKey).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      params: {
        fields:
          '["name","customer_name","mobile_no","customer_primary_address","customer_primary_contact","territory","customer_group"]',
        filters: `[["customer_name","like","%${name}%"]]`,
        limit_page_length: 20,
      },
    });

    console.log('✅ Name search successful!');
    console.log('📊 Response status:', response.status);
    console.log(
      '📈 Number of customers found:',
      response.data.data?.length || 0,
    );

    if (response.data.data?.length > 0) {
      console.log('👤 Found customers:');
      response.data.data.forEach((customer, index) => {
        console.log(
          `  ${index + 1}. ${customer.customer_name} - ${customer.mobile_no}`,
        );
      });
    }
  } catch (error) {
    console.error(
      '❌ Name search failed:',
      error.response?.status,
      error.response?.statusText,
    );
    console.error('📄 Error details:', error.response?.data || error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Testing Customer Search Fix\n');

  await testPhoneSearch();
  await testNameSearch();

  console.log('\n✅ Test completed!');
}

runTests().catch(console.error);
