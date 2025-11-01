#!/usr/bin/env node
/**
 * Script multiplataforma para copiar el schema correcto según el entorno
 * Uso: node scripts/copy-schema.js [local|vercel]
 */

import { copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const env = process.argv[2] || 'local';
const sourceFile = env === 'vercel' ? 'schema.zmodel.vercel' : 'schema.zmodel.local';
const targetFile = 'schema.zmodel';

const sourcePath = join(rootDir, sourceFile);
const targetPath = join(rootDir, targetFile);

try {
  copyFileSync(sourcePath, targetPath);
  console.log(`✅ Copiado ${sourceFile} -> ${targetFile} (entorno: ${env})`);
} catch (error) {
  console.error(`❌ Error al copiar el schema: ${error.message}`);
  process.exit(1);
}

