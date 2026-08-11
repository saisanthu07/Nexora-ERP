import { z } from 'zod';

export const challanItemInputSchema = z.object({
  productId: z.string().uuid('Invalid product id'),
  quantity: z.coerce.number().int().positive('Quantity must be greater than 0').max(100000, 'Quantity out of bounds'),
});

export const createChallanSchema = z.object({
  customerId: z.string().uuid('Invalid customer id'),
  items: z.array(challanItemInputSchema).min(1, 'A challan needs at least one item').max(100, 'Maximum 100 items per challan'),
});

export const updateChallanSchema = z.object({
  customerId: z.string().uuid().optional(),
  items: z.array(challanItemInputSchema).min(1, 'A challan needs at least one item').max(100, 'Maximum 100 items per challan').optional(),
});

export type CreateChallanInput = z.infer<typeof createChallanSchema>;
export type UpdateChallanInput = z.infer<typeof updateChallanSchema>;
