import Image from 'next/image';

export default function PokemonCard({ number, name, types, image }) {
  const getTypeColor = (type) => {
    const colors = {
      Plant: 'bg-green-500',
      Poison: 'bg-purple-500',
      Fire: 'bg-orange-500',
      Water: 'bg-blue-500',
      Bug: 'bg-lime-500',
      Normal: 'bg-gray-400',
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer">
      <div className="relative flex h-48 items-center justify-center bg-gray-100 p-6">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 1024px) 50vw, 25vw"
            className="object-contain p-6 drop-shadow-lg hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <span className="text-sm font-semibold text-gray-400">No image available</span>
        )}
      </div>

      {/* Pokemon info */}
      <div className="p-4">
        <p className="text-sm text-gray-400 font-bold mb-1">No. {number}</p>
        <h2 className="text-xl font-bold text-gray-800 capitalize mb-3">{name}</h2>

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
    </div>
  );
}
