'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [pokemons, setPokemons] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('pokemon_token');

    if (!token) {
      router.push('/login');
      return;
    }
    const fetchMyPokemons = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/pokemon', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPokemons(data.data || []);
        } else {
          localStorage.removeItem('pokemon_token');
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching Pokémon data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyPokemons();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex justify-center items-center transition-colors duration-300">
        <p className="text-gray-900 dark:text-white text-xl font-bold animate-pulse">
          Loading your Pokédex...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My pokemon team</h1>

        {pokemons.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              You haven't caught any Pokémon yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {pokemons.map((pokemon) => (
              <div
                key={pokemon.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-colors duration-300 hover:shadow-lg hover:-translate-y-1 transform"
              >
                <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-md mb-4 flex items-center justify-center transition-colors duration-300 overflow-hidden relative">
                  {pokemon.image ? (
                    <img 
                      src={pokemon.image} 
                      alt={`Image of ${pokemon.name}`}
                      className="w-full h-full object-contain p-4 drop-shadow-md hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 text-sm">No image available</span>
                  )}
                </div>
                <h2 className="text-gray-900 dark:text-white text-xl font-bold text-center capitalize mb-2">
                  {pokemon.name}
                </h2>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
