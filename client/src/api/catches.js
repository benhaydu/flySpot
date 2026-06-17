const BASE = 'http://localhost:3001/api/catches';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

export const logCatch = (data) =>
  fetch(BASE, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(r => r.json());

export const getMyCatches = () =>
  fetch(BASE, { headers: authHeaders() }).then(r => r.json());

export const getCatchesByRiver = (riverName) =>
  fetch(`${BASE}/river/${encodeURIComponent(riverName)}`, {
    headers: authHeaders(),
  }).then(r => r.json());