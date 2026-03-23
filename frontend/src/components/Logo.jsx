import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="text-2xl font-bold text-white tracking-wider">
      Poké<span className="text-red-500">Dex</span>
    </Link>
  );
}