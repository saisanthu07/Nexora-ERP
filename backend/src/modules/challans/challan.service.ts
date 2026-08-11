import { Prisma, ChallanStatus } from '@prisma/client';
import { prisma } from '../../config/db';
import { ApiError } from '../../utils/ApiError';
import { buildMeta, getPagination } from '../../utils/pagination';
import { generateChallanNumber } from './challanNumber.service';
import { CreateChallanInput, UpdateChallanInput } from './challan.schema';

interface ListParams {
  status?: string;
  customerId?: string;
  page?: string;
  limit?: string;
}

const challanInclude = {
  items: { include: { product: { select: { id: true, name: true, sku: true } } } },
  customer: { select: { id: true, name: true, phone: true, businessName: true } },
  createdBy: { select: { id: true, name: true } },
} as const;

export async function listChallans(params: ListParams) {
  const { skip, take, page, limit } = getPagination(params);

  const where: Prisma.ChallanWhereInput = {
    ...(params.status ? { status: params.status as ChallanStatus } : {}),
    ...(params.customerId ? { customerId: params.customerId } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.challan.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: challanInclude }),
    prisma.challan.count({ where }),
  ]);

  return { items, meta: buildMeta(page, limit, total) };
}

export async function getChallanById(id: string) {
  const challan = await prisma.challan.findUnique({ where: { id }, include: challanInclude });
  if (!challan) throw ApiError.notFound('Challan not found');
  return challan;
}

async function buildLineItems(tx: Prisma.TransactionClient, items: { productId: string; quantity: number }[]) {
  const productIds = [...new Set(items.map((i) => i.productId))];
  const products = await tx.product.findMany({ where: { id: { in: productIds } } });

  if (products.length !== productIds.length) {
    const foundIds = new Set(products.map((p) => p.id));
    const missing = productIds.filter((id) => !foundIds.has(id));
    throw ApiError.badRequest(`Unknown product id(s): ${missing.join(', ')}`, 'INVALID_PRODUCT');
  }

  const productById = new Map(products.map((p) => [p.id, p]));

  const lineItems = items.map((item) => {
    const product = productById.get(item.productId)!;
    const priceNum = Number(product.price);
    const lineTotal = Math.round(priceNum * item.quantity * 100) / 100;
    return {
      productId: product.id,
      productNameSnapshot: product.name,
      skuSnapshot: product.sku,
      priceSnapshot: product.price,
      quantity: item.quantity,
      lineTotal,
    };
  });

  const totalAmount = lineItems.reduce((sum, li) => sum + Number(li.lineTotal), 0);
  const totalQuantity = lineItems.reduce((sum, li) => sum + li.quantity, 0);

  return { lineItems, totalAmount, totalQuantity };
}

export async function createChallan(input: CreateChallanInput, userId: string) {
  const customer = await prisma.customer.findUnique({ where: { id: input.customerId } });
  if (!customer) throw ApiError.badRequest('Customer not found', 'INVALID_CUSTOMER');

  return prisma.$transaction(async (tx) => {
    const { lineItems, totalAmount, totalQuantity } = await buildLineItems(tx, input.items);
    const challanNumber = await generateChallanNumber(tx);

    return tx.challan.create({
      data: {
        challanNumber,
        customerId: input.customerId,
        createdById: userId,
        totalAmount,
        totalQuantity,
        status: ChallanStatus.DRAFT,
        items: { create: lineItems },
      },
      include: challanInclude,
    });
  });
}

export async function updateChallan(id: string, input: UpdateChallanInput) {
  const existing = await prisma.challan.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Challan not found');
  if (existing.status !== ChallanStatus.DRAFT) {
    throw ApiError.unprocessable('Only draft challans can be edited', 'INVALID_STATUS');
  }

  return prisma.$transaction(async (tx) => {
    if (input.items) {
      const { lineItems, totalAmount, totalQuantity } = await buildLineItems(tx, input.items);
      await tx.challanItem.deleteMany({ where: { challanId: id } });
      await tx.challan.update({
        where: { id },
        data: {
          totalAmount,
          totalQuantity,
          ...(input.customerId ? { customerId: input.customerId } : {}),
          items: { create: lineItems },
        },
      });
    } else if (input.customerId) {
      await tx.challan.update({ where: { id }, data: { customerId: input.customerId } });
    }

    return tx.challan.findUnique({ where: { id }, include: challanInclude });
  });
}

/**
 * Confirms a draft challan: validates stock for every line item, then reduces stock
 * and writes an audit trail entry — all inside one transaction with row-level locks
 * so two concurrent confirms can never both succeed against insufficient stock.
 */
export async function confirmChallan(challanId: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const challan = await tx.challan.findUnique({ where: { id: challanId }, include: { items: true } });

    if (!challan) throw ApiError.notFound('Challan not found');
    if (challan.status !== ChallanStatus.DRAFT) {
      throw ApiError.unprocessable('Only draft challans can be confirmed', 'INVALID_STATUS');
    }
    if (challan.items.length === 0) {
      throw ApiError.unprocessable('Cannot confirm a challan with no items', 'EMPTY_CHALLAN');
    }

    // Lock the exact product rows involved, in a stable (sorted) order, to prevent
    // deadlocks between two concurrent challans that share products.
    const productIds = [...new Set(challan.items.map((i) => i.productId))].sort();
    const lockedProducts = await tx.$queryRaw<{ id: string; stock: number }[]>`
      SELECT id, stock FROM "products" WHERE id = ANY(${productIds}) ORDER BY id FOR UPDATE
    `;
    const stockById = new Map(lockedProducts.map((p) => [p.id, p.stock]));

    // Validate every line before mutating any — no partial stock reduction on failure.
    for (const item of challan.items) {
      const available = stockById.get(item.productId) ?? 0;
      if (available < item.quantity) {
        throw ApiError.conflict(
          `Insufficient stock for "${item.skuSnapshot}": have ${available}, need ${item.quantity}`,
          'INSUFFICIENT_STOCK'
        );
      }
    }

    for (const item of challan.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });

      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          type: 'OUT',
          quantity: item.quantity,
          reason: `Challan ${challan.challanNumber} confirmed`,
          refType: 'CHALLAN',
          refId: challan.id,
          createdBy: userId,
        },
      });
    }

    await tx.challan.update({
      where: { id: challanId },
      data: { status: ChallanStatus.CONFIRMED, confirmedAt: new Date() },
    });

    return tx.challan.findUnique({ where: { id: challanId }, include: challanInclude });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
}

export async function cancelChallan(challanId: string) {
  const challan = await prisma.challan.findUnique({ where: { id: challanId } });
  if (!challan) throw ApiError.notFound('Challan not found');
  if (challan.status !== ChallanStatus.DRAFT) {
    throw ApiError.unprocessable('Only draft challans can be cancelled', 'INVALID_STATUS');
  }

  return prisma.challan.update({
    where: { id: challanId },
    data: { status: ChallanStatus.CANCELLED },
    include: challanInclude,
  });
}
