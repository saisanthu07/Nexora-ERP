import { z } from 'zod';
import { CustomerStatus, CustomerType } from '@prisma/client';

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  email: z.string().email().optional().or(z.literal('')).transform((v) => (v === '' ? undefined : v)),
  businessName: z.string().optional(),
  gstNumber: z.string().optional(),
  type: z.nativeEnum(CustomerType).default(CustomerType.RETAIL),
  status: z.nativeEnum(CustomerStatus).default(CustomerStatus.LEAD),
  followUpDate: z.coerce.date().optional(),
  note: z.string().optional(), // optional initial note
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const addNoteSchema = z.object({
  content: z.string().min(1, 'Note content cannot be empty'),
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
