import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '../../../data');

export function readJson(filename) {
  const raw = readFileSync(resolve(DATA_DIR, filename), 'utf-8');
  return JSON.parse(raw);
}

export function writeJson(filename, data) {
  writeFileSync(resolve(DATA_DIR, filename), JSON.stringify(data, null, 2), 'utf-8');
}
