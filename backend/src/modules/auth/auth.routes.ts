import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validateBody } from '../../middleware/validate';
import { loginHandler, meHandler, registerHandler, listUsersHandler, updateUserHandler, deleteUserHandler } from './auth.controller';
import { loginSchema, registerSchema, updateUserSchema } from './auth.schema';
import { Role } from '@prisma/client';

import { authLimiter } from '../../middleware/rateLimiter';

const router = Router();

router.post('/login', authLimiter, validateBody(loginSchema), asyncHandler(loginHandler));

// Only an Admin can create or view employee accounts
router.post('/register', authLimiter, authenticate, authorize(Role.ADMIN), validateBody(registerSchema), asyncHandler(registerHandler));
router.get('/users', authenticate, authorize(Role.ADMIN), asyncHandler(listUsersHandler));
router.put('/users/:id', authenticate, authorize(Role.ADMIN), validateBody(updateUserSchema), asyncHandler(updateUserHandler));
router.delete('/users/:id', authenticate, authorize(Role.ADMIN), asyncHandler(deleteUserHandler));

router.get('/me', authenticate, asyncHandler(meHandler));

export default router;
