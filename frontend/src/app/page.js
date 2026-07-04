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
    source: 'starter',
    purchasePrice: 0,
  },
  {
    id: '0004',
    name: 'Charmander',
    types: ['Fire'],
    image:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png',
    source: 'starter',
    purchasePrice: 0,
  },
  {
    id: '0007',
    name: 'Squirtle',
    types: ['Water'],
    image:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png',
    source: 'starter',
    purchasePrice: 0,
  },
  {
    id: '0010',
    name: 'Caterpie',
    types: ['Bug'],
    image:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10.png',
    source: 'starter',
    purchasePrice: 0,
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
  acquiredAt: pokemon.created_at || pokemon.createdAt,
  source: pokemon.source || 'starter',
  purchasePrice: pokemon.purchase_price ?? pokemon.purchasePrice ?? 0,
});

const formatDate = (dateString) => {
  if (!dateString) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
};

const getSourceLabel = (source) => {
  const labels = {
    starter: 'Starter Pokemon',
    shop: 'Shop purchase',
    legacy: 'Legacy collection',
    manual: 'Manual entry',
  };

  return labels[source] || source;
};

export default function Home() {
  const [pokemons, setPokemons] = useState(featuredPokemons);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUserCollection, setIsUserCollection] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedPokemon, setSelectedPokemon] = useState(null);

  useEffect(() => {
    const readSearchTerm = () => {
      setSearchTerm(new URLSearchParams(window.location.search).get('search') || '');
    };

    readSearchTerm();

    const handleSearchChange = (event) => {
      setSearchTerm(event.detail || '');
    };

    window.addEventListener('pokemon-search-change', handleSearchChange);
    window.addEventListener('popstate', readSearchTerm);

    return () => {
      window.removeEventListener('pokemon-search-change', handleSearchChange);
      window.removeEventListener('popstate', readSearchTerm);
    };
  }, []);

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
        const response = await fetch(`${API_URL}/api/pokemon?limit=100`, {
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

  const availableTypes = Array.from(
    new Set(pokemons.flatMap((pokemon) => pokemon.types || []))
  ).sort();

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const visiblePokemons = pokemons.filter((pokemon) => {
    const matchesSearch =
      !normalizedSearchTerm ||
      pokemon.name.toLowerCase().includes(normalizedSearchTerm) ||
      String(pokemon.number || pokemon.id).includes(normalizedSearchTerm.padStart(4, '0')) ||
      String(pokemon.number || pokemon.id).replace(/^0+/, '').includes(normalizedSearchTerm);

    const matchesType = selectedType === 'All' || pokemon.types.includes(selectedType);

    return matchesSearch && matchesType;
  });

  const clearFilters = () => {
    setSelectedType('All');
    setSearchTerm('');
    window.history.replaceState(null, '', '/');
    window.dispatchEvent(new CustomEvent('pokemon-search-change', { detail: '' }));
  };

  return (
    <main className="min-h-screen bg-gray-50 bg-white transition-colors duration-300 dark:bg-gray-950">
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
          {(searchTerm || selectedType !== 'All') && (
            <button
              type="button"
              onClick={clearFilters}
              className="self-start rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-600 transition-colors hover:border-red-400 hover:text-red-500 dark:border-gray-700 dark:text-gray-300"
            >
              Clear filters
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-wrap gap-2">
          {['All', ...availableTypes].map((type) => (
            <button
              type="button"
              key={type}
              onClick={() => setSelectedType(type)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                selectedType === type
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-colors duration-300">
          {isLoading ? (
            <div className="py-16 text-center text-gray-500 dark:text-gray-400">
              Loading your Pokemon collection...
            </div>
          ) : pokemons.length === 0 ? (
            <div className="py-16 text-center text-gray-500 dark:text-gray-400">
              Your collection is empty. Visit the shop to buy your first Pokemon.
            </div>
          ) : visiblePokemons.length === 0 ? (
            <div className="py-16 text-center text-gray-500 dark:text-gray-400">
              No Pokemon match your current search.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {visiblePokemons.map((pokemon) => (
                <PokemonCard
                  key={`${pokemon.id}-${pokemon.name}`}
                  number={pokemon.number || pokemon.id}
                  name={pokemon.name}
                  types={pokemon.types}
                  image={pokemon.image}
                  onClick={() => setSelectedPokemon(pokemon)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedPokemon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-gray-400">No. {selectedPokemon.number}</p>
                <h2 className="text-2xl font-bold capitalize text-gray-900 dark:text-white">
                  {selectedPokemon.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPokemon(null)}
                className="rounded-md px-2 py-1 text-xl leading-none text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
                aria-label="Close Pokemon details"
              >
                x
              </button>
            </div>

            <dl className="space-y-4 text-sm">
              <div>
                <dt className="font-bold text-gray-500 dark:text-gray-400">Type</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">
                  {selectedPokemon.types.join(', ')}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-gray-500 dark:text-gray-400">Acquired</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">
                  {formatDate(selectedPokemon.acquiredAt)}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-gray-500 dark:text-gray-400">Origin</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">
                  {getSourceLabel(selectedPokemon.source)}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-gray-500 dark:text-gray-400">Price</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">
                  {selectedPokemon.purchasePrice > 0
                    ? `${selectedPokemon.purchasePrice} Pokecoins`
                    : 'No cost'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </main>
  );
}
