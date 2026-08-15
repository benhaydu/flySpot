import { Router } from 'express'
import { getRegulationsByRiver } from '../controllers/regulationController.js'
import { asyncHandler } from '../middleware/asyncHandler.js'

const router = Router()

router.get('/:riverName', asyncHandler(getRegulationsByRiver))

export default router
