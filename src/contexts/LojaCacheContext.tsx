'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'

interface CategoriaPublica {
  id: string
  name: string
  description: string
  status: 'ativo' | 'inativo' | 'em-falta'
  isActive: boolean
  userId: string
  createdAt: Date
  updatedAt: Date
}

interface ProdutoPublico {
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

interface ConfiguracaoLoja {
  id: string
  nomeLoja: string
  linkPersonalizado: string
  descricao: string
  telefone: string
  endereco: string
  horariosFuncionamento: any[]
  fusoHorario: string
  pedidoMinimo: number
  taxaEntrega: number
  tempoEntrega: string
  imagemLogo: string
  imagemBanner: string
  banners: string[]
  userId: string
  createdAt: Date
  updatedAt: Date
}

interface LojaCacheData {
  loja: ConfiguracaoLoja | null
  categorias: CategoriaPublica[]
  produtos: ProdutoPublico[]
  loading: boolean
  error: string | null
  lastFetch: number | null
  scrollPosition: number
  retryCount: number
  lastError: number | null
}

interface LojaCacheContextType {
  getLojaData: (linkPersonalizado: string) => LojaCacheData
  preloadLojaData: (linkPersonalizado: string, forceRefresh?: boolean) => Promise<void>
  clearCache: (linkPersonalizado?: string) => void
  saveScrollPosition: (linkPersonalizado: string, position: number) => void
  retryLoad: (linkPersonalizado: string) => Promise<void>
}

const LojaCacheContext = createContext<LojaCacheContextType | undefined>(undefined)

export function LojaCacheProvider({ children }: { children: ReactNode }) {
  const [cache, setCache] = useState<Record<string, LojaCacheData>>({})
  const { user } = useAuth()

  // Função para limpar cache antigo automaticamente
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now()
      const maxAge = 30 * 60 * 1000 // 30 minutos
      
      setCache(prev => {
        const newCache = { ...prev }
        Object.keys(newCache).forEach(key => {
          const data = newCache[key]
          if (data.lastFetch && now - data.lastFetch > maxAge) {
            delete newCache[key]
          }
        })
        return newCache
      })
    }, 5 * 60 * 1000) // Verificar a cada 5 minutos

    return () => clearInterval(cleanupInterval)
  }, [])

  const preloadLojaData = async (linkPersonalizado: string, forceRefresh = false) => {
    // Verificar se já temos dados em cache e se não é um refresh forçado
    const cachedData = cache[linkPersonalizado]
    if (cachedData && !forceRefresh && cachedData.lastFetch && Date.now() - cachedData.lastFetch < 5 * 60 * 1000) {
      return // Dados ainda válidos (menos de 5 minutos)
    }

    // Marcar como carregando
    setCache(prev => ({
      ...prev,
      [linkPersonalizado]: {
        ...prev[linkPersonalizado],
        loading: true,
        error: null
      }
    }))

    try {
      // Tentar buscar configuração da loja nas coleções antigas primeiro
      let lojaData: ConfiguracaoLoja | null = null
      
      try {
        // Tentar coleção antiga
        const lojasRef = collection(db, 'storeConfigurations')
        const lojasQuery = query(lojasRef, where('linkPersonalizado', '==', linkPersonalizado))
        const lojasSnapshot = await getDocs(lojasQuery)

        if (!lojasSnapshot.empty) {
          const lojaDoc = lojasSnapshot.docs[0]
          lojaData = {
            id: lojaDoc.id,
            ...lojaDoc.data(),
            createdAt: lojaDoc.data().createdAt?.toDate() || new Date(),
            updatedAt: lojaDoc.data().updatedAt?.toDate() || new Date(),
          } as ConfiguracaoLoja
        }
      } catch (error) {
        console.log('Coleção storeConfigurations não encontrada, tentando configuracoesLojas...')
      }

      // Se não encontrou na coleção antiga, tentar na nova
      if (!lojaData) {
        const lojasRef = collection(db, 'configuracoesLojas')
        const lojasQuery = query(lojasRef, where('linkPersonalizado', '==', linkPersonalizado))
        const lojasSnapshot = await getDocs(lojasQuery)

        if (lojasSnapshot.empty) {
          throw new Error('Loja não encontrada')
        }

        const lojaDoc = lojasSnapshot.docs[0]
        lojaData = {
          id: lojaDoc.id,
          ...lojaDoc.data(),
          createdAt: lojaDoc.data().createdAt?.toDate() || new Date(),
          updatedAt: lojaDoc.data().updatedAt?.toDate() || new Date(),
        } as ConfiguracaoLoja
      }

      // Buscar categorias - tentar coleção antiga primeiro
      let categoriasData: CategoriaPublica[] = []
      
      try {
        const categoriasRef = collection(db, 'categories')
        const categoriasQuery = query(categoriasRef, where('userId', '==', lojaData.userId))
        const categoriasSnapshot = await getDocs(categoriasQuery)

        categoriasData = categoriasSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as CategoriaPublica[]
      } catch (error) {
        console.log('Coleção categories não encontrada, tentando categorias...')
        
        // Tentar coleção nova
        const categoriasRef = collection(db, 'categorias')
        const categoriasQuery = query(categoriasRef, where('userId', '==', lojaData.userId))
        const categoriasSnapshot = await getDocs(categoriasQuery)

        categoriasData = categoriasSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as CategoriaPublica[]
      }

      categoriasData.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

      // Buscar produtos - tentar coleção antiga primeiro
      let produtosData: ProdutoPublico[] = []
      
      try {
        const produtosRef = collection(db, 'products')
        const produtosQuery = query(produtosRef, where('userId', '==', lojaData.userId))
        const produtosSnapshot = await getDocs(produtosQuery)

        produtosData = produtosSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as ProdutoPublico[]
      } catch (error) {
        console.log('Coleção products não encontrada, tentando produtos...')
        
        // Tentar coleção nova
        const produtosRef = collection(db, 'produtos')
        const produtosQuery = query(produtosRef, where('userId', '==', lojaData.userId))
        const produtosSnapshot = await getDocs(produtosQuery)

        produtosData = produtosSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as ProdutoPublico[]
      }

      produtosData.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

      // Salvar no cache com sucesso
      setCache(prev => ({
        ...prev,
        [linkPersonalizado]: {
          loja: lojaData,
          categorias: categoriasData,
          produtos: produtosData,
          loading: false,
          error: null,
          lastFetch: Date.now(),
          lastError: null,
          scrollPosition: prev[linkPersonalizado]?.scrollPosition || 0,
          retryCount: 0
        }
      }))

    } catch (error) {
      console.error('Erro ao pré-carregar dados da loja:', error)
      setCache(prev => ({
        ...prev,
        [linkPersonalizado]: {
          loja: null,
          categorias: [],
          produtos: [],
          loading: false,
          error: 'Erro ao carregar dados da loja',
          lastFetch: Date.now(),
          lastError: Date.now(),
          scrollPosition: prev[linkPersonalizado]?.scrollPosition || 0,
          retryCount: (prev[linkPersonalizado]?.retryCount || 0) + 1
        }
      }))
    }
  }

  const getLojaData = (linkPersonalizado: string): LojaCacheData => {
    return cache[linkPersonalizado] || {
      loja: null,
      categorias: [],
      produtos: [],
      loading: false,
      error: null,
      lastFetch: null,
      scrollPosition: 0,
      retryCount: 0,
      lastError: null
    }
  }

  const clearCache = (linkPersonalizado?: string) => {
    if (linkPersonalizado) {
      setCache(prev => {
        const newCache = { ...prev }
        delete newCache[linkPersonalizado]
        return newCache
      })
    } else {
      setCache({})
    }
  }

  const saveScrollPosition = (linkPersonalizado: string, position: number) => {
    setCache(prev => ({
      ...prev,
      [linkPersonalizado]: {
        ...prev[linkPersonalizado],
        scrollPosition: position
      }
    }))
  }

  const retryLoad = async (linkPersonalizado: string) => {
    await preloadLojaData(linkPersonalizado, true)
  }

  return (
    <LojaCacheContext.Provider value={{
      getLojaData,
      preloadLojaData,
      clearCache,
      saveScrollPosition,
      retryLoad
    }}>
      {children}
    </LojaCacheContext.Provider>
  )
}

export function useLojaCache() {
  const context = useContext(LojaCacheContext)
  if (context === undefined) {
    throw new Error('useLojaCache deve ser usado dentro de um LojaCacheProvider')
  }
  return context
} 