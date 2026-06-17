import Regulation from '../models/Regulation.js'

export async function getRegulationsByRiver(req, res) {
  try {
    const riverName = req.params.riverName.toLowerCase().trim()
    const reg = await Regulation.findOne({ riverName })
    if (!reg) return res.json(null)
    res.json(reg)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
