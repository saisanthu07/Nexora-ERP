import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = 'postgresql://postgres.bkdggmutpbzcbqzbesrk:Saisanthu67%40sai@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

const client = new Client({ connectionString });

async function run() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL...');
  await client.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS address TEXT;');
  await client.query('ALTER TABLE challans ADD COLUMN IF NOT EXISTS "totalQuantity" INTEGER DEFAULT 0;');
  console.log('✅ Columns "address" and "totalQuantity" successfully created on Supabase!');
  await client.end();
}

run().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
