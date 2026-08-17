const BASE = '/api/fish';

async function handleResponse(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const getAllSpecies = () =>
  fetch(`${BASE}/species`).then(handleResponse);

export const getSpeciesByRiver = (riverName) =>
  fetch(`${BASE}/river/${encodeURIComponent(riverName)}`).then(handleResponse);
/*What encodeURIComponent does here: river names have spaces (e.g. Campbell River),
 which would break the URL. encodeURIComponent converts them to Campbell%20River so the
  request goes through cleanly.*/
