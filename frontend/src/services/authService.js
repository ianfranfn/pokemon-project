import { API_URL } from './api';

export const register = async (email, password, nickname) => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({ email, password, nickname }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error creating account');
  }

  return data;
};

export const login = async (identifier, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ identifier, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error logging in');
  }

  if (data.accessToken) {
    localStorage.setItem('pokemon_token', data.accessToken);
  }

  return data;
};
