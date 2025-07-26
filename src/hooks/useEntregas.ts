'use client'

import { useState, useEffect } from 'react'
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  where,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  Timestamp 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import toast from 'react-hot-toast'

export interface EntregaProps {
  id: string
  endereco: string
  cliente: string
  telefone: string
  valor: number
  status: 'pendente' | 'em_preparacao' | 'saiu_entrega' | 'entregue' | 'cancelado'
  motoboy?: string
  motoboyId?: string
  coordenadas?: [number, number] // [longitude, latitude]
  horarioPedido: string
  previsaoEntrega?: string
  observacoes?: string
  formaPagamento?: string
  itens?: Array<{
    nome: string
    quantidade: number
    preco: number
    observacoes?: string
  }>
  createdAt: Timestamp
  updatedAt: Timestamp
}

export const useEntregas = () => {
  const [entregas, setEntregas] = useState<EntregaProps[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Buscar entregas do Firebase
  useEffect(() => {
    setLoading(true)
    const entregasRef = collection(db, 'entregas')
    const q = query(
      entregasRef,
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const entregasData: EntregaProps[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          entregasData.push({
            id: doc.id,
            ...data,
            // Converter Timestamp para string se necessário
            horarioPedido: data.horarioPedido || data.createdAt?.toDate().toLocaleString('pt-BR'),
            previsaoEntrega: data.previsaoEntrega || calcularPrevisaoEntrega(data.createdAt?.toDate())
          } as EntregaProps)
        })
        
        // Só atualizar se realmente mudou
        setEntregas(prevEntregas => {
          const prevSignature = prevEntregas.map(e => `${e.id}-${e.status}`).join('|')
          const newSignature = entregasData.map(e => `${e.id}-${e.status}`).join('|')
          
          if (prevSignature === newSignature) {
            return prevEntregas
          }
          
          return entregasData
        })
        
        setLoading(false)
        setError(null)
      },
      (error) => {
        console.error('Erro ao buscar entregas:', error)
        setError('Erro ao carregar entregas')
        setLoading(false)
        toast.error('Erro ao carregar entregas')
      }
    )

    return () => unsubscribe()
  }, [])

  // Função para calcular previsão de entrega
  const calcularPrevisaoEntrega = (dataPedido: Date): string => {
    if (!dataPedido) return ''
    
    const previsao = new Date(dataPedido)
    previsao.setMinutes(previsao.getMinutes() + 45) // 45 minutos de previsão padrão
    
    return previsao.toLocaleString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Buscar entregas por status
  const buscarEntregasPorStatus = (status: string) => {
    return entregas.filter(entrega => entrega.status === status)
  }

  // Buscar entregas por motoboy
  const buscarEntregasPorMotoboy = (motoboyId: string) => {
    return entregas.filter(entrega => entrega.motoboyId === motoboyId)
  }

  // Criar nova entrega
  const criarEntrega = async (dadosEntrega: Omit<EntregaProps, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = Timestamp.now()
      const novaEntrega = {
        ...dadosEntrega,
        createdAt: now,
        updatedAt: now,
        status: 'pendente' as const,
        horarioPedido: now.toDate().toLocaleString('pt-BR'),
        previsaoEntrega: calcularPrevisaoEntrega(now.toDate())
      }

      const docRef = await addDoc(collection(db, 'entregas'), novaEntrega)
      toast.success('Entrega criada com sucesso!')
      return docRef.id
    } catch (error) {
      console.error('Erro ao criar entrega:', error)
      toast.error('Erro ao criar entrega')
      throw error
    }
  }

  // Criar entregas de demonstração
  const criarEntregasDemo = async () => {
    const entregasDemo = [
      {
        cliente: 'João Silva',
        telefone: '(11) 98765-4321',
        endereco: 'Rua das Flores, 123, Vila Madalena - São Paulo, SP',
        valor: 45.50,
        status: 'pendente' as const,
        coordenadas: [-46.6915, -23.5462] as [number, number],
        formaPagamento: 'PIX',
        horarioPedido: new Date().toISOString(),
        itens: [
          { nome: 'Pizza Margherita', quantidade: 1, preco: 35.50 },
          { nome: 'Refrigerante 2L', quantidade: 1, preco: 10.00 }
        ]
      },
      {
        cliente: 'Maria Santos',
        telefone: '(11) 91234-5678',
        endereco: 'Av. Paulista, 1000, Bela Vista - São Paulo, SP',
        valor: 62.80,
        status: 'em_preparacao' as const,
        motoboy: 'Carlos Silva',
        motoboyId: 'motoboy1',
        coordenadas: [-46.6563, -23.5614] as [number, number],
        formaPagamento: 'Cartão de Crédito',
        horarioPedido: new Date().toISOString(),
        itens: [
          { nome: 'Pizza Calabresa', quantidade: 1, preco: 42.80 },
          { nome: 'Coca-Cola 600ml', quantidade: 2, preco: 10.00 }
        ]
      },
      {
        cliente: 'Pedro Oliveira',
        telefone: '(11) 95555-1234',
        endereco: 'Rua Oscar Freire, 500, Jardins - São Paulo, SP',
        valor: 78.90,
        status: 'saiu_entrega' as const,
        motoboy: 'José Santos',
        motoboyId: 'motoboy2',
        coordenadas: [-46.6692, -23.5649] as [number, number],
        formaPagamento: 'Dinheiro',
        horarioPedido: new Date().toISOString(),
        itens: [
          { nome: 'Pizza Portuguesa', quantidade: 1, preco: 48.90 },
          { nome: 'Pizza Doce', quantidade: 1, preco: 30.00 }
        ]
      },
      {
        cliente: 'Ana Costa',
        telefone: '(11) 97777-8888',
        endereco: 'Rua da Consolação, 2000, Consolação - São Paulo, SP',
        valor: 34.50,
        status: 'entregue' as const,
        motoboy: 'Ricardo Lima',
        motoboyId: 'motoboy3',
        coordenadas: [-46.6480, -23.5576] as [number, number],
        formaPagamento: 'PIX',
        horarioPedido: new Date().toISOString(),
        itens: [
          { nome: 'Pizza Mozzarella', quantidade: 1, preco: 32.50 },
          { nome: 'Água 500ml', quantidade: 1, preco: 2.00 }
        ]
      },
      {
        cliente: 'Lucas Ferreira',
        telefone: '(11) 96666-9999',
        endereco: 'Rua Augusta, 1500, Cerqueira César - São Paulo, SP',
        valor: 52.30,
        status: 'cancelado' as const,
        coordenadas: [-46.6603, -23.5580] as [number, number],
        formaPagamento: 'Cartão de Débito',
        horarioPedido: new Date().toISOString(),
        observacoes: 'Cliente cancelou devido ao tempo de entrega',
        itens: [
          { nome: 'Pizza Quatro Queijos', quantidade: 1, preco: 52.30 }
        ]
      }
    ]

    try {
      const promises = entregasDemo.map(entrega => criarEntrega(entrega))
      await Promise.all(promises)
      toast.success('Entregas de demonstração criadas!')
    } catch (error) {
      console.error('Erro ao criar entregas demo:', error)
      toast.error('Erro ao criar entregas de demonstração')
    }
  }

  // Atualizar status da entrega
  const atualizarStatusEntrega = async (entregaId: string, novoStatus: EntregaProps['status']) => {
    try {
      const entregaRef = doc(db, 'entregas', entregaId)
      await updateDoc(entregaRef, {
        status: novoStatus,
        updatedAt: Timestamp.now()
      })
      
      const statusTexto = {
        'pendente': 'Pendente',
        'em_preparacao': 'Em Preparação',
        'saiu_entrega': 'Saiu para Entrega',
        'entregue': 'Entregue',
        'cancelado': 'Cancelado'
      }
      
      toast.success(`Status atualizado para: ${statusTexto[novoStatus]}`)
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      toast.error('Erro ao atualizar status da entrega')
      throw error
    }
  }

  // Atribuir motoboy à entrega
  const atribuirMotoboy = async (entregaId: string, motoboyId: string, motoboyNome: string) => {
    try {
      const entregaRef = doc(db, 'entregas', entregaId)
      await updateDoc(entregaRef, {
        motoboyId,
        motoboy: motoboyNome,
        status: 'em_preparacao',
        updatedAt: Timestamp.now()
      })
      
      toast.success(`Motoboy ${motoboyNome} atribuído à entrega`)
    } catch (error) {
      console.error('Erro ao atribuir motoboy:', error)
      toast.error('Erro ao atribuir motoboy')
      throw error
    }
  }

  // Atualizar coordenadas da entrega
  const atualizarCoordenadas = async (entregaId: string, coordenadas: [number, number]) => {
    try {
      const entregaRef = doc(db, 'entregas', entregaId)
      await updateDoc(entregaRef, {
        coordenadas,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Erro ao atualizar coordenadas:', error)
      throw error
    }
  }

  // Atualizar entrega completa
  const atualizarEntrega = async (entregaId: string, dadosAtualizacao: Partial<EntregaProps>) => {
    try {
      const entregaRef = doc(db, 'entregas', entregaId)
      await updateDoc(entregaRef, {
        ...dadosAtualizacao,
        updatedAt: Timestamp.now()
      })
      
      toast.success('Entrega atualizada com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar entrega:', error)
      toast.error('Erro ao atualizar entrega')
      throw error
    }
  }

  // Excluir entrega
  const excluirEntrega = async (entregaId: string) => {
    try {
      await deleteDoc(doc(db, 'entregas', entregaId))
      toast.success('Entrega excluída com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir entrega:', error)
      toast.error('Erro ao excluir entrega')
      throw error
    }
  }

  // Estatísticas das entregas
  const estatisticas = {
    total: entregas.length,
    pendentes: entregas.filter(e => e.status === 'pendente').length,
    em_preparacao: entregas.filter(e => e.status === 'em_preparacao').length,
    saiu_entrega: entregas.filter(e => e.status === 'saiu_entrega').length,
    entregues: entregas.filter(e => e.status === 'entregue').length,
    cancelados: entregas.filter(e => e.status === 'cancelado').length,
    valorTotal: entregas.reduce((total, entrega) => total + entrega.valor, 0),
    valorEntregues: entregas
      .filter(e => e.status === 'entregue')
      .reduce((total, entrega) => total + entrega.valor, 0)
  }

  return {
    entregas,
    loading,
    error,
    estatisticas,
    buscarEntregasPorStatus,
    buscarEntregasPorMotoboy,
    criarEntrega,
    criarEntregasDemo,
    atualizarStatusEntrega,
    atribuirMotoboy,
    atualizarCoordenadas,
    atualizarEntrega,
    excluirEntrega
  }
} 