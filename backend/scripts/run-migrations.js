import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const defaultMigrationsDir = path.join(repoRoot, 'infrastructure', 'migrations');

dotenv.config({ path: path.join(repoRoot, '.env') });
dotenv.config({ path: path.join(repoRoot, 'backend', '.env'), override: true });

const migrationsDir = process.env.MIGRATIONS_DIR
  ? path.resolve(process.env.MIGRATIONS_DIR)
  : defaultMigrationsDir;

const createConnection = async () =>
  mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    multipleStatements: true,
  });

const ensureMigrationsTable = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

const getAppliedMigrations = async (connection) => {
  const [rows] = await connection.query('SELECT filename FROM schema_migrations');
  return new Set(rows.map((row) => row.filename));
};

const getMigrationFiles = async () => {
  const entries = await fs.readdir(migrationsDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.sql'))
    .map((entry) => entry.name)
    .sort();
};

const runMigration = async (connection, filename) => {
  const migrationPath = path.join(migrationsDir, filename);
  const sql = await fs.readFile(migrationPath, 'utf8');

  await connection.beginTransaction();
  try {
    await connection.query(sql);
    await connection.query('INSERT INTO schema_migrations (filename) VALUES (?)', [filename]);
    await connection.commit();
    console.log(`Applied migration: ${filename}`);
  } catch (error) {
    await connection.rollback();
    throw error;
  }
};

const runMigrations = async () => {
  const connection = await createConnection();

  try {
    await ensureMigrationsTable(connection);
    const appliedMigrations = await getAppliedMigrations(connection);
    const migrationFiles = await getMigrationFiles();
    const pendingMigrations = migrationFiles.filter((filename) => !appliedMigrations.has(filename));

    if (pendingMigrations.length === 0) {
      console.log('No pending migrations.');
      return;
    }

    for (const filename of pendingMigrations) {
      await runMigration(connection, filename);
    }

    console.log(`Applied ${pendingMigrations.length} migration(s).`);
  } finally {
    await connection.end();
  }
};

runMigrations().catch((error) => {
  console.error('Migration failed:', error.message);
  process.exitCode = 1;
});
