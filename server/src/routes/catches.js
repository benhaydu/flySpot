import { Router } from 'express';
import { logCatch, getMyCatches, getCatchesByRiver } from '../controllers/catchController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/',              logCatch);
router.get('/',               getMyCatches);
router.get('/river/:name',    getCatchesByRiver);

export default router;