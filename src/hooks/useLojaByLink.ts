'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ConfiguracaoLoja } from '@/hooks/useAdministrarLoja'

export function useLojaByLink(linkPersonalizado: string) {
  const [loja, setLoja] = useState<ConfiguracaoLoja | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!linkPersonalizado) {
      setLoading(false)
      return
    }

    const buscarLoja = async () => {
      try {
        setLoading(true)
        setError(null)

        // Buscar na collection storeConfigurations onde linkPersonalizado = linkPersonalizado
        const q = query(
          collection(db, 'storeConfigurations'),
          where('linkPersonalizado', '==', linkPersonalizado)
        )

        const querySnapshot = await getDocs(q)
        
        if (querySnapshot.empty) {
          setError('Loja não encontrada')
          setLoja(null)
        } else {
          const doc = querySnapshot.docs[0]
          const data = doc.data()
          
          // Verificar se o linkPersonalizado está configurado
          if (!data.linkPersonalizado || data.linkPersonalizado.trim() === '') {
            setError('Loja não encontrada')
            setLoja(null)
            return
          }
          
          const lojaData: ConfiguracaoLoja = {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as ConfiguracaoLoja
          
          setLoja(lojaData)
        }
      } catch (error) {
        console.error('Erro ao buscar loja:', error)
        setError('Erro ao carregar dados da loja')
        setLoja(null)
      } finally {
        setLoading(false)
      }
    }

    buscarLoja()
  }, [linkPersonalizado])

  return { loja, loading, error }
} 