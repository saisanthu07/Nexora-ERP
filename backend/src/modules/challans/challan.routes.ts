import { Router } from 'express';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validateBody } from '../../middleware/validate';
import {
  cancelChallanHandler,
  confirmChallanHandler,
  createChallanHandler,
  getChallanHandler,
  listChallansHandler,
  updateChallanHandler,
} from './challan.controller';
import { createChallanSchema, updateChallanSchema } from './challan.schema';

const router = Router();

router.use(authenticate);

const canView = authorize(Role.ADMIN, Role.SALES, Role.ACCOUNTS, Role.WAREHOUSE);
const canWrite = authorize(Role.ADMIN, Role.SALES);
const canCancel = authorize(Role.ADMIN);

router.get('/', canView, asyncHandler(listChallansHandler));
router.get('/:id', canView, asyncHandler(getChallanHandler));
router.post('/', canWrite, validateBody(createChallanSchema), asyncHandler(createChallanHandler));
router.patch('/:id', canWrite, validateBody(updateChallanSchema), asyncHandler(updateChallanHandler));
router.post('/:id/confirm', canWrite, asyncHandler(confirmChallanHandler));
router.post('/:id/cancel', canCancel, asyncHandler(cancelChallanHandler));

export default router;
