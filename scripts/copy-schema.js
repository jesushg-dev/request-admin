#!/usr/bin/env node
/**
 * Cross-platform script to copy the correct schema based on environment
 * and process .zmodel files according to the database provider
 * Usage: node scripts/copy-schema.js [local|vercel]
 */
import { execSync } from 'child_process';
import { copyFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const env = process.argv[2] || 'local';
const sourceFile = env === 'vercel' ? 'schema.zmodel.vercel' : 'schema.zmodel.local';
const targetFile = 'schema.zmodel';
const provider = env === 'vercel' ? 'postgresql' : 'sqlserver';

const sourcePath = join(rootDir, sourceFile);
const targetPath = join(rootDir, targetFile);

try {
  // Verify that the source file exists
  if (!existsSync(sourcePath)) {
    throw new Error(`Source file not found: ${sourceFile}`);
  }

  // First, restore .zmodel files to their original state (from git if available)
  console.log('🔄 Restoring .zmodel files to base state...');
  try {
    execSync('git checkout -- zmodel/*.zmodel', { cwd: rootDir, stdio: 'pipe' });
    console.log('  ✅ Files restored from git');
  } catch (error) {
    console.log('  ⚠️  Git not available or files unchanged (continuing...)');
    // Continue without restoring - files may already be in the correct state
  }

  // Copy the main schema
  console.log(`📋 Copying ${sourceFile} -> ${targetFile} (environment: ${env})...`);
  copyFileSync(sourcePath, targetPath);

  // Process .zmodel files according to the provider
  console.log(`🔧 Processing .zmodel files for ${provider}...`);
  execSync(`node scripts/process-schemas.js ${provider}`, { cwd: rootDir, stdio: 'inherit' });

  console.log(`✅ Configuration complete for ${env} (${provider})`);
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
  if (error.stderr) {
    console.error(`Details: ${error.stderr.toString()}`);
  }
  process.exit(1);
}
