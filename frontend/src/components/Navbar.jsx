'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import SearchIcon from './SearchIcon';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [nickname, setNickname] = useState(null);

  const isLoginPage = pathname === '/login';
  const isRegisterPage = pathname === '/register';
  const isAuthPage = isLoginPage || isRegisterPage;

  useEffect(() => {
    const token = localStorage.getItem('pokemon_token');

    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );

        const decodedData = JSON.parse(jsonPayload);

        if (decodedData.nickname) {
          setNickname(decodedData.nickname);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('pokemon_token');
      }
    } else {
      setNickname(null);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('pokemon_token');
    setNickname(null);
    router.push('/login');
  };

  return (
    <nav className="bg-gray-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Logo />

          {!isAuthPage && (
            <div className="flex-1 max-w-lg mx-8 hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-full py-2 px-4 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors placeholder-gray-400"
                  placeholder="Search Pokémon by name or number..."
                />
                <button className="absolute right-4 top-2.5 text-gray-400 hover:text-white transition-colors">
                  <SearchIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4">
            {nickname ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-300 text-sm font-semibold hidden sm:block">
                  Hi, <span className="text-white">{nickname}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-500 text-sm font-semibold transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-white text-sm font-semibold transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2 px-5 rounded-full transition-colors shadow-md"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
