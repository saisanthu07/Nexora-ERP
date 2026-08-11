import { prisma } from '../src/config/db';

async function main() {
  const tables = [
    'users',
    'customers',
    'notes',
    'products',
    'stock_movements',
    'challan_sequence',
    'challans',
    'challan_items',
  ];

  for (const table of tables) {
    await prisma.$executeRawUnsafe(`ALTER TABLE "public"."${table}" ENABLE ROW LEVEL SECURITY;`);
    console.log(`✅ Enabled RLS on table: public.${table}`);
  }
}

main()
  .catch((err) => {
    console.error('Error enabling RLS:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
