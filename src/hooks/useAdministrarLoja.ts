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

// Tipos para os dados da administração da loja
export interface HorarioFuncionamento {
  abertura: string
  fechamento: string
}

export interface DiaFuncionamento {
  dia: string
  horarios: HorarioFuncionamento[]
  fechado: boolean
}

export interface ConfiguracaoLoja {
  id: string
  nomeLoja: string
  descricaoLoja?: string
  linkPersonalizado: string
  logoUrl: string
  bannerUrl: string
  aceitarDelivery: boolean
  aceitarRetirada: boolean
  aceitarBalcao: boolean
  fusoHorario: string
  horariosFuncionamento: DiaFuncionamento[]
  // Configurações de pagamento
  aceitarDinheiro?: boolean
  aceitarPix?: boolean
  aceitarCredito?: boolean
  aceitarDebito?: boolean
  bandeirasMastercard?: { credito: boolean; debito: boolean }
  bandeirasVisa?: { credito: boolean; debito: boolean }
  bandeirasAmericanExpress?: { credito: boolean; debito: boolean }
  bandeirasElo?: { credito: boolean; debito: boolean }
  bandeirasHipercard?: { credito: boolean; debito: boolean }
  bandeirasPersonalizadas?: Array<{ id: number; nome: string; credito: boolean; debito: boolean }>
  // Configurações de impressão
  mostrarCnpjLoja?: boolean
  mostrarCategoriaProdutos?: boolean
  mostrarDescricaoProdutos?: boolean
  tipoExibicaoPizza?: string
  quantidadeAdicionais?: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

export function useAdministrarLoja() {
  const { user } = useAuth()
  const [configuracao, setConfiguracao] = useState<ConfiguracaoLoja | null>(null)
  const [loading, setLoading] = useState(true)

  // Configuração padrão dos horários
  const horariosPadrao: DiaFuncionamento[] = [
    { dia: 'Segunda-feira', horarios: [{ abertura: '18:00', fechamento: '19:30' }], fechado: false },
    { dia: 'Terça-feira', horarios: [{ abertura: '18:00', fechamento: '19:30' }], fechado: false },
    { dia: 'Quarta-feira', horarios: [{ abertura: '18:00', fechamento: '19:30' }], fechado: false },
    { dia: 'Quinta-feira', horarios: [{ abertura: '18:00', fechamento: '19:30' }], fechado: false },
    { dia: 'Sexta-feira', horarios: [{ abertura: '18:00', fechamento: '19:30' }], fechado: false },
    { dia: 'Sábado', horarios: [{ abertura: '18:00', fechamento: '19:30' }], fechado: false },
    { dia: 'Domingo', horarios: [{ abertura: '18:00', fechamento: '19:30' }], fechado: false }
  ]

  // Carregar dados do Firebase quando o usuário estiver logado
  useEffect(() => {
    if (user) {
      loadConfiguracao()
    } else {
      setConfiguracao(null)
      setLoading(false)
    }
  }, [user])

  // Função para carregar configuração da loja
  const loadConfiguracao = async () => {
    if (!user) return

    try {
      setLoading(true)
      const docRef = doc(db, 'storeConfigurations', user.id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        const configuracaoData: ConfiguracaoLoja = {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as ConfiguracaoLoja
        
        setConfiguracao(configuracaoData)
      } else {
        // Criar configuração padrão se não existir
        await createConfiguracaoPadrao()
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error)
      toast.error('Erro ao carregar configurações da loja')
    } finally {
      setLoading(false)
    }
  }

  // Função para criar configuração padrão
  const createConfiguracaoPadrao = async () => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      const configuracaoPadrao: Omit<ConfiguracaoLoja, 'id' | 'createdAt' | 'updatedAt'> = {
        nomeLoja: '',
        linkPersonalizado: '',
        logoUrl: '/product-placeholder.jpg',
        bannerUrl: '/product-placeholder.jpg',
        aceitarDelivery: true,
        aceitarRetirada: false,
        aceitarBalcao: false,
        fusoHorario: 'America/Sao_Paulo',
        horariosFuncionamento: horariosPadrao,
        // Configurações padrão de impressão
        mostrarCnpjLoja: true,
        mostrarCategoriaProdutos: true,
        mostrarDescricaoProdutos: true,
        tipoExibicaoPizza: 'nome-completo',
        quantidadeAdicionais: 'agrupar-manter',
        userId: user.id
      }

      const newConfiguracao = {
        ...configuracaoPadrao,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }

      const docRef = doc(db, 'storeConfigurations', user.id)
      await setDoc(docRef, newConfiguracao)
      
      const createdConfiguracao: ConfiguracaoLoja = {
        id: user.id,
        ...configuracaoPadrao,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      setConfiguracao(createdConfiguracao)
      toast.success('Configuração da loja criada com sucesso!')
      return createdConfiguracao
    } catch (error) {
      console.error('Erro ao criar configuração padrão:', error)
      toast.error('Erro ao criar configuração da loja')
      throw error
    }
  }

  // Função para atualizar configuração
  const updateConfiguracao = async (dadosAtualizacao: Partial<Omit<ConfiguracaoLoja, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => {
    if (!user || !configuracao) throw new Error('Usuário não autenticado ou configuração não carregada')

    try {
      const updateData = {
        ...dadosAtualizacao,
        updatedAt: Timestamp.now(),
      }

      const docRef = doc(db, 'storeConfigurations', user.id)
      await updateDoc(docRef, updateData)

      setConfiguracao(prev => prev ? {
        ...prev,
        ...dadosAtualizacao,
        updatedAt: new Date()
      } : null)

      toast.success('Configuração atualizada com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error)
      toast.error('Erro ao atualizar configuração')
      throw error
    }
  }

  // Função para converter arquivo para base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Criar canvas para otimizar a imagem antes de converter para base64
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Manter proporção original da imagem
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        
        // Desenhar imagem no canvas com alta qualidade
        ctx?.drawImage(img, 0, 0)
        
        // Converter para base64 com qualidade máxima
        const base64 = canvas.toDataURL('image/jpeg', 1.0)
        resolve(base64)
      }
      
      img.onerror = error => reject(error)
      img.src = URL.createObjectURL(file)
    })
  }

  // Função para fazer upload de imagem (salvar como base64 no Firestore)
  const uploadImage = async (file: File, tipo: 'logo' | 'banner'): Promise<string> => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      // Converter arquivo para base64
      const base64String = await fileToBase64(file)
      
      // Retornar o base64 diretamente (será salvo no Firestore)
      return base64String
    } catch (error) {
      console.error('Erro ao processar imagem:', error)
      throw new Error('Erro ao processar imagem')
    }
  }

  // Função para deletar imagem (não precisa fazer nada para base64)
  const deleteImage = async (imageUrl: string) => {
    // Para base64, não precisamos deletar nada do Storage
    // A imagem antiga será sobrescrita no Firestore
    return Promise.resolve()
  }

  // Função para salvar dados da loja
  const salvarDadosLoja = async (dados: {
    nomeLoja: string
    descricaoLoja?: string
    linkPersonalizado: string
    logoUrl?: string
    bannerUrl?: string
    aceitarDelivery: boolean
    aceitarRetirada: boolean
    aceitarBalcao: boolean
  }) => {
    try {
      await updateConfiguracao(dados)
    } catch (error) {
      console.error('Erro ao salvar dados da loja:', error)
      throw error
    }
  }

  // Função para salvar configurações de pagamento
  const salvarConfiguracaoPagamento = async (configuracoes: {
    aceitarDinheiro: boolean
    aceitarPix: boolean
    aceitarCredito: boolean
    aceitarDebito: boolean
    bandeirasMastercard: { credito: boolean; debito: boolean }
    bandeirasVisa: { credito: boolean; debito: boolean }
    bandeirasAmericanExpress: { credito: boolean; debito: boolean }
    bandeirasElo: { credito: boolean; debito: boolean }
    bandeirasHipercard: { credito: boolean; debito: boolean }
    bandeirasPersonalizadas: Array<{ id: number; nome: string; credito: boolean; debito: boolean }>
  }) => {
    try {
      await updateConfiguracao(configuracoes)
    } catch (error) {
      console.error('Erro ao salvar configurações de pagamento:', error)
      throw error
    }
  }

  // Função para salvar horários
  const salvarHorarios = async (horarios: DiaFuncionamento[], fusoHorario: string) => {
    try {
      await updateConfiguracao({
        horariosFuncionamento: horarios,
        fusoHorario: fusoHorario
      })
    } catch (error) {
      console.error('Erro ao salvar horários:', error)
      throw error
    }
  }

  // Função para salvar configurações de impressão
  const salvarConfiguracaoImpressao = async (configuracoes: {
    mostrarCnpjLoja: boolean
    mostrarCategoriaProdutos: boolean
    mostrarDescricaoProdutos: boolean
    tipoExibicaoPizza: string
    quantidadeAdicionais: string
  }) => {
    try {
      await updateConfiguracao(configuracoes)
    } catch (error) {
      console.error('Erro ao salvar configurações de impressão:', error)
      throw error
    }
  }

  // Função para verificar se a loja está aberta
  const verificarSeLojaAberta = (): boolean => {
    if (!configuracao?.horariosFuncionamento) return false

    const agora = new Date()
    const diaSemana = agora.getDay() // 0 = Domingo, 1 = Segunda, etc.
    
    // Mapear dia da semana para o nome do dia
    const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
    const diaAtual = diasSemana[diaSemana]
    
    // Encontrar o horário do dia atual
    const horarioDia = configuracao.horariosFuncionamento.find(h => h.dia === diaAtual)
    
    if (!horarioDia || horarioDia.fechado) return false
    
    // Verificar se está dentro de algum horário de funcionamento
    const horaAtual = agora.getHours()
    const minutoAtual = agora.getMinutes()
    const tempoAtual = horaAtual * 60 + minutoAtual // Converter para minutos
    
    return horarioDia.horarios.some(horario => {
      const [horaAbertura, minutoAbertura] = horario.abertura.split(':').map(Number)
      const [horaFechamento, minutoFechamento] = horario.fechamento.split(':').map(Number)
      
      const tempoAbertura = horaAbertura * 60 + minutoAbertura
      const tempoFechamento = horaFechamento * 60 + minutoFechamento
      
      // Se o fechamento é no dia seguinte (ex: 23:00 - 02:00)
      if (tempoFechamento < tempoAbertura) {
        return tempoAtual >= tempoAbertura || tempoAtual <= tempoFechamento
      }
      
      return tempoAtual >= tempoAbertura && tempoAtual <= tempoFechamento
    })
  }

  return {
    // Estados
    configuracao,
    loading,

    // Funções de carregamento
    loadConfiguracao,

    // Funções de atualização
    updateConfiguracao,
    salvarDadosLoja,
    salvarConfiguracaoPagamento,
    salvarHorarios,
    salvarConfiguracaoImpressao,

    // Funções de upload
    uploadImage,
    deleteImage,

    // Funções de verificação
    verificarSeLojaAberta,
  }
} 