# Dead Code Checking Guide

This guide explains how to check for and remove unused code, unused imports, and unused dependencies in the CBL TSO codebase.

## ⚠️ CRITICAL: Always Verify Before Removing

**ESLint can have false positives!** Always verify with `grep` before removing any code flagged as unused. See the "Best Practices" section below for details.

## Available Tools

### 1. ESLint - Unused Code Detection

ESLint can detect:
- Unused variables
- Unused imports
- Unused function parameters
- Dead code paths

#### Backend Dead Code Check

```bash
# From project root
npm run lint:deadcode:backend

# Or directly
cd backend
npx eslint "**/*.js"
```

#### Frontend Dead Code Check

```bash
# From project root
npm run lint:deadcode:frontend

# Or directly
cd frontend
npx eslint "src/**/*.{js,jsx}"
```

#### Check Both Backend and Frontend

```bash
npm run lint:deadcode:all
```

### 3. Safe Verification Script (RECOMMENDED)

**⚠️ IMPORTANT**: Before removing any "unused" code, use the verification script to confirm it's truly unused:

```bash
# Verify backend unused code (checks with grep before flagging)
npm run verify:deadcode:backend

# Verify frontend unused code
npm run verify:deadcode:frontend

# Verify both
npm run verify:deadcode:all
```

This script:
- Takes ESLint output
- For each "unused" item, runs `grep` to verify it's truly unused
- Only flags items that are **confirmed unused**
- **Warns about false positives** (items ESLint says are unused but are actually used)

**Always use this before removing code!**

### 2. Depcheck - Unused Dependencies

Depcheck identifies unused npm packages in your `package.json` files.

#### Check Backend Dependencies

```bash
# From project root
npm run depcheck:backend

# Or directly
cd backend
npx depcheck
```

#### Check Frontend Dependencies

```bash
# From project root
npm run depcheck:frontend

# Or directly
cd frontend
npx depcheck
```

## ESLint Configuration

### Backend ESLint Config (`backend/eslint.config.js`)

- Uses standard ESLint recommended rules
- Detects unused variables and code

### Frontend ESLint Config (`frontend/eslint.config.js`)

- Uses `eslint-plugin-unused-imports` for better import detection
- Configured to warn about:
  - Unused imports
  - Unused variables
  - Unused function parameters (except those starting with `_`)

**Note**: The `unused-imports/no-unused-imports` rule is set to `'off'` by default. To enable automatic removal, change it to `'warn'` or `'error'`.

## Common Issues and Solutions

### Unused Imports

**Problem**: Imported modules that are never used

**Solution**: 
1. Run ESLint to identify them
2. Remove manually, or
3. Use an IDE extension (like ESLint for VS Code) to auto-remove

### Unused Variables

**Problem**: Variables declared but never used

**Solution**:
- Remove the variable if truly unused
- Prefix with `_` if intentionally unused (e.g., `_unusedParam`)
- Use the variable or remove the declaration

### Unused Dependencies

**Problem**: Packages in `package.json` that aren't imported anywhere

**Solution**:
1. Run `depcheck` to identify unused packages
2. Review the list carefully (some packages may be used indirectly)
3. Remove unused packages: `npm uninstall <package-name>`

### Unused Functions/Components

**Problem**: Functions or React components that are never called

**Solution**:
- ESLint may not catch all unused exports
- Manually review and remove if confirmed unused
- Consider using tools like `ts-prune` (for TypeScript) or `unimported` for JavaScript

## Best Practices

1. **Run checks regularly**: Before committing code, run dead code checks
2. **ALWAYS verify with grep before removing**: ESLint can have false positives, especially for:
   - Variables used in complex boolean expressions (`!isAdmin && !isSalesManager`)
   - Variables used in JSX conditionals (`{condition && variable && ...}`)
   - Variables used indirectly or dynamically
3. **Review carefully**: Not all "unused" code is truly dead (e.g., exported functions for external use)
4. **Use ESLint in your IDE**: Configure your editor to show ESLint warnings in real-time
5. **Clean up incrementally**: Don't try to remove everything at once; do it gradually
6. **Test after removal**: Always build and test after removing code to ensure nothing broke

## Automated Cleanup

### ⚠️ WARNING: Auto-fix is NOT Recommended

**DO NOT use ESLint auto-fix for unused code removal** without manual verification first. Auto-fix can remove code that is actually being used, especially:
- Variables in boolean expressions
- Variables in JSX conditionals
- Variables used dynamically

### If You Must Use Auto-fix

1. **Commit your current work first** (so you can revert)
2. **Run auto-fix**:
   ```bash
   # Backend
   cd backend
   npx eslint "**/*.js" --fix
   
   # Frontend
   cd frontend
   npx eslint "src/**/*.{js,jsx}" --fix
   ```
3. **Review ALL changes** with `git diff` before committing
4. **Test thoroughly** - build and run the application
5. **Verify with grep** any variables that were removed to ensure they're truly unused

## Example Workflow (SAFE METHOD)

1. **Check for dead code**:
   ```bash
   npm run lint:deadcode:all
   ```

2. **Check for unused dependencies**:
   ```bash
   npm run depcheck:backend
   npm run depcheck:frontend
   ```

3. **Review the output** and identify what can be safely removed

4. **VERIFY WITH GREP BEFORE REMOVING** (CRITICAL STEP):
   ```bash
   # For each variable/import flagged as unused, verify it's truly unused:
   grep -r "variableName" --include="*.js" --include="*.jsx" .
   # If grep shows results, DO NOT remove it - it's being used!
   ```

5. **Remove unused code** manually (NEVER use auto-fix without verification)

6. **Test the application** to ensure nothing broke:
   ```bash
   npm run build  # Frontend
   # Test the application manually
   ```

7. **Commit the cleanup**

## ⚠️ IMPORTANT: Why Manual Verification is Required

ESLint's static analysis has limitations and can produce **false positives** (marking used code as unused):

- **Complex boolean expressions**: `!isAdmin && !isSalesManager` may not be detected
- **JSX conditionals**: `{condition && variable && ...}` may be missed
- **Dynamic usage**: Variables used via `window[variable]` or `require(dynamicPath)`
- **Framework magic**: React hooks, decorators, etc. may not be detected

**Always use grep to verify before removing anything!**

## Notes

- Some "unused" code might be:
  - Exported for external use
  - Used dynamically (e.g., `require()` with variables)
  - Part of a public API
  - Used in tests (if tests are in a separate directory)

- Always test after removing code to ensure functionality isn't broken

- Consider using version control (git) to track changes, so you can easily revert if needed

