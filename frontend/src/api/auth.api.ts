import { client } from './client';
import { ApiSuccess, User } from '../types';

export async function login(email: string, password: string) {
  const res = await client.post<ApiSuccess<{ token: string; user: User }>>('/auth/login', { email, password });
  return res.data.data;
}

export async function me() {
  const res = await client.get<ApiSuccess<User>>('/auth/me');
  return res.data.data;
}

export async function listUsers() {
  const res = await client.get<ApiSuccess<User[]>>('/auth/users');
  return res.data.data;
}

export async function createUser(data: { name: string; email: string; password: string; role: string }) {
  const res = await client.post<ApiSuccess<User>>('/auth/register', data);
  return res.data.data;
}

export async function updateUser(id: string, data: { name?: string; email?: string; password?: string; role?: string }) {
  const res = await client.put<ApiSuccess<User>>(`/auth/users/${id}`, data);
  return res.data.data;
}

export async function deleteUser(id: string) {
  const res = await client.delete<ApiSuccess<void>>(`/auth/users/${id}`);
  return res.data.data;
}
