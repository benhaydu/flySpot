const BASE = 'http://localhost:3001/api/fish';

export const getAllSpecies = () =>
  fetch(`${BASE}/species`).then(r => r.json());

export const getSpeciesByRiver = (riverName) =>
  fetch(`${BASE}/river/${encodeURIComponent(riverName)}`).then(r => r.json());
/*What encodeURIComponent does here: river names have spaces (e.g. Campbell River),
 which would break the URL. encodeURIComponent converts them to Campbell%20River so the
  request goes through cleanly.*/