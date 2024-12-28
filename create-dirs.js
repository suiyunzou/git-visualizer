import { mkdir } from 'fs/promises';
import { join } from 'path';

const dirs = [
  'src/assets',
  'src/components/common',
  'src/components/git',
  'src/components/tutorial',
  'src/models',
  'src/utils',
  'src/services',
  'src/styles'
];

async function createDirs() {
  for (const dir of dirs) {
    try {
      await mkdir(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    } catch (error) {
      if (error.code !== 'EEXIST') {
        console.error(`Error creating directory ${dir}:`, error);
      }
    }
  }
}

createDirs();
