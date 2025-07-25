'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseErrorRetryOptions {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  onRetry?: () => Promise<void>
  onMaxRetriesReached?: () => void
}

interface UseErrorRetryReturn {
  retryCount: number
  isRetrying: boolean
  hasError: boolean
  error: string | null
  retry: () => Promise<void>
  reset: () => void
  setError: (error: string | null) => void
}

export function useErrorRetry({
  maxRetries = 3,
  baseDelay = 2000,
  maxDelay = 10000,
  onRetry,
  onMaxRetriesReached
}: UseErrorRetryOptions = {}): UseErrorRetryReturn {
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const [error, setErrorState] = useState<string | null>(null)
  const [lastErrorTime, setLastErrorTime] = useState<number | null>(null)

  const hasError = error !== null

  // Função para calcular delay exponencial com backoff
  const calculateDelay = useCallback((attempt: number): number => {
    const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
    return delay + Math.random() * 1000 // Adiciona jitter para evitar thundering herd
  }, [baseDelay, maxDelay])

  // Função para executar retry
  const retry = useCallback(async () => {
    if (!onRetry || isRetrying || retryCount >= maxRetries) {
      return
    }

    setIsRetrying(true)
    setErrorState(null)

    try {
      await onRetry()
      // Se chegou aqui, o retry foi bem-sucedido
      setRetryCount(0)
      setLastErrorTime(null)
    } catch (err) {
      const newRetryCount = retryCount + 1
      setRetryCount(newRetryCount)
      setLastErrorTime(Date.now())

      if (newRetryCount >= maxRetries) {
        onMaxRetriesReached?.()
      }
    } finally {
      setIsRetrying(false)
    }
  }, [onRetry, isRetrying, retryCount, maxRetries, onMaxRetriesReached])

  // Retry automático quando há erro
  useEffect(() => {
    if (hasError && retryCount < maxRetries && !isRetrying) {
      // Evitar retry imediato se o erro foi recente
      const timeSinceLastError = lastErrorTime ? Date.now() - lastErrorTime : Infinity
      const minDelay = 1000 // 1 segundo mínimo entre tentativas

      if (timeSinceLastError < minDelay) {
        return
      }

      const delay = calculateDelay(retryCount)
      const timer = setTimeout(() => {
        retry()
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [hasError, retryCount, maxRetries, isRetrying, lastErrorTime, calculateDelay, retry])

  // Função para resetar o estado
  const reset = useCallback(() => {
    setRetryCount(0)
    setIsRetrying(false)
    setErrorState(null)
    setLastErrorTime(null)
  }, [])

  // Função para definir erro manualmente
  const setError = useCallback((newError: string | null) => {
    setErrorState(newError)
    if (newError) {
      setLastErrorTime(Date.now())
    }
  }, [])

  return {
    retryCount,
    isRetrying,
    hasError,
    error,
    retry,
    reset,
    setError
  }
} 