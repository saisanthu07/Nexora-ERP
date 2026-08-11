import { Router } from 'express';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validateBody } from '../../middleware/validate';
import {
  createProductHandler,
  getProductHandler,
  listProductsHandler,
  listStockMovementsHandler,
  stockMovementHandler,
  updateProductHandler,
} from './product.controller';
import { createProductSchema, stockMovementSchema, updateProductSchema } from './product.schema';

const router = Router();

router.use(authenticate);

const canManage = authorize(Role.ADMIN, Role.WAREHOUSE);

router.get('/', asyncHandler(listProductsHandler));
router.get('/:id', asyncHandler(getProductHandler));
router.get('/:id/stock-movements', asyncHandler(listStockMovementsHandler));
router.post('/', canManage, validateBody(createProductSchema), asyncHandler(createProductHandler));
router.patch('/:id', canManage, validateBody(updateProductSchema), asyncHandler(updateProductHandler));
router.post('/:id/stock-movement', canManage, validateBody(stockMovementSchema), asyncHandler(stockMovementHandler));

export default router;
