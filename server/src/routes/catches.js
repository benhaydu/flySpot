import { Router } from 'express';
import { logCatch, getMyCatches, getCatchesByRiver, getCatchStats } from '../controllers/catchController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';


const router = Router();

router.use(asyncHandler(requireAuth));

router.post('/',              asyncHandler(logCatch));
router.get('/',               asyncHandler(getMyCatches));
router.get('/river/:riverGroup', asyncHandler(getCatchesByRiver));
router.get('/stats', asyncHandler(getCatchStats));

export default router;