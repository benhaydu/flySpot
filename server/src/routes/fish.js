import { Router } from 'express';
import { getAllSpecies, getSpeciesByRiver } from '../controllers/fishController.js';

const router = Router();

router.get('/species', getAllSpecies);
router.get('/river/:name', getSpeciesByRiver);

export default router;