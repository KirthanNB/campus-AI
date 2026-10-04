import { create } from 'zustand';
import { api } from '../services/api';

const savedUser = (() => {
  try {
    const raw = localStorage.getItem('campusmind_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

export const useAuthStore = create((set, get) => ({
  user: savedUser,
  token: localStorage.getItem('campusmind_token') || null,
  isAuthenticated: !!localStorage.getItem('campusmind_token'),
  isLoading: false,
  error: null,

  setAuth: (token, user) => {
    localStorage.setItem('campusmind_token', token);
    if (user) {
      localStorage.setItem('campusmind_user', JSON.stringify(user));
    }
    set({ token, user, isAuthenticated: true, error: null });
  },

  logout: () => {
    localStorage.removeItem('campusmind_token');
    localStorage.removeItem('campusmind_user');
    set({ token: null, user: null, isAuthenticated: false, error: null });
  },

  fetchProfile: async () => {
    const token = get().token;
    if (!token) return;
    // If we already have a cached user, avoid blocking spinner
    if (!get().user) {
      set({ isLoading: true });
    }
    try {
      const profile = await api.getProfile();
      localStorage.setItem('campusmind_user', JSON.stringify(profile));
      set({ user: profile, isAuthenticated: true, isLoading: false });
    } catch (err) {
      console.error('Failed to load user profile:', err);
      // Only logout on 401 unauthorized
      if (err.message && err.message.toLowerCase().includes('authenticated')) {
        get().logout();
      }
      set({ isLoading: false });
    }
  },

  setError: (msg) => set({ error: msg }),
  clearError: () => set({ error: null }),
}));
