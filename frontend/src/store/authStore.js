import { create } from 'zustand';
import { api } from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('campusmind_token') || null,
  isAuthenticated: !!localStorage.getItem('campusmind_token'),
  isLoading: false,
  error: null,

  setAuth: (token, user) => {
    localStorage.setItem('campusmind_token', token);
    set({ token, user, isAuthenticated: true, error: null });
  },

  logout: () => {
    localStorage.removeItem('campusmind_token');
    set({ token: null, user: null, isAuthenticated: false, error: null });
  },

  fetchProfile: async () => {
    const token = get().token;
    if (!token) return;
    set({ isLoading: true });
    try {
      const profile = await api.getProfile();
      set({ user: profile, isAuthenticated: true, isLoading: false });
    } catch (err) {
      console.error('Failed to load user profile:', err);
      // If token is invalid or expired, clear session
      get().logout();
      set({ isLoading: false });
    }
  },

  setError: (msg) => set({ error: msg }),
  clearError: () => set({ error: null }),
}));
