'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const emptySession = {
  nickname: null,
  coins: 0,
  isLogged: false,
};

const decodeTokenPayload = (token) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join('')
  );

  return JSON.parse(jsonPayload);
};

const readStoredSession = () => {
  if (typeof window === 'undefined') {
    return emptySession;
  }

  const token = localStorage.getItem('pokemon_token');
  if (!token) {
    return emptySession;
  }

  try {
    const decodedData = decodeTokenPayload(token);
    const expiresAt = decodedData.exp ? decodedData.exp * 1000 : null;

    if (expiresAt && expiresAt <= Date.now()) {
      localStorage.removeItem('pokemon_token');
      localStorage.removeItem('pokemon_coins');
      return emptySession;
    }

    const savedCoins = localStorage.getItem('pokemon_coins');

    return {
      nickname: decodedData.nickname,
      coins: savedCoins !== null ? Number(savedCoins) : decodedData.coins || 0,
      isLogged: true,
    };
  } catch {
    localStorage.removeItem('pokemon_token');
    localStorage.removeItem('pokemon_coins');
    return emptySession;
  }
};

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [initialSession] = useState(readStoredSession);
  const [nickname, setNickname] = useState(initialSession.nickname);
  const [coins, setCoins] = useState(initialSession.coins);
  const [isLogged, setIsLogged] = useState(initialSession.isLogged);

  const clearSession = useCallback(() => {
    localStorage.removeItem('pokemon_token');
    localStorage.removeItem('pokemon_coins');
    setNickname(null);
    setCoins(0);
    setIsLogged(false);
  }, []);

  const loadUser = useCallback(() => {
    const token = localStorage.getItem('pokemon_token');

    if (!token) {
      clearSession();
      return;
    }

    try {
      const decodedData = decodeTokenPayload(token);
      const expiresAt = decodedData.exp ? decodedData.exp * 1000 : null;

      if (expiresAt && expiresAt <= Date.now()) {
        clearSession();
        return;
      }

      setNickname(decodedData.nickname);
      setIsLogged(true);

      const savedCoins = localStorage.getItem('pokemon_coins');
      if (savedCoins !== null) {
        setCoins(Number(savedCoins));
      } else if (decodedData.coins !== undefined) {
        setCoins(decodedData.coins);
        localStorage.setItem('pokemon_coins', decodedData.coins);
      }
    } catch {
      clearSession();
    }
  }, [clearSession]);

  const loginContext = useCallback(() => {
    loadUser();
  }, [loadUser]);

  const logout = useCallback(() => {
    clearSession();
    router.push('/login');
  }, [clearSession, router]);

  const updateCoins = useCallback((newCoins) => {
    setCoins(newCoins);
    localStorage.setItem('pokemon_coins', newCoins);
  }, []);

  return (
    <AuthContext.Provider value={{ nickname, coins, isLogged, loginContext, logout, updateCoins }}>
      {children}
    </AuthContext.Provider>
  );
};
