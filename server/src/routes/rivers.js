/**
 * server/src/routes/rivers.js — River API Routes
 *
 * Defines which HTTP method + URL maps to which controller function.
 * This file intentionally contains NO logic — it's just a routing table.
 *
 * These routes are mounted at /api/rivers in index.js, so:
 *   router.get('/')         → GET  /api/rivers
 *   router.get('/:osmId')   → GET  /api/rivers/12345678
 *   router.post('/')        → POST /api/rivers
 *   router.delete('/:osmId')→ DELETE /api/rivers/12345678
 *
 * TO ADD A NEW ROUTE:
 *  1. Add the handler to controllers/riverController.js
 *  2. Import it here
 *  3. Add a router.method(path, handler) line below
 *
 * :osmId is a URL parameter — Express parses it and puts it in req.params.osmId
 */

import { Router } from 'express'
import {
  getRivers,
  getRiver,
  upsertRiver,
  deleteRiver,
} from '../controllers/riverController.js'

const router = Router()

router.get('/',          getRivers)    // List all saved rivers
router.get('/:osmId',    getRiver)     // Get one river by OSM ID
router.post('/',         upsertRiver)  // Create or update a river
router.delete('/:osmId', deleteRiver)  // Delete saved river data

export default router
