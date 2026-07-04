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
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

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
    const readSearchTerm = () => {
      setSearchTerm(new URLSearchParams(window.location.search).get('search') || '');
    };

    readSearchTerm();

    const handleSearchChange = (event) => {
      setSearchTerm(event.detail || '');
    };

    window.addEventListener('pokemon-shop-search-change', handleSearchChange);
    window.addEventListener('popstate', readSearchTerm);

    return () => {
      window.removeEventListener('pokemon-shop-search-change', handleSearchChange);
      window.removeEventListener('popstate', readSearchTerm);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('pokemon_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchPurchaseHistory = async () => {
      const response = await fetch(`${API_URL}/shop/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (response.ok) {
        setPurchaseHistory(result.data || []);
      }
    };

    const fetchShopItems = async () => {
      try {
        const response = await fetch(`${API_URL}/shop`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (response.ok) {
          setPokemons(result.data);
        }
        await fetchPurchaseHistory();
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

    if (pokemon.stock <= 0) {
      setMessage({ text: `${pokemon.name} is out of stock.`, type: 'error' });
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
            item.apiId === pokemon.apiId
              ? { ...item, owned: true, stock: result.shopItem?.stock ?? item.stock }
              : item
          )
        );
        if (result.purchase) {
          setPurchaseHistory((currentHistory) => [result.purchase, ...currentHistory].slice(0, 20));
        }
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

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const visiblePokemons = pokemons.filter((pokemon) => {
    if (!normalizedSearchTerm) {
      return true;
    }

    return (
      pokemon.name.toLowerCase().includes(normalizedSearchTerm) ||
      String(pokemon.apiId).includes(normalizedSearchTerm) ||
      String(pokemon.apiId).padStart(4, '0').includes(normalizedSearchTerm.padStart(4, '0'))
    );
  });

  const getRarityClassName = (rarity) => {
    const classes = {
      common: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
      uncommon: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      rare: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      epic: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    };

    return classes[rarity] || classes.common;
  };

  const formatHistoryDate = (dateString) => {
    if (!dateString) {
      return '';
    }

    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pokemon Shop</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Prices change by rarity, and out-of-stock Pokemon cannot be purchased.
          </p>
        </div>
      </div>

      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg text-center font-bold ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {visiblePokemons.length === 0 && (
            <div className="col-span-full rounded-lg bg-white p-10 text-center text-gray-500 shadow-md dark:bg-gray-800 dark:text-gray-400">
              No shop Pokemon match your current search.
            </div>
          )}
          {visiblePokemons.map((pokemon) => (
            <div
              key={pokemon.apiId}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-col items-center transition-all hover:shadow-xl border border-transparent dark:border-gray-700"
            >
              <div className="mb-3 flex w-full items-center justify-between gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${getRarityClassName(
                    pokemon.rarity
                  )}`}
                >
                  {pokemon.rarity}
                </span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  {pokemon.stock > 0 ? `${pokemon.stock} in stock` : 'Out of stock'}
                </span>
              </div>
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
                disabled={isBuying === pokemon.apiId || pokemon.owned || pokemon.stock <= 0}
                className={`w-full py-2 rounded-lg font-bold text-white transition-colors ${
                  isBuying === pokemon.apiId || pokemon.owned || pokemon.stock <= 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : coins < pokemon.price
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isBuying === pokemon.apiId
                  ? 'Processing...'
                  : pokemon.owned
                    ? 'Owned'
                    : pokemon.stock <= 0
                      ? 'Out of stock'
                      : coins < pokemon.price
                        ? 'Need coins'
                        : 'Buy'}
              </button>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Purchase history</h2>
          {purchaseHistory.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your shop purchases will appear here.
            </p>
          ) : (
            <div className="space-y-3">
              {purchaseHistory.map((item, index) => (
                <div
                  key={`${item.apiId}-${item.purchasedAt || index}`}
                  className="rounded-md border border-gray-200 p-3 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold capitalize text-gray-900 dark:text-white">{item.name}</p>
                    <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                      {item.price}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="capitalize">{item.rarity || 'common'}</span>
                    <span>{formatHistoryDate(item.purchasedAt || item.purchased_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
