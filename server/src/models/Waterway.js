import mongoose from 'mongoose'

const waterwaySchema = new mongoose.Schema(
  {
    osmId:          { type: Number, required: true, unique: true },
    name:           { type: String, default: null },
    normalizedName: { type: String, default: null },
    riverGroup:     { type: String, required: true },
    waterway:       { type: String, required: true }, // 'river' | 'stream' | 'creek' | 'tidal_channel'

    geometry: {
      type:        { type: String, enum: ['LineString'], required: true },
      coordinates: { type: [[Number]], required: true }, // [[lon, lat], ...]
    },

    bbox: { type: [Number], default: undefined }, // [minLon, minLat, maxLon, maxLat]

    width:        { type: Number, default: null },
    intermittent: { type: Boolean, default: false },
    tunnel:       { type: Boolean, default: false },
    wikipedia:    { type: String, default: null },
    wikidata:     { type: String, default: null },
  },
  { timestamps: true }
)

export default mongoose.model('Waterway', waterwaySchema)