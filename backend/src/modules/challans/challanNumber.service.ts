import { Prisma } from '@prisma/client';

type TxClient = Prisma.TransactionClient;

/**
 * Generates the next challan number atomically, e.g. "CH-2026-000123".
 *
 * Must be called inside the SAME transaction that creates the challan, using a
 * dedicated single-row sequence table (rather than COUNT(*) on the challans table)
 * so concurrent requests can never be handed the same number.
 */
export async function generateChallanNumber(tx: TxClient): Promise<string> {
  const year = new Date().getFullYear();

  // Lock the single sequence row for the duration of this transaction.
  const rows = await tx.$queryRaw<{ id: number; year: number; lastNumber: number }[]>`
    SELECT id, year, "lastNumber" FROM "challan_sequence" WHERE id = 1 FOR UPDATE
  `;

  let nextNumber: number;

  if (rows.length === 0) {
    nextNumber = 1;
    await tx.$executeRaw`
      INSERT INTO "challan_sequence" (id, year, "lastNumber") VALUES (1, ${year}, ${nextNumber})
    `;
  } else {
    const current = rows[0];
    nextNumber = current.year === year ? current.lastNumber + 1 : 1;
    await tx.$executeRaw`
      UPDATE "challan_sequence" SET year = ${year}, "lastNumber" = ${nextNumber} WHERE id = 1
    `;
  }

  return `CH-${year}-${String(nextNumber).padStart(6, '0')}`;
}
