'use client'

import { useState, useEffect } from 'react'
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  Timestamp 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

// Tipos para as configurações de entrega
export interface RaioEntrega {
  id: number
  distancia: number
  tempoMaximo: number
  preco: string
  createdAt: Date
}

export interface EnderecoLoja {
  rua: string
  numero: string
  complemento: string
  pontoReferencia: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  pais: string
}

export interface ConfiguracaoEntrega {
  id: string
  enderecoLoja: EnderecoLoja
  coordenadas: [number, number] // [longitude, latitude]
  raiosEntrega: RaioEntrega[]
  // Configurações do Google Maps
  zoomPadrao: number
  tipoMapa: string
  // Configurações de entrega
  tempoPreparacaoPadrao: number // minutos
  taxaEntregaPadrao: number // valor base da entrega
  entregaGratis: boolean
  valorMinimoEntregaGratis: number
  // Tipo de cálculo de entrega
  tipoCalculoEntrega: 'distancia_linha' | 'distancia_rota' | 'bairro'
  userId: string
  createdAt: Date
  updatedAt: Date
}



export function useConfiguracaoEntrega() {
  const { user } = useAuth()
  const [configuracao, setConfiguracao] = useState<ConfiguracaoEntrega | null>(null)
  const [loading, setLoading] = useState(true)

  // Configuração padrão do endereço
  const enderecoPadrao: EnderecoLoja = {
    rua: '',
    numero: '',
    complemento: '',
    pontoReferencia: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    pais: 'Brasil'
  }

  // Raios de entrega padrão (vazio - usuário adiciona conforme necessário)
  const raiosPadrao: RaioEntrega[] = []

  // Carregar dados do Firebase quando o usuário estiver logado
  useEffect(() => {
    if (user) {
      loadConfiguracao()
    } else {
      setConfiguracao(null)
      setLoading(false)
    }
  }, [user])

  // Função para carregar configuração de entrega
  const loadConfiguracao = async () => {
    if (!user) return

    try {
      setLoading(true)
      const docRef = doc(db, 'deliveryConfigurations', user.id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        const configuracaoData: ConfiguracaoEntrega = {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          // Converter timestamps dos raios
          raiosEntrega: data.raiosEntrega?.map((raio: any) => ({
            ...raio,
            createdAt: raio.createdAt?.toDate() || new Date()
          })) || raiosPadrao,
          // Definir tipo de cálculo padrão se não existir
          tipoCalculoEntrega: data.tipoCalculoEntrega || 'distancia_linha'
        } as ConfiguracaoEntrega
        
        setConfiguracao(configuracaoData)
      } else {
        // Criar configuração padrão se não existir
        await createConfiguracaoPadrao()
      }
    } catch (error) {
      console.error('Erro ao carregar configuração de entrega:', error)
      toast.error('Erro ao carregar configurações de entrega')
    } finally {
      setLoading(false)
    }
  }

  // Função para criar configuração padrão
  const createConfiguracaoPadrao = async () => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      const configuracaoPadrao: Omit<ConfiguracaoEntrega, 'id' | 'createdAt' | 'updatedAt'> = {
        enderecoLoja: enderecoPadrao,
        coordenadas: [-46.6333, -23.5505], // São Paulo - coordenadas padrão
        raiosEntrega: raiosPadrao,
        // Configurações do Google Maps
        zoomPadrao: 12,
        tipoMapa: 'roadmap',
        // Configurações de entrega
        tempoPreparacaoPadrao: 30,
        taxaEntregaPadrao: 8.00,
        entregaGratis: false,
        valorMinimoEntregaGratis: 50.00,
        // Tipo de cálculo padrão
        tipoCalculoEntrega: 'distancia_linha',
        userId: user.id
      }

      const newConfiguracao = {
        ...configuracaoPadrao,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }

      const docRef = doc(db, 'deliveryConfigurations', user.id)
      await setDoc(docRef, newConfiguracao)
      
      const createdConfiguracao: ConfiguracaoEntrega = {
        id: user.id,
        ...configuracaoPadrao,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      setConfiguracao(createdConfiguracao)
      toast.success('Configuração de entrega criada com sucesso!')
      return createdConfiguracao
    } catch (error) {
      console.error('Erro ao criar configuração padrão de entrega:', error)
      toast.error('Erro ao criar configuração de entrega')
      throw error
    }
  }

  // Função para atualizar configuração
  const updateConfiguracao = async (dadosAtualizacao: Partial<Omit<ConfiguracaoEntrega, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => {
    if (!user || !configuracao) throw new Error('Usuário não autenticado ou configuração não carregada')

    try {
      const updateData = {
        ...dadosAtualizacao,
        updatedAt: Timestamp.now(),
      }

      const docRef = doc(db, 'deliveryConfigurations', user.id)
      await updateDoc(docRef, updateData)

      setConfiguracao(prev => prev ? {
        ...prev,
        ...dadosAtualizacao,
        updatedAt: new Date()
      } : null)

      toast.success('Configuração de entrega atualizada com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar configuração de entrega:', error)
      toast.error('Erro ao atualizar configuração de entrega')
      throw error
    }
  }

  // Função para salvar endereço da loja
  const salvarEnderecoLoja = async (endereco: EnderecoLoja, coordenadas?: [number, number]) => {
    try {
      const dadosAtualizacao: any = { enderecoLoja: endereco }
      if (coordenadas) {
        dadosAtualizacao.coordenadas = coordenadas
      }
      await updateConfiguracao(dadosAtualizacao)
    } catch (error) {
      console.error('Erro ao salvar endereço da loja:', error)
      throw error
    }
  }

  // Função para adicionar raio de entrega
  const adicionarRaioEntrega = async (raio: Omit<RaioEntrega, 'id' | 'createdAt'>) => {
    if (!configuracao) throw new Error('Configuração não carregada')

    try {
      const novoRaio: RaioEntrega = {
        ...raio,
        id: Date.now(), // ID único baseado em timestamp
        createdAt: new Date()
      }

      const novosRaios = [...configuracao.raiosEntrega, novoRaio]
      await updateConfiguracao({ raiosEntrega: novosRaios })
      
      toast.success('Raio de entrega adicionado com sucesso!')
      return novoRaio
    } catch (error) {
      console.error('Erro ao adicionar raio de entrega:', error)
      toast.error('Erro ao adicionar raio de entrega')
      throw error
    }
  }

  // Função para atualizar raio de entrega
  const atualizarRaioEntrega = async (raioId: number, dadosRaio: Partial<Omit<RaioEntrega, 'id' | 'createdAt'>>) => {
    if (!configuracao) throw new Error('Configuração não carregada')

    try {
      const novosRaios = configuracao.raiosEntrega.map(raio => 
        raio.id === raioId ? { ...raio, ...dadosRaio } : raio
      )
      
      await updateConfiguracao({ raiosEntrega: novosRaios })
      toast.success('Raio de entrega atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar raio de entrega:', error)
      toast.error('Erro ao atualizar raio de entrega')
      throw error
    }
  }

  // Função para excluir raio de entrega
  const excluirRaioEntrega = async (raioId: number) => {
    if (!configuracao) throw new Error('Configuração não carregada')

    try {
      const novosRaios = configuracao.raiosEntrega.filter(raio => raio.id !== raioId)
      await updateConfiguracao({ raiosEntrega: novosRaios })
      toast.success('Raio de entrega excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir raio de entrega:', error)
      toast.error('Erro ao excluir raio de entrega')
      throw error
    }
  }

  // Função para salvar configurações do mapa
  const salvarConfiguracoesMapa = async (configuracoes: {
    zoomPadrao: number
    tipoMapa: string
  }) => {
    try {
      await updateConfiguracao(configuracoes)
    } catch (error) {
      console.error('Erro ao salvar configurações do mapa:', error)
      throw error
    }
  }

  // Função para salvar configurações gerais de entrega
  const salvarConfiguracoesEntrega = async (configuracoes: {
    tempoPreparacaoPadrao: number
    taxaEntregaPadrao: number
    entregaGratis: boolean
    valorMinimoEntregaGratis: number
  }) => {
    try {
      await updateConfiguracao(configuracoes)
    } catch (error) {
      console.error('Erro ao salvar configurações de entrega:', error)
      throw error
    }
  }

  // Função para salvar tipo de cálculo de entrega
  const salvarTipoCalculoEntrega = async (tipoCalculo: 'distancia_linha' | 'distancia_rota' | 'bairro') => {
    try {
      await updateConfiguracao({ tipoCalculoEntrega: tipoCalculo })
    } catch (error) {
      console.error('Erro ao salvar tipo de cálculo de entrega:', error)
      throw error
    }
  }

  // Função para calcular distância em linha reta (fórmula de Haversine)
  const calcularDistanciaLinhaReta = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371 // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Função para calcular distância real usando Google Maps Directions API
  const calcularDistanciaRotaReal = async (
    origem: [number, number], // [lng, lat]
    destino: [number, number] // [lng, lat]
  ): Promise<{ distancia: number; tempo: number } | null> => {
    try {
      const url = `/api/directions?origin=${origem[1]},${origem[0]}&destination=${destino[1]},${destino[0]}&mode=driving&units=metric&region=br`
      
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        return {
          distancia: data.distancia,
          tempo: data.tempo
        }
      } else {
        console.error('Erro na API do Google Maps:', data.error)
        return null
      }
    } catch (error) {
      console.error('Erro ao calcular rota real:', error)
      return null
    }
  }

  // Função para buscar raio por coordenadas (calcular distância)
  const buscarRaioPorDistancia = (distanciaKm: number): RaioEntrega | null => {
    if (!configuracao) return null

    // Ordenar raios por distância e encontrar o adequado
    const raiosOrdenados = configuracao.raiosEntrega
      .sort((a, b) => a.distancia - b.distancia)
    
    return raiosOrdenados.find(raio => distanciaKm <= raio.distancia) || null
  }

  // Função para calcular preço de entrega por distância
  const calcularPrecoEntrega = async (
    coordenadasDestino: [number, number], // [lng, lat]
    tipoCalculo?: 'distancia_linha' | 'distancia_rota' | 'bairro'
  ): Promise<{ preco: string; tempo: number; distancia: number } | null> => {
    if (!configuracao || !configuracao.coordenadas) {
      return null
    }

    const tipoCalculoUsado = tipoCalculo || configuracao.tipoCalculoEntrega
    let distanciaKm: number
    let tempoEstimado: number

    try {
      if (tipoCalculoUsado === 'distancia_rota') {
        // Calcular distância real usando Google Maps Directions API
        const resultadoRota = await calcularDistanciaRotaReal(
          configuracao.coordenadas,
          coordenadasDestino
        )
        
        if (!resultadoRota) {
          // Fallback para linha reta se a API falhar
          distanciaKm = calcularDistanciaLinhaReta(
            configuracao.coordenadas[1],
            configuracao.coordenadas[0],
            coordenadasDestino[1],
            coordenadasDestino[0]
          )
          tempoEstimado = Math.ceil(distanciaKm * 2) // Estimativa básica: 2 min/km
        } else {
          distanciaKm = resultadoRota.distancia
          tempoEstimado = resultadoRota.tempo
        }
      } else {
        // Calcular distância em linha reta
        distanciaKm = calcularDistanciaLinhaReta(
          configuracao.coordenadas[1],
          configuracao.coordenadas[0],
          coordenadasDestino[1],
          coordenadasDestino[0]
        )
        tempoEstimado = Math.ceil(distanciaKm * 2) // Estimativa básica: 2 min/km
      }

      const raio = buscarRaioPorDistancia(distanciaKm)
      
      if (!raio) {
        return null // Fora da área de entrega
      }

      return {
        preco: raio.preco,
        tempo: raio.tempoMaximo,
        distancia: distanciaKm
      }
    } catch (error) {
      console.error('Erro ao calcular preço de entrega:', error)
      return null
    }
  }

  // Função para calcular preço de entrega por endereço (geocodificação + cálculo)
  const calcularPrecoEntregaPorEndereco = async (
    enderecoDestino: string,
    tipoCalculo?: 'distancia_linha' | 'distancia_rota' | 'bairro'
  ): Promise<{ preco: string; tempo: number; distancia: number; coordenadas: [number, number] } | null> => {
    try {
      // Geocodificar endereço de destino
      const url = `/api/geocode?address=${encodeURIComponent(enderecoDestino)}&region=br`
      
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        const coordenadasDestino: [number, number] = [data.lng, data.lat]
        
        // Calcular preço usando coordenadas
        const resultado = await calcularPrecoEntrega(coordenadasDestino, tipoCalculo)
        
        if (resultado) {
          return {
            ...resultado,
            coordenadas: coordenadasDestino
          }
        }
      }
      
      return null
    } catch (error) {
      console.error('Erro ao calcular preço de entrega por endereço:', error)
      return null
    }
  }

  return {
    // Estados
    configuracao,
    loading,

    // Funções de carregamento
    loadConfiguracao,

    // Funções de atualização
    updateConfiguracao,
    salvarEnderecoLoja,
    salvarConfiguracoesMapa,
    salvarConfiguracoesEntrega,
    salvarTipoCalculoEntrega,

    // Funções de raios de entrega
    adicionarRaioEntrega,
    atualizarRaioEntrega,
    excluirRaioEntrega,

    // Funções utilitárias
    buscarRaioPorDistancia,
    calcularPrecoEntrega,
    calcularPrecoEntregaPorEndereco,
    calcularDistanciaLinhaReta,
    calcularDistanciaRotaReal,
  }
} 