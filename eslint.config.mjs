// eslint.config.js
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import { defineConfig, globalIgnores } from 'eslint/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default defineConfig([
  globalIgnores([
    '!node_modules/', // unignore `node_modules/` directory
    'node_modules/*', // ignore its content
    '!node_modules/mylibrary/', // unignore `node_modules/mylibrary` directory
    '**/cypress/**/*.{js,ts,jsx,tsx}', // ignore all files in `cypress` directory
  ]),
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  ...compat.extends('plugin:@tanstack/eslint-plugin-query/recommended'),
  ...compat.extends('prettier'),
  ...compat.plugins('@tanstack/query'),
]);
