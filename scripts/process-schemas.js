#!/usr/bin/env node
/**
 * Script to process .zmodel files according to the database provider
 * Replaces SQL Server-specific types with PostgreSQL equivalents
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const zmodelDir = join(rootDir, 'zmodel');

// Get the provider from arguments
const provider = process.argv[2] || 'sqlserver';

/**
 * Processes a .zmodel file and replaces types according to the provider
 */
function processZModelFile(filePath, provider) {
  let content = readFileSync(filePath, 'utf-8');

  if (provider === 'postgresql') {
    // In PostgreSQL, @db.UniqueIdentifier is not valid
    // We remove @db.UniqueIdentifier as Prisma will handle UUIDs correctly
    // with String @default(uuid()) without needing @db annotation

    // Pattern 1: @id @default(uuid()) @db.UniqueIdentifier -> @id @default(uuid())
    content = content.replace(/(@id\s+@default\(uuid()\))\s+@db\.UniqueIdentifier/g, '$1');

    // Pattern 2: String @db.UniqueIdentifier (without @id) -> String (keep @default(uuid()) if exists)
    content = content.replace(/(String)\s+@db\.UniqueIdentifier/g, '$1');

    // Pattern 3: @default(uuid()) @db.UniqueIdentifier -> @default(uuid())
    content = content.replace(/(@default\(uuid()\))\s+@db\.UniqueIdentifier/g, '$1');

    // Pattern 4: @unique @db.UniqueIdentifier -> @unique
    content = content.replace(/(@unique)\s+@db\.UniqueIdentifier/g, '$1');

    // Pattern 5: Any other remaining @db.UniqueIdentifier
    content = content.replace(/\s+@db\.UniqueIdentifier/g, '');

    // PostgreSQL does not support @db.NVarChar (SQL Server specific)
    // Replace @db.NVarChar(Max) with @db.Text (PostgreSQL equivalent for large text)
    content = content.replace(/@db\.NVarChar\(Max\)/g, '@db.Text');

    // PostgreSQL accepts @db.VarChar(n) without issues, so we don't touch it
  } else if (provider === 'sqlserver') {
    // For SQL Server, files should already have @db.UniqueIdentifier and @db.NVarChar
    // We don't need to make changes
  }

  return content;
}

/**
 * Processes all .zmodel files in the directory
 */
function processAllZModelFiles(provider) {
  const files = readdirSync(zmodelDir);
  const zmodelFiles = files.filter((file) => file.endsWith('.zmodel'));

  console.log(`📝 Processing ${zmodelFiles.length} .zmodel files for ${provider}...`);

  for (const file of zmodelFiles) {
    const filePath = join(zmodelDir, file);
    const stats = statSync(filePath);

    if (stats.isFile()) {
      const processedContent = processZModelFile(filePath, provider);
      writeFileSync(filePath, processedContent, 'utf-8');
      console.log(`  ✅ Processed: ${file}`);
    }
  }

  console.log(`✨ All files processed for ${provider}`);
}

// Execute processing
processAllZModelFiles(provider);
