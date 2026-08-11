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
