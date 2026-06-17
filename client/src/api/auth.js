const BASE = 'http://localhost:3001/api/auth';

export const register = (email, password) =>
  fetch(`${BASE}/register`,
     { method: 'POST', headers: { 'Content-Type': 'application/json' }, 
     body: JSON.stringify({ email, password }) }).then(r => r.json());

export const login = (email, password) =>
  fetch(`${BASE}/login`, 
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify({ email, password }) }).then(r => r.json());