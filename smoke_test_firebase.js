const axios = require('axios');

async function smokeTest() {
    console.log('🚀 Starting Firebase Migration Smoke Test...');
    try {
        // 1. Test Login
        console.log('--- Testing Login (Firestore Mock) ---');
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            username: 'admin@villagecraft.in',
            password: 'password123'
        });
        console.log('✅ Login Success:', loginRes.data.user.username, 'Role:', loginRes.data.user.role);
        const token = loginRes.data.token;

        // 2. Test Dashboard
        console.log('\n--- Testing Dashboard Stats ---');
        const dashRes = await axios.get('http://localhost:3000/api/dashboard', {
            headers: { 'x-session-token': token }
        });
        console.log('✅ Dashboard Stats:', JSON.stringify(dashRes.data.stats, null, 2));

        // 3. Test SOS
        console.log('\n--- Testing SOS Trigger ---');
        const sosRes = await axios.post('http://localhost:3000/api/sos', {
            type: 'Anxiety',
            location: 'Mumbai Central'
        }, { headers: { 'x-session-token': token } });
        console.log('✅ SOS Success:', sosRes.data.message);

        console.log('\n✨ ALL FIREBASE MOCK TESTS PASSED!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Smoke Test Failed:', err.response?.data || err.message);
        process.exit(1);
    }
}

smokeTest();
