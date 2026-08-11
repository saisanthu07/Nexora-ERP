import { Router } from 'express';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validateBody } from '../../middleware/validate';
import {
  addNoteHandler,
  createCustomerHandler,
  getCustomerHandler,
  listCustomersHandler,
  updateCustomerHandler,
} from './customer.controller';
import { addNoteSchema, createCustomerSchema, updateCustomerSchema } from './customer.schema';

const router = Router();

router.use(authenticate);

const canWrite = authorize(Role.ADMIN, Role.SALES);
const canRead = authorize(Role.ADMIN, Role.SALES, Role.ACCOUNTS);

router.get('/', canRead, asyncHandler(listCustomersHandler));
router.get('/:id', canRead, asyncHandler(getCustomerHandler));
router.post('/', canWrite, validateBody(createCustomerSchema), asyncHandler(createCustomerHandler));
router.patch('/:id', canWrite, validateBody(updateCustomerSchema), asyncHandler(updateCustomerHandler));
router.post('/:id/notes', canWrite, validateBody(addNoteSchema), asyncHandler(addNoteHandler));

export default router;
