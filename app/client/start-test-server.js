import { execFileSync, spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const serverDir = path.resolve(currentDir, '..', 'server');
const repositoryDir = path.resolve(serverDir, '..', '..');
const testDbPath = process.env.DATABASE_PATH
  ? path.resolve(repositoryDir, process.env.DATABASE_PATH)
  : path.join(serverDir, 'e2e_test_dogshelter.db');
const python = process.env.PYTHON || (process.platform === 'win32' ? 'py' : 'python3');
const serverEnv = { ...process.env, DATABASE_PATH: testDbPath };

execFileSync(python, ['utils/seed_test_database.py'], {
  cwd: serverDir,
  env: serverEnv,
  stdio: 'inherit',
});

const server = spawn(python, ['app.py'], {
  cwd: serverDir,
  env: serverEnv,
  stdio: 'inherit',
});

server.on('close', (code) => process.exit(code ?? 1));
