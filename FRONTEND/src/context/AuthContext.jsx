import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, clearToken, saveToken, TOKEN_KEY } from '../services/api';

const USER_KEY = 'traveloop.auth.user';

const guestUser = {
  _id: 'offline-user',
  name: 'Traveloop Explorer',
  email: 'guest@traveloop.app',
  phone: '+91 98765 43210',
  preferredCurrency: 'INR',
  preferredLanguage: 'English',
  travelStyle: 'Balanced explorer',
  profileComplete: true,
};

const AuthContext = createContext(null);

function loadStoredUser() {
  try {
    const stored = window.localStorage.getItem(USER_KEY) || window.sessionStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function storeUser(user, remember = true) {
  window.localStorage.removeItem(USER_KEY);
  window.sessionStorage.removeItem(USER_KEY);
  if (!user) return;
  const storage = remember ? window.localStorage : window.sessionStorage;
  storage.setItem(USER_KEY, JSON.stringify(user));
}

function normalizeUser(payload) {
  const user = payload?.user || payload;
  return {
    ...guestUser,
    ...user,
    name: user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || guestUser.name,
    email: user?.email || guestUser.email,
    token: payload?.token || user?.token,
    profileComplete: user?.profileComplete ?? Boolean(user?.travelStyle || user?.preferredCurrency),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser);
  const [initializing, setInitializing] = useState(true);
  const [authNotice, setAuthNotice] = useState('');

  useEffect(() => {
    let mounted = true;
    const token =
      window.localStorage.getItem(TOKEN_KEY) ||
      window.sessionStorage.getItem(TOKEN_KEY);

    if (!token) {
      setInitializing(false);
      return undefined;
    }

    authApi.me()
      .then((profile) => {
        if (!mounted) return;
        const normalized = normalizeUser(profile);
        setUser(normalized);
        storeUser(normalized, Boolean(window.localStorage.getItem(TOKEN_KEY)));
      })
      .catch(() => {
        if (!mounted) return;
        setAuthNotice('Using your saved offline session until the backend is reachable.');
      })
      .finally(() => mounted && setInitializing(false));

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async ({ email, password, remember = true }) => {
    setAuthNotice('');
    try {
      const payload = await authApi.login({ email, password });
      const normalized = normalizeUser(payload);
      saveToken(normalized.token, remember);
      storeUser(normalized, remember);
      setUser(normalized);
      return normalized;
    } catch (error) {
      if (!navigator.onLine || /fetch|network|failed/i.test(error.message)) {
        const offlineUser = { ...guestUser, email, name: email.split('@')[0] || guestUser.name };
        saveToken(`offline-${Date.now()}`, remember);
        storeUser(offlineUser, remember);
        setUser(offlineUser);
        setAuthNotice('Backend unavailable, so Traveloop started an offline planning session.');
        return offlineUser;
      }
      throw error;
    }
  }, []);

  const register = useCallback(async ({ remember = true, ...form }) => {
    setAuthNotice('');
    const name = form.name || [form.firstName, form.lastName].filter(Boolean).join(' ');
    try {
      const payload = await authApi.register({ ...form, name });
      const normalized = normalizeUser({ ...payload, user: { ...payload, name, email: form.email, profileComplete: false } });
      saveToken(normalized.token, remember);
      storeUser(normalized, remember);
      setUser(normalized);
      return normalized;
    } catch (error) {
      if (!navigator.onLine || /fetch|network|failed/i.test(error.message)) {
        const offlineUser = { ...guestUser, ...form, name, profileComplete: false };
        saveToken(`offline-${Date.now()}`, remember);
        storeUser(offlineUser, remember);
        setUser(offlineUser);
        setAuthNotice('Account saved locally. It will be ready to sync when the backend is available.');
        return offlineUser;
      }
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
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
    googleLogin: async () => {
      const offlineUser = { ...guestUser, name: 'Google Traveler', email: 'google.user@traveloop.app' };
      saveToken(`google-placeholder-${Date.now()}`, true);
      storeUser(offlineUser, true);
      setUser(offlineUser);
      setAuthNotice('Google login placeholder completed. Wire OAuth client credentials when ready.');
      return offlineUser;
    },
  }), [authNotice, initializing, login, logout, register, updateProfile, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
