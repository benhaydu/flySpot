/**
 * server/src/index.js — Express Application Entry Point
 *
 * This is the server's equivalent of client/src/main.jsx.
 * It wires everything together and starts listening for HTTP requests.
 *
 * HOW IT WORKS:
 *  1. dotenv loads .env so process.env variables are available
 *  2. Express is configured with JSON body parsing and CORS
 *  3. Route files are mounted at URL prefixes
 *  4. MongoDB connection is established via db.js
 *  5. Server starts listening on PORT
 *
 * ADDING NEW ROUTES (e.g. /api/users for login):
 *  1. Create server/src/models/User.js      (Mongoose schema)
 *  2. Create server/src/controllers/userController.js
 *  3. Create server/src/routes/users.js
 *  4. Add:  import userRoutes from './routes/users.js'
 *            app.use('/api/users', userRoutes)
 *
 * URL STRUCTURE:
 *  GET  /api/health        — health check (no auth needed)
 *  *    /api/rivers/*      — river data routes (see routes/rivers.js)
 *  *    /api/users/*       — (future) user auth routes
 */

import 'dotenv/config'          // Must be first — loads .env into process.env
import express from 'express'
import cors    from 'cors'
import { connectDB } from './db.js'
import riverRoutes   from './routes/rivers.js'
import userRoutes from './routes/user.js';
import fishRoutes from './routes/fish.js';
import catchRoutes       from './routes/catches.js'
import regulationRoutes  from './routes/regulations.js'


const app  = express()
const PORT = process.env.PORT || 3001

// ── Middleware ────────────────────────────────────────────────────────────────

// cors() allows the Vite dev server (localhost:5173) to call this API.
// In production you would restrict this to your actual domain.
app.use(cors())

// express.json() parses incoming request bodies with Content-Type: application/json
// Without this, req.body would be undefined in POST/PUT handlers.
app.use(express.json())

// ── Routes ────────────────────────────────────────────────────────────────────

// Any request to /api/rivers/... is handled by the rivers router
app.use('/api/rivers', riverRoutes)
app.use('/api/auth', userRoutes );
app.use('/api/fish', fishRoutes);
app.use('/api/catches',      catchRoutes)
app.use('/api/regulations', regulationRoutes)
// Simple health check — useful for deployment monitoring
// e.g. curl http://localhost:3001/api/health → { "status": "ok" }
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

// ── Start ─────────────────────────────────────────────────────────────────────

// Connect to MongoDB first, then start the HTTP server.
// If the DB connection fails, the server won't start (fail loudly).
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
})
