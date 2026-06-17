/**
 * server/src/models/River.js — River Mongoose Model
 *
 * Defines the shape of documents stored in the `rivers` MongoDB collection.
 * This does NOT store the map geometry (that always comes from OSM/Overpass).
 * Instead it stores USER-GENERATED data associated with a river.
 *
 * HOW IT LINKS TO OSM DATA:
 *  Every OSM waterway has a unique numeric ID (the `id` field in GeoJSON
 *  properties). We store that as `osmId` here, so a document in MongoDB
 *  can be matched back to the correct feature on the map.
 *
 * DOCUMENT SHAPE:
 * {
 *   osmId:      12345678,          // OSM way ID — the link to map data
 *   name:       "Gold River",      // copied from OSM for easy querying
 *   riverGroup: "gold river",      // lowercased grouping key (matches GeoJSON)
 *   notes:      "Good salmon run", // user's free-text notes
 *   bookmarked: true,              // whether the user has saved this river
 *   createdAt:  Date,              // auto-set by Mongoose (timestamps: true)
 *   updatedAt:  Date,              // auto-updated by Mongoose
 * }
 *
 * TO ADD NEW FIELDS (e.g. a catch log array):
 *  Add a field to the schema below:
 *    catches: [{ date: Date, species: String, weight: Number }]
 *  Then run your server — Mongoose will accept the new shape immediately
 *  (MongoDB is schema-flexible; the schema here is enforced at the app level).
 */

import mongoose from 'mongoose'

const riverSchema = new mongoose.Schema(
  {
    // osmId is unique — one MongoDB document per OSM waterway way
    osmId:      { type: Number, required: true, unique: true },
    name:       { type: String },        // may be null for unnamed waterways
    riverGroup: { type: String },        // lowercased grouping key
    notes:      { type: String, default: '' },
    bookmarked: { type: Boolean, default: false },
  },
  {
    // Automatically adds `createdAt` and `updatedAt` fields to every document
    timestamps: true,
  }
)

// mongoose.model('River', schema) creates (or reuses) the `rivers` collection
// The first argument ('River') determines the collection name ('rivers' in MongoDB)
export default mongoose.model('River', riverSchema)
