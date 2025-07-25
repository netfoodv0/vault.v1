'use client'

import { ReactNode } from 'react'

interface PageWrapperProps {
  children: ReactNode
  className?: string
}

export function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <div 
      className={`page-container ${className}`}
      style={{
        minHeight: '100vh',
        backgroundColor: '#ececec',
        overflowX: 'hidden',
        overflowY: 'auto'
      }}
    >
      {children}
    </div>
  )
} 