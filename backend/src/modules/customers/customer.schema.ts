import { z } from 'zod';
import { CustomerStatus, CustomerType } from '@prisma/client';

export const createCustomerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(150, 'Name too long'),
  phone: z.string().trim().min(7, 'Enter a valid phone number').max(20, 'Phone number too long'),
  email: z.string().trim().toLowerCase().email('Invalid email').max(255).optional().or(z.literal('')).transform((v: string | undefined) => (v === '' ? undefined : v)),
  businessName: z.string().trim().max(200, 'Business name too long').optional(),
  gstNumber: z.string().trim().max(50, 'GST Number too long').optional(),
  type: z.nativeEnum(CustomerType).default(CustomerType.RETAIL),
  status: z.nativeEnum(CustomerStatus).default(CustomerStatus.LEAD),
  followUpDate: z.coerce.date().optional(),
  note: z.string().trim().max(2000, 'Note too long').optional(), // optional initial note
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const addNoteSchema = z.object({
  content: z.string().trim().min(1, 'Note content cannot be empty').max(2000, 'Note content too long'),
});

export const listCustomersQuerySchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(CustomerStatus).optional(),
  type: z.nativeEnum(CustomerType).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
