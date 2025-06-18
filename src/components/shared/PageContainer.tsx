import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export default function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn("max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}
