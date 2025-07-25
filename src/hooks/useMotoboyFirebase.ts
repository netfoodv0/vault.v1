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
  Timestamp 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

// Tipos para os dados dos motoboys
export interface Motoboy {
  id: string
  nome: string
  whatsapp: string
  ativo: boolean
  userId: string
  createdAt: Date
  updatedAt: Date
}

export function useMotoboyFirebase() {
  const { user } = useAuth()
  const [motoboys, setMotoboys] = useState<Motoboy[]>([])
  const [loading, setLoading] = useState(true)

  // Carregar dados do Firebase quando o usuário estiver logado
  useEffect(() => {
    if (user) {
      loadMotoboys()
    } else {
      setMotoboys([])
      setLoading(false)
    }
  }, [user])

  // Carregar motoboys
  const loadMotoboys = async () => {
    if (!user) return

    try {
      setLoading(true)
      const q = query(
        collection(db, 'motoboys'),
        where('userId', '==', user.id)
      )
      const snapshot = await getDocs(q)
      const motoboyData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Motoboy[]
      
      // Ordenar por data de criação (mais recentes primeiro)
      motoboyData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      
      setMotoboys(motoboyData)
    } catch (error) {
      console.error('Erro ao carregar motoboys:', error)
      toast.error('Erro ao carregar motoboys')
    } finally {
      setLoading(false)
    }
  }

  // Criar motoboy
  const createMotoboy = async (motoboyData: Omit<Motoboy, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      const newMotoboy = {
        ...motoboyData,
        userId: user.id,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }

      const docRef = await addDoc(collection(db, 'motoboys'), newMotoboy)
      const createdMotoboy: Motoboy = {
        id: docRef.id,
        ...motoboyData,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      setMotoboys(prev => [createdMotoboy, ...prev])
      toast.success('Motoboy cadastrado com sucesso!')
      return createdMotoboy
    } catch (error) {
      console.error('Erro ao criar motoboy:', error)
      toast.error('Erro ao cadastrar motoboy')
      throw error
    }
  }

  // Atualizar motoboy
  const updateMotoboy = async (motoboyId: string, motoboyData: Partial<Motoboy>) => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      const updateData = {
        ...motoboyData,
        updatedAt: Timestamp.now(),
      }

      await updateDoc(doc(db, 'motoboys', motoboyId), updateData)

      setMotoboys(prev => prev.map(motoboy => 
        motoboy.id === motoboyId 
          ? { ...motoboy, ...motoboyData, updatedAt: new Date() }
          : motoboy
      ))

      toast.success('Motoboy atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar motoboy:', error)
      toast.error('Erro ao atualizar motoboy')
      throw error
    }
  }

  // Deletar motoboy
  const deleteMotoboy = async (motoboyId: string) => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      await deleteDoc(doc(db, 'motoboys', motoboyId))
      setMotoboys(prev => prev.filter(motoboy => motoboy.id !== motoboyId))
      toast.success('Motoboy removido com sucesso!')
    } catch (error) {
      console.error('Erro ao deletar motoboy:', error)
      toast.error('Erro ao remover motoboy')
      throw error
    }
  }

  // Toggle status do motoboy
  const toggleMotoboyStatus = async (motoboyId: string) => {
    const motoboy = motoboys.find(m => m.id === motoboyId)
    if (!motoboy) return

    await updateMotoboy(motoboyId, { ativo: !motoboy.ativo })
  }

  return {
    motoboys,
    loading,
    createMotoboy,
    updateMotoboy,
    deleteMotoboy,
    toggleMotoboyStatus,
    loadMotoboys
  }
} 