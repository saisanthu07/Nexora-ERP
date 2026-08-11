import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';
import * as customerService from './customer.service';

export async function listCustomersHandler(req: Request, res: Response) {
  const { items, meta } = await customerService.listCustomers(req.query as Record<string, string>);
  return sendSuccess(res, items, 200, meta);
}

export async function getCustomerHandler(req: Request, res: Response) {
  const customer = await customerService.getCustomerById(req.params.id);
  return sendSuccess(res, customer);
}

export async function createCustomerHandler(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const customer = await customerService.createCustomer(req.body, req.user.id);
  return sendSuccess(res, customer, 201);
}

export async function updateCustomerHandler(req: Request, res: Response) {
  const customer = await customerService.updateCustomer(req.params.id, req.body);
  return sendSuccess(res, customer);
}

export async function addNoteHandler(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const note = await customerService.addNote(req.params.id, req.body.content, req.user.id);
  return sendSuccess(res, note, 201);
}
