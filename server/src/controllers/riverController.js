/**
 * server/src/controllers/riverController.js — River Request Handlers
 *
 * Controllers contain the actual logic for each API endpoint.
 * They are kept separate from the route definitions (routes/rivers.js)
 * so that routes stay clean (just URL + method → handler) and logic
 * is easy to find and test.
 *
 * PATTERN:
 *  Every handler follows: try { do DB work, send response } catch { send error }
 *
 * ENDPOINTS HANDLED HERE:
 *  GET    /api/rivers          → getRivers   (list all saved rivers)
 *  GET    /api/rivers/:osmId   → getRiver    (get one river by OSM ID)
 *  POST   /api/rivers          → upsertRiver (create or update)
 *  DELETE /api/rivers/:osmId   → deleteRiver (remove saved data)
 *
 * UPSERT PATTERN:
 *  Instead of separate POST (create) and PUT (update) endpoints, we use a
 *  single upsert: if a document with the given osmId exists, update it;
 *  otherwise create it. This is simpler for the client — it doesn't need
 *  to know whether a river has been saved before.
 */

import River from '../models/River.js'

/**
 * GET /api/rivers
 * Returns all rivers the user has saved (bookmarked, noted, etc.)
 */
export async function getRivers(_req, res) {
  try {
    const rivers = await River.find()
    res.json(rivers)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * GET /api/rivers/:osmId
 * Returns a single saved river by its OSM way ID.
 * Returns 404 if this river hasn't been saved yet (that's normal — it just
 * means the user hasn't interacted with it yet).
 */
export async function getRiver(req, res) {
  try {
    const river = await River.findOne({ osmId: Number(req.params.osmId) })
    if (!river) return res.status(404).json({ error: 'Not found' })
    res.json(river)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * POST /api/rivers
 * Creates or updates a river document (upsert by osmId).
 *
 * Expected request body:
 * {
 *   osmId:      12345678,
 *   name:       "Gold River",
 *   riverGroup: "gold river",
 *   notes:      "Great salmon run in October",
 *   bookmarked: true
 * }
 */
export async function upsertRiver(req, res) {
  try {
    const { osmId, ...data } = req.body

    // findOneAndUpdate with upsert:true creates the document if it doesn't exist.
    // new:true returns the updated document (not the old one).
    // runValidators:true enforces the schema rules on update (not just on create).
    const river = await River.findOneAndUpdate(
      { osmId },                              // filter: find by osmId
      { osmId, ...data },                     // update: set all provided fields
      { upsert: true, new: true, runValidators: true }
    )
    res.json(river)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

/**
 * DELETE /api/rivers/:osmId
 * Removes a river's saved data. The river still appears on the map
 * (it comes from OSM, not MongoDB) — this just clears the user's notes/bookmark.
 */
export async function deleteRiver(req, res) {
  try {
    await River.findOneAndDelete({ osmId: Number(req.params.osmId) })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
