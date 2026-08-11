import { z } from 'zod';
import { StockMovementType } from '@prisma/client';

export const createProductSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(150, 'Name too long'),
  sku: z.string().trim().min(1, 'SKU is required').max(50, 'SKU too long'),
  category: z.string().trim().min(1, 'Category is required').max(100, 'Category too long'),
  price: z.coerce.number().positive('Price must be greater than 0').max(1000000000, 'Price out of bounds'),
  stock: z.coerce.number().int().min(0).max(10000000, 'Stock count out of bounds').default(0),
  minStock: z.coerce.number().int().min(0).max(10000000, 'minStock out of bounds').default(0),
  warehouse: z.string().trim().min(1, 'Warehouse is required').max(100, 'Warehouse too long'),
});

export const updateProductSchema = createProductSchema.partial();

export const stockMovementSchema = z.object({
  type: z.nativeEnum(StockMovementType),
  quantity: z.coerce.number().int().positive('Quantity must be greater than 0').max(1000000, 'Quantity out of bounds'),
  reason: z.string().trim().min(1, 'Reason is required').max(500, 'Reason too long'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type StockMovementInput = z.infer<typeof stockMovementSchema>;
