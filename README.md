# CBL Sales Orders

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
- **Hot Reloading**: Automatic server restart on code changes
- **Material-UI**: Professional, modern interface
- **Sidebar Navigation**: Easy access to Dashboard, New Orders, and Placed Orders

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

**Using Docker (Recommended):**
```bash
# Deploy manually:
docker-compose up -d --build
```

**Access Points:**
- Frontend: http://localhost (main application)
- Backend API: http://localhost:3002 (API endpoints only)
- Database: localhost:3307

**For Local Development (without Docker):**
```bash
# Install all dependencies
npm run install:all

# Start backend (in one terminal)
npm run dev:backend

# Start frontend (in another terminal)
npm run start:frontend

# Or start both together
npm run start:all
```

**Access Points for Local Dev:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### 4. Stop the Application

**If using Docker:**
```bash
docker-compose down
```

**If using local development:**
Press Ctrl+C in each terminal window

## Database Configuration

**For Docker:**
- Database: `cbl_so`
- Username: `cbl_so_user`
- Password: `cbl_so_password`
- Host: `localhost`
- Port: `3307`

**For Local Development:**
- Database: `cbl_so`
- Username: `root`
- Password: `#lme11@@`
- Host: `localhost`
- Port: `3306`

## API Endpoints

- `GET /api/order-types` - Get all order types
- `GET /api/warehouses` - Get all warehouses
- `GET /api/dealers` - Get all dealers
- `GET /api/products` - Get all products
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders

## Additional Resources

- **Database:** Schema is automatically created from `database.sql` in Docker setup
- **Development Tools:** See `project_tools_deletable/` folder for deployment scripts, test tools, and documentation (optional, can be deleted)

