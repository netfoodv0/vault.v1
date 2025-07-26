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
  Timestamp,
  getDoc,
  setDoc
} from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { StoreUser } from '@/types'
import toast from 'react-hot-toast'

export function useStoreUsers() {
  const [storeUsers, setStoreUsers] = useState<StoreUser[]>([])
  const [loading, setLoading] = useState(true)

  const loadStoreUsers = async () => {
    try {
      setLoading(true)
      const q = query(
        collection(db, 'storeUsers'),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const users: StoreUser[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        users.push({
          id: doc.id,
          email: data.email,
          name: data.name,
          cpf: data.cpf,
          whatsapp: data.whatsapp,
          role: data.role,
          isActive: data.isActive,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          storeId: data.storeId
        })
      })
      
      setStoreUsers(users)
    } catch (error) {
      console.error('Erro ao carregar usuarios:', error)
      toast.error('Erro ao carregar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const createStoreUser = async (userData: {
    name: string
    email: string
    cpf: string
    whatsapp: string
    role: 'dono' | 'gerente' | 'operador'
    password: string
  }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      )

      const storeUserData = {
        email: userData.email,
        name: userData.name,
        cpf: userData.cpf,
        whatsapp: userData.whatsapp,
        role: userData.role,
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        storeId: 'default',
        authUid: userCredential.user.uid
      }

      await addDoc(collection(db, 'storeUsers'), storeUserData)
      
      const userDoc = {
        name: userData.name,
        email: userData.email,
        plan: 'free',
        avatar: '',
        role: userData.role,
        cpf: userData.cpf,
        whatsapp: userData.whatsapp,
        isStoreUser: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }

      await setDoc(doc(db, 'users', userCredential.user.uid), userDoc)

      toast.success('Usuario criado com sucesso!')
      await loadStoreUsers()
      
      return true
    } catch (error: any) {
      console.error('Erro ao criar usuario:', error)
      
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Este email ja esta em uso')
      } else if (error.code === 'auth/weak-password') {
        toast.error('A senha deve ter pelo menos 6 caracteres')
      } else {
        toast.error('Erro ao criar usuario')
      }
      
      return false
    }
  }

  const updateStoreUser = async (userId: string, userData: {
    name: string
    cpf: string
    whatsapp: string
    role: 'dono' | 'gerente' | 'operador'
  }) => {
    try {
      console.log('Iniciando atualizacao do usuario:', userId, userData)
      
      // Primeiro, buscar o usuario atual para obter o authUid
      const storeUserRef = doc(db, 'storeUsers', userId)
      const storeUserDoc = await getDoc(storeUserRef)
      
      if (!storeUserDoc.exists()) {
        console.error('Usuario nao encontrado na colecao storeUsers')
        toast.error('Usuario nao encontrado')
        return false
      }
      
      const currentUserData = storeUserDoc.data()
      console.log('Dados atuais do usuario:', currentUserData)
      
      // Atualizar na colecao storeUsers
      await updateDoc(storeUserRef, {
        name: userData.name,
        cpf: userData.cpf,
        whatsapp: userData.whatsapp,
        role: userData.role,
        updatedAt: Timestamp.now()
      })
      
      console.log('Usuario atualizado na colecao storeUsers')
      
      // Se tiver authUid, atualizar tambem na colecao users
      if (currentUserData.authUid) {
        try {
          const userRef = doc(db, 'users', currentUserData.authUid)
          await updateDoc(userRef, {
            name: userData.name,
            cpf: userData.cpf,
            whatsapp: userData.whatsapp,
            role: userData.role,
            updatedAt: Timestamp.now()
          })
          console.log('Usuario atualizado na colecao users tambem')
        } catch (userError) {
          console.warn('Erro ao atualizar colecao users (nao critico):', userError)
        }
      }

      toast.success('Usuario atualizado com sucesso!')
      await loadStoreUsers()
      
      return true
    } catch (error) {
      console.error('Erro ao atualizar usuario:', error)
      toast.error('Erro ao atualizar usuario: ' + (error as Error).message)
      return false
    }
  }

  const deleteStoreUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'storeUsers', userId))
      
      toast.success('Usuario excluido com sucesso!')
      await loadStoreUsers()
      
      return true
    } catch (error) {
      console.error('Erro ao excluir usuario:', error)
      toast.error('Erro ao excluir usuario')
      return false
    }
  }

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const userRef = doc(db, 'storeUsers', userId)
      
      await updateDoc(userRef, {
        isActive,
        updatedAt: Timestamp.now()
      })

      const message = 'Usuario ' + (isActive ? 'ativado' : 'desativado') + ' com sucesso!'
      toast.success(message)
      await loadStoreUsers()
      
      return true
    } catch (error) {
      console.error('Erro ao alterar status do usuario:', error)
      toast.error('Erro ao alterar status do usuario')
      return false
    }
  }

  useEffect(() => {
    loadStoreUsers()
  }, [])

  return {
    storeUsers,
    loading,
    createStoreUser,
    updateStoreUser,
    deleteStoreUser,
    toggleUserStatus,
    refreshUsers: loadStoreUsers
  }
}
