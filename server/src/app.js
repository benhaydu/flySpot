/**
 * server/src/app.js — Express Application Configuration
 *
 * Builds and exports the configured Express app: middleware, routes,
 * the 404 handler, and the error handler. It does NOT connect to
 * MongoDB and does NOT call app.listen() — that's index.js's job.
 *
 * Keeping those responsibilities separate means this file can be
 * imported directly (e.g. by Supertest in tests) without triggering
 * a real database connection or binding a real port.
 *
 * URL STRUCTURE:
 *  GET  /api/health        — health check (no auth needed)
 *  *    /api/waterways/*   — river/stream geometry (see routes/waterways.js)
 *  *    /api/auth/*        — user auth routes
 *  *    /api/fish/*        — species data
 *  *    /api/catches/*     — logged catches (auth required)
 *  *    /api/regulations/* — BC fishing regulations
 */

import 'dotenv/config'          // Must be first — loads .env into process.env
import './config/validateEnv.js'   // Must be second — fails fast if env is misconfigured

import express from 'express'
import cors    from 'cors'
import compression from 'compression'
import userRoutes from './routes/user.js';
import fishRoutes from './routes/fish.js';
import catchRoutes       from './routes/catches.js'
import regulationRoutes  from './routes/regulations.js'
import rateLimit from 'express-rate-limit'
import waterwayRoutes from './routes/waterways.js'

const app = express()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 10,                     // 10 requests per IP per window
  message: { error: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
})

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(compression())
app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? true}))

// express.json() parses incoming request bodies with Content-Type: application/json
// Without this, req.body would be undefined in POST/PUT handlers.
app.use(express.json())

// ── Routes ────────────────────────────────────────────────────────────────────

app.use('/api/auth', authLimiter, userRoutes);
app.use('/api/fish', fishRoutes);
app.use('/api/catches',      catchRoutes)
app.use('/api/regulations', regulationRoutes)
app.use('/api/waterways', waterwayRoutes)

// Simple health check — useful for deployment monitoring
// e.g. curl http://localhost:3001/api/health → { "status": "ok" }
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

app.use((err, req, res, next) => {
  console.error(`[${req.method} ${req.path}]`, err)

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message })
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ error: `Invalid ${err.path}: ${err.value}` })
  }

  const status = err.status || 500
  const message = process.env.NODE_ENV === 'production' && status === 500
    ? 'Something went wrong'
    : err.message

  res.status(status).json({ error: message })
})

export default app
