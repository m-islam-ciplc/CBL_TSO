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
- Frontend: http://localhost:5002 (main application - non-default port)
- Backend API: http://localhost:5001 (API endpoints only - non-default port)
- Database: localhost:3307 (non-default port to avoid conflict with system MySQL)

**Note:** To use a custom frontend port (e.g., to avoid conflicts), set the `FRONTEND_PORT` environment variable:
```bash
# Windows PowerShell
$env:FRONTEND_PORT="8080"; docker-compose up -d

# Linux/Mac
FRONTEND_PORT=8080 docker-compose up -d
```

**For Local Development (without Docker):**
```bash
# Install all dependencies
npm run install:all

# Start backend (in one terminal)
# If your MySQL is on default port 3306, use:
DB_PORT=3306 npm run dev:backend

# Or if MySQL is on port 3307:
DB_PORT=3307 npm run dev:backend

# Start frontend (in another terminal)
npm run start:frontend

# Or start both together (with MySQL on 3306):
DB_PORT=3306 npm run start:all
```

**Note:** 
- The backend defaults to port **3307** to match Docker, but you can override with `DB_PORT` environment variable
- If your local MySQL is on the default port **3306**, use `DB_PORT=3306` when starting the backend
- For MySQL Workbench, connect to the port your MySQL server is actually using (usually 3306 for local MySQL)

**Access Points for Local Dev:**
- Frontend: http://localhost:5002
- Backend API: http://localhost:5001
- MySQL: localhost:3307 (non-default port)

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
- Port: `3306` (default MySQL port) or `3307` (if configured)
- **Note:** Backend defaults to 3307, but use `DB_PORT=3306` if your MySQL is on 3306

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

