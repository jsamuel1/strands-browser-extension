#!/usr/bin/env node
/**
 * Post-build script for Chrome extension
 * Copies necessary files to the dist directory
 */

import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

const distDir = 'dist';
const iconsDir = 'icons';
const distIconsDir = join(distDir, iconsDir);

console.log('📦 Running post-build tasks for extension...');

// Ensure dist directory exists
if (!existsSync(distDir)) {
  console.error('❌ dist directory not found. Run vite build first.');
  process.exit(1);
}

// Copy manifest.json
try {
  copyFileSync('manifest.json', join(distDir, 'manifest.json'));
  console.log('✓ Copied manifest.json');
} catch (err) {
  console.error('❌ Failed to copy manifest.json:', err.message);
  process.exit(1);
}

// Create icons directory in dist
if (!existsSync(distIconsDir)) {
  mkdirSync(distIconsDir, { recursive: true });
}

// Copy all icons
try {
  const iconFiles = readdirSync(iconsDir).filter(file => file.endsWith('.png'));
  iconFiles.forEach(file => {
    copyFileSync(join(iconsDir, file), join(distIconsDir, file));
  });
  console.log(`✓ Copied ${iconFiles.length} icon(s)`);
} catch (err) {
  console.error('❌ Failed to copy icons:', err.message);
  process.exit(1);
}

console.log('✅ Extension build complete! Load the dist/ folder in Chrome.');
console.log('   Go to chrome://extensions/ and enable Developer mode, then click "Load unpacked".');
