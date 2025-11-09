const axios = require('axios');

(async () => {
  try {
    const res = await axios.get('http://localhost:3001/api/orders/range', {
      params: {
        startDate: '2025-11-09',
        endDate: '2025-11-09'
      }
    });
    console.log('Status:', res.status);
    console.log('Data:', res.data);
  } catch (err) {
    console.error('Error status:', err.response?.status);
    console.error('Error data:', err.response?.data || err.message);
  }
})();
