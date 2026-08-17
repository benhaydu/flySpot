import mongoose from 'mongoose'

const closureSchema = new mongoose.Schema({
  fromMonth:   { type: Number, required: true, min: 1, max: 12 },
  fromDay:     { type: Number, required: true, min: 1, max: 31 },
  toMonth:     { type: Number, required: true, min: 1, max: 12 },
  toDay:       { type: Number, required: true, min: 1, max: 31 },
  description: { type: String },
}, { _id: false })

const regulationSchema = new mongoose.Schema({
  riverGroup: { type: String, required: true, trim: true, lowercase: true }, // matched OSM riverGroup — the query key
  riverName:  { type: String, trim: true, lowercase: true }, // BC/PDF name, informational only now
  pdfName:    { type: String },
  mgmtUnit:   { type: String },
  rules:      [{ type: String }],
  closures:   [closureSchema],
  year:       { type: Number, default: () => new Date().getFullYear() },
}, { timestamps: true })

regulationSchema.index({ riverGroup: 1 })

export default mongoose.model('Regulation', regulationSchema)
