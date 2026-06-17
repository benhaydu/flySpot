/**
 * server/src/db.js — MongoDB Connection
 *
 * Exports a single `connectDB()` function that is called once at server
 * startup (in index.js). After this resolves, all Mongoose models are
 * ready to use — you never need to call this elsewhere.
 *
 * CONFIGURATION:
 *  Set MONGODB_URI in server/.env, e.g.:
 *    MONGODB_URI=mongodb://localhost:27017/vi-fishing-map      (local)
 *    MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db (Atlas)
 *
 * MONGOOSE vs NATIVE DRIVER:
 *  We use Mongoose because it adds:
 *    - Schemas (enforced shape/types on documents)
 *    - Model classes with built-in CRUD methods
 *    - Automatic validation before saves
 *  The raw MongoDB Node driver gives more control but requires more boilerplate.
 */

import mongoose from 'mongoose'

export async function connectDB() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set in .env')

  // Mongoose maintains a connection pool internally — calling connect() once
  // is all that's needed; every model will reuse the same connection.
  await mongoose.connect(uri)
  console.log('Connected to MongoDB')
}
