import Link from 'next/link';
import { Vote } from 'lucide-react';

export default function AppLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
      <Vote className="h-7 w-7" />
      <span className="text-xl font-headline font-bold">Edital Participativo</span>
    </Link>
  );
}
