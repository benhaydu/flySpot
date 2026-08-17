import Species from '../models/Species.js';
import RiverSpecies from '../models/RiverSpecies.js';

export const getAllSpecies = async (req, res) => {
  const species = await Species.find().sort({ name: 1 });
  res.json(species);
};

export const getSpeciesByRiver = async (req, res) => {
  const riverGroup = req.params.riverGroup.toLowerCase().trim();
  const result = await RiverSpecies.findOne({ riverGroup });
  if (!result) return res.json({ riverGroup, speciesList: [] });
  res.json(result);
};