import { Router } from 'express'
import { getRegulationsByRiver, getClosedToday } from '../controllers/regulationController.js'
import { asyncHandler } from '../middleware/asyncHandler.js'

const router = Router()

router.get('/closed-today', asyncHandler(getClosedToday))
router.get('/:riverGroup', asyncHandler(getRegulationsByRiver))

export default router
