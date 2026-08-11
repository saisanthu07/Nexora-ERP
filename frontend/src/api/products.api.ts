import { client } from './client';
import { ApiSuccess, PaginationMeta, Product, StockMovement } from '../types';

export interface ListProductsParams {
  search?: string;
  category?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}

export async function listProducts(params: ListProductsParams) {
  const res = await client.get<ApiSuccess<Product[]>>('/products', { params });
  return { items: res.data.data, meta: res.data.meta as PaginationMeta };
}

export async function getProduct(id: string) {
  const res = await client.get<ApiSuccess<Product>>(`/products/${id}`);
  return res.data.data;
}

export async function createProduct(payload: Partial<Product>) {
  const res = await client.post<ApiSuccess<Product>>('/products', payload);
  return res.data.data;
}

export async function updateProduct(id: string, payload: Partial<Product>) {
  const res = await client.patch<ApiSuccess<Product>>(`/products/${id}`, payload);
  return res.data.data;
}

export async function recordStockMovement(
  id: string,
  payload: { type: 'IN' | 'OUT'; quantity: number; reason: string }
) {
  const res = await client.post<ApiSuccess<{ product: Product; movement: StockMovement }>>(
    `/products/${id}/stock-movement`,
    payload
  );
  return res.data.data;
}

export async function listStockMovements(id: string, params: { page?: number; limit?: number }) {
  const res = await client.get<ApiSuccess<StockMovement[]>>(`/products/${id}/stock-movements`, { params });
  return { items: res.data.data, meta: res.data.meta as PaginationMeta };
}
