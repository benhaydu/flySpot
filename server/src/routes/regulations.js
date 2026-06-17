import { Router } from 'express'
import { getRegulationsByRiver } from '../controllers/regulationController.js'

const router = Router()

router.get('/:riverName', getRegulationsByRiver)

export default router
