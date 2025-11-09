const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '#lme11@@',
      database: 'cbl_so'
    });

    const [stats] = await conn.query('SELECT COUNT(*) AS count, MIN(created_at) AS min_date, MAX(created_at) AS max_date FROM orders');
    console.log('Order stats:', stats);

    const [recent] = await conn.query('SELECT order_id, created_at FROM orders ORDER BY created_at DESC LIMIT 5');
    console.log('Recent orders:', recent);

    await conn.end();
  } catch (error) {
    console.error('Error querying orders:', error);
  }
})();
