'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface CategoriaPublica {
  id: string
  name: string
  description: string
  status: 'ativo' | 'inativo' | 'em-falta'
  isActive: boolean
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface ProdutoPublico {
  id: string
  name: string
  description: string
  category: string
  price: string
  imageUrl: string
  portionSize: string
  portionUnit: string
  servesUpTo: string
  status: 'ativo' | 'inativo' | 'em-falta'
  isActive: boolean
  userId: string
  createdAt: Date
  updatedAt: Date
}

export function useLojaPublica(linkPersonalizado: string) {
  const [categorias, setCategorias] = useState<CategoriaPublica[]>([])
  const [produtos, setProdutos] = useState<ProdutoPublico[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!linkPersonalizado) {
      setLoading(false)
      return
    }

    const carregarDadosLoja = async () => {
      try {
        setLoading(true)
        setError(null)

        // 1. Buscar configuração da loja pelo linkPersonalizado
        const configQuery = query(
          collection(db, 'storeConfigurations'),
          where('linkPersonalizado', '==', linkPersonalizado)
        )

        const configSnapshot = await getDocs(configQuery)
        
        if (configSnapshot.empty) {
          setError('Loja não encontrada')
          setLoading(false)
          return
        }

        const configDoc = configSnapshot.docs[0]
        const configData = configDoc.data()
        const lojaUserId = configData.userId

        setUserId(lojaUserId)

        // 2. Carregar categorias ativas da loja
        const categoriasQuery = query(
          collection(db, 'categories'),
          where('userId', '==', lojaUserId),
          where('isActive', '==', true)
        )

        const categoriasSnapshot = await getDocs(categoriasQuery)
        const categoriasData = categoriasSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as CategoriaPublica[]

        // Ordenar categorias por data de criação
        categoriasData.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        setCategorias(categoriasData)

        // 3. Carregar produtos ativos da loja
        const produtosQuery = query(
          collection(db, 'products'),
          where('userId', '==', lojaUserId),
          where('isActive', '==', true)
        )

        const produtosSnapshot = await getDocs(produtosQuery)
        const produtosData = produtosSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as ProdutoPublico[]

        // Ordenar produtos por data de criação
        produtosData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        setProdutos(produtosData)

      } catch (error) {
        console.error('Erro ao carregar dados da loja:', error)
        setError('Erro ao carregar dados da loja')
      } finally {
        setLoading(false)
      }
    }

    carregarDadosLoja()
  }, [linkPersonalizado])

  return { 
    categorias, 
    produtos, 
    loading, 
    error, 
    userId 
  }
} 