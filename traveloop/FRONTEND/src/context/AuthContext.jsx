import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/api';
import { loadStoredUser, storeUser, USER_KEY } from '../utils/storage';

const AuthContext = createContext(null);

function normalizeUser(payload) {
  const user = payload?.user || payload;
  return {
    name: user?.name || '',
    email: user?.email || '',
    preferredCurrency: user?.preferredCurrency || 'USD',
    travelStyle: user?.travelStyle || '',
    profileComplete: user?.profileComplete ?? Boolean(user?.travelStyle || user?.preferredCurrency),
    token: payload?.token || user?.token,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser);
  const [initializing, setInitializing] = useState(true);
  const [authNotice, setAuthNotice] = useState('');

  useEffect(() => {
    let mounted = true;

    authApi.me()
      .then((profile) => {
        if (!mounted) return;
        const normalized = normalizeUser(profile);
        setUser(normalized);
        storeUser(normalized, true);
      })
      .catch((error) => {
        if (!mounted) return;
        setAuthNotice(error.message?.includes('401')
          ? 'Session expired. Please log in again.'
          : 'Unable to reach the server. Please check your connection and try again.');
      })
      .finally(() => mounted && setInitializing(false));

    return () => { mounted = false; };
  }, []);

  const login = useCallback(async ({ email, password, remember = true }) => {
    setAuthNotice('');
    const payload = await authApi.login({ email, password });
    const normalized = normalizeUser(payload);
    storeUser(normalized, remember);
    setUser(normalized);
    return normalized;
  }, []);

  const register = useCallback(async ({ remember = true, ...form }) => {
    setAuthNotice('');
    const name = form.name || [form.firstName, form.lastName].filter(Boolean).join(' ');
    const payload = await authApi.register({ ...form, name });
    const normalized = normalizeUser({ ...payload, user: { ...payload, name, email: form.email, profileComplete: false } });
    storeUser(normalized, remember);
    setUser(normalized);
    return normalized;
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* cookie cleared server-side regardless */ }
    window.localStorage.removeItem(USER_KEY);
    window.sessionStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates) => {
    const nextUser = { ...user, ...updates, profileComplete: true };
    setUser(nextUser);
    storeUser(nextUser, true);
    try {
      await authApi.updateMe(nextUser);
    } catch {
      setAuthNotice('Profile saved locally. Backend sync will retry when available.');
    }
    return nextUser;
  }, [user]);

  const value = useMemo(() => ({
    user,
    initializing,
    authNotice,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    updateProfile,
    forgotPassword: authApi.forgotPassword,
    resetPassword: authApi.resetPassword,
    verifyEmail: authApi.verifyEmail,
    googleLogin: async (idToken) => {
      const payload = await authApi.googleLogin({ idToken });
      const normalized = normalizeUser(payload);
      storeUser(normalized, true);
      setUser(normalized);
      return normalized;
    },
  }), [authNotice, initializing, login, logout, register, updateProfile, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}