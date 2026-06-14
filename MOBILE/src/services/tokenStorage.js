import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

const TOKEN_KEY = 'traveloop.auth.token';
let memoryToken = null;

const webStorage = {
  async getItem(key) {
    if (typeof window === 'undefined') return memoryToken;
    return window.localStorage.getItem(key);
  },
  async setItem(key, value) {
    if (typeof window === 'undefined') {
      memoryToken = value;
      return;
    }
    window.localStorage.setItem(key, value);
  },
  async deleteItem(key) {
    if (typeof window === 'undefined') {
      memoryToken = null;
      return;
    }
    window.localStorage.removeItem(key);
  },
};

export async function getStoredToken() {
  try {
    if (Platform.OS === 'web') return webStorage.getItem(TOKEN_KEY);
    return SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return memoryToken;
  }
}

export async function storeToken(token) {
  memoryToken = token;
  try {
    if (Platform.OS === 'web') return webStorage.setItem(TOKEN_KEY, token);
    return SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch {
    return undefined;
  }
}

export async function clearStoredToken() {
  memoryToken = null;
  try {
    if (Platform.OS === 'web') return webStorage.deleteItem(TOKEN_KEY);
    return SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    return undefined;
  }
}

export const biometricAuth = {
  async isAvailable() {
    const token = await getStoredToken();
    if (!token || Platform.OS === 'web') return false;
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return compatible && enrolled;
  },
  async authenticate() {
    const available = await this.isAvailable();
    if (!available) return { success: false, reason: 'Biometric login is available after you sign in and enroll biometrics on this device.' };
    return LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Traveloop',
      cancelLabel: 'Use password',
      disableDeviceFallback: false,
    });
  },
};
