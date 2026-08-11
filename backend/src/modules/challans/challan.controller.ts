import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';
import * as challanService from './challan.service';

export async function listChallansHandler(req: Request, res: Response) {
  const { items, meta } = await challanService.listChallans(req.query as Record<string, string>);
  return sendSuccess(res, items, 200, meta);
}

export async function getChallanHandler(req: Request, res: Response) {
  const challan = await challanService.getChallanById(req.params.id);
  return sendSuccess(res, challan);
}

export async function createChallanHandler(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const challan = await challanService.createChallan(req.body, req.user.id);
  return sendSuccess(res, challan, 201);
}

export async function updateChallanHandler(req: Request, res: Response) {
  const challan = await challanService.updateChallan(req.params.id, req.body);
  return sendSuccess(res, challan);
}

export async function confirmChallanHandler(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const challan = await challanService.confirmChallan(req.params.id, req.user.id);
  return sendSuccess(res, challan);
}

export async function cancelChallanHandler(req: Request, res: Response) {
  const challan = await challanService.cancelChallan(req.params.id);
  return sendSuccess(res, challan);
}
