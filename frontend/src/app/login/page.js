import Link from 'next/link';
import Logo from '../../components/Logo';

export default function LoginPage() {
  return (
    <main className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4 bg-gray-900 p-3 rounded-xl inline-block">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome back!</h1>
          <p className="text-gray-500 text-sm mt-2">Enter your credentials to access your Pokédex</p>
        </div>

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="trainer@pokemon.com"
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
          </div>

          <button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md"
          >
            Log In
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-8">
          Don't have a trainer license yet?{' '}
          <Link href="/register" className="text-red-500 hover:text-red-600 font-semibold transition-colors">
            Sign Up here
          </Link>
        </p>
      </div>
    </main>
  );
}