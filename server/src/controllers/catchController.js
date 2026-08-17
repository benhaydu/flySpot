import Catch from '../models/Catch.js';
import Waterway from '../models/Waterway.js';

export const logCatch = async (req, res) => {
  const { speciesCode, speciesName, osmId, weight, length, notes, caughtAt } = req.body;

  if (!speciesCode || !speciesName || !osmId)
    return res.status(400).json({ error: 'speciesCode, speciesName and osmId are required' });

  const waterway = await Waterway.findOne({ osmId });
  if (!waterway) return res.status(400).json({ error: 'Unknown waterway' });

  const newCatch = await Catch.create({
    userId: req.user.id,
    speciesCode,
    speciesName,
    riverId: waterway._id,
    riverGroup: waterway.riverGroup,
    weight,
    length,
    notes,
    caughtAt,
  });

  res.status(201).json(newCatch);
};

export const getMyCatches = async (req, res) => {
  const catches = await Catch.find({ userId: req.user.id }).sort({ caughtAt: -1 });
  res.json(catches);
};

export const getCatchesByRiver = async (req, res) => {
  const riverGroup = req.params.riverGroup.toLowerCase().trim();
  const catches = await Catch.find({ userId: req.user.id, riverGroup }).sort({ caughtAt: -1 });
  res.json(catches);
};