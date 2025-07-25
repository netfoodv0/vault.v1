'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { LojaCacheProvider } from '@/contexts/LojaCacheContext';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  
  // Rotas que não devem ter sidebar
  const isLojaRoute = pathname.startsWith('/loja');

  if (isLojaRoute) {
    return (
      <LojaCacheProvider>
        <div className="min-h-screen bg-white">
          {children}
        </div>
      </LojaCacheProvider>
    );
  }

  return (
    <LojaCacheProvider>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <main 
          className="flex-1 overflow-y-auto overflow-x-hidden main-content" 
          style={{ 
            paddingLeft: '255px',
            scrollbarGutter: 'stable'
          }}
        >
          {children}
        </main>
      </div>
    </LojaCacheProvider>
  );
} 