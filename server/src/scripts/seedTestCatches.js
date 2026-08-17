// server/src/scripts/seedTestCatches.js
//
// Populates the DB with realistic-looking test catch data for the
// logged-in user, spread across the last 12 weeks — useful for seeing
// the Pokédex STATS tab (personal records, top river) and the activity
// heatmap actually filled in, instead of staring at an empty grid.
//
// Requires seedWaterways.js and seedFishData.js to have already been run
// (it picks random named Waterway + Species documents that must exist).
//
// Usage:  node src/scripts/seedTestCatches.js          (run from server/)
// Optional catch count:  node src/scripts/seedTestCatches.js 100

import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDB } from '../db.js'
import User from '../models/User.js'
import Waterway from '../models/Waterway.js'
import Species from '../models/Species.js'
import Catch from '../models/Catch.js'

const COUNT = Number(process.argv[2]) || 60

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFloat(min, max, decimals = 1) {
  const val = Math.random() * (max - min) + min
  return Number(val.toFixed(decimals))
}

async function seedTestCatches() {
  await connectDB()

  const user = await User.findOne({})
  if (!user) throw new Error('No user found — sign up in the app first, then re-run this script.')

  const waterways = await Waterway.find({ name: { $ne: null } })
  if (waterways.length === 0) throw new Error('No named waterways found — run seedWaterways.js first.')

  const species = await Species.find({})
  if (species.length === 0) throw new Error('No species found — run seedFishData.js first.')

  const catches = []
  for (let i = 0; i < COUNT; i++) {
    const daysAgo = randomInt(0, 83)
    const caughtAt = new Date()
    caughtAt.setDate(caughtAt.getDate() - daysAgo)
    caughtAt.setHours(randomInt(6, 20), randomInt(0, 59), 0, 0)

    const waterway = waterways[randomInt(0, waterways.length - 1)]
    const sp = species[randomInt(0, species.length - 1)]

    catches.push({
      userId: user._id,
      speciesCode: sp.code,
      speciesName: sp.name,
      riverId: waterway._id,
      riverGroup: waterway.riverGroup,
      weight: randomFloat(0.5, 12, 1),
      length: randomFloat(8, 32, 1),
      notes: '',
      caughtAt,
    })
  }

  await Catch.insertMany(catches)
  console.log(`Inserted ${catches.length} test catches for ${user.email}.`)
  await mongoose.disconnect()
}

seedTestCatches().catch(async (err) => {
  console.error('Seed failed:', err)
  await mongoose.disconnect().catch(() => {})
  process.exitCode = 1
})
