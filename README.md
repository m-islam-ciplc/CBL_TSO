# CBL Sales Order

A simple sales order management system for CBL TSOs to place orders for batteries and associated products.

## Features

- TSO can create orders by selecting:
  - Order Type
  - Dealer Name
  - Warehouse
  - Product
  - Quantity
- Orders are saved with unique order IDs
- View recent orders
- Cross-platform support (Web, Mobile responsive)

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
1. Make sure MySQL is running
2. Import the database schema:
```bash
mysql -u root -p < database.sql
```

### 3. Run the Application
```bash
npm start
```

The application will be available at: http://localhost:3001

## Database Configuration

- Database: `cbl_ordres`
- Username: `root`
- Password: `#lme11@@`

## API Endpoints

- `GET /api/order-types` - Get all order types
- `GET /api/warehouses` - Get all warehouses
- `GET /api/dealers` - Get all dealers
- `GET /api/products` - Get all products
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders

## Initial Data

The system comes with initial data:
- Order Type: RO
- Warehouse: Narayanganj Factory
- Dealer: Kalam Enterprise
- Product: 6DGA-175T(H) Dimitris

