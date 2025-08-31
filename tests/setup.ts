import { expect, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Create necessary test directories
const testDirs = [
  'logs',
  'downloads/audiobooks'
];

async function setupTestDirs() {
  for (const dir of testDirs) {
    try {
      await fs.mkdir(path.join(process.cwd(), dir), { recursive: true });
    } catch (error) {
      console.warn(`Warning: Could not create test directory ${dir}:`, error);
    }
  }
}

// Run setup
setupTestDirs();
