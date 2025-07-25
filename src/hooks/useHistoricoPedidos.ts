'use client'

import { useState, useEffect } from 'react'
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

// Tipos para os dados do histórico de pedidos
export interface HistoricoPedido {
  id: string
  numeroPedido?: string // Número sequencial do pedido
  cliente: string
  telefone: string
  valor: string
  status: 'Entregue' | 'Cancelado'
  data: string
  hora: string
  formaPagamento: string
  tipo: 'Delivery' | 'Balcão' | 'Retirada'
  endereco?: string
  observacao?: string
  itens?: Array<{
    nome: string
    quantidade: number
    preco: string
    adicionais?: Array<{
      nome: string
      preco: string
    }>
  }>
  // Dados financeiros completos
  subtotal?: string
  valorAcrescimo?: string
  valorDesconto?: string
  taxaEntrega?: string
  // Dados de pagamento detalhados
  valorRecebido?: string
  valorPix?: string
  valorDebito?: string
  valorCredito?: string
  troco?: string
  // Status dos pagamentos
  pagamentoDinheiro?: string
  pagamentoPix?: string
  pagamentoDebito?: string
  pagamentoCredito?: string
  // Dados originais do pedido
  dadosCompletos?: any
  dataCriacao?: Date
  mesaNumero?: number
  userId: string
  createdAt: Date
  updatedAt: Date
}

export function useHistoricoPedidos() {
  const { user } = useAuth()
  const [historicoPedidos, setHistoricoPedidos] = useState<HistoricoPedido[]>([])
  const [loading, setLoading] = useState(true)

  // Carregar dados do Firebase quando o usuário estiver logado
  useEffect(() => {
    if (user) {
      loadHistoricoPedidos()
    } else {
      setHistoricoPedidos([])
      setLoading(false)
    }
  }, [user])

  // Função para carregar histórico de pedidos
  const loadHistoricoPedidos = async () => {
    if (!user) return

    try {
      setLoading(true)
      const q = query(
        collection(db, 'historicoPedidos'),
        where('userId', '==', user.id),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(q)
      const historicoData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as HistoricoPedido[]
      
      setHistoricoPedidos(historicoData)
    } catch (error) {
      console.error('Erro ao carregar histórico de pedidos:', error)
      toast.error('Erro ao carregar histórico de pedidos')
    } finally {
      setLoading(false)
    }
  }

  // Função para adicionar pedido ao histórico
  const adicionarAoHistorico = async (pedidoData: Omit<HistoricoPedido, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      // Remover campos undefined para evitar erro no Firebase
      const dadosLimpos = { ...pedidoData }
      Object.keys(dadosLimpos).forEach(key => {
        if (dadosLimpos[key as keyof typeof dadosLimpos] === undefined) {
          delete dadosLimpos[key as keyof typeof dadosLimpos]
        }
      })

      const novoPedido = {
        ...dadosLimpos,
        userId: user.id,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }

      const docRef = await addDoc(collection(db, 'historicoPedidos'), novoPedido)
      const createdPedido: HistoricoPedido = {
        id: docRef.id,
        ...pedidoData,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      setHistoricoPedidos(prev => [createdPedido, ...prev])
      toast.success('Pedido adicionado ao histórico!')
      return createdPedido
    } catch (error) {
      console.error('Erro ao adicionar pedido ao histórico:', error)
      toast.error('Erro ao adicionar pedido ao histórico')
      throw error
    }
  }

  // Função para buscar pedidos por status
  const buscarPorStatus = (status: string) => {
    return historicoPedidos.filter(pedido => pedido.status === status)
  }

  // Função para buscar pedidos por data
  const buscarPorData = (dataInicio: Date, dataFim: Date) => {
    return historicoPedidos.filter(pedido => {
      const dataPedido = new Date(pedido.data.split('/').reverse().join('-'))
      return dataPedido >= dataInicio && dataPedido <= dataFim
    })
  }

  // Estatísticas do histórico
  const estatisticas = {
    total: historicoPedidos.length,
    entregues: historicoPedidos.filter(p => p.status === 'Entregue').length,
    cancelados: historicoPedidos.filter(p => p.status === 'Cancelado').length,
    valorTotal: historicoPedidos.reduce((total, pedido) => {
      const valor = parseFloat(pedido.valor.replace('R$ ', '').replace(',', '.'))
      return total + valor
    }, 0),
    valorEntregues: historicoPedidos
      .filter(p => p.status === 'Entregue')
      .reduce((total, pedido) => {
        const valor = parseFloat(pedido.valor.replace('R$ ', '').replace(',', '.'))
        return total + valor
      }, 0)
  }

  return {
    historicoPedidos,
    loading,
    loadHistoricoPedidos,
    adicionarAoHistorico,
    buscarPorStatus,
    buscarPorData,
    estatisticas
  }
} 