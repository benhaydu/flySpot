const BASE = '/api/catches';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

async function handleResponse(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const logCatch = (data) =>
  fetch(BASE, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const getMyCatches = () =>
  fetch(BASE, { headers: authHeaders() }).then(handleResponse);

export const getCatchesByRiver = (riverGroup) =>
  fetch(`${BASE}/river/${encodeURIComponent(riverGroup)}`, {
    headers: authHeaders(),
  }).then(handleResponse);

  export const getCatchStats = () =>
  fetch(`${BASE}/stats`, { headers: authHeaders() }).then(handleResponse);