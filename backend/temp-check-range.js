const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '#lme11@@',
    database: 'cbl_so'
  });
  const query = "SELECT o.order_id, DATE(o.created_at) as order_date FROM orders o WHERE DATE(o.created_at) BETWEEN ? AND ? ORDER BY o.created_at DESC";
  const [rows] = await conn.execute(query, ['2025-11-09', '2025-11-09']);
  console.log(rows);
  await conn.end();
})();
