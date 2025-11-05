# Docker Update & Rebuild Guide

## 🔄 What Happens When You Rebuild Docker?

### Scenario 1: **Rebuild WITHOUT Removing Volumes** (Keeps Data)
```bash
docker-compose down
docker-compose up -d --build
```

**What happens:**
- ✅ Containers are rebuilt with new code
- ✅ Database data **persists** (stored in volume `cbl-so-mysql-data`)
- ✅ Schema changes **DO NOT** apply automatically
- ⚠️ Your migration (30 columns) will **remain** if already applied
- ⚠️ If you need schema changes, you must run migrations manually

**Use when:** You want to update code but keep all existing data.

---

### Scenario 2: **Rebuild WITH Removing Volumes** (Fresh Start)
```bash
docker-compose down -v
docker-compose up -d --build
```

**What happens:**
- ✅ Containers are rebuilt with new code
- ✅ **All data is deleted** (database, uploaded files, etc.)
- ✅ Database is recreated from `database.sql`
- ✅ **Uses the latest schema** from `database.sql` (30 columns if updated)

**Use when:** You want a completely fresh start, or the `database.sql` file has been updated.

---

## 📋 **Before Updating Remote Docker:**

### **✅ Good News: Schema is Automatically Included!**

The `database.sql` file is now **copied into the Docker image** during build (`Dockerfile.mysql`). This means:

- ✅ When you copy your codebase to the remote PC and rebuild, the schema is automatically included
- ✅ No need to manually sync `database.sql` separately
- ✅ The Docker image is self-contained - it doesn't depend on host filesystem

**Just make sure:**
- The codebase on remote PC includes the updated `database.sql` file (30 columns)
- Rebuild with `docker-compose up -d --build` (or `docker-compose down -v && docker-compose up -d --build` for fresh start)

---

### **Step 2: Choose Your Rebuild Strategy**

#### **A. Keep Existing Data (Recommended for Production)**

1. **Backup database first:**
   ```bash
   # On remote PC (172.16.50.50)
   docker-compose exec mysql mysqldump -u root -pcbl_so_root_password cbl_so > backup_$(date +%Y%m%d).sql
   ```

2. **Rebuild containers:**
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

3. **Result:** 
   - New code is deployed
   - All data remains
   - Schema stays as-is (migration persists)

#### **B. Fresh Start (For Testing/Development)**

1. **Rebuild with fresh database:**
   ```bash
   # On remote PC (172.16.50.50)
   docker-compose down -v
   docker-compose up -d --build
   ```

2. **Result:**
   - New code is deployed
   - Fresh database with schema from updated `database.sql`
   - All previous data is **lost**

---

## 🎯 **Recommended Workflow:**

### **For Production Updates (Keep Data):**

```bash
# On remote PC (172.16.50.50):

# 1. Backup database (optional but recommended)
docker-compose exec mysql mysqldump -u root -pcbl_so_root_password cbl_so > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Stop containers
docker-compose down

# 3. Update codebase (copy entire project from local PC or git pull)
#    - The updated database.sql is included in the codebase
#    - No need to manually sync database.sql separately

# 4. Rebuild containers (KEEPS DATA, schema stays as-is)
docker-compose up -d --build

# 5. Verify everything works
docker-compose ps
docker-compose logs -f backend
```

### **For Fresh Deployments (With Updated Schema):**

```bash
# On remote PC (172.16.50.50):

# 1. Stop and remove everything (WARNING: Deletes all data)
docker-compose down -v

# 2. Update codebase (copy entire project from local PC or git pull)
#    - The updated database.sql (30 columns) is included in the codebase

# 3. Rebuild everything (FRESH START with new schema)
docker-compose up -d --build

# 4. Verify everything works
docker-compose ps

# 5. Verify schema is correct
#    (from your local PC, run: node check-remote-docker-db.js)
```

---

## ⚠️ **Important Notes:**

### **Database Schema Updates:**

1. **`database.sql` is baked into the Docker image:**
   - The schema file is **copied into the image** during build (`Dockerfile.mysql`)
   - No need to manually sync `database.sql` between local and remote PC
   - Just copy the entire codebase and rebuild - schema is included automatically

2. **Schema changes apply automatically on fresh builds:**
   - When you rebuild **with** `-v` flag (fresh start), the new schema from the image is used
   - When you rebuild **without** `-v` flag (keeps data), existing schema persists
   - For schema updates without losing data, use migration scripts (like `migrate-products-table-remote.js`)

3. **MySQL Init Script Behavior:**
   - `database.sql` is copied to `/docker-entrypoint-initdb.d/init.sql` in the image
   - MySQL **only runs** scripts in `/docker-entrypoint-initdb.d/` when database volume is **empty**
   - If volume exists, init scripts are **skipped** (this is MySQL's default behavior)

### **Backend Code Updates:**

- Backend code (`server.js`) is **copied into the image** during build
- Changes to `server.js` require rebuilding: `docker-compose up -d --build`
- Code updates **do not require** removing volumes

### **Frontend Code Updates:**

- Frontend is built into a static bundle during image build
- Changes require: `docker-compose up -d --build frontend`
- No database impact

---

## 🔍 **How to Verify Schema After Rebuild:**

Run this from your local PC:

```bash
node check-remote-docker-db.js
```

This will show:
- Current number of columns in `products` table
- Whether schema matches expectations
- Current data count

---

## 📊 **Summary Table:**

| Action | Data Persists? | Schema Updated? | When to Use |
|--------|---------------|-----------------|-------------|
| `docker-compose up -d --build` | ✅ Yes | ❌ No | Code updates, keep data |
| `docker-compose down -v && up -d --build` | ❌ No | ✅ Yes (from database.sql) | Fresh start, schema changes |
| Manual Migration Script | ✅ Yes | ✅ Yes | Schema changes without losing data |

---

## 🚨 **Troubleshooting:**

### **Issue: Import fails after rebuild**

**Check:**
```bash
# Verify schema
node check-remote-docker-db.js

# If schema is wrong (only 3 columns):
# Option 1: Run migration script
node migrate-products-table-remote.js

# Option 2: Rebuild with updated database.sql
# (WARNING: This deletes all data!)
```

### **Issue: Code changes not reflected**

**Solution:**
```bash
# Make sure you're rebuilding
docker-compose up -d --build

# Not just restarting
# docker-compose restart  # ❌ This doesn't rebuild
```

---

## 📝 **Best Practices:**

1. **Always backup before rebuild (if keeping data):**
   ```bash
   docker-compose exec mysql mysqldump -u root -p cbl_so > backup.sql
   ```

2. **Deploy entire codebase:**
   - Copy the entire project directory (or use Git)
   - `database.sql` is automatically included in the Docker image
   - No need to manually sync individual files

3. **Use Git for version control:**
   - Commit schema changes to `database.sql`
   - Commit Dockerfile changes
   - Pull on remote PC before rebuild

4. **Test schema changes locally first:**
   - Test migration scripts
   - Verify import works with new schema
   - Then deploy to remote

5. **For fresh deployments:**
   - Use `docker-compose down -v && docker-compose up -d --build`
   - This ensures the latest schema from `database.sql` is applied
