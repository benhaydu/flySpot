// server/src/scripts/wipeCatches.js
//
// One-off cleanup for the Step 4c schema change: old Catch documents
// used a free-text `riverName` field that no longer exists on the schema
// (replaced by `riverId` + `riverGroup`). Rather than migrate that string
// data, we're just clearing it out — this is the only account on the DB.
//
// Usage:  node src/scripts/wipeCatches.js   (run from the server/ folder)

import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDB } from '../db.js'
import Catch from '../models/Catch.js'

async function wipeCatches() {
  await connectDB()
  const { deletedCount } = await Catch.deleteMany({})
  console.log(`Deleted ${deletedCount} old catch document(s).`)
  await mongoose.disconnect()
}

wipeCatches().catch(async (err) => {
  console.error('Wipe failed:', err)
  await mongoose.disconnect().catch(() => {})
  process.exitCode = 1
})
