
import axios from 'axios';

async function testOrders() {
    try {
        // We need a token. Let's assume the user is logged in locally or we can't test easily without one.
        // But I can check if the endpoint exists.
        const response = await axios.get('http://localhost:8081/api/v1/orders');
        console.log('Response:', response.data);
    } catch (error) {
        console.log('Error status:', error.response?.status);
        console.log('Error data:', error.response?.data);
    }
}

testOrders();
