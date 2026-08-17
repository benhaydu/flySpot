import { useState, useEffect, useCallback } from 'react';

// Decodes a JWT's payload without verifying the signature — verification is
// the server's job. This is purely so the client can read the `exp` claim
// and know when to log itself out proactively.
function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    // JWTs use base64url encoding: '-' -> '+', '_' -> '/', padding stripped.
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function isExpired(token) {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true; // no exp claim, or undecodable — treat as invalid
  return Date.now() >= decoded.exp * 1000; // exp is seconds; Date.now() is ms
}

export const useAuth = () => {
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem('token');
    if (stored && isExpired(stored)) {
      localStorage.removeItem('token');
      return null;
    }
    return stored;
  });

  const saveToken = (t) => { localStorage.setItem('token', t); setToken(t); };
  const logout    = useCallback(() => { localStorage.removeItem('token'); setToken(null); }, []);

  // Auto-logout the moment the current token expires, instead of waiting
  // for the next API call to fail with a 401.
  useEffect(() => {
    if (!token) return;
    const decoded = decodeToken(token);
    if (!decoded?.exp) return;
    const msUntilExpiry = decoded.exp * 1000 - Date.now();
    if (msUntilExpiry <= 0) { logout(); return; }
    const timer = setTimeout(logout, msUntilExpiry);
    return () => clearTimeout(timer);
  }, [token, logout]);

  return { token, saveToken, logout };
};