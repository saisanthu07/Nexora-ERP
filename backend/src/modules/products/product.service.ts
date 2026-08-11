import { Prisma } from '@prisma/client';
import { prisma } from '../../config/db';
import { ApiError } from '../../utils/ApiError';
import { buildMeta, getPagination } from '../../utils/pagination';
import { CreateProductInput, UpdateProductInput } from './product.schema';

interface ListParams {
  search?: string;
  category?: string;
  lowStock?: string;
  page?: string;
  limit?: string;
}

export async function listProducts(params: ListParams) {
  const { skip, take, page, limit } = getPagination(params);

  const where: Prisma.ProductWhereInput = {
    ...(params.category ? { category: params.category } : {}),
    ...(params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: 'insensitive' } },
            { sku: { contains: params.search, mode: 'insensitive' } },
            { category: { contains: params.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [allMatching, total] = await Promise.all([
    // lowStock is a computed comparison (stock <= minStock) — Prisma can't express column-to-column
    // comparisons in `where` directly, so we filter in application code for that case.
    params.lowStock === 'true'
      ? prisma.product.findMany({ where, orderBy: { createdAt: 'desc' } })
      : prisma.product.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.product.count({ where }),
  ]);

  if (params.lowStock === 'true') {
    const filtered = allMatching.filter((p) => p.stock <= p.minStock);
    const page_ = filtered.slice(skip, skip + take);
    return { items: page_, meta: buildMeta(page, limit, filtered.length) };
  }

  return { items: allMatching, meta: buildMeta(page, limit, total) };
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw ApiError.notFound('Product not found');
  return product;
}

export async function createProduct(input: CreateProductInput) {
  const existing = await prisma.product.findUnique({ where: { sku: input.sku } });
  if (existing) throw ApiError.conflict(`SKU "${input.sku}" is already in use`, 'DUPLICATE_SKU');

  return prisma.product.create({ data: input });
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  await getProductById(id);

  if (input.sku) {
    const existing = await prisma.product.findUnique({ where: { sku: input.sku } });
    if (existing && existing.id !== id) {
      throw ApiError.conflict(`SKU "${input.sku}" is already in use`, 'DUPLICATE_SKU');
    }
  }

  return prisma.product.update({ where: { id }, data: input });
}

export async function recordStockMovement(
  productId: string,
  input: { type: 'IN' | 'OUT'; quantity: number; reason: string },
  userId: string
) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product) throw ApiError.notFound('Product not found');

    if (input.type === 'OUT' && product.stock < input.quantity) {
      throw ApiError.conflict(
        `Cannot remove ${input.quantity} units — only ${product.stock} in stock`,
        'INSUFFICIENT_STOCK'
      );
    }

    const newStock = input.type === 'IN' ? product.stock + input.quantity : product.stock - input.quantity;

    const updated = await tx.product.update({ where: { id: productId }, data: { stock: newStock } });

    const movement = await tx.stockMovement.create({
      data: {
        productId,
        type: input.type,
        quantity: input.quantity,
        reason: input.reason,
        refType: 'MANUAL',
        createdBy: userId,
      },
    });

    return { product: updated, movement };
  });
}

export async function listStockMovements(productId: string, params: { page?: string; limit?: string }) {
  await getProductById(productId);
  const { skip, take, page, limit } = getPagination(params);

  const [items, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where: { productId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.stockMovement.count({ where: { productId } }),
  ]);

  return { items, meta: buildMeta(page, limit, total) };
}
