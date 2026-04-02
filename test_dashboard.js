const axios = require('axios');

async function testDashboard() {
    try {
        const res = await axios.get('http://localhost:3000/api/dashboard');
        console.log('Success:', res.data);
    } catch (err) {
        console.error('Error Status:', err.response?.status);
        console.error('Error Data:', err.response?.data);
    }
}

testDashboard();
