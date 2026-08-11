import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { ApiError } from '../utils/ApiError';

export const validateBody = (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const message = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    return next(ApiError.badRequest(message, 'VALIDATION_ERROR'));
  }
  req.body = result.data;
  return next();
};

export const validateQuery = (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    const message = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    return next(ApiError.badRequest(message, 'VALIDATION_ERROR'));
  }
  // Store parsed query separately — req.query is a getter-only property on some Express/Node versions.
  (req as Request & { validatedQuery: unknown }).validatedQuery = result.data;
  return next();
};
