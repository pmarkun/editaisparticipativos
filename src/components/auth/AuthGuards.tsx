"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  role?: 'admin' | 'user';
  requireEntity?: boolean;
}

export function AuthGuard({ children, role = 'user', requireEntity = false }: AuthGuardProps) {
  const { user, userData, loading, isAdmin, hasEntity } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }

      // Check role requirements
      if (role === 'admin' && !isAdmin) {
        // Not admin - redirect to appropriate dashboard
        router.push('/proponent/profile');
        return;
      }

      // Check entity requirements (for project submissions)
      if (requireEntity && !hasEntity) {
        // User doesn't have entity - redirect to profile
        router.push('/proponent/profile');
        return;
      }
    }
  }, [user, userData, loading, isAdmin, hasEntity, router, role, requireEntity]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (role === 'admin' && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (requireEntity && !hasEntity) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
    }

  return <>{children}</>;
}

