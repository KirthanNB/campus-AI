/**
 * API client service for CampusMind AI.
 * Handles authentication headers, token storage, and backend communication.
 */

const rawBase = (import.meta.env.VITE_API_BASE || '').trim().replace(/\/+$/, '');
export const API_BASE = rawBase ? (rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`) : '/api';

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
  async sendMessage(message, preferredLanguage = null, sessionId = null) {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        message,
        preferred_language: preferredLanguage,
        session_id: sessionId,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to send message');
    }
    return data;
  },

  async getChatSessions() {
    const res = await fetch(`${API_BASE}/chat/sessions`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to fetch chat sessions');
    }
    return data;
  },

  async createChatSession(title = 'New Chat') {
    const res = await fetch(`${API_BASE}/chat/sessions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to create chat session');
    }
    return data;
  },

  async getSessionMessages(sessionId) {
    const res = await fetch(`${API_BASE}/chat/sessions/${sessionId}/messages`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to fetch session messages');
    }
    return data;
  },

  async deleteChatSession(sessionId) {
    const res = await fetch(`${API_BASE}/chat/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to delete chat session');
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

  getTickets() {
    return this.getMyTickets();
  },

  // Dynamic Student Endpoints
  async getAttendance() {
    const res = await fetch(`${API_BASE}/student/attendance`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to fetch attendance');
    }
    return data;
  },

  async getCourses() {
    const res = await fetch(`${API_BASE}/student/courses`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to fetch courses');
    }
    return data;
  },

  async getNews() {
    const res = await fetch(`${API_BASE}/student/news`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to fetch news');
    }
    return data;
  },

  async getFirebaseStatus() {
    const res = await fetch(`${API_BASE}/firebase/status`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to fetch Firebase status');
    }
    return data;
  },
};


