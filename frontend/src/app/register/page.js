import Link from 'next/link';
import Logo from '../../components/Logo';

export default function RegisterPage() {
  return (
    <main className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4 bg-gray-900 p-3 rounded-xl inline-block">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Start Your Journey</h1>
          <p className="text-gray-500 text-sm mt-2">Create your account to register your Pokémon</p>
        </div>

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="newtrainer@pokemon.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors outline-none"
              required
            />
            <p className="text-xs text-gray-500 mt-2">Must have at least 6 characters.</p>
          </div>

          <button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-8">
          Already have an account?{' '}
          <Link href="/login" className="text-red-500 hover:text-red-600 font-semibold transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}