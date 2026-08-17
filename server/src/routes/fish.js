import { Router } from 'express';
import { getAllSpecies, getSpeciesByRiver } from '../controllers/fishController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/species', asyncHandler(getAllSpecies));
router.get('/river/:riverGroup', asyncHandler(getSpeciesByRiver));

export default router;