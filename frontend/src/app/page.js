import PokemonCard from '../components/PokemonCard';

export default function Home() {
  const mockPokemons = [
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

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl text-gray-500 font-light mb-8">Pokédex</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mockPokemons.map((pokemon) => (
            <PokemonCard
              key={pokemon.id}
              number={pokemon.id}
              name={pokemon.name}
              types={pokemon.types}
              image={pokemon.image}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
