# Project Tools (Deletable)

This folder contains development tools, scripts, and documentation that are **NOT required** for the core software to run.

## ⚠️ Safe to Delete

**This entire folder can be safely deleted** once development is complete. The software will continue to function normally without these files.

## Contents

### Development Scripts
- `cleanup.bat` / `cleanup.sh` - Cleanup scripts for temporary files and Docker resources
- `deploy.bat` / `deploy.sh` - Deployment scripts
- `manage-servers.bat` - Server management script
- `auto_update_db.js` - Database auto-update utility

### Test Scripts (`test_scripts/`)
- `test-workflow.js` - Comprehensive workflow test suite
- `TEST_WORKFLOW_GUIDE.md` - Test documentation
- `check_quota_debug.sql` - Debug SQL queries
- `deadcode-check.md` - Dead code checking instructions

### Database Migrations (`migrations/`)
- Migration SQL scripts for database updates
- **Note**: These are only needed if migrating from an older database schema. The main `database.sql` file is up to date.

### Utility Scripts (`scripts/`)
- `cbl_so_mysql_daily_backup.ps1` - Database backup script
- `sync_daily_quotas.sql` - Quota synchronization utility

### Documentation (`docs/`)
- Design documentation and style guides
- Docker setup guides
- Development references

### Docker Documentation
- `DOCKER_MYSQL_CONNECTION.md` - MySQL connection guide
- `DOCKER_README.md` - Docker setup instructions
- `DOCKER_UPDATE_GUIDE.md` - Docker update guide

## Impact of Deletion

If this folder is deleted:
- ✅ **Software will run normally** - All core functionality remains intact
- ✅ **No runtime errors** - No code dependencies on these files
- ❌ **Test scripts won't work** - `npm run test:workflow:*` commands will fail
- ❌ **Deployment scripts won't work** - Manual deployment scripts unavailable
- ❌ **Documentation unavailable** - Development guides removed

## Note

The `package.json` file references test scripts in this folder. If you delete this folder, you may want to remove those npm script entries from `package.json` as well.

