import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loginUser, registerUser, getMe, logoutUser } from '../api/authApi.js';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // On mount, check if there's a valid token and fetch user data
  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      if (!token) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const userData = await getMe(token);
        if (!cancelled) setUser(userData);
      } catch {
        // Token invalid or expired
        localStorage.removeItem('token');
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadUser();
    return () => { cancelled = true; };
  }, [token]);

  const applySession = useCallback((data) => {
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser({
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
      phone: data.phone,
    });
    return data;
  }, []);

  const login = useCallback(
    async (email, password) => applySession(await loginUser(email, password)),
    [applySession]
  );

  const register = useCallback(
    async (name, email, password, phone, adminCode) =>
      applySession(await registerUser(name, email, password, phone, adminCode)),
    [applySession]
  );

  const logout = useCallback(async () => {
    // Clear the httpOnly cookie server-side as well as the local token
    await logoutUser();
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: Boolean(user),
  }), [user, token, loading, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
