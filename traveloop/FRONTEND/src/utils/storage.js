const USER_KEY = 'traveloop.auth.user';

export function loadStoredUser() {
  try {
    const stored = window.localStorage.getItem(USER_KEY) || window.sessionStorage.getItem(USER_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    const { email, ...safe } = parsed;
    return { ...safe, email: email ? `${email.slice(0, 3)}***` : undefined };
  } catch {
    return null;
  }
}

export function storeUser(user, remember = true) {
  window.localStorage.removeItem(USER_KEY);
  window.sessionStorage.removeItem(USER_KEY);
  if (!user) return;
  const toStore = { name: user.name, preferredCurrency: user.preferredCurrency, profileComplete: user.profileComplete };
  const storage = remember ? window.localStorage : window.sessionStorage;
  storage.setItem(USER_KEY, JSON.stringify(toStore));
}

export { USER_KEY };