import mongoose from 'mongoose';

const catchSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  speciesCode: { type: String, required: true },
  speciesName: { type: String, required: true },
  riverName:   { type: String, required: true },
  weight:      { type: Number, default: null },
  length:      { type: Number, default: null },
  notes:       { type: String, default: '' },
  caughtAt:    { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Catch', catchSchema);