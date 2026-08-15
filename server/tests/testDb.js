import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

let mongod

export async function connectTestDB() {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
}

export async function disconnectTestDB() {
  await mongoose.disconnect()
  await mongod.stop()
}

export async function clearTestDB() {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
}