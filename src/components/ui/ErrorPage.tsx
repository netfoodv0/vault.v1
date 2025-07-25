'use client'

import { ReactNode } from 'react'

interface ErrorPageProps {
  title: string
  message: string
  icon?: ReactNode
  showRetry?: boolean
  retryCount?: number
  maxRetries?: number
  onRetry?: () => void
  isRetrying?: boolean
  primaryAction?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary'
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}

export function ErrorPage({
  title,
  message,
  icon = '⚠️',
  showRetry = false,
  retryCount = 0,
  maxRetries = 3,
  onRetry,
  isRetrying = false,
  primaryAction,
  secondaryAction
}: ErrorPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <div className="text-red-500 text-6xl mb-4">{icon}</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">{message}</p>
        
        {showRetry && retryCount < maxRetries && onRetry && (
          <div className="space-y-3 mb-6">
            <button 
              onClick={onRetry}
              disabled={isRetrying}
              className="px-6 py-2 bg-[#542583] text-white rounded-lg hover:bg-[#4a1d6b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRetrying ? 'Tentando novamente...' : 'Tentar novamente'}
            </button>
            <p className="text-gray-500 text-sm">
              Tentativa {retryCount + 1} de {maxRetries}
            </p>
          </div>
        )}
        
        <div className="space-y-3">
          {primaryAction && (
            <button 
              onClick={primaryAction.onClick}
              className={`px-6 py-2 rounded-lg transition-colors ${
                primaryAction.variant === 'secondary'
                  ? 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  : 'bg-[#542583] text-white hover:bg-[#4a1d6b]'
              }`}
            >
              {primaryAction.label}
            </button>
          )}
          
          {secondaryAction && (
            <div>
              <button 
                onClick={secondaryAction.onClick}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {secondaryAction.label}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 