import { PrismaClient, Role, CustomerType, CustomerStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('Password123!', 10);

  const users = await Promise.all(
    [
      { name: 'Ava Admin', email: 'admin@demo.com', role: Role.ADMIN },
      { name: 'Sam Sales', email: 'sales@demo.com', role: Role.SALES },
      { name: 'Wes Warehouse', email: 'warehouse@demo.com', role: Role.WAREHOUSE },
      { name: 'Alex Accounts', email: 'accounts@demo.com', role: Role.ACCOUNTS },
    ].map((u) =>
      prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: { ...u, passwordHash: password },
      })
    )
  );

  const admin = users[0];

  const customer = await prisma.customer.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Rohan Mehta',
      phone: '9876543210',
      email: 'rohan@brightretail.in',
      businessName: 'Bright Retail Pvt Ltd',
      gstNumber: '27ABCDE1234F1Z5',
      type: CustomerType.WHOLESALE,
      status: CustomerStatus.ACTIVE,
      notes: { create: [{ content: 'Prefers Tuesday deliveries.', createdBy: admin.id }] },
    },
  });

  const productsData = [
    { name: 'Steel Almirah 3-Door', sku: 'ALM-3D-001', category: 'Furniture', price: 8999, stock: 24, minStock: 5, warehouse: 'Main Warehouse' },
    { name: 'Office Chair — Mesh Back', sku: 'CHR-MSH-002', category: 'Furniture', price: 3499, stock: 40, minStock: 10, warehouse: 'Main Warehouse' },
    { name: 'LED Panel Light 24W', sku: 'LED-24W-003', category: 'Electricals', price: 449, stock: 6, minStock: 20, warehouse: 'Main Warehouse' },
    { name: 'A4 Copier Paper (Ream)', sku: 'PPR-A4-004', category: 'Stationery', price: 259, stock: 150, minStock: 30, warehouse: 'Secondary Warehouse' },
    { name: 'Whiteboard 4x3 ft', sku: 'WBD-43-005', category: 'Furniture', price: 1899, stock: 3, minStock: 5, warehouse: 'Main Warehouse' },
  ];

  for (const p of productsData) {
    await prisma.product.upsert({ where: { sku: p.sku }, update: {}, create: p });
  }

  // eslint-disable-next-line no-console
  console.log('✅ Seed complete.');
  // eslint-disable-next-line no-console
  console.log('Demo login — email: admin@demo.com / sales@demo.com / warehouse@demo.com / accounts@demo.com');
  // eslint-disable-next-line no-console
  console.log('Password (all accounts): Password123!');
  // eslint-disable-next-line no-console
  console.log(`Seeded customer: ${customer.name} (${customer.businessName})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
