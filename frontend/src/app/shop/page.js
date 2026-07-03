'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../services/api';

export default function ShopPage() {
  const router = useRouter();
  const { coins, updateCoins } = useAuth();
  const [pokemons, setPokemons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuying, setIsBuying] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  const getNextDailyRewardAt = () => {
    const nextRewardDate = new Date();
    nextRewardDate.setUTCHours(24, 0, 0, 0);
    return nextRewardDate.toISOString();
  };

  const formatTimeUntil = (dateString) => {
    const targetDate = new Date(dateString);
    const remainingMs = Math.max(targetDate.getTime() - Date.now(), 0);
    const totalMinutes = Math.ceil(remainingMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
  };

  useEffect(() => {
    const token = localStorage.getItem('pokemon_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchShopItems = async () => {
      try {
        const response = await fetch(`${API_URL}/shop`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (response.ok) {
          setPokemons(result.data);
        }
      } catch (error) {
        console.error('Error fetching shop:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShopItems();
  }, [router]);

  const handleBuy = async (pokemon) => {
    const token = localStorage.getItem('pokemon_token');

    if (pokemon.owned) {
      setMessage({ text: `You already own ${pokemon.name}.`, type: 'error' });
      return;
    }

    if (coins < pokemon.price) {
      const timeUntilReward = formatTimeUntil(getNextDailyRewardAt());
      setMessage({
        text: `Not enough coins. Your next daily reward will be available in ${timeUntilReward}.`,
        type: 'error',
      });
      return;
    }

    setIsBuying(pokemon.apiId);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch(`${API_URL}/shop/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ apiId: pokemon.apiId }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({
          text: `Successfully bought: ${pokemon.name} added to your Pokedex.`,
          type: 'success',
        });
        updateCoins(result.newBalance);
        setPokemons((currentPokemons) =>
          currentPokemons.map((item) =>
            item.apiId === pokemon.apiId ? { ...item, owned: true } : item
          )
        );
      } else {
        const rewardText = result.nextRewardAt
          ? ` Your next daily reward will be available in ${formatTimeUntil(result.nextRewardAt)}.`
          : '';
        setMessage({
          text: `${result.error || 'Error in the purchase'}${rewardText}`,
          type: 'error',
        });
      }
    } catch (error) {
      setMessage({ text: 'Error connecting to the server', type: 'error' });
    } finally {
      setIsBuying(null);
    }
  };

  if (isLoading) return <div className="text-center p-10 dark:text-white">Loading shop...</div>;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Pokemon Shop</h1>

      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg text-center font-bold ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {pokemons.map((pokemon) => (
          <div
            key={pokemon.apiId}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-col items-center transition-all hover:shadow-xl border border-transparent dark:border-gray-700"
          >
            <div className="relative mb-4 h-32 w-32">
              <Image
                src={pokemon.image}
                alt={pokemon.name}
                fill
                sizes="128px"
                className="object-contain"
              />
            </div>
            <h2 className="text-xl font-bold capitalize dark:text-white mb-2">{pokemon.name}</h2>
            <p className="text-yellow-600 dark:text-yellow-400 font-bold mb-4">
              {pokemon.price} Pokecoins
            </p>
            {pokemon.owned && (
              <span className="mb-3 rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-green-700 dark:bg-green-900/30 dark:text-green-300">
                Owned
              </span>
            )}
            <button
              onClick={() => handleBuy(pokemon)}
              disabled={isBuying === pokemon.apiId || pokemon.owned}
              className={`w-full py-2 rounded-lg font-bold text-white transition-colors ${
                isBuying === pokemon.apiId || pokemon.owned
                  ? 'bg-gray-400 cursor-not-allowed'
                  : coins < pokemon.price
                    ? 'bg-yellow-600 hover:bg-yellow-700'
                    : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isBuying === pokemon.apiId ? 'Processing...' : pokemon.owned ? 'Owned' : coins < pokemon.price ? 'Need coins' : 'Buy'}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
