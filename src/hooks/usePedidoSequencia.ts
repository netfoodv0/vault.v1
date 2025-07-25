'use client'

import { useState, useEffect } from 'react'
import { 
  doc, 
  getDoc, 
  setDoc, 
  Timestamp 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'

export function usePedidoSequencia() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [ultimoNumero, setUltimoNumero] = useState(0)

  // Carregar o último número quando o usuário estiver logado
  useEffect(() => {
    if (user) {
      carregarUltimoNumero()
    } else {
      setUltimoNumero(0)
      setLoading(false)
    }
  }, [user])

  // Função para carregar o último número do pedido
  const carregarUltimoNumero = async () => {
    if (!user) return

    try {
      setLoading(true)
      const docRef = doc(db, 'pedidoSequencias', user.id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        setUltimoNumero(data.ultimoNumero || 0)
        console.log('📊 Número atual carregado:', data.ultimoNumero)
      } else {
        setUltimoNumero(0)
        console.log('📊 Primeiro pedido - começando do 0')
      }
    } catch (error) {
      console.error('❌ Erro ao carregar sequência:', error)
      setUltimoNumero(0)
    } finally {
      setLoading(false)
    }
  }

  // Função para gerar o próximo número de pedido
  const gerarProximoNumero = async (): Promise<string> => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      const docRef = doc(db, 'pedidoSequencias', user.id)
      
      // Ler o documento atual
      const docSnap = await getDoc(docRef)
      let novoNumero = 1
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        novoNumero = (data.ultimoNumero || 0) + 1
        console.log('📝 Incrementando de', data.ultimoNumero, 'para', novoNumero)
      } else {
        console.log('📝 Primeiro pedido - começando com 1')
      }
      
      // Salvar o novo número
      await setDoc(docRef, {
        userId: user.id,
        ultimoNumero: novoNumero,
        updatedAt: Timestamp.now()
      })
      
      setUltimoNumero(novoNumero)
      const numeroFormatado = `V${novoNumero.toString().padStart(3, '0')}`
      console.log('✅ Número gerado:', numeroFormatado)
      
      return numeroFormatado
      
    } catch (error) {
      console.error('❌ Erro ao gerar número:', error)
      
      // Fallback: incrementar número local
      const numeroLocal = ultimoNumero + 1
      setUltimoNumero(numeroLocal)
      const numeroFormatado = `V${numeroLocal.toString().padStart(3, '0')}`
      console.log('🔄 Usando fallback local:', numeroFormatado)
      
      return numeroFormatado
    }
  }

  return {
    loading,
    ultimoNumero,
    gerarProximoNumero,
    carregarUltimoNumero
  }
} 