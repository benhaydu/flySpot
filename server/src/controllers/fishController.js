import Species from '../models/Species.js';
import RiverSpecies from '../models/RiverSpecies.js';

export const getAllSpecies = async (req, res) => {
  const species = await Species.find().sort({ name: 1 });
  res.json(species);
};

export const getSpeciesByRiver = async (req, res) => {
  const riverName = req.params.name.toLowerCase().trim();
  const result = await RiverSpecies.findOne({ riverName });
  if (!result) return res.json({ riverName, speciesList: [] });
  res.json(result);
};