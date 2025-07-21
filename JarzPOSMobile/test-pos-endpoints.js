const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

async function testPosEndpoints() {
  try {
    console.log('🧪 [PosTest] Testing POS endpoints...');

    const authHeader = `token ${API_KEY}:${API_SECRET}`;

    // Test 1: Get POS Profiles
    console.log('\n📋 Test 1: Get POS Profiles');
    const profilesResponse = await axios.get(
      `${API_BASE_URL}/api/method/jarz_pos.api.pos.get_pos_profiles`,
      {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('✅ Profiles response status:', profilesResponse.status);
    console.log(
      '📊 Profiles data:',
      JSON.stringify(profilesResponse.data?.message, null, 2),
    );

    // Use first profile for testing products and bundles
    const profiles = profilesResponse.data?.message;
    if (profiles && profiles.length > 0) {
      const firstProfile =
        typeof profiles[0] === 'string' ? profiles[0] : profiles[0].name;
      console.log('🎯 Using profile for testing:', firstProfile);

      // Test 2: Get Products by Profile
      console.log('\n📦 Test 2: Get Products by Profile');
      const productsResponse = await axios.get(
        `${API_BASE_URL}/api/method/jarz_pos.api.pos.get_profile_products`,
        {
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/json',
          },
          params: {
            profile: firstProfile,
          },
        },
      );

      console.log('✅ Products response status:', productsResponse.status);
      console.log(
        '📊 Products count:',
        productsResponse.data?.message?.length || 0,
      );
      console.log(
        '📦 Products data:',
        JSON.stringify(productsResponse.data?.message?.slice(0, 3), null, 2),
      );

      // Test 3: Get Bundles by Profile
      console.log('\n🎁 Test 3: Get Bundles by Profile');
      const bundlesResponse = await axios.get(
        `${API_BASE_URL}/api/method/jarz_pos.api.pos.get_profile_bundles`,
        {
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/json',
          },
          params: {
            profile: firstProfile,
          },
        },
      );

      console.log('✅ Bundles response status:', bundlesResponse.status);
      console.log(
        '📊 Bundles count:',
        bundlesResponse.data?.message?.length || 0,
      );
      console.log(
        '🎁 Bundles data:',
        JSON.stringify(bundlesResponse.data?.message, null, 2),
      );
    } else {
      console.log('❌ No profiles found for testing');
    }
  } catch (error) {
    console.error('❌ [PosTest] Error:', error.message);
    if (error.response) {
      console.error('📄 Response status:', error.response.status);
      console.error('📄 Response data:', error.response.data);
    }
  }
}

testPosEndpoints();
