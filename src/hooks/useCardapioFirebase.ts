'use client'

import { useState, useEffect } from 'react'
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

// Tipos para os dados do cardápio
export interface Product {
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
  additionals: string[]
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface Additional {
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

export interface Category {
  id: string
  name: string
  description: string
  status: 'ativo' | 'inativo' | 'em-falta'
  isActive: boolean
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface AdditionalCategory {
  id: string
  name: string
  description: string
  status: 'ativo' | 'inativo' | 'em-falta'
  isActive: boolean
  selectionType: 'unica' | 'multipla' | 'somavel'
  minQuantity: number
  maxQuantity: number
  userId: string
  createdAt: Date
  updatedAt: Date
}

export function useCardapio() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [additionals, setAdditionals] = useState<Additional[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [additionalCategories, setAdditionalCategories] = useState<AdditionalCategory[]>([])
  const [loading, setLoading] = useState(true)

  // Carregar dados do Firebase quando o usuário estiver logado
  useEffect(() => {
    if (user) {
      loadAllData()
    } else {
      setProducts([])
      setAdditionals([])
      setCategories([])
      setAdditionalCategories([])
      setLoading(false)
    }
  }, [user])

  // Função para carregar todos os dados
  const loadAllData = async () => {
    if (!user) return

    try {
      setLoading(true)
      await Promise.all([
        loadProducts(),
        loadAdditionals(),
        loadCategories(),
        loadAdditionalCategories()
      ])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados do cardápio')
    } finally {
      setLoading(false)
    }
  }

  // Carregar produtos
  const loadProducts = async () => {
    if (!user) return

    try {
      const q = query(
        collection(db, 'products'),
        where('userId', '==', user.id)
      )
      const snapshot = await getDocs(q)
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Product[]
      
      // Ordenar no cliente para evitar índice composto
      productsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      
      setProducts(productsData)
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
      throw error
    }
  }

  // Carregar adicionais
  const loadAdditionals = async () => {
    if (!user) return

    try {
      const q = query(
        collection(db, 'additionals'),
        where('userId', '==', user.id)
      )
      const snapshot = await getDocs(q)
      const additionalsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Additional[]
      
      // Ordenar no cliente para evitar índice composto
      additionalsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      
      setAdditionals(additionalsData)
    } catch (error) {
      console.error('Erro ao carregar adicionais:', error)
      throw error
    }
  }

  // Carregar categorias
  const loadCategories = async () => {
    if (!user) return

    try {
      const q = query(
        collection(db, 'categories'),
        where('userId', '==', user.id)
      )
      const snapshot = await getDocs(q)
      const categoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Category[]
      
      // Ordenar no cliente para evitar índice composto
      categoriesData.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      
      setCategories(categoriesData)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
      throw error
    }
  }

  // Carregar categorias de adicionais
  const loadAdditionalCategories = async () => {
    if (!user) return

    try {
      const q = query(
        collection(db, 'additionalCategories'),
        where('userId', '==', user.id)
      )
      const snapshot = await getDocs(q)
      const additionalCategoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as AdditionalCategory[]
      
      // Ordenar no cliente para evitar índice composto
      additionalCategoriesData.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      
      setAdditionalCategories(additionalCategoriesData)
    } catch (error) {
      console.error('Erro ao carregar categorias de adicionais:', error)
      throw error
    }
  }

  // CRUD para Produtos
  const createProduct = async (productData: Omit<Product, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      const newProduct = {
        ...productData,
        userId: user.id,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }

      const docRef = await addDoc(collection(db, 'products'), newProduct)
      const createdProduct: Product = {
        id: docRef.id,
        ...productData,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      setProducts(prev => [createdProduct, ...prev])
      toast.success('Produto criado com sucesso!')
      return createdProduct
    } catch (error) {
      console.error('Erro ao criar produto:', error)
      toast.error('Erro ao criar produto')
      throw error
    }
  }

  const updateProduct = async (productId: string, productData: Partial<Product>) => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      const updateData = {
        ...productData,
        updatedAt: Timestamp.now(),
      }

      await updateDoc(doc(db, 'products', productId), updateData)

      setProducts(prev => prev.map(product => 
        product.id === productId 
          ? { ...product, ...productData, updatedAt: new Date() }
          : product
      ))

      toast.success('Produto atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar produto:', error)
      toast.error('Erro ao atualizar produto')
      throw error
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      await deleteDoc(doc(db, 'products', productId))
      setProducts(prev => prev.filter(product => product.id !== productId))
      toast.success('Produto deletado com sucesso!')
    } catch (error) {
      console.error('Erro ao deletar produto:', error)
      toast.error('Erro ao deletar produto')
      throw error
    }
  }

  // CRUD para Adicionais
  const createAdditional = async (additionalData: Omit<Additional, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      const newAdditional = {
        ...additionalData,
        userId: user.id,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }

      const docRef = await addDoc(collection(db, 'additionals'), newAdditional)
      const createdAdditional: Additional = {
        id: docRef.id,
        ...additionalData,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      setAdditionals(prev => [createdAdditional, ...prev])
      toast.success('Adicional criado com sucesso!')
      return createdAdditional
    } catch (error) {
      console.error('Erro ao criar adicional:', error)
      toast.error('Erro ao criar adicional')
      throw error
    }
  }

  const updateAdditional = async (additionalId: string, additionalData: Partial<Additional>) => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      const updateData = {
        ...additionalData,
        updatedAt: Timestamp.now(),
      }

      await updateDoc(doc(db, 'additionals', additionalId), updateData)

      setAdditionals(prev => prev.map(additional => 
        additional.id === additionalId 
          ? { ...additional, ...additionalData, updatedAt: new Date() }
          : additional
      ))

      toast.success('Adicional atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar adicional:', error)
      toast.error('Erro ao atualizar adicional')
      throw error
    }
  }

  const deleteAdditional = async (additionalId: string) => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      await deleteDoc(doc(db, 'additionals', additionalId))
      setAdditionals(prev => prev.filter(additional => additional.id !== additionalId))
      toast.success('Adicional deletado com sucesso!')
    } catch (error) {
      console.error('Erro ao deletar adicional:', error)
      toast.error('Erro ao deletar adicional')
      throw error
    }
  }

  // CRUD para Categorias
  const createCategory = async (categoryData: Omit<Category, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      const newCategory = {
        ...categoryData,
        userId: user.id,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }

      const docRef = await addDoc(collection(db, 'categories'), newCategory)
      const createdCategory: Category = {
        id: docRef.id,
        ...categoryData,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      setCategories(prev => [...prev, createdCategory])
      toast.success('Categoria criada com sucesso!')
      return createdCategory
    } catch (error) {
      console.error('Erro ao criar categoria:', error)
      toast.error('Erro ao criar categoria')
      throw error
    }
  }

  const updateCategory = async (categoryId: string, categoryData: Partial<Category>) => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      const updateData = {
        ...categoryData,
        updatedAt: Timestamp.now(),
      }

      await updateDoc(doc(db, 'categories', categoryId), updateData)

      setCategories(prev => prev.map(category => 
        category.id === categoryId 
          ? { ...category, ...categoryData, updatedAt: new Date() }
          : category
      ))

      toast.success('Categoria atualizada com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error)
      toast.error('Erro ao atualizar categoria')
      throw error
    }
  }

  const deleteCategory = async (categoryId: string) => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      await deleteDoc(doc(db, 'categories', categoryId))
      setCategories(prev => prev.filter(category => category.id !== categoryId))
      toast.success('Categoria deletada com sucesso!')
    } catch (error) {
      console.error('Erro ao deletar categoria:', error)
      toast.error('Erro ao deletar categoria')
      throw error
    }
  }

  // CRUD para Categorias de Adicionais
  const createAdditionalCategory = async (categoryData: Omit<AdditionalCategory, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      const newCategory = {
        ...categoryData,
        userId: user.id,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }

      const docRef = await addDoc(collection(db, 'additionalCategories'), newCategory)
      const createdCategory: AdditionalCategory = {
        id: docRef.id,
        ...categoryData,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      setAdditionalCategories(prev => [...prev, createdCategory])
      toast.success('Categoria de adicional criada com sucesso!')
      return createdCategory
    } catch (error) {
      console.error('Erro ao criar categoria de adicional:', error)
      toast.error('Erro ao criar categoria de adicional')
      throw error
    }
  }

  const updateAdditionalCategory = async (categoryId: string, categoryData: Partial<AdditionalCategory>) => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      const updateData = {
        ...categoryData,
        updatedAt: Timestamp.now(),
      }

      await updateDoc(doc(db, 'additionalCategories', categoryId), updateData)

      setAdditionalCategories(prev => prev.map(category => 
        category.id === categoryId 
          ? { ...category, ...categoryData, updatedAt: new Date() }
          : category
      ))

      toast.success('Categoria de adicional atualizada com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar categoria de adicional:', error)
      toast.error('Erro ao atualizar categoria de adicional')
      throw error
    }
  }

  const deleteAdditionalCategory = async (categoryId: string) => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      await deleteDoc(doc(db, 'additionalCategories', categoryId))
      setAdditionalCategories(prev => prev.filter(category => category.id !== categoryId))
      toast.success('Categoria de adicional deletada com sucesso!')
    } catch (error) {
      console.error('Erro ao deletar categoria de adicional:', error)
      toast.error('Erro ao deletar categoria de adicional')
      throw error
    }
  }

  return {
    // Estados
    products,
    additionals,
    categories,
    additionalCategories,
    loading,

    // Funções de carregamento
    loadAllData,

    // CRUD Produtos
    createProduct,
    updateProduct,
    deleteProduct,

    // CRUD Adicionais
    createAdditional,
    updateAdditional,
    deleteAdditional,

    // CRUD Categorias
    createCategory,
    updateCategory,
    deleteCategory,

    // CRUD Categorias de Adicionais
    createAdditionalCategory,
    updateAdditionalCategory,
    deleteAdditionalCategory,
  }
} 