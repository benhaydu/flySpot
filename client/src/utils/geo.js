/**
 * calcLengthKm — total length of a polyline in kilometres using the
 * Haversine formula (accounts for Earth's curvature).
 *
 * @param {[number, number][]} coordinates  — GeoJSON [lon, lat] pairs
 * @returns {number}  length in km
 */
export function calcLengthKm(coordinates) {
  let total = 0
  for (let i = 1; i < coordinates.length; i++) {
    const [lon1, lat1] = coordinates[i - 1]
    const [lon2, lat2] = coordinates[i]
    const R    = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
    total += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }
  return total
}
