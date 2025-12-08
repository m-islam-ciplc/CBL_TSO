#!/usr/bin/env node

/**
 * Safe Dead Code Verification Script
 * 
 * This script takes ESLint output and verifies each "unused" item with grep
 * to ensure it's truly unused before flagging it for removal.
 * 
 * Usage:
 *   node verify-deadcode.js <eslint-output-file> [--file <file-path>]
 * 
 * Or pipe ESLint output:
 *   npm run lint:deadcode:frontend 2>&1 | node verify-deadcode.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// Parse ESLint output to extract unused items
function parseESLintOutput(output) {
  const unusedItems = [];
  const lines = output.split('\n');
  let currentFile = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Match file path line: "D:\path\to\file.js" or "path/to/file.js"
    // Must be a .js or .jsx file and not contain warning/error keywords
    const fileMatch = trimmedLine.match(/^(.+\.(js|jsx))$/);
    if (fileMatch && !trimmedLine.includes('warning') && !trimmedLine.includes('error') && !trimmedLine.includes('problems')) {
      currentFile = fileMatch[1];
      continue;
    }
    
    // Match warning line: "  13:225  warning  'STANDARD_INPUT_SIZE' is defined but never used..."
    // Format: "  line:column  warning  'name' is ... never used"
    // Can start with spaces or tabs
    const warningMatch = line.match(/^\s+(\d+):(\d+)\s+warning\s+'(.+?)'\s+is\s+(?:assigned|defined).+never\s+used/i);
    if (warningMatch && currentFile) {
      const name = warningMatch[3];
      const lineNum = parseInt(warningMatch[1]);
      const colNum = parseInt(warningMatch[2]);
      
      // Determine type based on context
      let type = 'variable';
      if (trimmedLine.includes('import') || name.includes('Outlined') || name.includes('Icon') || name.includes('Number')) {
        type = 'import';
      }
      
      unusedItems.push({
        file: currentFile,
        line: lineNum,
        column: colNum,
        name: name,
        type: type,
        originalLine: trimmedLine,
      });
    }
  }
  
  return unusedItems;
}

// Verify if a variable/import is actually used using grep
function verifyWithGrep(item, projectRoot) {
  const filePath = path.isAbsolute(item.file) ? item.file : path.join(projectRoot, item.file);
  const fileName = path.basename(filePath);
  const fileDir = path.dirname(filePath);
  
  // Skip if file doesn't exist
  if (!fs.existsSync(filePath)) {
    return { isUsed: false, reason: 'File not found' };
  }
  
  try {
    // For React state variables, also check for the setter
    // e.g., if checking "orderItems", also check "setOrderItems"
    const searchNames = [item.name];
    
    // If it looks like a state variable (not starting with "set"), also check the setter
    if (!item.name.startsWith('set') && item.name.length > 0) {
      const setterName = 'set' + item.name.charAt(0).toUpperCase() + item.name.slice(1);
      searchNames.push(setterName);
    }
    
    // If it's a setter (starts with "set"), also check the variable name
    if (item.name.startsWith('set') && item.name.length > 3) {
      const varName = item.name.charAt(3).toLowerCase() + item.name.slice(4);
      searchNames.push(varName);
    }
    
    let allMatches = [];
    
    // Search for each name variant
    for (const searchName of searchNames) {
      const searchPattern = `\\b${searchName}\\b`;
      
      // Search in the file directory and subdirectories
      const grepCommand = process.platform === 'win32' 
        ? `findstr /S /N /C:"${searchName}" "${fileDir}\\*.js" "${fileDir}\\*.jsx" 2>nul`
        : `grep -r -n "\\b${searchName}\\b" "${fileDir}" --include="*.js" --include="*.jsx" 2>/dev/null || true`;
      
      const grepOutput = execSync(grepCommand, { 
        encoding: 'utf-8',
        cwd: projectRoot,
        stdio: ['pipe', 'pipe', 'ignore']
      });
      
      if (grepOutput && grepOutput.trim().length > 0) {
        const matches = grepOutput.trim().split('\n').filter(line => line.trim());
        allMatches = allMatches.concat(matches);
      }
    }
    
    if (allMatches.length === 0) {
      return { isUsed: false, reason: 'No matches found' };
    }
    
    // Remove duplicates
    const uniqueMatches = [...new Set(allMatches)];
    
    // Filter out the declaration/import line itself
    const actualUsage = uniqueMatches.filter(match => {
      const matchLine = match.match(/:(\d+):/);
      if (!matchLine) return true;
      const matchLineNum = parseInt(matchLine[1]);
      // Allow some tolerance (declaration might be on nearby lines)
      return Math.abs(matchLineNum - item.line) > 2;
    });
    
    if (actualUsage.length === 0) {
      return { isUsed: false, reason: 'Only found in declaration' };
    }
    
    return { 
      isUsed: true, 
      reason: `Found ${actualUsage.length} usage(s)${searchNames.length > 1 ? ` (checked: ${searchNames.join(', ')})` : ''}`,
      matches: actualUsage.slice(0, 3) // Show first 3 matches
    };
  } catch (error) {
    // If grep fails, assume it's used (safer default)
    return { isUsed: true, reason: 'Verification failed (assuming used for safety)' };
  }
}

// Main function
function main() {
  const projectRoot = process.cwd();
  let eslintOutput = '';
  
  // Read from stdin or file
  if (process.stdin.isTTY) {
    // No stdin, check for file argument
    const args = process.argv.slice(2);
    const fileIndex = args.indexOf('--file');
    
    if (fileIndex !== -1 && args[fileIndex + 1]) {
      const filePath = args[fileIndex + 1];
      eslintOutput = fs.readFileSync(filePath, 'utf-8');
    } else {
      console.error(colorize('Error: No input provided. Pipe ESLint output or use --file option.', 'red'));
      console.error('Usage: npm run lint:deadcode:frontend 2>&1 | node verify-deadcode.js');
      console.error('   or: node verify-deadcode.js --file eslint-output.txt');
      process.exit(1);
    }
  } else {
    // Read from stdin
    eslintOutput = fs.readFileSync(0, 'utf-8');
  }
  
  console.log(colorize('\n🔍 Verifying ESLint unused code warnings...\n', 'blue'));
  
  const unusedItems = parseESLintOutput(eslintOutput);
  
  if (unusedItems.length === 0) {
    console.log(colorize('✅ No unused code warnings found.', 'green'));
    return;
  }
  
  console.log(`Found ${unusedItems.length} potential unused items. Verifying with grep...\n`);
  
  const safeToRemove = [];
  const actuallyUsed = [];
  const verificationFailed = [];
  
  for (const item of unusedItems) {
    process.stdout.write(`Checking ${item.name} in ${path.basename(item.file)}... `);
    
    const verification = verifyWithGrep(item, projectRoot);
    
    if (verification.isUsed) {
      console.log(colorize(`❌ USED (${verification.reason})`, 'red'));
      actuallyUsed.push({ ...item, verification });
    } else {
      console.log(colorize(`✅ UNUSED (${verification.reason})`, 'green'));
      safeToRemove.push({ ...item, verification });
    }
  }
  
  // Print summary
  console.log(colorize('\n' + '='.repeat(60), 'blue'));
  console.log(colorize('\n📊 VERIFICATION SUMMARY\n', 'blue'));
  
  console.log(colorize(`✅ Safe to remove: ${safeToRemove.length}`, 'green'));
  if (safeToRemove.length > 0) {
    console.log('\nThese items are confirmed unused:');
    safeToRemove.forEach(item => {
      console.log(`  - ${item.name} in ${item.file}:${item.line} (${item.type})`);
    });
  }
  
  console.log(colorize(`\n❌ Actually used (DO NOT REMOVE): ${actuallyUsed.length}`, 'red'));
  if (actuallyUsed.length > 0) {
    console.log('\n⚠️  WARNING: These items are flagged as unused by ESLint but are actually used:');
    actuallyUsed.forEach(item => {
      console.log(`  - ${colorize(item.name, 'red')} in ${item.file}:${item.line} (${item.type})`);
      console.log(`    Reason: ${item.verification.reason}`);
      if (item.verification.matches && item.verification.matches.length > 0) {
        console.log(`    Found in:`);
        item.verification.matches.forEach(match => {
          console.log(`      ${match.substring(0, 80)}...`);
        });
      }
    });
  }
  
  console.log(colorize('\n' + '='.repeat(60), 'blue'));
  console.log(colorize('\n💡 Recommendation:', 'yellow'));
  if (actuallyUsed.length > 0) {
    console.log(colorize('   DO NOT remove the items marked as "Actually used" above!', 'red'));
    console.log(colorize('   ESLint has false positives for these items.', 'yellow'));
  }
  if (safeToRemove.length > 0) {
    console.log(colorize(`   You can safely remove ${safeToRemove.length} confirmed unused item(s).`, 'green'));
  }
  console.log();
}

main();

