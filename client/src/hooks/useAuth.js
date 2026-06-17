import { useState } from 'react';

export const useAuth = () => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const saveToken = (t) => { localStorage.setItem('token', t); setToken(t); };
  const logout    = ()  => { localStorage.removeItem('token'); setToken(null); };

  return { token, saveToken, logout };
};