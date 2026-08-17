import Regulation from '../models/Regulation.js'
import { isDateInClosure } from '../utils/closures.js'

export async function getRegulationsByRiver(req, res) {
  const riverGroup = req.params.riverGroup.toLowerCase().trim()
  const reg = await Regulation.findOne({ riverGroup })
  if (!reg) return res.json(null)
  res.json(reg)
}

export async function getClosedToday(req, res) {
  const regs  = await Regulation.find({ 'closures.0': { $exists: true } }, 'riverGroup closures')
  const today = new Date()
  const closedGroups = regs
    .filter(r => r.closures.some(c => isDateInClosure(today, c)))
    .map(r => r.riverGroup)
  res.json(closedGroups)
}
