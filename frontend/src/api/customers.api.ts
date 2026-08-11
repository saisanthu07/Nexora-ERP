import { client } from './client';
import { ApiSuccess, Customer, Note, PaginationMeta } from '../types';

export interface ListCustomersParams {
  search?: string;
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export async function listCustomers(params: ListCustomersParams) {
  const res = await client.get<ApiSuccess<Customer[]>>('/customers', { params });
  return { items: res.data.data, meta: res.data.meta as PaginationMeta };
}

export async function getCustomer(id: string) {
  const res = await client.get<ApiSuccess<Customer>>(`/customers/${id}`);
  return res.data.data;
}

export async function createCustomer(payload: Partial<Customer> & { note?: string }) {
  const res = await client.post<ApiSuccess<Customer>>('/customers', payload);
  return res.data.data;
}

export async function updateCustomer(id: string, payload: Partial<Customer>) {
  const res = await client.patch<ApiSuccess<Customer>>(`/customers/${id}`, payload);
  return res.data.data;
}

export async function addNote(customerId: string, content: string) {
  const res = await client.post<ApiSuccess<Note>>(`/customers/${customerId}/notes`, { content });
  return res.data.data;
}
