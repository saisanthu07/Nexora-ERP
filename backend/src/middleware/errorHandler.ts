import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';

// Express recognizes this as an error-handling middleware by its 4-argument signature.
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
  }

  // eslint-disable-next-line no-console
  console.error('[UNHANDLED ERROR]', err);

  const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again.';

  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: errorMessage },
  });
}

export function notFoundHandler(req: Request, res: Response) {
  return res.status(404).json({
    success: false,
    error: { code: 'ROUTE_NOT_FOUND', message: `No route: ${req.method} ${req.originalUrl}` },
  });
}
