import './globals.css';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'Pokédex Pro',
  description: 'La API de Pokémon de alto rendimiento',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-gray-100 font-primary antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
