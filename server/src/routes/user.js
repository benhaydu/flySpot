import { Router } from 'express';
import { register, login } from '../controllers/userController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));

export default router;