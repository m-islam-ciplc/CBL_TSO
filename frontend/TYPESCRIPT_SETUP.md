# TypeScript Setup - Troubleshooting

## Issue: Module Not Found Error

If you see errors like:
```
Module not found: Error: Can't resolve '../templates/DealerReportsViewOrdersCardTemplate'
```

### Solution 1: Restart Dev Server
React Scripts needs to be restarted to pick up new `.tsx` files:

```bash
# Stop the current dev server (Ctrl+C)
# Then restart:
npm start
```

### Solution 2: Clear Cache
If restart doesn't work, clear the cache:

```bash
# Delete node_modules/.cache
rm -rf node_modules/.cache

# Or on Windows:
rmdir /s /q node_modules\.cache

# Then restart:
npm start
```

### Solution 3: Verify File Extensions
Make sure the files exist:
- `src/templates/DealerReportsViewOrdersCardTemplate.tsx` ✅
- `src/templates/MonthlyForecastSelectPeriodCardTemplate.tsx` ✅

### Solution 4: Check tsconfig.json
Ensure `tsconfig.json` exists in the `frontend/` directory and includes:
```json
{
  "compilerOptions": {
    "allowJs": true,
    ...
  },
  "include": ["src"]
}
```

## Import Syntax

**Correct** (no extension needed):
```javascript
import { DealerReportsViewOrdersCardTemplate } from '../templates/DealerReportsViewOrdersCardTemplate';
```

**Incorrect** (don't use .tsx extension):
```javascript
import { DealerReportsViewOrdersCardTemplate } from '../templates/DealerReportsViewOrdersCardTemplate.tsx'; // ❌
```

React Scripts automatically resolves `.tsx` files when importing without extensions.

