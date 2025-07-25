'use client'

import { usePathname } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { MainSidebar } from './MainSidebar'

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();

  return (
    <ProtectedRoute>
      <div className="flex flex-1" style={{ backgroundColor: '#ececec' }}>
        <MainSidebar activeRoute={pathname} />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
} 