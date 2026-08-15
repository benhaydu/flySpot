/**
 * server/src/index.js — Server Entry Point
 *
 * Connects to MongoDB, then starts the HTTP server. All Express app
 * configuration (middleware, routes, error handling) lives in app.js —
 * this file's only job is wiring the DB connection to app.listen().
 */

import { connectDB } from './db.js'
import app from './app.js'

const PORT = process.env.PORT || 3001

// Connect to MongoDB first, then start the HTTP server.
// If the DB connection fails, the server won't start (fail loudly).
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
})
