import mongoose from 'mongoose';

const speciesSchema = new mongoose.Schema({
code:        { type: String, required: true, unique: true },
name:        { type: String, required: true },
caught:      { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Species', speciesSchema);