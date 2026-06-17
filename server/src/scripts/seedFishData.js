import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../db.js';
import Species from '../models/Species.js';
import RiverSpecies from '../models/RiverSpecies.js';

const WFS_URL = 'https://openmaps.gov.bc.ca/geo/pub/WHSE_FISH.FISS_FISH_OBSRVTN_PNT_SP/ows';

// Vancouver Island bounding box
const BBOX = '-128.5,48.3,-123.3,50.9,EPSG:4326';

const SPORT_FISH_CODES = new Set([
  'CO', 'CK', 'CH', 'CT', 'RB', 'ST',
  'BT', 'DV', 'PK', 'SK', 'CM', 'GB',
  'AGB', 'EB', 'KO', 'AS', 'ACT', 'CCT',
  'LT', 'MT',
]);

// Merge variants into canonical species to avoid duplicates in the display
const CANONICAL = {
  CH:  { code: 'CK', name: 'Chinook Salmon' },
  AGB: { code: 'GB', name: 'Brown Trout' },
  ACT: { code: 'CT', name: 'Cutthroat Trout' },
  CCT: { code: 'CT', name: 'Cutthroat Trout' },
  AS:  { code: 'AS', name: 'Atlantic Salmon' },
};

async function fetchPage(startIndex) {
  const params = new URLSearchParams({
    service: 'WFS',
    version: '2.0.0',
    request: 'GetFeature',
    typeName: 'pub:WHSE_FISH.FISS_FISH_OBSRVTN_PNT_SP',
    outputFormat: 'application/json',
    srsName: 'EPSG:4326',
    bbox: BBOX,
    count: 1000,
    startIndex,
    propertyName: 'SPECIES_CODE,SPECIES_NAME,GAZETTED_NAME,WATERBODY_TYPE',
  });

  const res = await fetch(`${WFS_URL}?${params}`);
  if (!res.ok) throw new Error(`WFS error: ${res.status}`);
  return res.json();
}

async function seed() {
  await connectDB();

  console.log('Fetching fish data from BC government WFS...');

  const riverSpeciesMap = {};  // { riverName: { code: name } }
  const allSpecies = {};       // { code: name }

  let startIndex = 0;
  let total = Infinity;

  while (startIndex < total) {
    console.log(`Fetching records ${startIndex}...`);
    const data = await fetchPage(startIndex);

    if (total === Infinity) total = data.totalFeatures;
    console.log(`Total features: ${total}`);

    for (const feature of data.features) {
      const { SPECIES_CODE, SPECIES_NAME, GAZETTED_NAME, WATERBODY_TYPE } = feature.properties;

      if (!GAZETTED_NAME || !SPECIES_NAME || !SPECIES_CODE) continue;
      if (!['River', 'Stream', 'Creek'].includes(WATERBODY_TYPE)) continue;
      if (!SPORT_FISH_CODES.has(SPECIES_CODE)) continue;

      // Merge variant codes into their canonical parent species
      const canonical = CANONICAL[SPECIES_CODE];
      const code = canonical ? canonical.code : SPECIES_CODE;
      const name = canonical ? canonical.name : SPECIES_NAME;

      const riverKey = GAZETTED_NAME.trim().toLowerCase();
      allSpecies[code] = name;

      if (!riverSpeciesMap[riverKey]) riverSpeciesMap[riverKey] = {};
      riverSpeciesMap[riverKey][code] = name;
    }

    startIndex += 1000;
  }

  // Save all unique species
  console.log(`Saving ${Object.keys(allSpecies).length} species...`);
  for (const [code, name] of Object.entries(allSpecies)) {
    await Species.findOneAndUpdate({ code }, { code, name }, { upsert: true });
  }

  // Save river→species mappings
  console.log(`Saving ${Object.keys(riverSpeciesMap).length} rivers...`);
  for (const [riverName, speciesObj] of Object.entries(riverSpeciesMap)) {
    const speciesList = Object.entries(speciesObj).map(([code, name]) => ({ code, name }));
    await RiverSpecies.findOneAndUpdate({ riverName }, { riverName, speciesList }, { upsert: true });
  }

  console.log('Done!');
  mongoose.disconnect();
}

seed().catch(err => { console.error(err); mongoose.disconnect(); });