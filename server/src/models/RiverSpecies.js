import mongoose from 'mongoose';

const riverSpeciesSchema = new mongoose.Schema({
  riverName:   { type: String, required: true, unique: true },
  riverGroup: { type: String, index: true },
  speciesList: [{ code: String, name: String }],
}, { timestamps: true });

export default mongoose.model('RiverSpecies', riverSpeciesSchema);