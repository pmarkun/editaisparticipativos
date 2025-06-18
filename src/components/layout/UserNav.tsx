
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
import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from "firebase/auth";
import { auth, db } from "@/firebase/client";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';

interface AppUser {
  uid: string;
  name: string | null;
  email: string | null;
  avatarUrl?: string | null;
  role: 'proponent' | 'admin' | null; // Adicionando role
}

export default function UserNav() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Usuário está logado, buscar role do Firestore
        let userRole: AppUser['role'] = null; // Default role
        try {
          // Tenta buscar primeiro na coleção 'users' (cadastro geral)
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
             // 'role' pode não existir no doc 'users', então assumimos proponente se não especificado
            userRole = userDocSnap.data()?.role || 'proponent';
          } else {
            // Se não encontrar em 'users', pode ser um admin antigo ou lógica diferente
            // Para este exemplo, se não achar em 'users' e for admin, deve ter sido setado manualmente.
            // Aqui, podemos adicionar uma checagem na coleção 'admins' se existir
            // ou assumir 'proponent' como fallback seguro.
            // console.warn(`User document not found in 'users' for UID: ${firebaseUser.uid}. Defaulting role.`);
          }
          
          // Se o usuário tem um displayName no Firebase Auth, use-o. Senão, tente buscar do doc 'users'.
          // Se ainda não houver, use o email.
          let displayName = firebaseUser.displayName;
          if (!displayName && userDocSnap.exists()) {
            displayName = userDocSnap.data()?.name || firebaseUser.email;
          }


          setUser({
            uid: firebaseUser.uid,
            name: displayName,
            email: firebaseUser.email,
            avatarUrl: firebaseUser.photoURL,
            role: userRole,
          });
        } catch (error) {
          console.error("Error fetching user role:", error);
          // Se houver erro ao buscar a role, defina como proponente
           setUser({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email,
            email: firebaseUser.email,
            avatarUrl: firebaseUser.photoURL,
            role: 'proponent', // Fallback
          });
        }
      } else {
        // Usuário está deslogado
        setUser(null);
      }
    });

    return () => unsubscribe(); // Limpar o listener ao desmontar
  }, []);

  if (!mounted) {
    // Skeleton loader para evitar hydration mismatch e layout shift
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
    if (!name) return "SN"; // Sem Nome
    const names = name.split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      setUser(null); // Limpa o estado do usuário localmente
      router.push('/'); // Redireciona para a home page
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
  const profilePath = user.role === 'admin' ? '/admin/profile' : '/proponent/profile'; // Supondo que admin também tenha perfil

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
          {(user.role === 'proponent' || user.role === 'admin') && ( // Assumindo que admin também pode ter um perfil editável
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
