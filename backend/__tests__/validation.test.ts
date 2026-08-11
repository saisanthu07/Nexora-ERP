import { z } from 'zod';
import { createCustomerSchema } from '../src/modules/customers/customer.schema';
import { createProductSchema } from '../src/modules/products/product.schema';

describe('Zod Input Validation Unit Tests', () => {
  test('Customer schema requires valid phone and min length name', () => {
    const invalidPayload = { name: 'A', phone: '123' };
    const result = createCustomerSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });

  test('Customer schema passes for valid customer data', () => {
    const validPayload = {
      name: 'Acme Logistics',
      phone: '9876543210',
      email: 'contact@acme.com',
      address: 'Plot 45, Tech Park, Bangalore',
      type: 'RETAIL',
      status: 'ACTIVE',
    };
    const result = createCustomerSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  test('Product schema enforces positive price and non-negative stock', () => {
    const invalidProduct = {
      name: 'Steel Rods',
      sku: 'SKU-001',
      category: 'Metals',
      price: -50,
      stock: -10,
      warehouse: 'WH-A',
    };
    const result = createProductSchema.safeParse(invalidProduct);
    expect(result.success).toBe(false);
  });
});
