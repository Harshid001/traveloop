import { describe, it, expect, beforeEach } from 'vitest';
import { loadStoredUser, storeUser, USER_KEY } from '../storage';

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
});

describe('storeUser', () => {
  it('stores user data in localStorage by default', () => {
    storeUser({ name: 'Test', preferredCurrency: 'USD', profileComplete: true });
    const stored = JSON.parse(window.localStorage.getItem(USER_KEY));
    expect(stored).toEqual({ name: 'Test', preferredCurrency: 'USD', profileComplete: true });
  });

  it('stores in sessionStorage when remember is false', () => {
    storeUser({ name: 'Test', preferredCurrency: 'EUR', profileComplete: false }, false);
    expect(window.localStorage.getItem(USER_KEY)).toBeNull();
    const stored = JSON.parse(window.sessionStorage.getItem(USER_KEY));
    expect(stored.preferredCurrency).toBe('EUR');
  });

  it('removes user when passed null', () => {
    storeUser({ name: 'Test' });
    storeUser(null);
    expect(window.localStorage.getItem(USER_KEY)).toBeNull();
  });
});

describe('loadStoredUser', () => {
  it('returns null when nothing is stored', () => {
    expect(loadStoredUser()).toBeNull();
  });

  it('masks email in returned user', () => {
    storeUser({ name: 'Alice', preferredCurrency: 'USD', profileComplete: true }, true);
    const raw = JSON.parse(window.localStorage.getItem(USER_KEY));
    raw.email = 'alice@example.com';
    window.localStorage.setItem(USER_KEY, JSON.stringify(raw));
    const user = loadStoredUser();
    expect(user.name).toBe('Alice');
    expect(typeof user.email).toBe('string');
    expect(user.email).not.toBe('alice@example.com');
  });
});