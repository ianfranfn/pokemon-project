import './globals.css';
import Navbar from '../components/Navbar';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'Pokedex Pro',
  description: 'The high-performance Pokemon API',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-primary antialiased transition-colors duration-300">
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
