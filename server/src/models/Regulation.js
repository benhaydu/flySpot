import mongoose from 'mongoose'

const regulationSchema = new mongoose.Schema({
  riverName: { type: String, required: true, trim: true, lowercase: true },
  pdfName:   { type: String },
  mgmtUnit:  { type: String },
  rules:     [{ type: String }],
  year:      { type: Number, default: () => new Date().getFullYear() },
}, { timestamps: true })

regulationSchema.index({ riverName: 1 })

export default mongoose.model('Regulation', regulationSchema)
