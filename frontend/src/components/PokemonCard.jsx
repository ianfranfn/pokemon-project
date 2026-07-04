import Image from 'next/image';

export default function PokemonCard({ number, name, types, image, onClick }) {
  const getTypeColor = (type) => {
    const colors = {
      Grass: 'bg-green-500',
      Plant: 'bg-green-500',
      Poison: 'bg-purple-500',
      Fire: 'bg-orange-500',
      Water: 'bg-blue-500',
      Bug: 'bg-lime-500',
      Normal: 'bg-gray-400',
      Electric: 'bg-yellow-500',
      Ground: 'bg-amber-700',
      Rock: 'bg-stone-500',
      Psychic: 'bg-pink-500',
      Ice: 'bg-cyan-400',
      Dragon: 'bg-indigo-500',
      Dark: 'bg-slate-700',
      Fairy: 'bg-rose-400',
      Fighting: 'bg-red-700',
      Flying: 'bg-sky-400',
      Ghost: 'bg-violet-700',
      Steel: 'bg-slate-400',
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="group overflow-hidden rounded-xl bg-white text-left shadow-md transition-shadow duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-900"
    >
      <div className="relative flex h-48 items-center justify-center bg-gray-100 p-6">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 1024px) 50vw, 25vw"
            className="object-contain p-6 drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <span className="text-sm font-semibold text-gray-400">No image available</span>
        )}
      </div>

      {/* Pokemon info */}
      <div className="p-4">
        <p className="text-sm text-gray-400 font-bold mb-1">No. {number}</p>
        <h2 className="text-xl font-bold text-gray-800 capitalize mb-3 dark:text-white">{name}</h2>

        <div className="flex gap-2">
          {types.map((type, index) => (
            <span
              key={index}
              className={`${getTypeColor(type)} text-white text-xs px-3 py-1 rounded-md font-semibold w-full text-center`}
            >
              {type}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
