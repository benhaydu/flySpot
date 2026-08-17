import { Router } from 'express'
import { getWaterways } from '../controllers/waterwayController.js'
import { asyncHandler } from '../middleware/asyncHandler.js'

const router = Router()

router.get('/', asyncHandler(getWaterways))

export default router