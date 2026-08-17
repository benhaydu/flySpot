import Catch from '../models/Catch.js';
import Waterway from '../models/Waterway.js';
import mongoose from 'mongoose';

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
export const getCatchStats = async (req, res) => {
  const userId = req.user.id;
  const twelveWeeksAgo = new Date(Date.now() - 84 * 24 * 60 * 60 * 1000);

  const [result] = await Catch.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $facet: {
        totals: [
          { $group: { _id: null, totalCatches: { $sum: 1 }, uniqueSpecies: { $addToSet: '$speciesCode' } } },
          { $project: { _id: 0, totalCatches: 1, uniqueSpecies: { $size: '$uniqueSpecies' } } },
        ],
        longest: [
          { $match: { length: { $ne: null } } },
          { $sort: { length: -1 } },
          { $limit: 1 },
          { $project: { _id: 0, speciesName: 1, length: 1 } },
        ],
        heaviest: [
          { $match: { weight: { $ne: null } } },
          { $sort: { weight: -1 } },
          { $limit: 1 },
          { $project: { _id: 0, speciesName: 1, weight: 1 } },
        ],
        topRiver: [
          { $group: { _id: '$riverGroup', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 1 },
        ],
        activity: [
          { $match: { caughtAt: { $gte: twelveWeeksAgo } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$caughtAt', timezone: 'UTC' } },
              count: { $sum: 1 },
            },
          },
        ],
      },
    },
  ]);

  res.json({
    totalCatches: result.totals[0]?.totalCatches ?? 0,
    uniqueSpecies: result.totals[0]?.uniqueSpecies ?? 0,
    longest: result.longest[0] ?? null,
    heaviest: result.heaviest[0] ?? null,
    topRiver: result.topRiver[0] ? { riverGroup: result.topRiver[0]._id, count: result.topRiver[0].count } : null,
    activity: result.activity.map(a => ({ date: a._id, count: a.count })),
  });
};