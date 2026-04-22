'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ShopPage() {
  const router = useRouter();
  const [pokemons, setPokemons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuying, setIsBuying] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const token = localStorage.getItem('pokemon_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchShopItems = async () => {
      try {
        const response = await fetch('http://localhost:4000/shop', {
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
    setIsBuying(pokemon.apiId);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch('http://localhost:4000/shop/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: pokemon.name,
          apiId: pokemon.apiId,
          image: pokemon.image,
          price: pokemon.price,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ text: `Congrats! You've bought ${pokemon.name}`, type: 'success' });
        // ! Important: Update the token or global coin state
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setMessage({ text: result.error || 'Error in the purchase', type: 'error' });
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
            <img src={pokemon.image} alt={pokemon.name} className="w-32 h-32 object-contain mb-4" />
            <h2 className="text-xl font-bold capitalize dark:text-white mb-2">{pokemon.name}</h2>
            <p className="text-yellow-600 dark:text-yellow-400 font-bold mb-4">
              {pokemon.price} Pokecoins
            </p>
            <button
              onClick={() => handleBuy(pokemon)}
              disabled={isBuying === pokemon.apiId}
              className={`w-full py-2 rounded-lg font-bold text-white transition-colors ${
                isBuying === pokemon.apiId ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isBuying === pokemon.apiId ? 'Processing...' : 'Buy'}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
