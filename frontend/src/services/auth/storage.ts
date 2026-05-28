import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '@/constants';
import type { StoredAuthSession, User } from '@/interfaces/auth';

export async function getStoredToken() {
  return AsyncStorage.getItem(STORAGE_KEYS.authToken);
}

export async function getStoredUser() {
  const value = await AsyncStorage.getItem(STORAGE_KEYS.authUser);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as User;
  } catch {
    return null;
  }
}

export async function getStoredAuthSession(): Promise<StoredAuthSession> {
  const [token, user] = await Promise.all([getStoredToken(), getStoredUser()]);
  return { token, user };
}

export async function saveAuthSession(session: StoredAuthSession) {
  const operations = [];

  if (session.token) {
    operations.push(AsyncStorage.setItem(STORAGE_KEYS.authToken, session.token));
  } else {
    operations.push(AsyncStorage.removeItem(STORAGE_KEYS.authToken));
  }

  if (session.user) {
    operations.push(AsyncStorage.setItem(STORAGE_KEYS.authUser, JSON.stringify(session.user)));
  } else {
    operations.push(AsyncStorage.removeItem(STORAGE_KEYS.authUser));
  }

  await Promise.all(operations);
}

export async function clearAuthSession() {
  await Promise.all([
    AsyncStorage.removeItem(STORAGE_KEYS.authToken),
    AsyncStorage.removeItem(STORAGE_KEYS.authUser),
  ]);
}
