import AppLogo from './AppLogo';
import UserNav from './UserNav';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutGrid, PlusCircle } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center gap-6">
          <AppLogo />
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <Link href="/editais" className="text-foreground/60 transition-colors hover:text-foreground/80">
              Editais Abertos
            </Link>
            {/* Add more nav links here if needed */}
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Example Admin/Proponent specific quick actions - Conditionally render these */}
          {/* <Button variant="outline" size="sm" asChild>
            <Link href="/admin/editais/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Novo Edital
            </Link>
          </Button> */}
          <UserNav />
        </div>
      </div>
    </header>
  );
}
