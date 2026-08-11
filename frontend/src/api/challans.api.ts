import { client } from './client';
import { ApiSuccess, Challan, PaginationMeta } from '../types';

export interface ListChallansParams {
  status?: string;
  customerId?: string;
  page?: number;
  limit?: number;
}

export interface ChallanItemInput {
  productId: string;
  quantity: number;
}

export async function listChallans(params: ListChallansParams) {
  const res = await client.get<ApiSuccess<Challan[]>>('/challans', { params });
  return { items: res.data.data, meta: res.data.meta as PaginationMeta };
}

export async function getChallan(id: string) {
  const res = await client.get<ApiSuccess<Challan>>(`/challans/${id}`);
  return res.data.data;
}

export async function createChallan(payload: { customerId: string; items: ChallanItemInput[] }) {
  const res = await client.post<ApiSuccess<Challan>>('/challans', payload);
  return res.data.data;
}

export async function updateChallan(
  id: string,
  payload: { customerId?: string; items?: ChallanItemInput[] }
) {
  const res = await client.patch<ApiSuccess<Challan>>(`/challans/${id}`, payload);
  return res.data.data;
}

export async function confirmChallan(id: string) {
  const res = await client.post<ApiSuccess<Challan>>(`/challans/${id}/confirm`);
  return res.data.data;
}

export async function cancelChallan(id: string) {
  const res = await client.post<ApiSuccess<Challan>>(`/challans/${id}/cancel`);
  return res.data.data;
}
