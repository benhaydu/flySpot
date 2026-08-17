import Waterway from '../models/Waterway.js'

export async function getWaterways(req, res) {
  const waterways = await Waterway.find()
    .select('-_id osmId name riverGroup waterway geometry width intermittent tunnel wikipedia wikidata')
    .lean()

  const featureCollection = {
    type: 'FeatureCollection',
    features: waterways.map(doc => ({
      type: 'Feature',
      id: doc.osmId,
      geometry: doc.geometry,
      properties: {
        id:           doc.osmId,
        riverGroup:   doc.riverGroup,
        name:         doc.name,
        waterway:     doc.waterway,
        width:        doc.width,
        intermittent: doc.intermittent,
        tunnel:       doc.tunnel,
        wikipedia:    doc.wikipedia,
        wikidata:     doc.wikidata,
      },
    })),
  }

  res.set('Cache-Control', 'public, max-age=86400')   // 24h — matches your IndexedDB TTL
  res.json(featureCollection)
}
