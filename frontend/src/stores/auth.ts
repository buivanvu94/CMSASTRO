import { atom, computed } from 'nanostores';
import type { User } from '@/lib/api/users';

// Auth state
export const $user = atom<User | null>(null);
export const $isAuthenticated = computed($user, (user) => user !== null);

// Auth actions
export const setUser = (user: User | null) => {
  $user.set(user);
};

export const clearUser = () => {
  $user.set(null);
};

// Initialize auth state from stored token
export const initAuth = async () => {
  try {
    const { authApi } = await import('@/lib/api');
    const user = await authApi.me();
    setUser(user);
  } catch (error) {
    clearUser();
  }
};
