'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth'
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { User, AuthContextType } from '@/types'
import toast from 'react-hot-toast'

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await loadUserData(firebaseUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const loadUserData = async (firebaseUser: FirebaseUser) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
      
      if (userDoc.exists()) {
        const userData = userDoc.data()
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: userData.name,
          avatar: userData.avatar,
          plan: userData.plan || 'free',
          createdAt: userData.createdAt?.toDate() || new Date(),
          updatedAt: userData.updatedAt?.toDate() || new Date(),
          role: userData.role,
          cpf: userData.cpf,
          whatsapp: userData.whatsapp,
          isStoreUser: userData.isStoreUser || false,
        })
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error)
      toast.error('Erro ao carregar dados do usuário')
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      await signInWithEmailAndPassword(auth, email, password)
      toast.success('Login realizado com sucesso!')
    } catch (error: any) {
      console.error('Erro no login:', error)
      toast.error('Erro no login. Verifique suas credenciais.')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true)
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)
      
      // Criar documento do usuário no Firestore
      const userData = {
        name,
        email,
        plan: 'free',
        avatar: '',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }

      await setDoc(doc(db, 'users', firebaseUser.uid), userData)
      toast.success('Conta criada com sucesso!')
    } catch (error: any) {
      console.error('Erro no cadastro:', error)
      toast.error('Erro ao criar conta. Tente novamente.')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      setUser(null)
      toast.success('Logout realizado com sucesso!')
    } catch (error) {
      console.error('Erro no logout:', error)
      toast.error('Erro ao fazer logout')
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
      toast.success('Email de recuperação enviado!')
    } catch (error: any) {
      console.error('Erro ao enviar email de recuperação:', error)
      toast.error('Erro ao enviar email de recuperação')
      throw error
    }
  }

  // Função para verificar se o usuário pode acessar a seção de usuários
  const canAccessUsers = () => {
    if (!user || !user.isStoreUser) return true // Usuários não da loja podem acessar tudo
    return user.role === 'dono' || user.role === 'gerente' // Apenas dono e gerente podem acessar usuários
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    canAccessUsers,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
} 