import { createContext, useContext, useState, useEffect } from 'react';
import { api, getStoredTokens, setStoredTokens, clearStoredTokens } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCurrentUser = async () => {
    try {
      const { accessToken } = getStoredTokens();
      if (accessToken) {
        const profile = await api.get('/auth/me').catch(() => null);
        const userData = profile?.data || profile;
        if (userData) {
          setUser(userData);
          localStorage.setItem('agrilend_user', JSON.stringify(userData));
          return userData;
        }
      }

      const storedUserRaw = localStorage.getItem('agrilend_user');
      if (storedUserRaw) {
        try {
          const localUser = JSON.parse(storedUserRaw);
          if (localUser && (localUser.email || localUser.name)) {
            setUser(localUser);
            return localUser;
          }
        } catch {
          // Ignore malformed cached session profile.
        }
      }

      setUser(null);
      return null;
    } catch (err) {
      console.warn('Failed to verify user session with FastAPI backend:', err);
      const storedUserRaw = localStorage.getItem('agrilend_user');
      if (storedUserRaw) {
        try {
          const localUser = JSON.parse(storedUserRaw);
          if (localUser && (localUser.email || localUser.name)) {
            setUser(localUser);
            return localUser;
          }
        } catch {
          // Ignore malformed cached session profile.
        }
      }
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(fetchCurrentUser);
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      clearStoredTokens();
      localStorage.removeItem("agrilend_user");
      setUser(null);
      setError(null);
    };
    window.addEventListener("agrilend:session-expired", handleSessionExpired);
    return () => window.removeEventListener("agrilend:session-expired", handleSessionExpired);
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      const tokens = response?.data || response;
      if (tokens && tokens.access_token) {
        setStoredTokens(tokens.access_token, tokens.refresh_token);
      }
      const profile = await fetchCurrentUser();
      return { success: true, user: profile };
    } catch (err) {
      const msg = err.message || 'Invalid email or password.';
      setError(msg);
      throw err;
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('bank_sidebar_collapsed');
      localStorage.removeItem('admin_sidebar_collapsed');
      localStorage.removeItem('agrilend_user');
    } catch (e) {
      console.error(e);
    }
    clearStoredTokens();
    setUser(null);
    setError(null);
  };

  const updateProfile = async (data) => {
    try {
      const updated = await api.patch('/auth/me', data);
      const userData = updated?.data || updated;
      setUser(userData);
      localStorage.setItem('agrilend_user', JSON.stringify(userData));
      return userData;
    } catch {
      setUser(prev => ({ ...prev, ...data }));
      return data;
    }
  };

  const setSessionUser = (userData) => {
    if (userData) {
      setUser(userData);
      localStorage.setItem('agrilend_user', JSON.stringify(userData));
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    logout,
    updateProfile,
    setSessionUser,
    refreshUser: fetchCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

