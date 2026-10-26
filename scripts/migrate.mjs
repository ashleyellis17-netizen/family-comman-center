import pg from 'pg';
import { readFileSync, readdirSync } from 'node:fs';
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  for (const file of readdirSync(new URL('.', import.meta.url)).filter((f) => f.endsWith('.sql')).sort()) {
    const sql = readFileSync(new URL(file, import.meta.url), 'utf8');
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('applied', file);
  }
} catch (e) {
  await client.query('ROLLBACK');
  console.error('migration failed:', e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
