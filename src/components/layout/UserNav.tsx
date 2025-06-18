
"use client";

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogIn, LogOut, Settings, UserPlus, UserCircle, LayoutGrid } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function UserNav() {
  const { user, loading, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-20 rounded-md bg-muted animate-pulse"></div>
        <div className="h-8 w-20 rounded-md bg-muted animate-pulse"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" asChild>
          <Link href="/login">
            <LogIn className="mr-2 h-4 w-4" />
            Login
          </Link>
        </Button>
        <Button asChild>
          <Link href="/signup">
            <UserPlus className="mr-2 h-4 w-4" />
            Cadastrar
          </Link>
        </Button>
      </div>
    );
  }

  const getInitials = (name: string | null) => {
    if (!name) return "SN";
    const names = name.split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      router.push('/');
    } catch (error) {
      console.error("Erro no logout:", error);
      toast({
        title: "Erro no Logout",
        description: "Não foi possível realizar o logout. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const dashboardPath = user.role === 'admin' ? '/admin/dashboard' : '/proponent/dashboard';
  const profilePath = user.role === 'admin' ? '/admin/profile' : '/proponent/profile';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name || 'User Avatar'} />}
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name || "Usuário"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            {user.role && (
                 <p className="text-xs leading-none text-muted-foreground capitalize pt-1">
                    Perfil: {user.role}
                </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
           <DropdownMenuItem asChild>
            <Link href={dashboardPath}>
              {user.role === 'admin' ? <Settings className="mr-2 h-4 w-4" /> : <LayoutGrid className="mr-2 h-4 w-4" />}
              <span>Painel</span>
            </Link>
          </DropdownMenuItem>
          {(user.role === 'proponent' || user.role === 'admin') && (
             <DropdownMenuItem asChild>
              <Link href={profilePath}>
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Meu Perfil</span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
