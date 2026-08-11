import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';
import * as productService from './product.service';

export async function listProductsHandler(req: Request, res: Response) {
  const { items, meta } = await productService.listProducts(req.query as Record<string, string>);
  return sendSuccess(res, items, 200, meta);
}

export async function getProductHandler(req: Request, res: Response) {
  const product = await productService.getProductById(req.params.id);
  return sendSuccess(res, product);
}

export async function createProductHandler(req: Request, res: Response) {
  const product = await productService.createProduct(req.body);
  return sendSuccess(res, product, 201);
}

export async function updateProductHandler(req: Request, res: Response) {
  const product = await productService.updateProduct(req.params.id, req.body);
  return sendSuccess(res, product);
}

export async function stockMovementHandler(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const result = await productService.recordStockMovement(req.params.id, req.body, req.user.id);
  return sendSuccess(res, result, 201);
}

export async function listStockMovementsHandler(req: Request, res: Response) {
  const { items, meta } = await productService.listStockMovements(req.params.id, req.query as Record<string, string>);
  return sendSuccess(res, items, 200, meta);
}
