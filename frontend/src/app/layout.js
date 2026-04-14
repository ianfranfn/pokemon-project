import './globals.css';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'Pokédex Pro',
  description: 'The high-performance Pokémon API',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-primary antialiased transition-colors duration-300">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
