import mongoose from 'mongoose';

const catchSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  speciesCode: { type: String, required: true },
  speciesName: { type: String, required: true },
  riverId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Waterway', required: true },
  riverGroup:  { type: String, required: true },
  weight:      { type: Number, default: null, min: [0, 'Weight cannot be negative'], max: [100, 'Weight seems unrealistic'] },
  length:      { type: Number, default: null, min: [0, 'Length cannot be negative'], max: [200, 'Length seems unrealistic'] },
  notes:       { type: String, default: '' },
  caughtAt:    { type: Date, default: Date.now },
}, { timestamps: true });

catchSchema.index({ userId: 1, riverGroup: 1 });

export default mongoose.model('Catch', catchSchema);