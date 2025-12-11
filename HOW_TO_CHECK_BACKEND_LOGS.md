# How to Check Backend Logs

## Method 1: If Running Backend Locally (Terminal/Command Prompt)

### Windows:
1. **Find the terminal window** where you started the backend
   - Look for a window titled "Backend Server (Port 5001)" or similar
   - Or check the terminal where you ran `npm run dev:backend` or `cd backend && npm run dev`

2. **The logs appear directly in that terminal**
   - You'll see messages like:
     - `📊 Generating MR Order Report CSV for date: 2024-01-15`
     - `✅ Generated CSV with X rows`
     - `Error generating MR Order Report CSV: ...`

### If you can't find the terminal:
- **Check Task Manager** (Ctrl+Shift+Esc) for Node.js processes
- **Restart the backend** in a new terminal:
  ```bash
  cd backend
  npm run dev
  ```

## Method 2: If Using Docker

### View logs in real-time:
```bash
docker logs -f cbl-so-backend
```

### View last 100 lines:
```bash
docker logs --tail 100 cbl-so-backend
```

### View logs with timestamps:
```bash
docker logs -f --timestamps cbl-so-backend
```

## Method 3: Check Browser Console (Frontend Errors)

1. **Open your browser** (Chrome/Edge/Firefox)
2. **Press F12** to open Developer Tools
3. **Click the "Console" tab**
4. **Try downloading the MR CSV report again**
5. **Look for error messages** in red

You should see messages like:
- `Error generating MR report: ...`
- `Error response: ...`

## What to Look For

When you click "Download MR CSV", you should see in the backend logs:

### Success:
```
📊 Generating MR Order Report CSV for date: 2024-01-15
📦 Fetching order items for X orders
✅ Found X order items
✅ Generated CSV with X rows (X bytes)
   Orders: X, Products: X
```

### Error:
```
📊 Generating MR Order Report CSV for date: 2024-01-15
Error generating MR Order Report CSV: [ERROR MESSAGE]
Error stack: [STACK TRACE]
```

## Quick Test

1. **Open backend terminal/logs**
2. **Go to the Reports page in your browser**
3. **Click "Download MR CSV"**
4. **Watch the backend logs immediately** - you should see the log messages appear

## Still Can't See Logs?

If you're not sure how the backend is running:

1. **Check if backend is running:**
   ```bash
   # Windows PowerShell
   netstat -ano | findstr :5001
   
   # Linux/Mac
   lsof -i :5001
   ```

2. **If using Docker, check container status:**
   ```bash
   docker ps
   ```

3. **Restart backend to see logs:**
   ```bash
   # Stop backend (Ctrl+C in terminal, or)
   docker stop cbl-so-backend
   
   # Start backend with visible logs
   cd backend
   npm run dev
   ```

