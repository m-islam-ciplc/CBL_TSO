const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API Routes only - no static file serving needed

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '#lme11@@',
    database: 'cbl_ordres'
});

// Connect to database first, then start server
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1); // Exit if database connection fails
    } else {
        console.log('Connected to MySQL database');

        // Start server only after database connection is established
        app.listen(PORT, () => {
            console.log(`CBL Sales Order server running on port ${PORT}`);
        });
    }
});

// Routes

// Get all order types
app.get('/api/order-types', (req, res) => {
    db.query('SELECT * FROM order_types', (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Get all warehouses
app.get('/api/warehouses', (req, res) => {
    db.query('SELECT * FROM warehouses', (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Get all dealers
app.get('/api/dealers', (req, res) => {
    db.query('SELECT * FROM dealers ORDER BY name', (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Get all products
app.get('/api/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Create new order
app.post('/api/orders', (req, res) => {
    const { order_type_id, dealer_id, warehouse_id, product_id, quantity } = req.body;
    const order_id = 'ORD-' + uuidv4().substring(0, 8).toUpperCase();
    
    const query = `
        INSERT INTO orders (order_id, order_type_id, dealer_id, warehouse_id, product_id, quantity) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    db.query(query, [order_id, order_type_id, dealer_id, warehouse_id, product_id, quantity], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ 
                success: true, 
                order_id: order_id,
                message: 'Order created successfully' 
            });
        }
    });
});

// Get all orders
app.get('/api/orders', (req, res) => {
    const query = `
        SELECT o.*, ot.name as order_type, d.name as dealer_name, d.territory_name as dealer_territory, w.name as warehouse_name, p.name as product_name
        FROM orders o
        JOIN order_types ot ON o.order_type_id = ot.id
        JOIN dealers d ON o.dealer_id = d.id
        JOIN warehouses w ON o.warehouse_id = w.id
        JOIN products p ON o.product_id = p.id
        ORDER BY o.created_at DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

