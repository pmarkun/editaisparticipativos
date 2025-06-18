import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageTitleProps {
  children: ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export default function PageTitle({ children, className, as: Component = 'h1' }: PageTitleProps) {
  return (
    <Component className={cn("text-3xl font-headline font-bold tracking-tight text-primary sm:text-4xl mb-8", className)}>
      {children}
    </Component>
  );
}
