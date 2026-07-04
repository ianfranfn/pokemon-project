export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const getAuthToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem('pokemon_token');
};
