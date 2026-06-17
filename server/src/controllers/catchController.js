import Catch from '../models/Catch.js';

export const logCatch = async (req, res) => {
  const { speciesCode, speciesName, riverName, weight, length, notes, caughtAt } = req.body;

  if (!speciesCode || !speciesName || !riverName)
    return res.status(400).json({ error: 'speciesCode, speciesName and riverName are required' });

  const newCatch = await Catch.create({
    userId: req.user.id,
    speciesCode,
    speciesName,
    riverName: riverName.toLowerCase().trim(),
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
  const riverName = req.params.name.toLowerCase().trim();
  const catches = await Catch.find({ userId: req.user.id, riverName }).sort({ caughtAt: -1 });
  res.json(catches);
};