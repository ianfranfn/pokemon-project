'use client';

import { useEffect, useState } from 'react';
import PokemonCard from '../components/PokemonCard';
import { API_URL } from '../services/api';

const featuredPokemons = [
  {
    id: '0001',
    name: 'Bulbasaur',
    types: ['Plant', 'Poison'],
    image:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
  },
  {
    id: '0004',
    name: 'Charmander',
    types: ['Fire'],
    image:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png',
  },
  {
    id: '0007',
    name: 'Squirtle',
    types: ['Water'],
    image:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png',
  },
  {
    id: '0010',
    name: 'Caterpie',
    types: ['Bug'],
    image:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10.png',
  },
];

const formatPokemonNumber = (pokemon) => {
  const apiId = pokemon.api_id || pokemon.apiId || pokemon.pokemon_id || pokemon.id;
  return String(apiId).padStart(4, '0');
};

const formatPokemonTypes = (type) => {
  if (!type) {
    return ['Normal'];
  }

  return String(type)
    .split('/')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase());
};

const normalizeUserPokemon = (pokemon) => ({
  id: pokemon.id,
  number: formatPokemonNumber(pokemon),
  name: pokemon.name,
  types: formatPokemonTypes(pokemon.type),
  image: pokemon.image,
});

export default function Home() {
  const [pokemons, setPokemons] = useState(featuredPokemons);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUserCollection, setIsUserCollection] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('pokemon_token');

    if (!token) {
      setPokemons(featuredPokemons);
      setIsUserCollection(false);
      return;
    }

    const fetchUserPokemons = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_URL}/api/pokemon`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('pokemon_token');
          localStorage.removeItem('pokemon_coins');
          setPokemons(featuredPokemons);
          setIsUserCollection(false);
          return;
        }

        if (!response.ok) {
          throw new Error('Unable to load your Pokemon collection.');
        }

        const result = await response.json();
        setPokemons((result.data || []).map(normalizeUserPokemon));
        setIsUserCollection(true);
      } catch (loadError) {
        setError(loadError.message || 'Unable to load your Pokemon collection.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPokemons();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl text-gray-500 font-light">Pokedex</h1>
            {isUserCollection && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Showing the Pokemon in your trainer collection.
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-colors duration-300">
          {isLoading ? (
            <div className="py-16 text-center text-gray-500 dark:text-gray-400">
              Loading your Pokemon collection...
            </div>
          ) : pokemons.length === 0 ? (
            <div className="py-16 text-center text-gray-500 dark:text-gray-400">
              Your collection is empty. Visit the shop to buy your first Pokemon.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {pokemons.map((pokemon) => (
                <PokemonCard
                  key={`${pokemon.id}-${pokemon.name}`}
                  number={pokemon.number || pokemon.id}
                  name={pokemon.name}
                  types={pokemon.types}
                  image={pokemon.image}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
