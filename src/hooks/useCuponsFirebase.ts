import { useState, useEffect } from 'react'
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from './useAuth'

export interface Cupom {
  id?: string
  codigo: string
  descricao: string
  desconto: string
  valorMinimo: string
  validade: string
  status: 'Ativo' | 'Inativo'
  usos: number
  maxUsos: number
  primeiraCompra: boolean
  usosPorCliente: number
  dataExpiracao?: string | null
  userId: string
  createdAt?: any
  updatedAt?: any
}

export const useCuponsFirebase = () => {
  const { user } = useAuth()
  const [cupons, setCupons] = useState<Cupom[]>([])
  const [loading, setLoading] = useState(false) // Inicializar como false
  const [saving, setSaving] = useState(false)

  // Carregar cupons do Firebase
  const loadCupons = async () => {
    if (!user || !user.id) return

    try {
      setLoading(true)
      const cuponsRef = collection(db, 'cupons')
      
      // Primeiro, tentar com orderBy (quando o índice estiver pronto)
      try {
        const q = query(
          cuponsRef, 
          where('userId', '==', user.id),
          orderBy('createdAt', 'desc')
        )
        
        const querySnapshot = await getDocs(q)
        const cuponsData: Cupom[] = []
        
        querySnapshot.forEach((doc) => {
          cuponsData.push({
            id: doc.id,
            ...doc.data()
          } as Cupom)
        })
        
        setCupons(cuponsData)
        return
      } catch (indexError: any) {
        // Se o índice ainda não estiver pronto, usar consulta sem orderBy
        if (indexError.code === 'failed-precondition' || indexError.message.includes('index')) {
          console.log('Índice ainda em construção, usando consulta alternativa...')
          
          const q = query(
            cuponsRef, 
            where('userId', '==', user.id)
          )
          
          const querySnapshot = await getDocs(q)
          const cuponsData: Cupom[] = []
          
          querySnapshot.forEach((doc) => {
            cuponsData.push({
              id: doc.id,
              ...doc.data()
            } as Cupom)
          })
          
          // Ordenar localmente por createdAt (mais recente primeiro)
          cuponsData.sort((a, b) => {
            const aTime = a.createdAt?.toDate?.() || a.createdAt || new Date(0)
            const bTime = b.createdAt?.toDate?.() || b.createdAt || new Date(0)
            return bTime.getTime() - aTime.getTime()
          })
          
          setCupons(cuponsData)
          return
        }
        
        // Se for outro tipo de erro, relançar
        throw indexError
      }
    } catch (error) {
      console.error('Erro ao carregar cupons:', error)
    } finally {
      setLoading(false)
    }
  }

  // Adicionar novo cupom
  const addCupom = async (cupomData: Omit<Cupom, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user || !user.id) {
      console.error('Usuário não autenticado ou ID não disponível')
      throw new Error('Usuário não autenticado')
    }

    try {
      setSaving(true)
      const cupomRef = collection(db, 'cupons')
      
      const newCupom = {
        ...cupomData,
        userId: user.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      const docRef = await addDoc(cupomRef, newCupom)
      
      // Adicionar o cupom à lista local
      const cupomComId = {
        id: docRef.id,
        ...newCupom
      } as Cupom
      
      setCupons(prev => [cupomComId, ...prev])
      
      return docRef.id
    } catch (error) {
      console.error('Erro ao adicionar cupom:', error)
      throw error
    } finally {
      setSaving(false)
    }
  }

  // Atualizar cupom existente
  const updateCupom = async (cupomId: string, cupomData: Partial<Cupom>) => {
    if (!user || !user.id) return

    try {
      setSaving(true)
      
      const cupomRef = doc(db, 'cupons', cupomId)
      
      await updateDoc(cupomRef, {
        ...cupomData,
        updatedAt: serverTimestamp()
      })
      
      // Atualizar na lista local
      setCupons(prev => prev.map(cupom => 
        cupom.id === cupomId 
          ? { 
              ...cupom, 
              ...cupomData,
              id: cupom.id // Garantir que o ID não seja perdido
            }
          : cupom
      ))
    } catch (error) {
      console.error('Erro ao atualizar cupom:', error)
      throw error
    } finally {
      setSaving(false)
    }
  }

  // Deletar cupom
  const deleteCupom = async (cupomId: string) => {
    if (!user || !user.id) return

    try {
      setSaving(true)
      const cupomRef = doc(db, 'cupons', cupomId)
      await deleteDoc(cupomRef)
      
      // Remover da lista local
      setCupons(prev => prev.filter(cupom => cupom.id !== cupomId))
    } catch (error) {
      console.error('Erro ao deletar cupom:', error)
      throw error
    } finally {
      setSaving(false)
    }
  }

  // Carregar cupons quando o usuário mudar
  useEffect(() => {
    if (user && user.id) {
      loadCupons()
    } else {
      setCupons([])
      setLoading(false)
    }
  }, [user])

  return {
    cupons,
    loading,
    saving,
    addCupom,
    updateCupom,
    deleteCupom,
    loadCupons
  }
} 