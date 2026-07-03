'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import SearchIcon from './SearchIcon';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const getPreferredTheme = () => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const storedTheme = localStorage.getItem('theme');
  if (storedTheme === 'dark' || storedTheme === 'light') {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('theme', theme);
};

export default function Navbar() {
  const pathname = usePathname();
  const { nickname, coins, logout } = useAuth();
  const [theme, setTheme] = useState(getPreferredTheme);

  const isLoginPage = pathname === '/login';
  const isRegisterPage = pathname === '/register';
  const isAuthPage = isLoginPage || isRegisterPage;

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Logo />
          <Link
            href="/shop"
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded transition-colors"
          >
            Shop
          </Link>

          {!isAuthPage && (
            <div className="flex-1 max-w-lg mx-8 hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-transparent dark:border-gray-700 rounded-full py-2 px-4 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Search Pokemon by name or number..."
                />
                <button className="absolute right-4 top-2.5 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-white transition-colors">
                  <SearchIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'light' ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              )}
            </button>

            {nickname ? (
              <div className="flex items-center space-x-4 border-l border-gray-200 dark:border-gray-700 pl-4">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-gray-600 dark:text-gray-300 text-sm font-semibold">
                    Hi, <span className="text-gray-900 dark:text-white">{nickname}</span>
                  </span>
                  <span className="text-yellow-600 dark:text-yellow-400 text-xs font-bold bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded-full mt-1">
                    {coins} Pokecoins
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-500 text-sm font-semibold transition-colors"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4 border-l border-gray-200 dark:border-gray-700 pl-4">
                <Link
                  href="/login"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-semibold transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2 px-5 rounded-full transition-colors shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
