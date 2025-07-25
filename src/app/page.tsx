'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Se usuário estiver logado, redirecionar para pedidos
        router.push('/pedidos')
      } else {
        // Se não estiver logado, redirecionar para o login
        router.push('/login')
      }
    }
  }, [user, loading, router])

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="spinner" width="80px" height="80px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
            <circle className="path" fill="none" strokeWidth="6" strokeLinecap="round" cx="33" cy="33" r="30"></circle>
          </svg>
        </div>
        <style jsx>{`
          .spinner {
            animation: rotator 1.4s linear infinite;
          }

          @keyframes rotator {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(270deg); }
          }

          .path {
            stroke-dasharray: 187;
            stroke-dashoffset: 0;
            transform-origin: center;
            animation: dash 1.4s ease-in-out infinite;
            stroke: #542583;
          }

          @keyframes dash {
            0% { stroke-dashoffset: 187; }
            50% {
              stroke-dashoffset: 46.75;
              transform: rotate(135deg);
            }
            100% {
              stroke-dashoffset: 187;
              transform: rotate(450deg);
            }
          }
        `}</style>
      </div>
    )
  }

  // Não renderizar nada enquanto redireciona
  return null
} 