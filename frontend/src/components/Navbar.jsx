import Logo from './Logo';
import SearchIcon from './SearchIcon';

export default function Navbar() {
  return (
    <nav className="bg-gray-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Logo />
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
          <div className="flex items-center space-x-4">
            <button className="text-gray-300 hover:text-white text-sm font-semibold transition-colors">
              Log In
            </button>
            <button className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2 px-5 rounded-full transition-colors shadow-md">
              Sign Up
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}