/**
 * API client service for CampusMind AI.
 * Handles authentication headers, token storage, and backend communication.
 */

const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('campusmind_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Authentication
  async register(userData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Registration failed');
    }
    return data;
  },

  async login(credentials) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Login failed');
    }
    return data;
  },

  async getProfile() {
    const res = await fetch(`${API_BASE}/user/profile`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to fetch profile');
    }
    return data;
  },

  // Chat & RAG
  async sendMessage(message, preferredLanguage = null) {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        message,
        preferred_language: preferredLanguage,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to send message');
    }
    return data;
  },

  async getChatHistory() {
    const res = await fetch(`${API_BASE}/chat/history`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to fetch chat history');
    }
    return data;
  },

  async clearChatHistory() {
    const res = await fetch(`${API_BASE}/chat/history`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to clear chat history');
    }
    return data;
  },

  // Tickets & Grievance Actions
  async createTicket(ticketData) {
    const res = await fetch(`${API_BASE}/tickets/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(ticketData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to create ticket');
    }
    return data;
  },

  async getMyTickets() {
    const res = await fetch(`${API_BASE}/tickets/my-tickets`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to fetch tickets');
    }
    return data;
  },
};

