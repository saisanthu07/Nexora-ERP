import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/ApiResponse';
import * as authService from './auth.service';
import { ApiError } from '../../utils/ApiError';

export async function loginHandler(req: Request, res: Response) {
  const result = await authService.login(req.body);
  return sendSuccess(res, result);
}

export async function registerHandler(req: Request, res: Response) {
  const result = await authService.register(req.body);
  return sendSuccess(res, result, 201);
}

export async function meHandler(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const result = await authService.getById(req.user.id);
  return sendSuccess(res, result);
}
