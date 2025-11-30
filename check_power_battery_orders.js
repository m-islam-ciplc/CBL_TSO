const mysql = require('mysql2/promise');

async function checkPowerBatteryOrders() {
    try {
        // Create connection
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3307,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'cbl_so_root_password',
            database: process.env.DB_NAME || 'cbl_so'
        });

        console.log('Connected to database\n');

        // First, find the dealer ID for Power Battery
        const [dealers] = await connection.execute(
            `SELECT id, name, code FROM dealers WHERE name LIKE '%Power Battery%' OR name LIKE '%Power%Battery%'`
        );

        if (dealers.length === 0) {
            console.log('No dealer found with name containing "Power Battery"');
            console.log('\nTrying to find all dealers with "Power" in name...');
            const [allPower] = await connection.execute(
                `SELECT id, name, code FROM dealers WHERE name LIKE '%Power%' LIMIT 10`
            );
            if (allPower.length > 0) {
                console.log('Found dealers with "Power" in name:');
                allPower.forEach(d => console.log(`  - ID: ${d.id}, Name: ${d.name}, Code: ${d.code}`));
            }
            await connection.end();
            return;
        }

        console.log('Found dealer(s):');
        dealers.forEach(d => {
            console.log(`  - ID: ${d.id}, Name: ${d.name}, Code: ${d.code}`);
        });

        const dealerId = dealers[0].id;
        console.log(`\nUsing dealer ID: ${dealerId}\n`);

        // Get all orders for this dealer
        const [orders] = await connection.execute(
            `SELECT 
                o.order_id,
                o.id,
                DATE(o.created_at) as order_date,
                o.created_at,
                o.order_source,
                COUNT(oi.id) as item_count,
                SUM(oi.quantity) as total_quantity
            FROM orders o
            LEFT JOIN order_items oi ON o.order_id = oi.order_id
            WHERE o.dealer_id = ? AND o.order_source = 'dealer'
            GROUP BY o.order_id, o.id, DATE(o.created_at), o.created_at, o.order_source
            ORDER BY o.created_at DESC`,
            [dealerId]
        );

        console.log(`\nTotal Daily Demand Orders for Power Battery: ${orders.length}\n`);

        if (orders.length > 0) {
            console.log('Orders by date:');
            const ordersByDate = {};
            orders.forEach(order => {
                const date = order.order_date;
                if (!ordersByDate[date]) {
                    ordersByDate[date] = [];
                }
                ordersByDate[date].push(order);
            });

            Object.keys(ordersByDate).sort().reverse().forEach(date => {
                const dateOrders = ordersByDate[date];
                console.log(`\n📅 ${date}: ${dateOrders.length} order(s)`);
                dateOrders.forEach(order => {
                    console.log(`   - Order ID: ${order.order_id}, Items: ${order.item_count}, Total Qty: ${order.total_quantity}, Created: ${order.created_at}`);
                });
            });

            // Get distinct dates
            const [dates] = await connection.execute(
                `SELECT DISTINCT DATE(created_at) as order_date
                FROM orders
                WHERE dealer_id = ? AND order_source = 'dealer'
                ORDER BY order_date DESC`,
                [dealerId]
            );

            console.log(`\n\nDistinct dates with orders:`);
            dates.forEach(d => console.log(`  - ${d.order_date}`));

        } else {
            console.log('No orders found for this dealer');
        }

        await connection.end();
        console.log('\nDatabase connection closed');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkPowerBatteryOrders();

