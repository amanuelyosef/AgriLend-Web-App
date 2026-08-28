import { createContext, useEffect, useState } from 'react';
import { login as apiLogin, me as apiMe, logout as apiLogout } from '../api/auth';
import { isAuthenticated } from '../api/client';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (isAuthenticated()) {
      setLoading(true);
      apiMe()
        .then((u) => {
          if (mounted) setUser(u);
        })
        .catch(() => {
          apiLogout();
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
    }
    const onUnauthorized = () => setUser(null);
    window.addEventListener('agrilend:unauthorized', onUnauthorized);
    return () => {
      mounted = false;
      window.removeEventListener('agrilend:unauthorized', onUnauthorized);
    };
  }, []);

  const login = async (credentials) => {
    await apiLogin(credentials);
    const u = await apiMe();
    setUser(u);
    return u;
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  const refreshUser = async () => {
    const u = await apiMe();
    setUser(u);
    return u;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
