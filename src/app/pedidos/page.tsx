'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { useCardapio } from '@/hooks/useCardapioFirebase'
import { usePedidoSequencia } from '@/hooks/usePedidoSequencia'
import { addDoc, collection, Timestamp, query, where, orderBy, limit, getDocs, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function PedidosPage() {
  const pathname = usePathname()
  const isPedidosActive = pathname === '/pedidos'
  const isCardapioActive = pathname === '/cardapio'
  const isAdministrarLojaActive = pathname === '/administrar'
  const { signOut, user } = useAuth()
  const { categories: firebaseCategories, products: firebaseProducts, additionals: savedAdditionals, loading: cardapioLoading } = useCardapio()
  const { gerarProximoNumero, formatarNumeroPedido } = usePedidoSequencia()
  
  // Carregar pedidos em produção do Firebase quando a página carregar
  useEffect(() => {
    if (user) {
      carregarPedidosProducao()
    }
  }, [user])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isModalAnimating, setIsModalAnimating] = useState(false)
  const [selectedButton, setSelectedButton] = useState('delivery')
  const [phoneValue, setPhoneValue] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isProductModalVisible, setIsProductModalVisible] = useState(false)
  const [isProductModalAnimating, setIsProductModalAnimating] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [selectedAdditionals, setSelectedAdditionals] = useState<string[]>([])
  const [quantity, setQuantity] = useState(1)
  const [selectedItems, setSelectedItems] = useState<Array<{
    id: string;
    name: string;
    price: string;
    quantity: number;
    additionals?: Array<{
      id: string;
      name: string;
      price: string;
      category: string;
    }>;
  }>>([])
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)
  const [isDeleteModalAnimating, setIsDeleteModalAnimating] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{index: number, name: string} | null>(null)
  const [isEntregaModalVisible, setIsEntregaModalVisible] = useState(false)
  const [isEntregaModalAnimating, setIsEntregaModalAnimating] = useState(false)
  const [selectedEntregaType, setSelectedEntregaType] = useState<'delivery' | 'retirada' | 'local'>('delivery')
  
  // Estados do modal de forma de entrega
  const [isFormaEntregaModalVisible, setIsFormaEntregaModalVisible] = useState(false)
  const [isFormaEntregaModalAnimating, setIsFormaEntregaModalAnimating] = useState(false)
  const [selectedFormaEntrega, setSelectedFormaEntrega] = useState<'E' | 'R' | 'C'>('E')
  const [showEnderecoForm, setShowEnderecoForm] = useState(false)
  

  const [enderecoData, setEnderecoData] = useState({
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: ''
  })
  const [taxaEntrega, setTaxaEntrega] = useState('R$ 0,00')
  const [cepValido, setCepValido] = useState(false)
  
  // Estado para armazenar os endereços salvos
  const [enderecosSalvos, setEnderecosSalvos] = useState<Array<{
    id: string;
    cep: string;
    rua: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    taxaEntrega: string;
  }>>([])
  
  // Estado para o endereço selecionado
  const [enderecoSelecionado, setEnderecoSelecionado] = useState<string | null>(null)
  
  // Estado para o endereço confirmado (que aparece no botão)
  const [enderecoConfirmado, setEnderecoConfirmado] = useState<{
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
  } | null>(null)

  // Estado para controlar item sendo editado
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null)

  // Função para aplicar máscara de CEP
  const aplicarMascaraCep = (valor: string) => {
    // Remove tudo que não for número
    const apenasNumeros = valor.replace(/\D/g, '')
    
    // Aplica a máscara 00000-000
    if (apenasNumeros.length <= 5) {
      return apenasNumeros
    } else {
      return apenasNumeros.slice(0, 5) + '-' + apenasNumeros.slice(5, 8)
    }
  }

  // Função para formatar valor monetário
  const formatarValor = (valor: string) => {
    // Remove tudo que não for número
    const apenasNumeros = valor.replace(/\D/g, '')
    
    // Converte para centavos
    const centavos = parseInt(apenasNumeros) || 0
    
    // Formata como moeda brasileira
    const reais = (centavos / 100).toFixed(2).replace('.', ',')
    return `R$ ${reais}`
  }
  
  // Função para formatar endereço no formato "rua, numero, bairro e cidade"
  const formatarEndereco = (endereco: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
  }) => {
    return `${endereco.rua} ${endereco.numero}, ${endereco.bairro}, ${endereco.cidade}`
  }

  // Função para buscar dados de CEP via API ViaCEP
  const buscarCep = async (cep: string) => {
    try {
      // Remove caracteres não numéricos
      const cepLimpo = cep.replace(/\D/g, '')
      
      if (cepLimpo.length !== 8) {
        setCepValido(false)
        return
      }
      
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await response.json()
      
      if (data.erro) {
        showNotification('CEP INVÁLIDO')
        setCepValido(false)
        return
      }
      
      if (!data.erro) {
        setEnderecoData(prev => ({
          ...prev,
          cep: data.cep,
          rua: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade
        }))
        setCepValido(true)
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      showNotification('CEP INVÁLIDO')
      setCepValido(false)
    }
  }

  // Estados do modal de pagamento em dinheiro
  const [isDinheiroModalVisible, setIsDinheiroModalVisible] = useState(false)
  const [isDinheiroModalAnimating, setIsDinheiroModalAnimating] = useState(false)
  const [valorRecebido, setValorRecebido] = useState('R$ 0,00')
  const [valorRecebidoTemp, setValorRecebidoTemp] = useState('R$ 0,00')
  const [pagamentoDinheiro, setPagamentoDinheiro] = useState<'agora' | 'entrega'>('agora')
  const [pagamentoDinheiroTemp, setPagamentoDinheiroTemp] = useState<'agora' | 'entrega'>('agora')
  const [dropdownPagamentoDinheiroAberto, setDropdownPagamentoDinheiroAberto] = useState(false)

  // Estados do modal de acréscimo/desconto
  const [isAcrescimoDescontoModalVisible, setIsAcrescimoDescontoModalVisible] = useState(false)
  const [isAcrescimoDescontoModalAnimating, setIsAcrescimoDescontoModalAnimating] = useState(false)
  const [valorAcrescimo, setValorAcrescimo] = useState('R$ 0,00')
  const [valorDesconto, setValorDesconto] = useState('R$ 0,00')
  const [abaAtiva, setAbaAtiva] = useState<'acrescimo' | 'desconto'>('acrescimo')

  // Estados do modal de detalhes financeiros
  const [isDetalhesFinanceirosModalVisible, setIsDetalhesFinanceirosModalVisible] = useState(false)
  const [isDetalhesFinanceirosModalAnimating, setIsDetalhesFinanceirosModalAnimating] = useState(false)

  // Estados do modal de pagamento em débito
  const [isDebitoModalVisible, setIsDebitoModalVisible] = useState(false)
  const [isDebitoModalAnimating, setIsDebitoModalAnimating] = useState(false)
  const [valorDebito, setValorDebito] = useState('R$ 0,00')
  const [valorDebitoTemp, setValorDebitoTemp] = useState('R$ 0,00')
  const [pagamentoDebito, setPagamentoDebito] = useState<'agora' | 'entrega'>('agora')
  const [pagamentoDebitoTemp, setPagamentoDebitoTemp] = useState<'agora' | 'entrega'>('agora')
  const [dropdownPagamentoAberto, setDropdownPagamentoAberto] = useState(false)

  // Estados do modal de pagamento em crédito
  const [isCreditoModalVisible, setIsCreditoModalVisible] = useState(false)
  const [isCreditoModalAnimating, setIsCreditoModalAnimating] = useState(false)
  const [valorCredito, setValorCredito] = useState('R$ 0,00')
  const [valorCreditoTemp, setValorCreditoTemp] = useState('R$ 0,00')
  const [pagamentoCredito, setPagamentoCredito] = useState<'agora' | 'entrega'>('agora')
  const [pagamentoCreditoTemp, setPagamentoCreditoTemp] = useState<'agora' | 'entrega'>('agora')
  const [dropdownPagamentoCreditoAberto, setDropdownPagamentoCreditoAberto] = useState(false)

  // Estados do modal de pagamento em PIX
  const [isPixModalVisible, setIsPixModalVisible] = useState(false)
  const [isPixModalAnimating, setIsPixModalAnimating] = useState(false)
  const [valorPix, setValorPix] = useState('R$ 0,00')
  const [valorPixTemp, setValorPixTemp] = useState('R$ 0,00')
  const [pagamentoPix, setPagamentoPix] = useState<'agora' | 'entrega'>('agora')
  const [pagamentoPixTemp, setPagamentoPixTemp] = useState<'agora' | 'entrega'>('agora')
  const [dropdownPagamentoPixAberto, setDropdownPagamentoPixAberto] = useState(false)

  // Estados do modal de observação
  const [isObservacaoModalVisible, setIsObservacaoModalVisible] = useState(false)
  const [isObservacaoModalAnimating, setIsObservacaoModalAnimating] = useState(false)
  const [observacao, setObservacao] = useState('')
  const [observacaoTemp, setObservacaoTemp] = useState('')

  // Estados para gerenciar pedidos em produção
  const [pedidosEmProducao, setPedidosEmProducao] = useState<Array<{
    id: string;
    mesaNumero: number;
    tipo: 'Delivery' | 'Balcão' | 'Retirada';
    cliente: string;
    valor: string;
    tempo: string;
    status: string;
    formaPagamento: string;
    mostrarTroco: boolean;
    dataCriacao: Date;
  }>>([])

  // Estados para gerenciar pedidos em análise
  const [pedidosEmAnalise, setPedidosEmAnalise] = useState<Array<{
    id: string;
    mesaNumero: number;
    tipo: 'Delivery' | 'Balcão' | 'Retirada';
    cliente: string;
    valor: string;
    tempo: string;
    status: string;
    formaPagamento: string;
    mostrarTroco: boolean;
    dataCriacao: Date;
  }>>([])

  // Estados para gerenciar pedidos em entrega
  const [pedidosEmEntrega, setPedidosEmEntrega] = useState<Array<{
    id: string;
    mesaNumero: number;
    tipo: 'Delivery' | 'Balcão' | 'Retirada';
    cliente: string;
    valor: string;
    tempo: string;
    status: string;
    formaPagamento: string;
    mostrarTroco: boolean;
    dataCriacao: Date;
  }>>([])

  // Estados do modal de confirmação de cancelamento
  const [isCancelarModalVisible, setIsCancelarModalVisible] = useState(false)
  const [isCancelarModalAnimating, setIsCancelarModalAnimating] = useState(false)
  
  // Estados do modal de confirmação de limpeza
  const [isLimparModalVisible, setIsLimparModalVisible] = useState(false)
  const [isLimparModalAnimating, setIsLimparModalAnimating] = useState(false)

  // Estados da notificação
  const [notification, setNotification] = useState<{message: string, visible: boolean}>({
    message: '',
    visible: false
  })

  // Estado para controlar o timer da barra verde
  const [timerProgress, setTimerProgress] = useState(100)
  
  // Estados do modal de detalhes
  const [isDetalhesModalVisible, setIsDetalhesModalVisible] = useState(false)
  const [isDetalhesModalAnimating, setIsDetalhesModalAnimating] = useState(false)
  const [pedidoDetalhes, setPedidoDetalhes] = useState<any>(null)
  const [tempoDecorrido, setTempoDecorrido] = useState('00:00')
  const dataCriacaoRef = useRef<Date | null>(null)
  const pedidoIdRef = useRef<string | null>(null)
  
  // Estado para atualizar tempos em tempo real
  const [currentTime, setCurrentTime] = useState(new Date())
  const [nomeCliente, setNomeCliente] = useState('')
  const [telefoneCliente, setTelefoneCliente] = useState('')
  const [semCliente, setSemCliente] = useState(false)
  const [mostrarErroNome, setMostrarErroNome] = useState(false)
  const [mostrarErroTelefone, setMostrarErroTelefone] = useState(false)

  // Função para limpar todos os campos do pedido
  const limparCamposPedido = () => {
    setSelectedItems([])
    setValorRecebido('R$ 0,00')
    setPagamentoDinheiro('agora')
    setValorDebito('R$ 0,00')
    setValorCredito('R$ 0,00')
    setValorPix('R$ 0,00')
    setValorAcrescimo('R$ 0,00')
    setValorDesconto('R$ 0,00')
    setObservacao('')
    setSelectedFormaEntrega('E')
    setEnderecoConfirmado(null)
    setPhoneValue('')
    setNomeCliente('')
    setTelefoneCliente('')
    setSemCliente(false)
    setMostrarErroNome(false)
    setMostrarErroTelefone(false)
  }

  // Função para aplicar máscara de telefone (XX) X XXXX-XXXX
  const aplicarMascaraTelefone = (valor: string) => {
    // Remove tudo que não é dígito
    const numeros = valor.replace(/\D/g, '')
    
    // Aplica a máscara
    if (numeros.length <= 2) {
      return `(${numeros}`
    } else if (numeros.length <= 6) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`
    } else if (numeros.length <= 10) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 3)} ${numeros.slice(3)}`
    } else {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 3)} ${numeros.slice(3, 7)}-${numeros.slice(7, 11)}`
    }
  }
  
  // Função para calcular tempo decorrido
  const calcularTempoDecorrido = (dataCriacao: Date | any) => {
    if (!dataCriacao) return 'Agora'
    
    const dataPedido = dataCriacao instanceof Date ? dataCriacao : dataCriacao.toDate()
    const diferenca = currentTime.getTime() - dataPedido.getTime()
    const minutos = Math.floor(diferenca / (1000 * 60))
    
    if (minutos < 1) return 'Agora'
    if (minutos === 1) return 'Há 1 minuto'
    if (minutos < 60) return `Há ${minutos} minutos`
    
    const horas = Math.floor(minutos / 60)
    if (horas === 1) return 'Há 1 hora'
    return `Há ${horas} horas`
  }
  
  // Atualizar tempo a cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Atualizar a cada minuto
    
    return () => clearInterval(interval)
  }, [])
  
  // Atualizar tempos dos pedidos quando currentTime mudar
  useEffect(() => {
    if (pedidosEmProducao.length > 0) {
      setPedidosEmProducao(prev => prev.map(pedido => ({
        ...pedido,
        tempo: calcularTempoDecorrido(pedido.dataCriacao)
      })))
    }
    if (pedidosEmAnalise.length > 0) {
      setPedidosEmAnalise(prev => prev.map(pedido => ({
        ...pedido,
        tempo: calcularTempoDecorrido(pedido.dataCriacao)
      })))
    }
    if (pedidosEmEntrega.length > 0) {
      setPedidosEmEntrega(prev => prev.map(pedido => ({
        ...pedido,
        tempo: calcularTempoDecorrido(pedido.dataCriacao)
      })))
    }
  }, [currentTime])
  
  // Função para calcular o troco
  const calcularTroco = () => {
    try {
      const total = priceToNumber(calculateTotal())
      const recebido = priceToNumber(valorRecebido)
      const debito = priceToNumber(valorDebito)
      const credito = priceToNumber(valorCredito)
      const pix = priceToNumber(valorPix)
      const totalPago = recebido + debito + credito + pix
      const troco = totalPago - total
      return troco > 0 ? `R$ ${troco.toFixed(2).replace('.', ',')}` : 'R$ 0,00'
    } catch {
      return 'R$ 0,00'
    }
  }

  // Função para calcular o valor pago
  const calcularValorPago = () => {
    try {
      const recebido = priceToNumber(valorRecebido)
      const debito = priceToNumber(valorDebito)
      const credito = priceToNumber(valorCredito)
      const pix = priceToNumber(valorPix)
      const totalPago = recebido + debito + credito + pix
      return totalPago > 0 ? `R$ ${totalPago.toFixed(2).replace('.', ',')}` : 'R$ 0,00'
    } catch {
      return 'R$ 0,00'
    }
  }

  // Função para calcular o valor a pagar
  const calcularValorAPagar = () => {
    try {
      const total = priceToNumber(calculateTotal())
      const recebido = priceToNumber(valorRecebido)
      const debito = priceToNumber(valorDebito)
      const credito = priceToNumber(valorCredito)
      const pix = priceToNumber(valorPix)
      const totalPago = recebido + debito + credito + pix
      const aPagar = total - totalPago
      return aPagar > 0 ? `R$ ${aPagar.toFixed(2).replace('.', ',')}` : 'R$ 0,00'
    } catch {
      return calculateTotal()
    }
  }

  // Função para calcular valor a pagar considerando valores temporários dos modais
  const calcularValorAPagarComTemp = () => {
    try {
      const total = priceToNumber(calculateTotal())
      
      // Usar valores temporários se os modais estiverem abertos
      const recebido = isDinheiroModalVisible ? priceToNumber(valorRecebidoTemp) : priceToNumber(valorRecebido)
      const debito = isDebitoModalVisible ? priceToNumber(valorDebitoTemp) : priceToNumber(valorDebito)
      const credito = isCreditoModalVisible ? priceToNumber(valorCreditoTemp) : priceToNumber(valorCredito)
      const pix = isPixModalVisible ? priceToNumber(valorPixTemp) : priceToNumber(valorPix)
      
      const totalPago = recebido + debito + credito + pix
      const aPagar = total - totalPago
      return aPagar > 0 ? aPagar.toFixed(2).replace('.', ',') : '0,00'
    } catch {
      return calculateTotal()
    }
  }

  // Função para verificar se há troco
  const temTroco = () => {
    try {
      const total = priceToNumber(calculateTotal())
      const recebido = priceToNumber(valorRecebido)
      const debito = priceToNumber(valorDebito)
      const credito = priceToNumber(valorCredito)
      const pix = priceToNumber(valorPix)
      const totalPago = recebido + debito + credito + pix
      return totalPago > total
    } catch {
      return false
    }
  }

  // Função para validar se o endereço foi configurado antes do pagamento
  const validarEnderecoAntesPagamento = () => {
    // Validar campos obrigatórios apenas se não for "Sem cliente"
    if (!semCliente) {
      // Validar nome (mínimo 3 caracteres)
      if (nomeCliente.trim() === '') {
        setMostrarErroNome(true)
        showNotification('DIGITE O NOME DO CLIENTE')
        return false
      }
      
      if (nomeCliente.trim().length < 3) {
        setMostrarErroNome(true)
        showNotification('NOME DEVE TER PELO MENOS 3 CARACTERES')
        return false
      }
      
      // Validar telefone (exatamente 9 dígitos)
      if (telefoneCliente.trim() === '') {
        setMostrarErroTelefone(true)
        showNotification('DIGITE O TELEFONE DO CLIENTE')
        return false
      }
      
      const telefoneNumeros = telefoneCliente.replace(/\D/g, '')
      if (telefoneNumeros.length !== 11) {
        setMostrarErroTelefone(true)
        showNotification('TELEFONE DEVE TER 11 DÍGITOS')
        return false
      }
    }
    
    // Se nenhuma forma de entrega foi selecionada ainda
    if (!selectedFormaEntrega) {
      showNotification('SELECIONE A FORMA DE ENTREGA PRIMEIRO')
      // Abrir modal de forma de entrega após um pequeno delay
      setTimeout(() => {
        openFormaEntregaModal()
      }, 1000)
      return false
    }
    
    // Se a forma de entrega é delivery (E) e não há endereço configurado
    if (selectedFormaEntrega === 'E' && !enderecoConfirmado) {
      showNotification('CONFIGURE O ENDEREÇO PRIMEIRO')
      // Abrir modal de forma de entrega após um pequeno delay
      setTimeout(() => {
        openFormaEntregaModal()
      }, 1000)
      return false
    }
    
    // Para retirada (R) e balcão (C), não precisa de endereço
    return true
  }

  // Função para obter o texto do botão de entrega baseado na forma selecionada
  const getTextoBotaoEntrega = () => {
    if (selectedFormaEntrega === 'E') {
      // Delivery - mostra endereço se configurado, senão "Endereço"
      return enderecoConfirmado ? formatarEndereco(enderecoConfirmado) : 'Endereço'
    } else if (selectedFormaEntrega === 'R') {
      // Retirada
      return 'Retirada'
    } else if (selectedFormaEntrega === 'C') {
      // Balcão - mostra "Balcão" se configurado, senão "Balcão"
      return 'Balcão'
    } else {
      // Nenhuma forma selecionada
      return 'Endereço'
    }
  }

  // Função para obter o texto da segunda linha do botão de entrega
  const getTextoBotaoEntregaSegundaLinha = () => {
    if (selectedFormaEntrega === 'E') {
      return 'Delivery'
    } else if (selectedFormaEntrega === 'R') {
      return 'Retirada'
    } else if (selectedFormaEntrega === 'C') {
      return 'Balcão'
    } else {
      return 'Delivery'
    }
  }

  // Função para obter o texto do endereço no card cinza
  const getTextoEnderecoCard = () => {
    if (selectedFormaEntrega === 'E') {
      // Delivery - mostra endereço se configurado, senão "Adicionar endereço"
      const enderecoFormatado = enderecoConfirmado ? formatarEndereco(enderecoConfirmado) : 'Adicionar endereço'
      // Força quebra em 2 linhas se for longo (mais de 25 caracteres)
      if (enderecoFormatado.length > 25) {
        const primeiraLinha = enderecoFormatado.substring(0, 25)
        const segundaLinha = enderecoFormatado.substring(25, 50) + (enderecoFormatado.length > 50 ? '...' : '')
        return `${primeiraLinha}\n${segundaLinha}`
      }
      return enderecoFormatado
    } else if (selectedFormaEntrega === 'R') {
      // Retirada
      return 'Retirada'
    } else if (selectedFormaEntrega === 'C') {
      // Balcão
      return 'Balcão'
    } else {
      // Nenhuma forma selecionada
      return 'Adicionar endereço'
    }
  }

  // Função para calcular o troco para exibição
  const calcularTrocoExibicao = () => {
    try {
      const total = priceToNumber(calculateTotal())
      const recebido = priceToNumber(valorRecebido)
      const debito = priceToNumber(valorDebito)
      const credito = priceToNumber(valorCredito)
      const pix = priceToNumber(valorPix)
      const totalPago = recebido + debito + credito + pix
      const troco = totalPago - total
      return troco > 0 ? `R$ ${troco.toFixed(2).replace('.', ',')}` : 'R$ 0,00'
    } catch {
      return 'R$ 0,00'
    }
  }

  const calcularValorRestante = () => {
    const totalPedido = priceToNumber(calculateTotal())
    const totalRecebido = priceToNumber(valorRecebido) + priceToNumber(valorDebito) + priceToNumber(valorCredito) + priceToNumber(valorPix)
    return totalPedido - totalRecebido
  }

  const handleLogout = async () => {
    await signOut()
  }

  const openModal = () => {
    setIsModalVisible(true)
    setTimeout(() => setIsModalAnimating(true), 10)
  }

  const closeModal = () => {
    setIsModalAnimating(false)
    setTimeout(() => setIsModalVisible(false), 400)
  }

  const openProductModal = (product: any) => {
    setSelectedProduct(product)
    setIsProductModalVisible(true)
    setTimeout(() => {
      setIsProductModalAnimating(true)
    }, 10)
  }

  const closeProductModal = () => {
    setIsProductModalAnimating(false)
    setTimeout(() => {
      setIsProductModalVisible(false)
      setSelectedProduct(null)
      setQuantity(1)
      setSelectedAdditionals([])
      // Resetar o estado de edição quando cancelar
      setEditingItemIndex(null)
    }, 400)
  }

  // Função para formatar telefone
  const formatPhone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    
    // Aplica a máscara (XX) X XXXX-XXXX
    if (numbers.length <= 2) {
      return numbers
    } else if (numbers.length <= 3) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)} ${numbers.slice(3)}`
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)} ${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
    }
  }
  
  // Função para formatar valor monetário
  const formatMoney = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    
    if (numbers === '') return 'R$ 0,00'
    
    // Converte para centavos
    const cents = parseInt(numbers)
    const reais = (cents / 100).toFixed(2)
    
    // Formata com vírgula
    return `R$ ${reais.replace('.', ',')}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setPhoneValue(formatted)
  }

  // Função para obter produtos de uma categoria específica
  const getProductsByCategory = (categoryName: string) => {
    return firebaseProducts.filter(product => product.category === categoryName)
  }

  // Filtrar apenas categorias que têm produtos
  const categoriesWithProducts = firebaseCategories.filter(category => 
    getProductsByCategory(category.name).length > 0
  )

  // Definir primeira categoria como selecionada quando carregar as categorias
  useEffect(() => {
    if (categoriesWithProducts.length > 0 && selectedCategory === null) {
      setSelectedCategory(categoriesWithProducts[0].name)
    }
  }, [categoriesWithProducts, selectedCategory])

  // Effect para atualizar o cronômetro do modal de detalhes
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isDetalhesModalVisible && pedidoDetalhes?.dataCriacao) {
      // Capturar a data de criação uma vez e armazenar no ref para evitar re-renders
      if (!dataCriacaoRef.current || pedidoDetalhes.id !== pedidoIdRef.current) {
        dataCriacaoRef.current = pedidoDetalhes.dataCriacao instanceof Date 
          ? pedidoDetalhes.dataCriacao 
          : new Date(pedidoDetalhes.dataCriacao);
        pedidoIdRef.current = pedidoDetalhes.id;
      }
      
      // Executar imediatamente na primeira vez
      const atualizarTempo = () => {
        if (!dataCriacaoRef.current) return;
        
        const agora = new Date();
        const diferenca = agora.getTime() - dataCriacaoRef.current.getTime();
        
        // Calcular dias, horas, minutos e segundos
        const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);
        
        // Formatar o tempo baseado na duração
        let tempoFormatado = '';
        if (dias > 0) {
          tempoFormatado = `${dias}d ${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
        } else if (horas > 0) {
          tempoFormatado = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
        } else {
          tempoFormatado = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
        }
        
        setTempoDecorrido(tempoFormatado);
      };
      
      // Executar imediatamente
      atualizarTempo();
      
      // Configurar intervalo para atualizar a cada segundo
      interval = setInterval(atualizarTempo, 1000);
    } else {
      // Resetar o tempo quando modal fechar
      setTempoDecorrido('00:00');
      dataCriacaoRef.current = null;
      pedidoIdRef.current = null;
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isDetalhesModalVisible, pedidoDetalhes?.id]);

  // Removido controle de overflow para evitar movimento da página

  const handleAdditionalToggle = (additionalId: string) => {
    setSelectedAdditionals(prev => {
      if (prev.includes(additionalId)) {
        return prev.filter(id => id !== additionalId)
      } else {
        return [...prev, additionalId]
      }
    })
  }

  // Função para adicionar item
  const handleAddItem = () => {
    if (!selectedProduct) return;
    
    // Buscar informações dos adicionais selecionados
    const selectedAdditionalsInfo = selectedAdditionals.map(additionalId => {
      const additional = firebaseProducts.find(p => p.id === additionalId) || 
                        savedAdditionals?.find(a => a.id === additionalId);
      return additional ? {
        id: additional.id,
        name: additional.name,
        price: additional.price || '0,00',
        category: additional.category
      } : null;
    }).filter((item): item is {
      id: string;
      name: string;
      price: string;
      category: string;
    } => item !== null);

    const newItem = {
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price || '0,00',
      quantity: quantity,
      additionals: selectedAdditionalsInfo
    }

    if (editingItemIndex !== null) {
      // Se está editando, substituir o item existente
      setSelectedItems(prev => prev.map((item, index) => 
        index === editingItemIndex ? newItem : item
      ))
      setEditingItemIndex(null)
    } else {
      // Se está adicionando novo item
      setSelectedItems(prev => [...prev, newItem])
    }
    
    closeProductModal()
  }

  // Função para editar item
  const handleEditItem = (index: number) => {
    const item = selectedItems[index]
    if (!item) return

    // Encontrar o produto original
    const product = firebaseProducts.find(p => p.id === item.id)
    if (!product) return

    // Guardar o índice do item sendo editado
    setEditingItemIndex(index)
    
    // Setar o produto selecionado e abrir o modal
    openProductModal(product)
    
    // Setar a quantidade e adicionais
    setQuantity(item.quantity)
    setSelectedAdditionals(item.additionals?.map(a => a.id) || [])
  }

  // Função para abrir modal de exclusão
  const openDeleteModal = (index: number, name: string) => {
    setItemToDelete({ index, name })
    setIsDeleteModalVisible(true)
    setTimeout(() => {
      setIsDeleteModalAnimating(true)
    }, 10)
  }

  // Função para fechar modal de exclusão
  const closeDeleteModal = () => {
    setIsDeleteModalAnimating(false)
    setTimeout(() => {
      setIsDeleteModalVisible(false)
      setItemToDelete(null)
    }, 400)
  }

  // Função para confirmar exclusão
  const confirmDelete = () => {
    if (itemToDelete !== null) {
      setSelectedItems(prev => prev.filter((_, i) => i !== itemToDelete.index))
    }
    closeDeleteModal()
  }

  // Função para excluir item
  const handleDeleteItem = (index: number) => {
    const item = selectedItems[index]
    if (!item) return
    openDeleteModal(index, item.name)
  }

  // Função para converter string de preço em número
  const priceToNumber = (price: string) => {
    try {
      return parseFloat(price.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
    } catch {
      return 0;
    }
  };

  // Função para calcular o total de um item específico
  const calculateItemTotal = (item: typeof selectedItems[0]) => {
    try {
      const itemPrice = priceToNumber(item.price) * item.quantity;
      const additionalsTotal = item.additionals?.reduce((total, additional) => {
        return total + priceToNumber(additional.price);
      }, 0) || 0;
      
      return (itemPrice + additionalsTotal).toFixed(2).replace('.', ',');
    } catch {
      return '0,00';
    }
  };

  // Função para calcular o total
  const calculateTotal = () => {
    try {
      const subtotal = selectedItems.reduce((total, item) => {
        const itemPrice = priceToNumber(item.price) * item.quantity;
        const additionalsTotal = item.additionals?.reduce((addTotal, additional) => {
          return addTotal + priceToNumber(additional.price);
        }, 0) || 0;
        
        return total + itemPrice + additionalsTotal;
      }, 0);

      // Aplicar acréscimo e desconto
      const acrescimo = priceToNumber(valorAcrescimo)
      const desconto = priceToNumber(valorDesconto)
      const total = subtotal + acrescimo - desconto

      return total.toFixed(2).replace('.', ',');
    } catch {
      return '0,00';
    }
  };

  // Função para calcular apenas o subtotal (sem acréscimo/desconto)
  const calculateSubtotal = () => {
    try {
      const subtotal = selectedItems.reduce((total, item) => {
        const itemPrice = priceToNumber(item.price) * item.quantity;
        const additionalsTotal = item.additionals?.reduce((addTotal, additional) => {
          return addTotal + priceToNumber(additional.price);
        }, 0) || 0;
        
        return total + itemPrice + additionalsTotal;
      }, 0);

      return subtotal.toFixed(2).replace('.', ',');
    } catch {
      return '0,00';
    }
  };

  const openEntregaModal = () => {
    setIsEntregaModalVisible(true)
    setTimeout(() => setIsEntregaModalAnimating(true), 10)
  }

  const closeEntregaModal = () => {
    setIsEntregaModalAnimating(false)
    setTimeout(() => setIsEntregaModalVisible(false), 400)
  }

  // Funções do modal de forma de entrega
  const openFormaEntregaModal = () => {
    setIsFormaEntregaModalVisible(true)
    setShowEnderecoForm(false)
    setTaxaEntrega('R$ 0,00')
    setCepValido(false)
    setTimeout(() => setIsFormaEntregaModalAnimating(true), 10)
  }

  const closeFormaEntregaModal = () => {
    setIsFormaEntregaModalAnimating(false)
    setShowEnderecoForm(false)
    // Não limpar a taxa se há um endereço selecionado
    if (!enderecoSelecionado) {
      setTaxaEntrega('R$ 0,00')
    }
    setCepValido(false)
    setTimeout(() => setIsFormaEntregaModalVisible(false), 400)
  }

  const handleFormaEntregaSelect = (forma: 'E' | 'R' | 'C') => {
    setSelectedFormaEntrega(forma)
    closeFormaEntregaModal()
  }

  // Funções do modal de endereço
  const openEnderecoModal = () => {
    setShowEnderecoForm(true)
  }

  const closeEnderecoModal = () => {
    setShowEnderecoForm(false)
    // Limpar dados do formulário
    setEnderecoData({
      cep: '',
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: ''
    })
    setTaxaEntrega('R$ 0,00')
    setCepValido(false)
  }

  // Funções do modal de pagamento em dinheiro
  const openDinheiroModal = () => {
    setIsDinheiroModalVisible(true)
    // Preencher com o valor que ainda falta pagar
    const valorAPagar = calcularValorAPagar()
    setValorRecebidoTemp(valorAPagar)
    setPagamentoDinheiroTemp(pagamentoDinheiro)
    setTimeout(() => setIsDinheiroModalAnimating(true), 10)
  }

  const closeDinheiroModal = () => {
    setIsDinheiroModalAnimating(false)
    setValorRecebidoTemp('R$ 0,00')
    setPagamentoDinheiroTemp('agora')
    setDropdownPagamentoDinheiroAberto(false)
    setTimeout(() => setIsDinheiroModalVisible(false), 400)
  }

  // Funções do modal de acréscimo/desconto
  const openAcrescimoDescontoModal = () => {
    setIsAcrescimoDescontoModalVisible(true)
    setTimeout(() => setIsAcrescimoDescontoModalAnimating(true), 10)
  }

  const closeAcrescimoDescontoModal = () => {
    setIsAcrescimoDescontoModalAnimating(false)
    setTimeout(() => setIsAcrescimoDescontoModalVisible(false), 400)
  }

  const openDetalhesFinanceirosModal = () => {
    setIsDetalhesFinanceirosModalVisible(true)
    setTimeout(() => {
      setIsDetalhesFinanceirosModalAnimating(true)
    }, 10)
  }

  const closeDetalhesFinanceirosModal = () => {
    setIsDetalhesFinanceirosModalAnimating(false)
    setTimeout(() => {
      setIsDetalhesFinanceirosModalVisible(false)
    }, 400)
  }

  const openDebitoModal = () => {
    setIsDebitoModalVisible(true)
    // Preencher com o valor que ainda falta pagar
    const valorAPagar = calcularValorAPagar()
    setValorDebitoTemp(valorAPagar)
    setPagamentoDebitoTemp('agora')
    setTimeout(() => {
      setIsDebitoModalAnimating(true)
    }, 10)
  }

  const closeDebitoModal = () => {
    setIsDebitoModalAnimating(false)
    setDropdownPagamentoAberto(false)
    setTimeout(() => {
      setIsDebitoModalVisible(false)
    }, 400)
  }

  const openCreditoModal = () => {
    setIsCreditoModalVisible(true)
    // Preencher com o valor que ainda falta pagar
    const valorAPagar = calcularValorAPagar()
    setValorCreditoTemp(valorAPagar)
    setPagamentoCreditoTemp('agora')
    setTimeout(() => {
      setIsCreditoModalAnimating(true)
    }, 10)
  }

  const closeCreditoModal = () => {
    setIsCreditoModalAnimating(false)
    setDropdownPagamentoCreditoAberto(false)
    setTimeout(() => {
      setIsCreditoModalVisible(false)
    }, 400)
  }

  const openPixModal = () => {
    setIsPixModalVisible(true)
    // Preencher com o valor que ainda falta pagar
    const valorAPagar = calcularValorAPagar()
    setValorPixTemp(valorAPagar)
    setPagamentoPixTemp('agora')
    setTimeout(() => {
      setIsPixModalAnimating(true)
    }, 10)
  }

  const closePixModal = () => {
    setIsPixModalAnimating(false)
    setDropdownPagamentoPixAberto(false)
    setTimeout(() => {
      setIsPixModalVisible(false)
    }, 400)
  }

  // Funções do modal de observação
  const openObservacaoModal = () => {
    setIsObservacaoModalVisible(true)
    setObservacaoTemp(observacao)
    setTimeout(() => {
      setIsObservacaoModalAnimating(true)
    }, 10)
  }

  const closeObservacaoModal = () => {
    setIsObservacaoModalAnimating(false)
    setTimeout(() => {
      setIsObservacaoModalVisible(false)
    }, 400)
  }

  // Funções do modal de confirmação de cancelamento
  const openCancelarModal = () => {
    // Verificar se há dados para cancelar
    const temItens = selectedItems.length > 0
    const temTelefone = phoneValue.trim() !== ''
    const temEndereco = enderecoConfirmado !== null
    const temObservacao = observacao.trim() !== ''
    
    if (!temItens && !temTelefone && !temEndereco && !temObservacao) {
      showNotification('NÃO HÁ DADOS PARA CANCELAR!')
      return
    }
    
    setIsCancelarModalVisible(true)
    setTimeout(() => {
      setIsCancelarModalAnimating(true)
    }, 10)
  }

  const closeCancelarModal = () => {
    setIsCancelarModalAnimating(false)
    setTimeout(() => {
      setIsCancelarModalVisible(false)
    }, 400)
  }

  const openLimparModal = () => {
    setIsLimparModalVisible(true)
    setTimeout(() => {
      setIsLimparModalAnimating(true)
    }, 10)
  }

  const closeLimparModal = () => {
    setIsLimparModalAnimating(false)
    setTimeout(() => {
      setIsLimparModalVisible(false)
    }, 400)
  }

  const confirmarCancelamento = () => {
    // Limpar todos os dados do pedido
    setSelectedItems([])
    setValorRecebido('R$ 0,00')
    setValorDebito('R$ 0,00')
    setValorCredito('R$ 0,00')
    setValorPix('R$ 0,00')
    setValorAcrescimo('R$ 0,00')
    setValorDesconto('R$ 0,00')
    setObservacao('')
    setSelectedFormaEntrega('E')
    setEnderecoConfirmado(null)
    setPhoneValue('')
    
    // Fechar modal
    closeCancelarModal()
    
    // Mostrar notificação
    showNotification('VENDA CANCELADA!')
  }

  // Função para verificar se há formas de pagamento para limpar
  const verificarPagamentosParaLimpar = () => {
    const temDinheiro = valorRecebido !== 'R$ 0,00'
    const temDebito = valorDebito !== 'R$ 0,00'
    const temCredito = valorCredito !== 'R$ 0,00'
    const temPix = valorPix !== 'R$ 0,00'
    const temAcrescimo = valorAcrescimo !== 'R$ 0,00'
    const temDesconto = valorDesconto !== 'R$ 0,00'
    
    return temDinheiro || temDebito || temCredito || temPix || temAcrescimo || temDesconto
  }

  // Função para abrir modal de limpeza
  const abrirModalLimpeza = () => {
    if (!verificarPagamentosParaLimpar()) {
      showNotification('NÃO HÁ PAGAMENTOS PARA LIMPAR!')
      return
    }
    
    openLimparModal()
  }

  // Função para limpar apenas formas de pagamento e acréscimos/descontos
  const limparPagamentos = () => {
    // Limpar apenas valores de pagamento
    setValorRecebido('R$ 0,00')
    setPagamentoDinheiro('agora')
    setValorDebito('R$ 0,00')
    setValorCredito('R$ 0,00')
    setValorPix('R$ 0,00')
    setValorAcrescimo('R$ 0,00')
    setValorDesconto('R$ 0,00')
    
    // Fechar modal
    closeLimparModal()
    
    // Mostrar notificação
    showNotification('PAGAMENTOS LIMPOS!')
  }

  // Função para mostrar notificação
  const showNotification = (message: string) => {
    setNotification({ message: message, visible: true })
    setTimerProgress(100)
    
    // Timer para a barra verde (5 segundos)
    const timer = setInterval(() => {
      setTimerProgress(prev => {
        if (prev <= 0) {
          clearInterval(timer)
          setNotification({ message: '', visible: false })
          return 100
        }
        return prev - 2 // Diminui 2% a cada 100ms (5 segundos total)
      })
    }, 100)
  }

  // Função helper para manipular eventos de mouse de forma segura
  const handleMouseEvent = (e: React.MouseEvent, backgroundColor: string, color?: string) => {
    const target = e.target as HTMLElement
    if (target && target.style) {
      target.style.backgroundColor = backgroundColor
      if (color) {
        target.style.color = color
      }
    }
  }

  // Função para carregar pedidos em produção do Firebase
  const carregarPedidosProducao = async () => {
    if (!user) return
    
    try {
      // Consulta simples sem ordenação para evitar problemas de índice
      const q = query(
        collection(db, 'pedidosProducao'),
        where('userId', '==', user.id)
      )
      
      const snapshot = await getDocs(q)
      
      if (!snapshot.empty) {
        const pedidos = snapshot.docs.map(doc => {
          const data = doc.data()
          return {
            ...data,
            id: doc.id,
            dataCriacao: data.dataCriacao?.toDate() || new Date()
          }
        })
        
        // Ordenar localmente por data de criação (mais recente primeiro)
        const pedidosOrdenados = pedidos.sort((a, b) => {
          const dataA = a.dataCriacao instanceof Date ? a.dataCriacao : new Date(a.dataCriacao)
          const dataB = b.dataCriacao instanceof Date ? b.dataCriacao : new Date(b.dataCriacao)
          return dataB.getTime() - dataA.getTime()
        })
        
        // Separar pedidos por status
        const pedidosEmAnaliseTemp: any[] = []
        const pedidosEmPreparoTemp: any[] = []
        const pedidosEmEntregaTemp: any[] = []
        
        pedidosOrdenados.forEach(pedido => {
          // Determinar forma de pagamento baseada nos dados do pedido
          let formaPagamento = 'Dinheiro'
          if (pedido.dadosCompletos) {
            if (pedido.dadosCompletos.valorPix && pedido.dadosCompletos.valorPix !== 'R$ 0,00') {
              formaPagamento = 'PIX'
            } else if (pedido.dadosCompletos.valorCredito && pedido.dadosCompletos.valorCredito !== 'R$ 0,00') {
              formaPagamento = 'Cartão de Crédito'
            } else if (pedido.dadosCompletos.valorDebito && pedido.dadosCompletos.valorDebito !== 'R$ 0,00') {
              formaPagamento = 'Cartão de Débito'
            } else if (pedido.dadosCompletos.valorRecebido && pedido.dadosCompletos.valorRecebido !== 'R$ 0,00') {
              formaPagamento = 'Dinheiro'
            }
          }
          
          const pedidoFormatado = {
            id: pedido.id,
            mesaNumero: pedido.mesaNumero || Math.floor(Math.random() * 50) + 1, // Manter mesaNumero original
            numeroPedido: pedido.numeroPedido || null, // Número sequencial do pedido
            tipo: pedido.tipo || 'Delivery',
            cliente: pedido.cliente || 'Cliente',
            valor: pedido.valor || 'R$ 0,00',
            tempo: calcularTempoDecorrido(pedido.dataCriacao),
            status: (pedido as any).status || 'Em análise',
            formaPagamento: formaPagamento,
            mostrarTroco: true,
            dadosCompletos: pedido.dadosCompletos || null,
            dataCriacao: pedido.dataCriacao instanceof Date ? pedido.dataCriacao : new Date(pedido.dataCriacao)
          }
          
          switch ((pedido as any).status) {
            case 'Em análise':
              pedidosEmAnaliseTemp.push(pedidoFormatado)
              break
            case 'Em preparo':
              pedidosEmPreparoTemp.push(pedidoFormatado)
              break
            case 'Em entrega':
              pedidosEmEntregaTemp.push(pedidoFormatado)
              break
            case 'Entregue':
              // Pedidos entregues não aparecem mais na produção
              break
            default:
              // Se não tem status definido, coloca em análise
              pedidosEmAnaliseTemp.push(pedidoFormatado)
          }
        })
        
        setPedidosEmAnalise(pedidosEmAnaliseTemp)
        setPedidosEmProducao(pedidosEmPreparoTemp)
        setPedidosEmEntrega(pedidosEmEntregaTemp)
      } else {
        setPedidosEmAnalise([])
        setPedidosEmProducao([])
        setPedidosEmEntrega([])
      }
    } catch (error) {
      console.error('❌ Erro ao carregar pedidos:', error)
    }
  }

  // Função para remover pedido da produção
  const removerPedidoProducao = async (pedidoId: string) => {
    if (!user) return
    
    try {
      // Remover do Firebase
      const docRef = doc(db, 'pedidosProducao', pedidoId)
      await deleteDoc(docRef)
      
      // Remover do estado local
      setPedidosEmProducao(prev => prev.filter(pedido => pedido.id !== pedidoId))
    } catch (error) {
      console.error('❌ Erro ao remover pedido da produção:', error)
    }
  }

  // Função para aceitar pedido em análise (mover para em preparo)
  const aceitarPedidoAnalise = async (pedidoId: string) => {
    if (!user) return
    
    try {
      // Encontrar o pedido em análise
      const pedido = pedidosEmAnalise.find(p => p.id === pedidoId)
      if (!pedido) return
      
      // Atualizar status no Firebase
      const docRef = doc(db, 'pedidosProducao', pedidoId)
      await setDoc(docRef, {
        ...pedido,
        status: 'Em preparo',
        dataCriacao: Timestamp.now()
      }, { merge: true })
      
      // Remover da lista de análise
      setPedidosEmAnalise(prev => prev.filter(p => p.id !== pedidoId))
      
      // Adicionar à lista de preparo
      const pedidoAtualizado = { ...pedido, status: 'Em preparo' }
      setPedidosEmProducao(prev => [pedidoAtualizado, ...prev])
    } catch (error) {
      console.error('❌ Erro ao aceitar pedido:', error)
      showNotification('Erro ao aceitar pedido')
    }
  }

  // Função para finalizar pedido em preparo (mover para em entrega)
  const finalizarPedidoPreparo = async (pedidoId: string) => {
    if (!user) return
    
    try {
      // Encontrar o pedido em preparo
      const pedido = pedidosEmProducao.find(p => p.id === pedidoId)
      if (!pedido) return
      
      // Atualizar status no Firebase
      const docRef = doc(db, 'pedidosProducao', pedidoId)
      await setDoc(docRef, {
        ...pedido,
        status: 'Em entrega',
        dataCriacao: Timestamp.now()
      }, { merge: true })
      
      // Remover da lista de preparo
      setPedidosEmProducao(prev => prev.filter(p => p.id !== pedidoId))
      
      // Adicionar à lista de entrega
      const pedidoAtualizado = { ...pedido, status: 'Em entrega' }
      setPedidosEmEntrega(prev => [pedidoAtualizado, ...prev])
    } catch (error) {
      console.error('❌ Erro ao finalizar pedido:', error)
      showNotification('Erro ao finalizar pedido')
    }
  }

  // Função para finalizar entrega (mover para entregue)
  const finalizarEntrega = async (pedidoId: string) => {
    if (!user) return
    
    try {
      // Encontrar o pedido em entrega
      const pedido = pedidosEmEntrega.find(p => p.id === pedidoId)
      if (!pedido) return
      
      // Preparar dados completos para o histórico
      const dadosCompletos = pedido.dadosCompletos || {}
      const dataAtual = new Date()
      
      // Converter itens para o formato esperado pelo histórico
      const produtosConvertidos = dadosCompletos.itens?.map((item: any, index: number) => {
        return {
          id: index + 1,
          nome: item.name,
          quantidade: item.quantity,
          preco: item.price,
          observacoes: '',
          adicionais: item.additionals?.map((adicional: any) => ({
            nome: adicional.name,
            preco: adicional.price
          })) || [],
          subtotal: (parseFloat(item.price.replace(/[^0-9,]/g, '').replace(',', '.')) * item.quantity).toFixed(2).replace('.', ',')
        }
      }) || []

      const dadosHistorico: any = {
        numeroPedido: dadosCompletos.numeroPedido || pedido.numeroPedido, // Adicionar número sequencial
        cliente: pedido.cliente,
        telefone: dadosCompletos.telefone || '',
        valor: pedido.valor,
        status: 'Entregue' as const,
        data: dataAtual.toLocaleDateString('pt-BR'),
        hora: dataAtual.toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        formaPagamento: pedido.formaPagamento,
        tipo: pedido.tipo,
        endereco: dadosCompletos.endereco || null,
        observacao: dadosCompletos.observacao || null,
        origem: dadosCompletos.origem || 'pdv', // Adicionar campo origem
        produtos: produtosConvertidos, // Usar produtos em vez de itens
        itens: dadosCompletos.itens || [], // Manter itens para compatibilidade
        // Dados financeiros completos
        subtotal: dadosCompletos.total || pedido.valor,
        valorAcrescimo: dadosCompletos.valorAcrescimo || 'R$ 0,00',
        valorDesconto: dadosCompletos.valorDesconto || 'R$ 0,00',
        taxaEntrega: dadosCompletos.taxaEntrega || 'R$ 0,00',
        // Dados de pagamento detalhados
        valorRecebido: dadosCompletos.valorRecebido || 'R$ 0,00',
        valorPix: dadosCompletos.valorPix || 'R$ 0,00',
        valorDebito: dadosCompletos.valorDebito || 'R$ 0,00',
        valorCredito: dadosCompletos.valorCredito || 'R$ 0,00',
        troco: dadosCompletos.troco || 'R$ 0,00',
        // Status dos pagamentos
        pagamentoDinheiro: dadosCompletos.pagamentoDinheiro || 'agora',
        pagamentoPix: dadosCompletos.pagamentoPix || 'agora',
        pagamentoDebito: dadosCompletos.pagamentoDebito || 'agora',
        pagamentoCredito: dadosCompletos.pagamentoCredito || 'agora',
        // Dados originais do pedido
        dadosCompletos: dadosCompletos,
        dataCriacao: dataAtual,
        mesaNumero: pedido.mesaNumero || null
      }
      
      // Remover campos undefined para evitar erro no Firebase
      Object.keys(dadosHistorico).forEach(key => {
        if (dadosHistorico[key] === undefined) {
          delete dadosHistorico[key]
        }
      })
      
      // Adicionar ao histórico no Firebase
      console.log('📝 Salvando no histórico:', dadosHistorico.numeroPedido)
      const historicoRef = collection(db, 'historicoPedidos')
      const docData = {
        ...dadosHistorico,
        userId: user.id,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
      console.log('📊 Dados completos para salvar:', docData)
      await addDoc(historicoRef, docData)
      console.log('✅ Histórico salvo com sucesso')
      
      // Atualizar status no Firebase
      const docRef = doc(db, 'pedidosProducao', pedidoId)
      await setDoc(docRef, {
        ...pedido,
        status: 'Entregue',
        dataCriacao: Timestamp.now()
      }, { merge: true })
      
      // Remover da lista de entrega
      setPedidosEmEntrega(prev => prev.filter(p => p.id !== pedidoId))
    } catch (error) {
      console.error('❌ Erro ao finalizar entrega:', error)
      showNotification('Erro ao finalizar entrega')
    }
  }



  // Função para adicionar pedido à produção
  const adicionarPedidoProducao = async (pedidoData: any, firebaseDocId?: string) => {
    if (!user) return
    
    try {
      const pedidoId = firebaseDocId || `${user.id}_${Date.now()}`
      
      // Determinar o status baseado no status do pedido
      let statusProducao = 'Em análise'
      if (pedidoData.status === 'PAGO') {
        statusProducao = 'Em preparo' // Se já foi pago, vai direto para preparo
      } else if (pedidoData.status === 'ENTREGUE') {
        statusProducao = 'Entregue' // Se já foi entregue
      }
      
      const novoPedido = {
        id: pedidoId,
        mesaNumero: Math.floor(Math.random() * 50) + 1, // Número aleatório de mesa (mantido para compatibilidade)
        numeroPedido: pedidoData.numeroPedido, // Adicionar número sequencial
        tipo: (pedidoData.formaEntrega === 'E' ? 'Delivery' : 
               pedidoData.formaEntrega === 'R' ? 'Retirada' : 'Balcão') as 'Delivery' | 'Balcão' | 'Retirada',
        cliente: pedidoData.cliente || 'Cliente',
        valor: pedidoData.total,
        tempo: calcularTempoDecorrido(new Date()),
        status: statusProducao,
        formaPagamento: pedidoData.formaPagamento,
        mostrarTroco: pedidoData.formaPagamento === 'Dinheiro',
        dataCriacao: new Date(),
        userId: user.id,
        // Salvar dados completos para acesso posterior
        dadosCompletos: pedidoData
      } as any
      
      // Salvar no Firebase
      const docRef = doc(db, 'pedidosProducao', novoPedido.id)
      await setDoc(docRef, {
        ...novoPedido,
        dataCriacao: Timestamp.now()
      })
      
      // Atualizar estado local baseado no status
      if (statusProducao === 'Em análise') {
        setPedidosEmAnalise(prev => [novoPedido, ...prev])
      } else if (statusProducao === 'Em preparo') {
        setPedidosEmProducao(prev => [novoPedido, ...prev])
      } else if (statusProducao === 'Em entrega') {
        setPedidosEmEntrega(prev => [novoPedido, ...prev])
      }
      // Pedidos entregues não aparecem mais na produção
    } catch (error) {
      console.error('❌ Erro ao salvar pedido em produção:', error)
    }
  }
  
  // Função para abrir modal de detalhes
  const openDetalhesModal = async (pedido: any) => {
    try {
      // Primeiro, verificar se temos dados completos salvos localmente
      if (pedido.dadosCompletos) {
        const produtosConvertidos = pedido.dadosCompletos.itens?.map((item: any, index: number) => {
          return {
            id: index + 1,
            nome: item.name,
            quantidade: item.quantity,
            preco: item.price,
            observacoes: '',
            adicionais: item.additionals?.map((adicional: any) => ({
              nome: adicional.name,
              preco: adicional.price
            })) || [],
            subtotal: calculateItemTotal(item)
          }
        }) || []
        
                    const pedidoComProdutos = {
              ...pedido,
              cliente: pedido.cliente || 'Cliente',
              formaPagamento: pedido.dadosCompletos.formaPagamento || pedido.formaPagamento,
              produtos: produtosConvertidos,
              total: pedido.dadosCompletos.total || pedido.valor,
              taxaEntrega: pedido.dadosCompletos.taxaEntrega || (pedido.tipo === 'Delivery' ? 'R$ 8,00' : 'R$ 0,00'),
              subtotal: pedido.dadosCompletos.total || pedido.valor,
              endereco: pedido.dadosCompletos.endereco || (pedido.tipo === 'Delivery' ? {
                rua: 'Endereço não informado',
                bairro: '',
                cidade: '',
                complemento: ''
              } : null),
              telefone: pedido.dadosCompletos.telefone || (pedido.tipo === 'Delivery' ? 'Telefone não informado' : null),
              horarioPedido: pedido.dadosCompletos.dataPedido?.toDate().toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }) || 'Horário não informado',
              observacoesGerais: pedido.dadosCompletos.observacao || 'Sem observações',
              // Dados de pagamento específicos
              valorDinheiro: pedido.dadosCompletos.valorDinheiro || 'R$ 0,00',
              valorDebito: pedido.dadosCompletos.valorDebito || 'R$ 0,00',
              valorCredito: pedido.dadosCompletos.valorCredito || 'R$ 0,00',
              valorPix: pedido.dadosCompletos.valorPix || 'R$ 0,00',
              valorAcrescimo: pedido.dadosCompletos.valorAcrescimo || 'R$ 0,00',
              valorDesconto: pedido.dadosCompletos.valorDesconto || 'R$ 0,00',
              troco: pedido.dadosCompletos.troco || 'R$ 0,00',
              // Status de pagamento (quando será pago)
              pagamentoDinheiro: pedido.dadosCompletos.pagamentoDinheiro || 'agora',
              pagamentoDebito: pedido.dadosCompletos.pagamentoDebito || 'agora',
              pagamentoCredito: pedido.dadosCompletos.pagamentoCredito || 'agora',
              pagamentoPix: pedido.dadosCompletos.pagamentoPix || 'agora',
              // Data de criação para o cronômetro
              dataCriacao: pedido.dadosCompletos.dataPedido?.toDate() || pedido.dataCriacao || new Date()
            }
        
        setPedidoDetalhes(pedidoComProdutos)
        setIsDetalhesModalVisible(true)
        setTimeout(() => {
          setIsDetalhesModalAnimating(true)
        }, 10)
        return
      }
      
      // Se o pedido tem ID, tentar buscar diretamente no Firebase
      if (pedido.id && pedido.id.includes('_')) {
        try {
          const docRef = doc(db, 'orders', pedido.id)
          const docSnap = await getDoc(docRef)
          
          if (docSnap.exists()) {
            const pedidoData = docSnap.data()
            
            // Converter produtos salvos para o formato do modal
            const produtosConvertidos = pedidoData.itens?.map((item: any, index: number) => ({
              id: index + 1,
              nome: item.name,
              quantidade: item.quantity,
              preco: item.price,
              observacoes: '',
              adicionais: item.additionals?.map((adicional: any) => ({
                nome: adicional.name,
                preco: adicional.price
              })) || [],
              subtotal: calculateItemTotal(item)
            })) || []
            
            const pedidoComProdutos = {
              ...pedido,
              cliente: pedido.cliente || 'Cliente',
              formaPagamento: pedidoData.formaPagamento || pedido.formaPagamento,
              produtos: produtosConvertidos,
              total: pedidoData.total || pedido.valor,
              taxaEntrega: pedidoData.taxaEntrega || (pedido.tipo === 'Delivery' ? 'R$ 8,00' : 'R$ 0,00'),
              subtotal: pedidoData.total || pedido.valor,
              endereco: pedidoData.endereco || (pedido.tipo === 'Delivery' ? {
                rua: 'Endereço não informado',
                bairro: '',
                cidade: '',
                complemento: ''
              } : null),
              telefone: pedidoData.telefone || (pedido.tipo === 'Delivery' ? 'Telefone não informado' : null),
              horarioPedido: pedidoData.dataPedido?.toDate().toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }) || 'Horário não informado',
              observacoesGerais: pedidoData.observacao || 'Sem observações',
              // Dados de pagamento específicos
              valorDinheiro: pedidoData.valorDinheiro || 'R$ 0,00',
              valorDebito: pedidoData.valorDebito || 'R$ 0,00',
              valorCredito: pedidoData.valorCredito || 'R$ 0,00',
              valorPix: pedidoData.valorPix || 'R$ 0,00',
              valorAcrescimo: pedidoData.valorAcrescimo || 'R$ 0,00',
              valorDesconto: pedidoData.valorDesconto || 'R$ 0,00',
              troco: pedidoData.troco || 'R$ 0,00',
              // Status de pagamento (quando será pago)
              pagamentoDinheiro: pedidoData.pagamentoDinheiro || 'agora',
              pagamentoDebito: pedidoData.pagamentoDebito || 'agora',
              pagamentoCredito: pedidoData.pagamentoCredito || 'agora',
              pagamentoPix: pedidoData.pagamentoPix || 'agora',
              // Data de criação para o cronômetro
              dataCriacao: pedidoData.dataPedido?.toDate() || pedido.dataCriacao || new Date()
            }
            
            setPedidoDetalhes(pedidoComProdutos)
            setIsDetalhesModalVisible(true)
            setTimeout(() => {
              setIsDetalhesModalAnimating(true)
            }, 10)
            return
          }
        } catch (firebaseError) {
          console.log('⚠️ Erro ao buscar no Firebase, usando fallback:', firebaseError)
        }
      }
      

      
      // Fallback: usar dados do card se não conseguir buscar no Firebase
      console.log('⚠️ Não foi possível buscar no Firebase, usando dados do card')
      
      // Criar dados básicos do pedido
      const pedidoComProdutos = {
        ...pedido,
        cliente: pedido.cliente || 'Cliente',
        formaPagamento: pedido.formaPagamento,
        produtos: [],
        total: pedido.valor,
        taxaEntrega: pedido.taxaEntrega || (pedido.tipo === 'Delivery' ? 'R$ 8,00' : 'R$ 0,00'),
        subtotal: pedido.valor,
        endereco: pedido.tipo === 'Delivery' ? {
          rua: 'Endereço não informado',
          bairro: '',
          cidade: '',
          complemento: ''
        } : null,
        telefone: pedido.tipo === 'Delivery' ? 'Telefone não informado' : null,
        horarioPedido: 'Horário não informado',
        observacoesGerais: 'Dados do pedido não disponíveis no momento',
        // Dados de pagamento específicos (fallback)
        valorDinheiro: 'R$ 0,00',
        valorDebito: 'R$ 0,00',
        valorCredito: 'R$ 0,00',
        valorPix: 'R$ 0,00',
        valorAcrescimo: 'R$ 0,00',
        valorDesconto: 'R$ 0,00',
        troco: 'R$ 0,00',
        // Status de pagamento (fallback)
        pagamentoDinheiro: 'agora',
        pagamentoDebito: 'agora',
        pagamentoCredito: 'agora',
        pagamentoPix: 'agora'
      }
      
      setPedidoDetalhes(pedidoComProdutos)
      setIsDetalhesModalVisible(true)
      setTimeout(() => {
        setIsDetalhesModalAnimating(true)
      }, 10)
      return
        

    } catch (error) {
      console.error('❌ Erro ao buscar detalhes do pedido:', error)
      
      // Fallback em caso de erro
      const pedidoComProdutos = {
        ...pedido,
        cliente: pedido.cliente || 'Cliente',
        formaPagamento: pedido.formaPagamento,
        produtos: [],
        total: pedido.valor,
        taxaEntrega: pedido.taxaEntrega || (pedido.tipo === 'Delivery' ? 'R$ 8,00' : 'R$ 0,00'),
        subtotal: pedido.valor,
        endereco: pedido.tipo === 'Delivery' ? {
          rua: 'Erro ao carregar endereço',
          bairro: '',
          cidade: '',
          complemento: ''
        } : null,
        telefone: pedido.tipo === 'Delivery' ? 'Erro ao carregar telefone' : null,
        horarioPedido: 'Erro ao carregar horário',
        observacoesGerais: 'Erro ao carregar detalhes do pedido',
        // Dados de pagamento específicos (fallback erro)
        valorDinheiro: 'R$ 0,00',
        valorDebito: 'R$ 0,00',
        valorCredito: 'R$ 0,00',
        valorPix: 'R$ 0,00',
        valorAcrescimo: 'R$ 0,00',
        valorDesconto: 'R$ 0,00',
        troco: 'R$ 0,00',
        // Status de pagamento (fallback erro)
        pagamentoDinheiro: 'agora',
        pagamentoDebito: 'agora',
        pagamentoCredito: 'agora',
        pagamentoPix: 'agora',
        // Data de criação para o cronômetro (fallback)
        dataCriacao: pedido.dataCriacao || new Date()
      }
      
      setPedidoDetalhes(pedidoComProdutos)
      setIsDetalhesModalVisible(true)
      setTimeout(() => {
        setIsDetalhesModalAnimating(true)
      }, 10)
    }
  }
  
  // Função para fechar modal de detalhes
  const closeDetalhesModal = () => {
    setIsDetalhesModalAnimating(false)
    setTimeout(() => {
      setIsDetalhesModalVisible(false)
      setPedidoDetalhes(null)
    }, 300)
  }

  // Função para debug - verificar pedidos salvos
  const verificarPedidosSalvos = async () => {
    if (!user) return
    
    try {
      console.log('🔍 Verificando pedidos salvos no Firebase...')
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', user.id),
        orderBy('createdAt', 'desc'),
        limit(10)
      )
      const snapshot = await getDocs(q)
      
      console.log('📋 Últimos 5 pedidos salvos:')
      snapshot.forEach((doc) => {
        const data = doc.data()
        console.log(`📦 Pedido ID: ${doc.id}`)
        console.log(`   - Itens: ${data.itens?.length || 0} produtos`)
        console.log(`   - Total: ${data.total}`)
        console.log(`   - Status: ${data.status}`)
        console.log(`   - Data: ${data.createdAt?.toDate()}`)
        if (data.itens && data.itens.length > 0) {
          console.log('   - Produtos:')
          data.itens.forEach((item: any, index: number) => {
            console.log(`     ${index + 1}. ${item.name} - Qtd: ${item.quantity} - Preço: ${item.price}`)
            if (item.additionals && item.additionals.length > 0) {
              console.log(`       Adicionais: ${item.additionals.map((a: any) => a.name).join(', ')}`)
            }
          })
        }
        console.log('---')
      })
    } catch (error) {
      console.error('❌ Erro ao verificar pedidos:', error)
    }
  }
  
  // Função para salvar pedido como pago
  const salvarPedidoPago = async () => {
    if (!user || selectedItems.length === 0) return
    
    try {
      // Gerar número sequencial do pedido
      const numeroPedido = await gerarProximoNumero()
      console.log('🔢 Número gerado (salvarPedidoPago):', numeroPedido)
      
      const pedidoData = {
        userId: user.id,
        numeroPedido: numeroPedido, // Adicionar número sequencial
        itens: selectedItems,
        total: calculateTotal(),
        valorRecebido: valorRecebido,
        taxaEntrega: taxaEntrega, // Adicionar taxa de entrega
        troco: calcularTroco(),
        formaPagamento: 'Dinheiro',
        status: 'PAGO',
        dataPedido: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        origem: 'pdv', // Adicionar campo origem
        // Status de pagamento
        pagamentoDinheiro: pagamentoDinheiro
      }
      
      // Usar timestamp como ID único para cada pedido
      const timestamp = Date.now()
      const docRef = doc(db, 'orders', `${user.id}_${timestamp}`)
      await setDoc(docRef, pedidoData)
      
      // Limpar todos os dados do pedido
      setSelectedItems([])
      setValorRecebido('R$ 0,00')
      setValorDebito('R$ 0,00')
      setValorCredito('R$ 0,00')
      setValorPix('R$ 0,00')
      setValorAcrescimo('R$ 0,00')
      setValorDesconto('R$ 0,00')
      setObservacao('')
      setSelectedFormaEntrega('E')
      setEnderecoConfirmado(null)
      setPhoneValue('')
      
      // Adicionar pedido à produção com o ID do Firebase
      adicionarPedidoProducao(pedidoData, docRef.id)
      
      // Fechar todos os modais
      closeDinheiroModal()
      closeModal()
      
      // Mostrar notificação de sucesso
      showNotification('PEDIDO PAGO COM SUCESSO!')
      
    } catch (error) {
      console.error('Erro ao salvar pedido:', error)
      showNotification('ERRO AO SALVAR PEDIDO!')
    }
  }

  // Função para finalizar pedido com pagamento
  const finalizarPedidoComPagamento = async (formaPagamento: string) => {
    if (!user || selectedItems.length === 0) return
    
    try {
      // Gerar número sequencial do pedido
      const numeroPedido = await gerarProximoNumero()
      
      // Determinar forma de pagamento baseada nos valores configurados
      const formasPagamento = [];
      if (valorRecebido !== 'R$ 0,00') formasPagamento.push('Dinheiro');
      if (valorDebito !== 'R$ 0,00') formasPagamento.push('Débito');
      if (valorCredito !== 'R$ 0,00') formasPagamento.push('Crédito');
      if (valorPix !== 'R$ 0,00') formasPagamento.push('PIX');
      
      // Usar as formas reais se houver múltiplas, senão usar o parâmetro
      const formaPagamentoFinal = formasPagamento.length > 1 ? formasPagamento.join(' + ') : formaPagamento;
      
      const pedidoData = {
        userId: user.id,
        numeroPedido: numeroPedido, // Adicionar número sequencial
        itens: selectedItems,
        total: calculateTotal(),
        valorRecebido: valorRecebido,
        valorDebito: valorDebito,
        valorCredito: valorCredito,
        valorPix: valorPix,
        valorAcrescimo: valorAcrescimo,
        valorDesconto: valorDesconto,
        taxaEntrega: taxaEntrega, // Adicionar taxa de entrega
        troco: calcularTroco(),
        formaPagamento: formaPagamentoFinal,
        status: 'PAGO',
        dataPedido: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        formaEntrega: selectedFormaEntrega,
        endereco: enderecoConfirmado || null,
        observacao: observacao || null,
        cliente: semCliente ? 'Sem cliente' : nomeCliente,
        telefone: semCliente ? null : telefoneCliente,
        semCliente: semCliente,
        origem: 'pdv', // Adicionar campo origem
        // Status de pagamento
        pagamentoDinheiro: pagamentoDinheiro,
        pagamentoDebito: pagamentoDebito,
        pagamentoCredito: pagamentoCredito,
        pagamentoPix: pagamentoPix
      }
      
      // Usar timestamp como ID único para cada pedido
      const timestamp = Date.now()
      const docRef = doc(db, 'orders', `${user.id}_${timestamp}`)
      await setDoc(docRef, pedidoData)
      
      // Limpar todos os dados do pedido
      setSelectedItems([])
      setValorRecebido('R$ 0,00')
      setValorDebito('R$ 0,00')
      setValorCredito('R$ 0,00')
      setValorPix('R$ 0,00')
      setValorAcrescimo('R$ 0,00')
      setValorDesconto('R$ 0,00')
      setObservacao('')
      setSelectedFormaEntrega('E')
      setEnderecoConfirmado(null)
      setPhoneValue('')
      
      // Adicionar pedido à produção com o ID do Firebase
      adicionarPedidoProducao(pedidoData, docRef.id)
      
      // Fechar todos os modais
      closeModal()
      
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error)
      showNotification('ERRO AO FINALIZAR PEDIDO!')
    }
  }

  // Função para finalizar pedido diretamente (quando não há valor a pagar)
  const finalizarPedidoDireto = async () => {
    if (!user || selectedItems.length === 0) return
    
    try {
      // Gerar número sequencial do pedido
      const numeroPedido = await gerarProximoNumero()
      
      // Determinar forma de pagamento baseada nos valores configurados
      const formasPagamento = [];
      if (valorRecebido !== 'R$ 0,00') formasPagamento.push('Dinheiro');
      if (valorDebito !== 'R$ 0,00') formasPagamento.push('Débito');
      if (valorCredito !== 'R$ 0,00') formasPagamento.push('Crédito');
      if (valorPix !== 'R$ 0,00') formasPagamento.push('PIX');
      
      const formaPagamentoFinal = formasPagamento.length > 0 ? formasPagamento.join(' + ') : 'Gratuito';
      
      const pedidoData = {
        userId: user.id,
        numeroPedido: numeroPedido, // Adicionar número sequencial
        itens: selectedItems,
        total: calculateTotal(),
        valorRecebido: valorRecebido,
        valorDebito: valorDebito,
        valorCredito: valorCredito,
        valorPix: valorPix,
        valorAcrescimo: valorAcrescimo,
        valorDesconto: valorDesconto,
        taxaEntrega: taxaEntrega, // Adicionar taxa de entrega
        troco: calcularTroco(),
        formaPagamento: formaPagamentoFinal,
        status: 'PAGO',
        dataPedido: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        formaEntrega: selectedFormaEntrega,
        endereco: enderecoConfirmado || null,
        observacao: observacao || null,
        cliente: semCliente ? 'Sem cliente' : nomeCliente,
        telefone: semCliente ? null : telefoneCliente,
        semCliente: semCliente,
        origem: 'pdv', // Adicionar campo origem
        // Status de pagamento
        pagamentoDinheiro: pagamentoDinheiro,
        pagamentoDebito: pagamentoDebito,
        pagamentoCredito: pagamentoCredito,
        pagamentoPix: pagamentoPix
      }
      
      // Usar timestamp como ID único para cada pedido
      const timestamp = Date.now()
      const docRef = doc(db, 'orders', `${user.id}_${timestamp}`)
      await setDoc(docRef, pedidoData)
      
      // Limpar todos os dados do pedido
      setSelectedItems([])
      setValorRecebido('R$ 0,00')
      setValorDebito('R$ 0,00')
      setValorCredito('R$ 0,00')
      setValorPix('R$ 0,00')
      setValorAcrescimo('R$ 0,00')
      setValorDesconto('R$ 0,00')
      setObservacao('')
      setSelectedFormaEntrega('E')
      setEnderecoConfirmado(null)
      setPhoneValue('')
      
      // Adicionar pedido à produção com o ID do Firebase
      adicionarPedidoProducao(pedidoData, docRef.id)
      
      // Fechar modal principal
      closeModal()
      
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error)
      showNotification('ERRO AO FINALIZAR PEDIDO!')
    }
  }

  // Componente do Card da Mesa (clonado)
  const MesaCard = ({ mesaNumero, tipo, cliente, valor, tempo, status, formaPagamento = 'Dinheiro', mostrarTroco = true, id, dadosCompletos, dataCriacao, numeroPedido }: {
    mesaNumero: number;
    tipo: 'Delivery' | 'Balcão' | 'Retirada';
    cliente: string;
    valor: string;
    tempo: string;
    status: string;
    formaPagamento?: string;
    mostrarTroco?: boolean;
    id?: string;
    dadosCompletos?: any;
    dataCriacao?: Date;
    numeroPedido?: string;
  }) => {
    // Função para determinar se o pedido está pago ou a cobrar
    const getStatusPagamento = () => {
      if (!dadosCompletos) {
        // Se não tem dados completos, usar o status original
        return {
          texto: status,
          isPago: status === 'PAGO' || status === 'Pago'
        };
      }
      
      // Verificar se há algum pagamento configurado
      const temPagamento = (dadosCompletos.valorRecebido && dadosCompletos.valorRecebido !== 'R$ 0,00') ||
                          (dadosCompletos.valorPix && dadosCompletos.valorPix !== 'R$ 0,00') ||
                          (dadosCompletos.valorDebito && dadosCompletos.valorDebito !== 'R$ 0,00') ||
                          (dadosCompletos.valorCredito && dadosCompletos.valorCredito !== 'R$ 0,00');
      
      if (!temPagamento) {
        return {
          texto: 'A cobrar',
          isPago: false
        };
      }
      
      // Verificar se todos os pagamentos são "agora" (pago)
      const todosPagamentosAgora = 
        (!dadosCompletos.valorRecebido || dadosCompletos.valorRecebido === 'R$ 0,00' || dadosCompletos.pagamentoDinheiro === 'agora') &&
        (!dadosCompletos.valorPix || dadosCompletos.valorPix === 'R$ 0,00' || dadosCompletos.pagamentoPix === 'agora') &&
        (!dadosCompletos.valorDebito || dadosCompletos.valorDebito === 'R$ 0,00' || dadosCompletos.pagamentoDebito === 'agora') &&
        (!dadosCompletos.valorCredito || dadosCompletos.valorCredito === 'R$ 0,00' || dadosCompletos.pagamentoCredito === 'agora');
      
      return {
        texto: todosPagamentosAgora ? 'Pago' : 'A cobrar',
        isPago: todosPagamentosAgora
      };
    };
    
    const statusPagamento = getStatusPagamento();
    
    // Determinar qual ação mostrar baseado no status
    const getActionButton = () => {
      switch (status) {
        case 'Em análise':
          return {
            text: 'Avançar',
            color: '#542583',
            hoverColor: '#4a1f6b',
            onClick: () => {
              if (id) {
                aceitarPedidoAnalise(id)
              }
            }
          }
        case 'Em preparo':
          return {
            text: 'Avançar',
            color: '#542583',
            hoverColor: '#4a1f6b',
            onClick: () => {
              if (id) {
                finalizarPedidoPreparo(id)
              }
            }
          }
        case 'Em entrega':
          return {
            text: 'Finalizar',
            color: '#542583',
            hoverColor: '#4a1f6b',
            onClick: () => {
              if (id) {
                finalizarEntrega(id)
              }
            }
          }
        default:
          return null
      }
    }

    const actionButton = getActionButton()

    return (
    <div style={{
      width: '100%',
      height: '180px',
      backgroundColor: 'white',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      color: 'black',
      fontSize: '16px',
      fontWeight: '500',
      marginTop: '1px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      border: '1px solid #542583',
    }}>
      {/* Parte superior */}
      <div style={{
        height: '25%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingLeft: '8px',
        paddingRight: '8px',
        position: 'relative'
      }}>
        {/* Ícone do pin no centro */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1
        }}>
          <img 
            src="/icons/pin.png" 
            alt="Pin" 
            width="35" 
            height="35"
          />
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {tipo === 'Delivery' && (
            <img 
              src="/icons/motocicleta.png" 
              alt="Delivery" 
              width="24" 
              height="24" 
              style={{ color: 'black' }}
            />
          )}
          {tipo === 'Balcão' && (
            <img 
              src="/icons/balcao-de-recepcao.png" 
              alt="Balcão" 
              width="24" 
              height="24" 
              style={{ color: 'black' }}
            />
          )}
          {tipo === 'Retirada' && (
            <img 
              src="/icons/sacola.png" 
              alt="Retirada" 
              width="24" 
              height="24" 
              style={{ color: 'black' }}
            />
          )}
                          <span>#{numeroPedido || 'V001'}</span>
        </div>
        <span style={{
          fontSize: '11px',
          color: 'black',
          opacity: 0.8,
          marginTop: '1px'
        }}>
          {calcularTempoDecorrido(dadosCompletos?.dataPedido || dataCriacao)}
        </span>
        {/* Ícones de ação */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '16px',
          display: 'flex',
          gap: '8px'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#747c94" style={{ cursor: 'pointer' }}>
            <path d="M360-600v-80h360v80H360Zm0 120v-80h360v80H360ZM560-80v-123l221-220q9-9 20-13t22-4q12 0 23 4.5t20 13.5l37 37q8 9 12.5 20t4.5 22q0 11-4 22.5T903-300L683-80H560Zm263-224 37-39-37-37-38 38 38 38ZM240-80q-50 0-85-35t-35-85v-120h120v-560h600v361q-20-2-40.5 1.5T760-505v-295H320v480h240l-80 80v160H240Z"/>
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#747c94" style={{ cursor: 'pointer' }}>
            <path d="M720-680H240v-160h480v160Zm0 220q17 0 28.5-11.5T760-500q0-17-11.5-28.5T720-540q-17 0-28.5 11.5T680-500q0 17 11.5 28.5T720-460Zm-80 260v-160H320v160h320Zm80 80H240v-160H80v-240q0-51 35-85.5t85-34.5h560q51 0 85.5 34.5T880-520v240H720v160Z"/>
          </svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#25D366', cursor: 'pointer' }}>
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7 8.5 7 9.71C7 10.93 7.89 12.1 8 12.27C8.14 12.44 9.76 14.94 12.25 16C12.84 16.27 13.3 16.42 13.66 16.53C14.25 16.72 14.79 16.69 15.22 16.63C15.7 16.56 16.68 16.03 16.89 15.45C17.1 14.87 17.1 14.38 17.04 14.27C16.97 14.17 16.81 14.11 16.56 14C16.31 13.86 15.09 13.26 14.87 13.18C14.64 13.1 14.5 13.06 14.31 13.3C14.15 13.55 13.67 14.11 13.53 14.27C13.38 14.44 13.24 14.46 13 14.34C12.74 14.21 11.94 13.95 11 13.11C10.26 12.45 9.77 11.64 9.62 11.39C9.5 11.15 9.61 11 9.73 10.89C9.84 10.78 10 10.6 10.1 10.45C10.23 10.31 10.27 10.2 10.35 10.04C10.43 9.87 10.39 9.73 10.33 9.61C10.27 9.5 9.77 8.26 9.56 7.77C9.36 7.29 9.16 7.35 9 7.34C8.86 7.34 8.7 7.33 8.53 7.33Z"></path>
          </svg>
        </div>
      </div>
      {/* Linha divisória */}
      <div style={{
        height: '1px',
        width: '100%',
        borderTop: '1.4px dashed #542583'
      }} />
      {/* Parte inferior */}
      <div style={{
        height: '75%',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        paddingLeft: '8px',
        paddingRight: '8px',
        paddingTop: '1px',
        paddingBottom: '8px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          width: '100%'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            width: '100%'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}>
              <span style={{
                fontSize: '16px',
                color: '#000000',
                fontWeight: '500',
                marginLeft: '1px',
                marginRight: '1px'
              }}>
                Pedido via PDV
              </span>
              <span style={{
                fontSize: '11px',
                color: 'black',
                opacity: 0.8,
                marginTop: '1px'
              }}>
                {tipo === 'Delivery' ? 'Delivery' : tipo === 'Balcão' ? 'Consumo no local' : 'Retirada'}
              </span>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '2px'
            }}>
              <span style={{
                fontSize: '16px',
                color: '#000000',
                fontWeight: '500'
              }}>
                {cliente}
              </span>
              <span 
                onClick={() => openDetalhesModal({
                  mesaNumero: mesaNumero,
                  tipo: tipo,
                  cliente: cliente,
                  valor: valor,
                  tempo: tempo,
                  status: status,
                  formaPagamento: formaPagamento,
                  id: id,
                  dadosCompletos: dadosCompletos
                })}
                style={{
                  fontSize: '11px',
                  color: '#542583',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Ver detalhes
              </span>
            </div>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            width: '100%'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column'
              }}>
                <span style={{
                  fontSize: '16px',
                  color: '#000000',
                  fontWeight: '500',
                  marginLeft: '1px',
                  marginRight: '1px'
                }}>
                  {valor}
                </span>
                <span style={{
                  fontSize: '11px',
                  color: 'black',
                  opacity: 0.8,
                  marginTop: '-4px'
                }}>
                  {formaPagamento}
                </span>
                {mostrarTroco && dadosCompletos?.troco && dadosCompletos.troco !== 'R$ 0,00' && (
                  <span style={{
                    fontSize: '11px',
                    color: 'black',
                    opacity: 0.8,
                    marginTop: '-4px'
                  }}>
                    Troco: {dadosCompletos.troco}
                  </span>
                )}
              </div>
              <div style={{
                backgroundColor: statusPagamento.isPago ? '#e7feea' : '#ffe6e9',
                padding: '2px 6px',
                borderRadius: '100px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 'fit-content'
              }}>
                <span style={{
                  fontSize: '11px',
                  color: statusPagamento.isPago ? '#0b8c21' : '#8d0a17',
                  fontWeight: '500'
                }}>
                  {statusPagamento.texto}
                </span>
              </div>
            </div>
            <div style={{
              display: 'flex',
              gap: '8px'
            }}>
              {actionButton && (
                <button 
                  style={{
                    backgroundColor: actionButton.color,
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    height: '36px'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = actionButton.hoverColor
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = actionButton.color
                  }}
                  onClick={actionButton.onClick}
                >
                  {actionButton.text}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
  };

  return (
    <ProtectedRoute>
      <style jsx global>{`
        .custom-checkmark {
          display: block;
          position: relative;
          cursor: pointer;
          user-select: none;
        }

        .custom-checkmark input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }

        .checkmark {
          position: relative;
          display: block;
          height: 18px;
          width: 18px;
          background-color: white;
          border: 2px solid #d1d5db;
          border-radius: 3px;
          transition: all 0.2s ease;
        }

        .custom-checkmark:hover .checkmark {
          border-color: #542583;
        }

        .custom-checkmark input:checked ~ .checkmark {
          background-color: #542583;
          border-color: #542583;
        }

        .checkmark:after {
          content: "";
          position: absolute;
          display: none;
          left: 5px;
          top: 1px;
          width: 4px;
          height: 8px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .custom-checkmark input:checked ~ .checkmark:after {
          display: block;
        }
      `}</style>

    <div className="min-h-screen flex" style={{ backgroundColor: '#ececec' }}>
      {/* Sidebar removido */}
      {/* Conteúdo principal aqui */}
      {/* Coloque aqui o restante do conteúdo da página, sem o sidebar */}
      <div className="flex-1" style={{ marginTop: '24px', marginLeft: '18px', marginRight: '18px', marginBottom: '18px' }}>
        <div className="flex justify-between items-center mb-6" style={{ marginLeft: '30px', marginRight: '30px' }}>
          <h1 className="text-2xl font-bold">Pedidos</h1>
          
          <div className="flex items-center gap-4">
            {/* Barra de pesquisa */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg 
                  className="h-5 w-5 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar (Nome, telefone, ou numero do pedido)"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                style={{
                  backgroundColor: 'white',
                  color: '#6b7280',
                  width: '450px',
                  height: '40px'
                }}
              />
            </div>
            
            <div className="flex gap-3">
              <button
                className="hover:opacity-90 transition-opacity"
                style={{
                  width: '100px',
                  height: '36px',
                  backgroundColor: '#5aaf51',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Botão 1
              </button>
              
              <button
                className="hover:opacity-90 transition-opacity"
                style={{
                  width: '100px',
                  height: '36px',
                  backgroundColor: '#5aaf51',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Botão 2
              </button>
              
              <button
                onClick={openModal}
                className="hover:opacity-90 transition-opacity flex items-center justify-center gap-1"
                style={{
                  width: '140px',
                  height: '36px',
                  backgroundColor: '#5aaf51',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                NOVO PEDIDO
              </button>
              
              <button
                className="hover:opacity-90 transition-opacity"
                style={{
                  width: '120px',
                  height: '36px',
                  backgroundColor: '#5aaf51',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                PAUSAR LOJA
              </button>
            </div>
          </div>
        </div>
        
        {/* Cards de Status com MesaCards */}
        <div className="flex gap-4 mb-6" style={{ marginLeft: '30px', marginRight: '30px' }}>
          {/* Seção Em Análise */}
          <div style={{ flex: '1' }}>
            {/* Card de Status */}
            <div style={{ backgroundColor: '#E8D0FF', height: '40px', borderRadius: '8px 8px 0px 0px', marginBottom: '5px', border: '2px solid #542583' }} className="relative">
              <div className="absolute top-1 left-4 text-white w-full pr-8">
                <div className="flex justify-between items-center">
                  <h3 style={{ fontSize: '20px', color: '#542583', fontWeight: 'bold' }}>Em análise</h3>
                  <span className="font-bold" style={{ 
                    fontSize: '20px', 
                    color: '#542583',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #542583'
                  }}>{pedidosEmAnalise.length}</span>
                </div>
              </div>
            </div>
            {/* MesaCards dinâmicos da análise */}
            {pedidosEmAnalise.map((pedido) => (
              <div key={pedido.id} style={{ marginBottom: '6px' }}>
                <MesaCard 
                  mesaNumero={pedido.mesaNumero} 
                  tipo={pedido.tipo} 
                  cliente={pedido.cliente} 
                  valor={pedido.valor} 
                  tempo={pedido.tempo} 
                  status={pedido.status}
                  formaPagamento={pedido.formaPagamento}
                  mostrarTroco={pedido.mostrarTroco}
                  id={pedido.id}
                  dadosCompletos={pedido.dadosCompletos}
                  dataCriacao={pedido.dataCriacao}
                  numeroPedido={pedido.numeroPedido}
                />
              </div>
            ))}
          </div>
          
          {/* Seção Em Preparo */}
          <div style={{ flex: '1' }}>
            {/* Card de Status */}
            <div style={{ backgroundColor: '#E8D0FF', height: '40px', borderRadius: '8px 8px 0px 0px', marginBottom: '5px', border: '2px solid #542583' }} className="relative">
              <div className="absolute top-1 left-4 text-white w-full pr-8">
                <div className="flex justify-between items-center">
                  <h3 style={{ fontSize: '20px', color: '#542583', fontWeight: 'bold' }}>Em preparo</h3>
                  <span className="font-bold" style={{ 
                    fontSize: '20px', 
                    color: '#542583',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #542583'
                  }}>{pedidosEmProducao.length}</span>
                </div>
              </div>
            </div>
            {/* MesaCards dinâmicos da produção */}
            {pedidosEmProducao.map((pedido) => (
              <div key={pedido.id} style={{ marginBottom: '6px' }}>
                <MesaCard 
                  mesaNumero={pedido.mesaNumero} 
                  tipo={pedido.tipo} 
                  cliente={pedido.cliente} 
                  valor={pedido.valor} 
                  tempo={pedido.tempo} 
                  status={pedido.status}
                  formaPagamento={pedido.formaPagamento}
                  mostrarTroco={pedido.mostrarTroco}
                  id={pedido.id}
                  dadosCompletos={pedido.dadosCompletos}
                  dataCriacao={pedido.dataCriacao}
                  numeroPedido={pedido.numeroPedido}
                />
              </div>
            ))}
          </div>
          
          {/* Seção Em Entrega */}
          <div style={{ flex: '1' }}>
            {/* Card de Status */}
            <div style={{ backgroundColor: '#E8D0FF', height: '40px', borderRadius: '8px 8px 0px 0px', marginBottom: '5px', border: '2px solid #542583' }} className="relative">
              <div className="absolute top-1 left-4 text-white w-full pr-8">
                <div className="flex justify-between items-center">
                  <h3 style={{ fontSize: '20px', color: '#542583', fontWeight: 'bold' }}>Em entrega</h3>
                  <span className="font-bold" style={{ 
                    fontSize: '20px', 
                    color: '#542583',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #542583'
                  }}>{pedidosEmEntrega.length}</span>
                </div>
              </div>
            </div>
            {/* MesaCards dinâmicos da entrega */}
            {pedidosEmEntrega.map((pedido) => (
              <div key={pedido.id} style={{ marginBottom: '6px' }}>
                <MesaCard 
                  mesaNumero={pedido.mesaNumero} 
                  tipo={pedido.tipo} 
                  cliente={pedido.cliente} 
                  valor={pedido.valor} 
                  tempo={pedido.tempo} 
                  status={pedido.status}
                  formaPagamento={pedido.formaPagamento}
                  mostrarTroco={pedido.mostrarTroco}
                  id={pedido.id}
                  dadosCompletos={pedido.dadosCompletos}
                  dataCriacao={pedido.dataCriacao}
                  numeroPedido={pedido.numeroPedido}
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Conteúdo será adicionado posteriormente */}
      </div>
    </div>
    
    {/* Modal de Novo Pedido */}
    {isModalVisible && (
      <>
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black"
          style={{
            opacity: isModalAnimating ? 0.5 : 0,
            transition: 'opacity 400ms cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 40
          }}
          onClick={closeModal}
        ></div>
        
        {/* Modal Content */}
        <div 
          className="fixed top-0 right-0 h-full overflow-y-auto"
          style={{
            width: '80%',
            backgroundColor: '#ececec',
            boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)',
            transform: isModalAnimating ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 50
          }}
        >
          {/* Botão de fechar com saliência */}
          <button
            onClick={closeModal}
            className="absolute left-0 top-4 transform -translate-x-full transition-all"
            style={{
              width: '40px',
              height: '80px',
              borderTopLeftRadius: '8px',
              borderBottomLeftRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              color: 'white',
              backgroundColor: 'rgba(130, 10, 209, 0.3)',
              backdropFilter: 'blur(10px)',
              boxShadow: '-2px 0 15px rgba(130, 10, 209, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(130, 10, 209, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(130, 10, 209, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(130, 10, 209, 0.3)'
            }}
          >
            ×
          </button>
          
          {/* Títulos das caixas */}
          <div className="flex gap-6 px-6" style={{ marginTop: '5px' }}>
            {/* Título da caixa da esquerda */}
            <div style={{ width: '70%' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                Pedidos balcão (PDV)
              </h3>
            </div>
            
            {/* Título para a caixa da direita */}
            <div style={{ width: '30%' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                Informações do pedido
              </h3>
            </div>
          </div>

          {/* Container das caixas */}
          <div className="flex" style={{ marginTop: '5px', paddingLeft: '24px', paddingRight: '24px', minHeight: '544px', gap: '8px' }}>
            {/* Caixa branca 1 - 70% */}
            <div
              className="bg-white"
              style={{
                width: '70%',
                height: '544px',
                borderRadius: '1px'
              }}
            >
              {/* Container com caixa e linha divisória */}
              <div className="flex h-full overflow-hidden">
                {/* Área dos botões de categoria - SIDEBAR FIXO */}
                <div style={{ margin: '8px', flexShrink: 0 }}>
                  {/* Botões de categoria */}
                  <div className="flex flex-col gap-2">
                    {categoriesWithProducts.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.name)}
                        className="flex items-center justify-center transition-colors"
                        style={{
                            width: '96px',
                            height: '48px',
                          backgroundColor: selectedCategory === category.name ? '#542583' : 'transparent',
                          border: '1px solid #542583',
                          borderRadius: '4px',
                          color: selectedCategory === category.name ? 'white' : '#542583',
                            fontSize: '11px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          padding: '2px',
                          textAlign: 'center',
                          lineHeight: '1.1',
                          overflow: 'hidden',
                          display: 'block',
                            maxHeight: '44px',
                          wordWrap: 'break-word'
                        }}
                      >
                        <span style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          lineHeight: '1.1'
                        }}>
                          {category.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Linha divisória vertical */}
                <div
                  style={{
                    width: '1px',
                    height: '100%',
                    backgroundColor: '#e5e5e5',
                    flexShrink: 0
                  }}
                ></div>
                
                {/* Textos das categorias - ÁREA COM SCROLL */}
                <div 
                  className="custom-scrollbar"
                  style={{ 
                    margin: '8px',
                    flex: 1,
                    overflowY: 'auto',
                    maxHeight: 'calc(100vh - 100px)',
                    height: 'fit-content'
                  }}
                >
                  <div className="flex flex-col">
                    {categoriesWithProducts.map((category, index) => (
                      <div key={category.id} style={{ marginBottom: index === categoriesWithProducts.length - 1 ? '0' : '8px' }}>
                        {/* Texto da categoria */}
                        <div
                          style={{
                              height: '48px',
                            display: 'flex',
                            alignItems: 'flex-start',
                              fontSize: selectedCategory === category.name ? '18px' : '14px',
                            color: '#333',
                            fontWeight: selectedCategory === category.name ? 'bold' : 'normal',
                            lineHeight: '1',
                              marginTop: '14px'
                          }}
                        >
                          {category.name}
                        </div>
                        
                                                {/* Container horizontal para as caixas */}
                        <div 
                          style={{
                            marginTop: '-25px',
                            display: 'flex',
                            gap: '8px'
                          }}
                        >
                          {/* Produtos da categoria atual */}
                          {getProductsByCategory(category.name).map((product, productIndex) => (
                            <div 
                              key={product.id}
                              onClick={() => openProductModal(product)}
                              style={{
                                  width: '96px',
                                  height: '138px',
                                backgroundColor: 'white',
                                border: '1px solid #e5e5e5',
                                borderRadius: '4px',
                                position: 'relative',
                                cursor: 'pointer'
                              }}
                            >
                              {/* Imagem na parte superior */}
                              <div
                                style={{
                                  position: 'absolute',
                                  top: '0',
                                  left: '0',
                                  right: '0',
                                    height: '69px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  overflow: 'hidden',
                                  borderTopLeftRadius: '4px',
                                  borderTopRightRadius: '4px'
                                }}
                              >
                                <img
                                  src={product.imageUrl || 'https://client-assets.anota.ai/produtos/6866d16e54c51f0012cb568e/202105121045_PUE3_blob.webp'}
                                  alt={product.name}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                />
                              </div>
                              
                              {/* Linha horizontal no meio */}
                              <div
                                style={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '0',
                                  right: '0',
                                  height: '1px',
                                  backgroundColor: 'transparent',
                                  transform: 'translateY(-50%)'
                                }}
                              ></div>
                              
                              {/* Texto centralizado na parte de baixo */}
                              <div
                                style={{
                                  position: 'absolute',
                                  bottom: '0',
                                  left: '0',
                                  right: '0',
                                    height: '69px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                    fontSize: '10px',
                                  color: '#333',
                                  textAlign: 'center',
                                  padding: '2px',
                                  lineHeight: '1.1'
                                }}
                              >
                                <span style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  lineHeight: '1.1',
                                    maxHeight: '25px'
                                }}>
                                  {product.name}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Caixa branca 2 - 30% */}
            <div
              className="bg-white"
              style={{
                width: '30%',
                height: '544px',
                borderRadius: '1px',
                position: 'relative'
              }}
            >
              {/* Barra cinza */}
              <div
                className="flex justify-between items-center px-2"
                style={{
                  width: '100%',
                  height: '40px',
                  backgroundColor: '#E1E1E1'
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: '500', color: '#333' }}>
                  Itens do pedido
                </span>
                <span style={{ fontSize: '12px', fontWeight: '500', color: '#333' }}>
                  Subtotal
                </span>
              </div>
              
              {/* Área dos itens futuros */}
              <div
                  className="flex flex-col"
                style={{
                  width: '100%',
                    height: 'calc(544px - 80px)',
                    overflowY: 'auto'
                }}
              >
                  {selectedItems.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                <span style={{ fontSize: '14px', color: '#666', textAlign: 'center' }}>
                  Finalize o item ao lado, ele vai aparecer aqui
                </span>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {selectedItems.map((item, index) => (
                        <div key={`${item.id}-${index}`} className="group hover:bg-purple-50">
                          {/* Item principal */}
                          <div
                            className="flex justify-between items-start px-2 py-2"
                            style={{
                              borderBottom: item.additionals?.length ? '1px dashed #E1E1E1' : '1px solid #E1E1E1',
                              minHeight: '32px'
                            }}
                          >
                            <div className="flex items-start gap-1" style={{ maxWidth: 'calc(100% - 120px)' }}>
                              <span style={{ fontSize: '13px', color: '#374151', flexShrink: 0 }}>
                                {item.quantity}x
                              </span>
                              <span style={{ 
                                fontSize: '13px', 
                                color: '#374151', 
                                marginLeft: '4px',
                                wordBreak: 'break-word'
                              }}>
                                {item.name}
                              </span>
                            </div>
                            <div className="flex items-center" style={{ flexShrink: 0, minWidth: '110px' }}>
                              <span style={{ fontSize: '13px', color: '#374151', marginRight: '8px' }}>
                                R$ {calculateItemTotal(item)}
                              </span>
                              {/* Ícones de ação - visíveis apenas no hover */}
                              <div className="hidden group-hover:flex items-center gap-2">
                                <button
                                  onClick={() => handleEditItem(index)}
                                  className="text-purple-600 hover:text-purple-700 transition-colors"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor">
                                    <path d="M360-600v-80h360v80H360Zm0 120v-80h360v80H360ZM560-80v-123l221-220q9-9 20-13t22-4q12 0 23 4.5t20 13.5l37 37q8 9 12.5 20t4.5 22q0 11-4 22.5T903-300L683-80H560Zm263-224 37-39-37-37-38 38 38 38ZM240-80q-50 0-85-35t-35-85v-120h120v-560h600v361q-20-2-40.5 1.5T760-505v-295H320v480h240l-80 80v160H240Z"/>
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(index)}
                                  className="text-purple-600 hover:text-purple-700 transition-colors"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 6h18"></path>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Adicionais */}
                          {item.additionals && item.additionals.length > 0 && (
                            <div className="px-2 group-hover:bg-purple-100 transition-colors" style={{ backgroundColor: '#f9fafb' }}>
                              {/* Título da Categoria */}
                              <div style={{ 
                                fontSize: '11px', 
                                color: '#6B7280', 
                                paddingTop: '1px',
                                paddingBottom: '1px'
                              }}>
                                {item.additionals[0].category}:
                              </div>
                              
                              {/* Lista de adicionais */}
                              {item.additionals.map((additional, addIndex) => (
                                <div
                                  key={`${additional.id}-${addIndex}`}
                                  className="flex justify-between items-center"
                                  style={{
                                    borderBottom: addIndex === item.additionals!.length - 1 ? 'none' : '1px dashed #E1E1E1',
                                    minHeight: '20px'
                                  }}
                                >
                                  <span style={{ fontSize: '12px', color: '#4B5563', paddingLeft: '4px' }}>
                                    {additional.name}
                                  </span>
                                  <span style={{ fontSize: '12px', color: '#4B5563' }}>
                                    R$ {additional.price}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Linha divisória sólida após os adicionais */}
                          {item.additionals?.length > 0 && (
                            <div style={{ borderBottom: '1px solid #E1E1E1' }}></div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
              </div>
              
              {/* Segunda caixa de endereço (nova) */}




            </div>
          </div>
          
          {/* Container dos cards de baixo */}
          <div style={{ 
            display: 'flex', 
            marginTop: '8px', 
            marginBottom: '8px', 
            marginLeft: '24px', 
            marginRight: '24px' 
          }}>
            {/* Card branco com barra de pesquisa e botões */}
          <div
            className="bg-white"
            style={{
                width: 'calc(70% - 6px)',
              height: '195px',
              borderRadius: '1px',
              border: '1px solid #e5e7eb'
            }}
          >
              {/* Conteúdo do card branco */}
            <div className="p-4">
              
                {/* Botões de pagamento */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                  {/* Coluna 1 - DINHEIRO e DÉBITO */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <button
                      onClick={() => {
                        if (selectedItems.length === 0) {
                          showNotification('ADICIONE PEDIDOS NA SACOLA')
                          return
                        }
                        if (!validarEnderecoAntesPagamento()) {
                          return
                        }
                        openDinheiroModal()
                      }}
                style={{
                        backgroundColor: '#6ca23d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '12px 24px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        height: '50px'
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLElement).style.backgroundColor = '#5a8a32'
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLElement).style.backgroundColor = '#6ca23d'
                      }}
                    >
                      DINHEIRO
                    </button>
                    
                    <button
                      onClick={() => {
                        if (selectedItems.length === 0) {
                          showNotification('ADICIONE PEDIDOS NA SACOLA')
                          return
                        }
                        if (!validarEnderecoAntesPagamento()) {
                          return
                        }
                        openDebitoModal()
                      }}
                      style={{
                        backgroundColor: '#6ca23d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '12px 24px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        height: '50px'
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLElement).style.backgroundColor = '#5a8a32'
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLElement).style.backgroundColor = '#6ca23d'
                      }}
                    >
                      DÉBITO
                    </button>
                    
                    <button
                      onClick={() => {
                        openObservacaoModal()
                      }}
                      style={{
                        backgroundColor: observacao ? '#6ca23d' : 'white',
                        color: observacao ? 'white' : '#6ca23d',
                        border: '1px solid #6ca23d',
                        borderRadius: '4px',
                        padding: '12px 24px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center'
                      }}
                      onMouseEnter={(e) => {
                        const target = e.target as HTMLElement
                        if (target && target.style) {
                          target.style.backgroundColor = '#5a8a32'
                          target.style.color = 'white'
                        }
                      }}
                      onMouseLeave={(e) => {
                        const target = e.target as HTMLElement
                        if (target && target.style) {
                          target.style.backgroundColor = observacao ? '#6ca23d' : 'white'
                          target.style.color = observacao ? 'white' : '#6ca23d'
                        }
                      }}
                    >
                      {observacao ? 'OBSERVAÇÃO ADICIONADA' : 'ADICIONAR OBSERVAÇÃO'}
                    </button>
                </div>
                
                  {/* Coluna 2 - PIX e CRÉDITO */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <button
                      onClick={() => {
                        if (selectedItems.length === 0) {
                          showNotification('ADICIONE PEDIDOS NA SACOLA')
                          return
                        }
                        if (!validarEnderecoAntesPagamento()) {
                          return
                        }
                        openPixModal()
                      }}
                      style={{
                        backgroundColor: '#6ca23d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '12px 24px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        height: '50px'
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLElement).style.backgroundColor = '#5a8a32'
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLElement).style.backgroundColor = '#6ca23d'
                      }}
                    >
                      PIX
                    </button>
                    
                    <button
                      onClick={() => {
                        if (selectedItems.length === 0) {
                          showNotification('ADICIONE PEDIDOS NA SACOLA')
                          return
                        }
                        if (!validarEnderecoAntesPagamento()) {
                          return
                        }
                        openCreditoModal()
                      }}
                      style={{
                        backgroundColor: '#6ca23d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '12px 24px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        height: '50px'
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLElement).style.backgroundColor = '#5a8a32'
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLElement).style.backgroundColor = '#6ca23d'
                      }}
                    >
                      CRÉDITO
                    </button>
                    
                    <button
                      onClick={() => {
                        if (selectedItems.length === 0) {
                          showNotification('ADICIONE PEDIDOS NA SACOLA')
                          return
                        }
                        if (!validarEnderecoAntesPagamento()) {
                          return
                        }
                        openAcrescimoDescontoModal()
                      }}
                      style={{
                        backgroundColor: 'white',
                        color: '#6ca23d',
                        border: '1px solid #6ca23d',
                        borderRadius: '4px',
                        padding: '12px 24px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        height: '50px'
                      }}
                      onMouseEnter={(e) => {
                        const target = e.target as HTMLElement
                        if (target && target.style) {
                          target.style.backgroundColor = '#6ca23d'
                          target.style.color = 'white'
                        }
                      }}
                      onMouseLeave={(e) => {
                        const target = e.target as HTMLElement
                        if (target && target.style) {
                          target.style.backgroundColor = 'white'
                          target.style.color = '#6ca23d'
                        }
                      }}
                    >
                      ACR/DES
                    </button>
                  </div>
                  
                  {/* Coluna 4 - Card cinza vertical unificado */}
                  <div
                    style={{
                      backgroundColor: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      padding: '16px 12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      height: '166px', // 50px + 8px gap + 50px + 8px gap + 50px
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                      <svg viewBox="0 0 24 24" height="24px" width="24px" fill="#6b7280">
                        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7 8.5 7 9.71C7 10.93 7.89 12.1 8 12.27C8.14 12.44 9.76 14.94 12.25 16C12.84 16.27 13.3 16.42 13.66 16.53C14.25 16.72 14.79 16.69 15.22 16.63C15.7 16.56 16.68 16.03 16.89 15.45C17.1 14.87 17.1 14.38 17.04 14.27C16.97 14.17 16.81 14.11 16.56 14C16.31 13.86 15.09 13.26 14.87 13.18C14.64 13.1 14.5 13.06 14.31 13.3C14.15 13.55 13.67 14.11 13.53 14.27C13.38 14.44 13.24 14.46 13 14.34C12.74 14.21 11.94 13.95 11 13.11C10.26 12.45 9.77 11.64 9.62 11.39C9.5 11.15 9.61 11 9.73 10.89C9.84 10.78 10 10.6 10.1 10.45C10.23 10.31 10.27 10.2 10.35 10.04C10.43 9.87 10.39 9.73 10.33 9.61C10.27 9.5 9.77 8.26 9.56 7.77C9.36 7.29 9.16 7.35 9 7.34C8.86 7.34 8.7 7.33 8.53 7.33Z"/>
                      </svg>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <input
                          type="text"
                          placeholder="(XX) X XXXX-XXXX *"
                          value={telefoneCliente}
                          onChange={(e) => {
                            setTelefoneCliente(aplicarMascaraTelefone(e.target.value))
                            if (mostrarErroTelefone) {
                              setMostrarErroTelefone(false)
                            }
                          }}
                          required
                          disabled={semCliente}
                          style={{
                            width: '100%',
                            height: '32px',
                            padding: '6px 10px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '13px',
                            backgroundColor: semCliente ? '#f3f4f6' : 'white',
                            color: semCliente ? '#9ca3af' : '#374151',
                            outline: 'none',
                            cursor: semCliente ? 'not-allowed' : 'text'
                          }}
                          onFocus={(e) => {
                            if (!semCliente) {
                              e.target.style.borderColor = '#542583'
                            }
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#d1d5db'
                          }}
                        />
                        {!semCliente && mostrarErroTelefone && telefoneCliente.trim() === '' && (
                          <div style={{
                            position: 'absolute',
                            bottom: '-18px',
                            left: '0px',
                            color: '#dc2626',
                            fontSize: '10px',
                            fontWeight: '500'
                          }}>
                            Obrigatório
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="checkbox"
                          id="semCliente"
                          checked={semCliente}
                          onChange={(e) => setSemCliente(e.target.checked)}
                          style={{
                            width: '16px',
                            height: '16px',
                            accentColor: '#542583',
                            cursor: 'pointer'
                          }}
                        />
                        <label
                          htmlFor="semCliente"
                          style={{
                            fontSize: '13px',
                            color: '#374151',
                            fontWeight: '500',
                            cursor: 'pointer',
                            userSelect: 'none',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Sem cliente
                        </label>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6b7280">
                        <path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z"/>
                      </svg>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <input
                          type="text"
                          placeholder="Nome do cliente *"
                          value={nomeCliente}
                          onChange={(e) => {
                            setNomeCliente(e.target.value)
                            if (mostrarErroNome) {
                              setMostrarErroNome(false)
                            }
                          }}
                          required
                          disabled={semCliente}
                          style={{
                            width: '100%',
                            height: '32px',
                            padding: '6px 10px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '13px',
                            backgroundColor: semCliente ? '#f3f4f6' : 'white',
                            color: semCliente ? '#9ca3af' : '#374151',
                            outline: 'none',
                            cursor: semCliente ? 'not-allowed' : 'text'
                          }}
                          onFocus={(e) => {
                            if (!semCliente) {
                              e.target.style.borderColor = '#542583'
                            }
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#d1d5db'
                          }}
                        />
                        {!semCliente && mostrarErroNome && nomeCliente.trim() === '' && (
                          <div style={{
                            position: 'absolute',
                            bottom: '-18px',
                            left: '0px',
                            color: '#dc2626',
                            fontSize: '10px',
                            fontWeight: '500'
                          }}>
                            Obrigatório
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', width: '100%', minWidth: '280px', overflow: 'hidden' }}>
                      {/* Ícones dinâmicos baseados na forma de entrega */}
                      {selectedFormaEntrega === 'E' && (
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6b7280" style={{ marginTop: '2px' }}>
                          <path d="M120-640v-200h280v200H120Zm80-80h120v-40H200v40Zm80 520q-50 0-85-35t-35-85H80v-120q0-66 47-113t113-47h160v200h140l140-174v-106H560v-80h120q33 0 56.5 23.5T760-680v134L580-320H400q0 50-35 85t-85 35Zm0-80q17 0 28.5-11.5T320-320h-80q0 17 11.5 28.5T280-280Zm480 80q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35Zm0-80q17 0 28.5-11.5T800-320q0-17-11.5-28.5T760-360q-17 0-28.5 11.5T720-320q0 17 11.5 28.5T760-280ZM160-400h160v-120h-80q-33 0-56.5 23.5T160-440v40Zm160-320v-40 40Zm0 320Z"/>
                        </svg>
                      )}
                      
                      {selectedFormaEntrega === 'R' && (
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6b7280" style={{ marginTop: '2px' }}>
                          <path d="M200-80q-33 0-56.5-23.5T120-160v-480q0-33 23.5-56.5T200-720h80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720h80q33 0 56.5 23.5T840-640v480q0 33-23.5 56.5T760-80H200Zm0-80h560v-480H200v480Zm280-240q83 0 141.5-58.5T680-600h-80q0 50-35 85t-85 35q-50 0-85-35t-35-85h-80q0 83 58.5 141.5T480-400ZM360-720h240q0-50-35-85t-85-35q-50 0-85 35t-35 85ZM200-160v-480 480Z"/>
                        </svg>
                      )}
                      
                      {selectedFormaEntrega === 'C' && (
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6b7280" style={{ marginTop: '2px' }}>
                          <path d="M400-80v-80h520v80H400Zm40-120q0-81 51-141.5T620-416v-25q0-17 11.5-28.5T660-481q17 0 28.5 11.5T700-441v25q77 14 128.5 74.5T880-200H440Zm105-81h228q-19-27-48.5-43.5T660-341q-36 0-66 16.5T545-281Zm114 0ZM40-440v-440h240v58l280-78 320 100v40q0 50-35 85t-85 35h-80v24q0 25-14.5 45.5T628-541L358-440H40Zm80-80h80v-280h-80v280Zm160 0h64l232-85q11-4 17.5-13.5T600-640h-71l-117 38-24-76 125-42h247q9 0 22.5-6.5T796-742l-238-74-278 76v220Z"/>
                        </svg>
                      )}
                      
                      {!selectedFormaEntrega && (
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6b7280" style={{ marginTop: '2px' }}>
                          <path d="M120-640v-200h280v200H120Zm80-80h120v-40H200v40Zm80 520q-50 0-85-35t-35-85H80v-120q0-66 47-113t113-47h160v200h140l140-174v-106H560v-80h120q33 0 56.5 23.5T760-680v134L580-320H400q0 50-35 85t-85 35Zm0-80q17 0 28.5-11.5T320-320h-80q0 17 11.5 28.5T280-280Zm480 80q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35Zm0-80q17 0 28.5-11.5T800-320q0-17-11.5-28.5T760-360q-17 0-28.5 11.5T720-320q0 17 11.5 28.5T760-280ZM160-400h160v-120h-80q-33 0-56.5 23.5T160-440v40Zm160-320v-40 40Zm0 320Z"/>
                        </svg>
                      )}
                      <span style={{ 
                        fontSize: '13px', 
                        color: '#6b7280', 
                        fontWeight: '500',
                        width: '234px',
                        lineHeight: '1.3',
                        wordWrap: 'break-word',
                        minHeight: '34px',
                        whiteSpace: 'pre-line',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {getTextoEnderecoCard()}
                      </span>
                      <button
                        onClick={() => {
                          openFormaEntregaModal()
                        }}
                        style={{
                          backgroundColor: '#542583',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '8px 16px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginLeft: 'auto'
                        }}
                        onMouseEnter={(e) => {
                          (e.target as HTMLElement).style.backgroundColor = '#4a1f6b'
                        }}
                        onMouseLeave={(e) => {
                          (e.target as HTMLElement).style.backgroundColor = '#542583'
                        }}
                      >
                        {selectedFormaEntrega ? 'Trocar' : '+'}
                      </button>
                    </div>
                  </div>
                </div>
                </div>
              </div>
              
                        {/* Card branco com dados de pagamento */}
              <div
                style={{
                width: '30%',
                height: '195px',
                backgroundColor: 'white',
                borderRadius: '1px',
                border: '1px solid #e5e7eb',
                marginLeft: 'auto',
                display: 'flex',
                flexDirection: 'column'
                }}
              >
              {/* Resumo financeiro dinâmico */}
              <div 
                style={{
                padding: '16px',
                display: 'grid',
                gridTemplateColumns: (() => {
                  // Calcular quantas colunas são necessárias
                  let colunas = 2; // Subtotal + A Pagar (sempre aparecem)
                  if (priceToNumber(valorAcrescimo) > 0 || priceToNumber(valorDesconto) > 0) colunas++;
                  if (priceToNumber(calcularValorPago()) > 0) colunas++;
                  if (priceToNumber(taxaEntrega) > 0) colunas++;
                  return `repeat(${colunas}, 1fr)`;
                })(),
                gap: '8px',
                  borderBottom: '1px solid #e5e7eb',
                  position: 'relative',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(84, 37, 131, 0.1)'
                  // Mostrar overlay
                  const overlay = e.currentTarget.querySelector('.hover-overlay') as HTMLElement
                  if (overlay) {
                    overlay.style.opacity = '1'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  // Esconder overlay
                  const overlay = e.currentTarget.querySelector('.hover-overlay') as HTMLElement
                  if (overlay) {
                    overlay.style.opacity = '0'
                  }
                }}
                onClick={openDetalhesFinanceirosModal}
              >
                {/* Subtotal - sempre aparece */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#6b7280', 
                    marginBottom: '4px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    Subtotal
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#374151', 
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {calculateSubtotal()}
                  </div>
                </div>
                
                {/* Acréscimo/Desconto - só aparece se tiver valor */}
                {(priceToNumber(valorAcrescimo) > 0 || priceToNumber(valorDesconto) > 0) && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#6b7280', 
                      marginBottom: '4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {priceToNumber(valorAcrescimo) > 0 ? 'Acréscimo' : 'Desconto'}
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#374151', 
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {priceToNumber(valorAcrescimo) > 0 ? valorAcrescimo : valorDesconto}
                    </div>
                  </div>
                )}
                
                {/* Pago - só aparece se tiver valor */}
                {priceToNumber(calcularValorPago()) > 0 && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#6b7280', 
                      marginBottom: '4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      Pago
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#374151', 
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {calcularValorPago()}
                    </div>
                  </div>
                )}
                
                {/* Entrega - só aparece se tiver valor */}
                {priceToNumber(taxaEntrega) > 0 && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#6b7280', 
                      marginBottom: '4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      Entrega
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#374151', 
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {taxaEntrega}
                    </div>
                  </div>
                )}
                
                {/* A Pagar / Troco - sempre aparece */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#6b7280', 
                    marginBottom: '4px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {temTroco() ? 'Troco' : 'A Pagar'}
                  </div>
                  <div style={{ 
                    fontSize: '16px', 
                    color: '#542583', 
                    fontWeight: '700',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {temTroco() ? calcularTrocoExibicao() : calcularValorAPagar()}
                  </div>
                </div>

                {/* Hover overlay para toda a caixa */}
                <div 
                  onClick={() => {
                    // Mostrar resumo dos itens selecionados
                    const itensResumo = selectedItems.map(item => 
                      `${item.quantity}x ${item.name}`
                    ).join(', ')
                    
                    if (itensResumo) {
                      showNotification(`ITENS: ${itensResumo}`)
                    } else {
                      showNotification('SACOLA VAZIA')
                    }
                  }}
                  style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    backgroundColor: 'rgba(84, 37, 131, 0.25)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    borderRadius: '4px',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    cursor: 'pointer'
                  }}
                  className="hover-overlay"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0'
                  }}
                >
                  VER ITENS
                </div>
              </div>
              
              {/* Botões de ação */}
              <div style={{ 
                flex: 1, 
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                                {/* Botão Finalizar (largura total) */}
                <button
                  onClick={() => {
                    if (selectedItems.length === 0) {
                      showNotification('ADICIONE PEDIDOS NA SACOLA')
                      return
                    }
                    if (!validarEnderecoAntesPagamento()) {
                      return
                    }
                    
                    // Verificar se não há valor a pagar
                    const valorAPagar = priceToNumber(calcularValorAPagar())
                    if (valorAPagar <= 0) {
                      // Finalizar pedido diretamente
                      finalizarPedidoDireto()
                    } else {
                      // Mostrar notificação indicando que há valor a pagar
                      showNotification('HÁ VALOR A PAGAR!')
                    }
                  }}
            style={{
                    width: '100%',
                    height: '40px',
                    backgroundColor: '#542583',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 12px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#4a1f6b'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#542583'
                  }}
                >
                  <span>Finalizar</span>
                  <svg width="16" height="16" viewBox="0 0 48 48" fill="currentColor">
                    <path d="M40.6 12.1L17 35.7 7.4 26.1 4.6 29 17 41.3 43.4 14.9z"></path>
                  </svg>
                </button>
                
               
                
                {/* Botões Cancelar e Limpar lado a lado */}
                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                      onClick={openCancelarModal}
                    style={{
                      flex: 1,
                      height: '40px',
                      backgroundColor: 'white',
                      color: '#dc2626',
                      border: '1px solid #dc2626',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0 12px'
            }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#dc2626'
                      e.target.style.color = 'white'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'white'
                      e.target.style.color = '#dc2626'
                    }}
                  >
                    <span>Cancelar</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.576,19.721l-6.707-9.287l4.354-5.399c0.433-0.538,0.349-1.325-0.188-1.758c-0.537-0.434-1.325-0.349-1.758,0.188	l-3.926,4.868L9.057,3.771C8.707,3.287,8.146,3,7.549,3H4.078C3.42,3,3.039,3.746,3.424,4.279l5.762,7.978l-5.409,6.707	c-0.433,0.538-0.349,1.325,0.188,1.758C4.196,20.909,4.474,21,4.749,21c0.365,0,0.727-0.159,0.974-0.465l4.981-6.176l4.24,5.87	c0.35,0.484,0.91,0.771,1.507,0.771h3.471C20.58,21,20.961,20.254,20.576,19.721z"></path>
                    </svg>
                  </button>
                  
                  <button
                    onClick={abrirModalLimpeza}
                    style={{
                      flex: 1,
                      height: '40px',
                      backgroundColor: '#542583',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0 12px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#4a1f6b'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#542583'
                    }}
                  >
                    <span>Cancelar</span>
                    <svg width="16" height="16" viewBox="0 0 30 30" fill="currentColor">
                      <path d="M 14.984375 2.4863281 A 1.0001 1.0001 0 0 0 14 3.5 L 14 4 L 8.5 4 A 1.0001 1.0001 0 0 0 7.4863281 5 L 6 5 A 1.0001 1.0001 0 1 0 6 7 L 24 7 A 1.0001 1.0001 0 1 0 24 5 L 22.513672 5 A 1.0001 1.0001 0 0 0 21.5 4 L 16 4 L 16 3.5 A 1.0001 1.0001 0 0 0 14.984375 2.4863281 z M 6 9 L 7.7929688 24.234375 C 7.9109687 25.241375 8.7633438 26 9.7773438 26 L 20.222656 26 C 21.236656 26 22.088031 25.241375 22.207031 24.234375 L 24 9 L 6 9 z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )}

    {/* Modal de Produto */}
    {isProductModalVisible && (
      <>
        {/* Overlay */}
        <div 
          className="fixed inset-0"
          style={{
            backgroundColor: isProductModalAnimating ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
            transition: 'all 0.3s ease-out',
            zIndex: 60
          }}
          onClick={closeProductModal}
        ></div>
        
        {/* Modal Content */}
        <div 
          className="fixed top-1/2 left-1/2 bg-white"
          style={{
            width: '585px',
              height: '750px',
            borderRadius: '4px',
            transform: isProductModalAnimating ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.3)',
            opacity: isProductModalAnimating ? 1 : 0,
            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              zIndex: 61,
              display: 'flex',
              flexDirection: 'column'
          }}
        >
          {/* Botão de fechar */}
          <button
            onClick={closeProductModal}
            className="absolute"
            style={{
              top: '8px',
              right: '16px',
              fontSize: '32px',
              lineHeight: '1',
              color: '#9ca3af',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.color = '#1f2937'
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.color = '#9ca3af'
            }}
          >
            ×
          </button>
          
            {/* Cabeçalho fixo */}
            <div style={{ padding: '24px 24px 16px 24px', borderBottom: '1px solid #e5e7eb' }}>
          {/* Título do produto */}
          <div 
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#374151',
                  marginBottom: '2px'
            }}
          >
            {selectedProduct?.name || 'Produto'}
          </div>
          
          {/* Descrição do produto */}
          {selectedProduct?.description && (
            <div 
              style={{
                fontSize: '14px',
                color: '#6b7280',
                lineHeight: '1.5'
              }}
            >
              {selectedProduct.description}
            </div>
          )}
            </div>
          
            {/* Conteúdo rolável - Adicionais */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px 0 24px' }}>
          {selectedProduct?.additionals && selectedProduct.additionals.length > 0 && (
                <>
              <h3 
                style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#374151',
                      marginBottom: '8px'
                }}
              >
                Adicionais
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedProduct.additionals.map((additionalId, index) => {
                  const additional = firebaseProducts.find(p => p.id === additionalId) || 
                                   savedAdditionals?.find(a => a.id === additionalId);
                  
                  if (!additional) return null;
                  
                  return (
                    <div 
                      key={additionalId}
                      style={{
                        display: 'flex',
                            alignItems: 'center',
                        gap: '12px',
                        padding: '8px 0',
                        borderBottom: index === selectedProduct.additionals.length - 1 ? 'none' : '1px solid #e5e7eb'
                      }}
                    >
                          {/* Imagem do adicional */}
                          <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '0px',
                            overflow: 'hidden',
                          flexShrink: 0
                          }}>
                            <img
                              src={additional.imageUrl || '/product-placeholder.jpg'}
                              alt={additional.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                      </div>
                      
                      {/* Informações do adicional */}
                      <div style={{ flex: 1 }}>
                        {/* Nome do adicional */}
                        <div 
                          style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                                marginBottom: '2px'
                          }}
                        >
                          {additional.name}
                        </div>
                        
                        {/* Descrição do adicional (se houver) */}
                        {additional.description && (
                          <div 
                            style={{
                              fontSize: '12px',
                              color: '#6b7280',
                              lineHeight: '1.4',
                              marginBottom: '4px'
                            }}
                          >
                            {additional.description}
                          </div>
                        )}
                        
                        {/* Valor do adicional */}
                        <div 
                          style={{
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#542583'
                          }}
                        >
                          R$ {additional.price ? Number(additional.price).toFixed(2).replace('.', ',') : '0,00'}
                        </div>
                      </div>

                          {/* Checkbox personalizado */}
                          <label className="custom-checkmark" style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                              type="checkbox"
                              checked={selectedAdditionals.includes(additionalId)}
                              onChange={() => handleAdditionalToggle(additionalId)}
                            />
                            <span className="checkmark"></span>
                          </label>
                    </div>
                  );
                })}
              </div>
                </>
              )}
            </div>

            {/* Rodapé fixo */}
            <div style={{
              height: '76px',
              borderTop: '1px solid #e5e7eb',
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'white'
            }}>
              {/* Botão com controles de quantidade */}
              <div
                style={{
                  width: '96px',
                  height: '40px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'white',
                  padding: '0 8px'
                }}
              >
                <button
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  style={{
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    color: '#542583',
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: 'transparent',
                    padding: 0
                  }}
                  className="hover:opacity-80 transition-opacity"
                >
                  -
                </button>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(prev => prev + 1)}
                  style={{
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    color: '#542583',
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: 'transparent',
                    padding: 0
                  }}
                  className="hover:opacity-80 transition-opacity"
                >
                  +
                </button>
              </div>

              {/* Grupo de botões da direita */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={closeProductModal}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddItem}
                  style={{
                    padding: '8px 24px',
                    backgroundColor: '#542583',
                    border: 'none',
                    borderRadius: '4px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                  className="hover:opacity-90 transition-opacity"
                >
                  {editingItemIndex !== null ? 'Editar' : 'Adicionar'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal de Exclusão */}
      {isDeleteModalVisible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          style={{
            opacity: isDeleteModalAnimating ? 1 : 0,
            transition: 'opacity 0.4s ease-in-out'
          }}
        >
          <div 
            className="bg-white rounded-lg"
            style={{
              width: '400px',
              padding: '24px',
              transform: isDeleteModalAnimating ? 'scale(1)' : 'scale(0.95)',
              transition: 'transform 0.4s ease-in-out',
              position: 'relative'
            }}
          >
            {/* Botão de fechar */}
            <button
              onClick={closeDeleteModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Título */}
            <h3 
              className="mb-2"
              style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#111827'
              }}
            >
              Excluir item
            </h3>

            {/* Mensagem */}
            <p 
              className="mb-6"
              style={{
                fontSize: '14px',
                color: '#6B7280'
              }}
            >
              Deseja realmente excluir o item {itemToDelete?.name}?
            </p>

            {/* Botões */}
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 border border-gray-300 rounded-md"
                style={{ height: '40px' }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-md"
                style={{ height: '40px' }}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Entrega */}
      {isEntregaModalVisible && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0"
            style={{
              backgroundColor: isEntregaModalAnimating ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
              transition: 'all 0.3s ease-out',
              zIndex: 70
            }}
            onClick={closeEntregaModal}
          ></div>
          
          {/* Modal Content */}
          <div 
            className="fixed top-1/2 left-1/2 bg-white"
            style={{
              width: '600px',
              height: '500px',
              borderRadius: '4px',
              transform: isEntregaModalAnimating ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.3)',
              opacity: isEntregaModalAnimating ? 1 : 0,
              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              zIndex: 71,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Botão de fechar */}
            <button
              onClick={closeEntregaModal}
              className="absolute"
              style={{
                top: '8px',
                right: '16px',
                fontSize: '32px',
                lineHeight: '1',
                color: '#9ca3af',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#1f2937'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#9ca3af'
              }}
            >
              ×
            </button>

            {/* Conteúdo do Modal */}
            <div className="flex-1 p-6">
              {/* Título */}
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Forma de Entrega
              </h2>
              
              {/* Botões de navegação */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setSelectedEntregaType('delivery')}
                  style={{
                    flex: 1,
                    height: '48px',
                    backgroundColor: selectedEntregaType === 'delivery' ? '#542583' : 'transparent',
                    color: selectedEntregaType === 'delivery' ? 'white' : '#542583',
                    border: '1px solid #542583',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  className="hover:opacity-90"
                >
                  Entrega (Delivery)
                </button>
                <button
                  onClick={() => setSelectedEntregaType('retirada')}
                  style={{
                    flex: 1,
                    height: '48px',
                    backgroundColor: selectedEntregaType === 'retirada' ? '#542583' : 'transparent',
                    color: selectedEntregaType === 'retirada' ? 'white' : '#542583',
                    border: '1px solid #542583',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  className="hover:opacity-90"
                >
                  Retirar no Local
                </button>
                <button
                  onClick={() => setSelectedEntregaType('local')}
                  style={{
                    flex: 1,
                    height: '48px',
                    backgroundColor: selectedEntregaType === 'local' ? '#542583' : 'transparent',
                    color: selectedEntregaType === 'local' ? 'white' : '#542583',
                    border: '1px solid #542583',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  className="hover:opacity-90"
                >
                  Consumir no Local
                </button>
              </div>

              {/* Conteúdo específico para cada tipo */}
              <div className="mt-4">
                {selectedEntregaType === 'delivery' && (
                  <div className="flex flex-col">
                    <h3 className="text-lg font-medium text-gray-700 mb-4">
                      Endereço de entrega:
                    </h3>
                    <div className="flex flex-col items-center justify-center h-64">
                      <button
                        style={{
                          height: '48px',
                          backgroundColor: 'transparent',
                          color: '#542583',
                          border: '1px solid #542583',
                          borderRadius: '4px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          padding: '0 24px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        className="hover:opacity-90"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Novo Endereço
                      </button>
                    </div>
                  </div>
                )}
                {selectedEntregaType === 'retirada' && (
                  <div>
                    {/* Conteúdo para retirada */}
                  </div>
                )}
                {selectedEntregaType === 'local' && (
                  <div>
                    {/* Conteúdo para consumo no local */}
                  </div>
                )}
              </div>
          </div>
        </div>
      </>
    )}

    {/* Modal de Pagamento em Dinheiro */}
    {isDinheiroModalVisible && (
      <>
                  {/* Overlay */}
          <div 
            className="fixed inset-0"
            style={{
              backgroundColor: isDinheiroModalAnimating ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
              transition: 'all 0.3s ease-out',
              zIndex: 70
            }}
            onClick={(e) => {
              // Fechar dropdown se clicar fora dele
              if (dropdownPagamentoDinheiroAberto) {
                setDropdownPagamentoDinheiroAberto(false)
              } else {
                closeDinheiroModal()
              }
            }}
          ></div>
        
        {/* Modal Content */}
        <div 
          className="fixed top-1/2 left-1/2 bg-white"
          style={{
            width: '400px',
            borderRadius: '4px',
            transform: isDinheiroModalAnimating ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.3)',
            opacity: isDinheiroModalAnimating ? 1 : 0,
            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            zIndex: 71
          }}
        >
          {/* Botão X para fechar */}
          <button
            onClick={closeDinheiroModal}
            className="absolute text-gray-400 hover:text-gray-600 transition-colors"
            style={{ 
              fontSize: '32px', 
              lineHeight: '1',
              top: '8px',
              right: '16px'
            }}
          >
            ×
          </button>
          
          {/* Cabeçalho */}
          <div style={{ padding: '24px 24px 16px 24px', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ 
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#374151',
              margin: 0
            }}>
              Pagamento em Dinheiro
            </h2>
          </div>
          
          {/* Conteúdo */}
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Campo de valor recebido */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Valor Recebido
                </label>
                <input
                  type="text"
                  value={valorRecebidoTemp}
                  onChange={(e) => {
                    const novoValor = formatMoney(e.target.value)
                    setValorRecebidoTemp(novoValor)
                  }}
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#542583'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db'
                  }}
                />
              </div>

              {/* Campo Quando Receber */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Quando Receber
                </label>
                
                <div style={{ position: 'relative', width: '100%' }}>
                  <button
                    onClick={() => setDropdownPagamentoDinheiroAberto(!dropdownPagamentoDinheiroAberto)}
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '0 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      background: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '14px',
                      color: '#374151',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.borderColor = '#542583'}
                    onMouseLeave={(e) => e.target.style.borderColor = '#d1d5db'}
                  >
                    <span>{pagamentoDinheiroTemp === 'agora' ? 'Agora' : 'Na entrega'}</span>
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      style={{
                        transform: dropdownPagamentoDinheiroAberto ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s'
                      }}
                    >
                      <polyline points="6,9 12,15 18,9"></polyline>
                    </svg>
                  </button>
                  
                  {/* Menu Dropdown */}
                  {dropdownPagamentoDinheiroAberto && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: '0',
                        right: '0',
                        marginTop: '4px',
                        background: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        zIndex: 10,
                        maxHeight: '200px',
                        overflowY: 'auto'
                      }}
                    >
                      <button
                        onClick={() => {
                          setPagamentoDinheiroTemp('agora')
                          setDropdownPagamentoDinheiroAberto(false)
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          fontSize: '14px',
                          color: '#374151',
                          background: pagamentoDinheiroTemp === 'agora' ? '#f3e8ff' : 'transparent',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s',
                          display: 'block'
                        }}
                        onMouseEnter={(e) => {
                          if (pagamentoDinheiroTemp !== 'agora') {
                            e.target.style.backgroundColor = '#f9fafb'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (pagamentoDinheiroTemp !== 'agora') {
                            e.target.style.backgroundColor = 'transparent'
                          }
                        }}
                      >
                        Agora
                      </button>
                      <button
                        onClick={() => {
                          setPagamentoDinheiroTemp('entrega')
                          setDropdownPagamentoDinheiroAberto(false)
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          fontSize: '14px',
                          color: '#374151',
                          background: pagamentoDinheiroTemp === 'entrega' ? '#f3e8ff' : 'transparent',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s',
                          display: 'block'
                        }}
                        onMouseEnter={(e) => {
                          if (pagamentoDinheiroTemp !== 'entrega') {
                            e.target.style.backgroundColor = '#f9fafb'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (pagamentoDinheiroTemp !== 'entrega') {
                            e.target.style.backgroundColor = 'transparent'
                          }
                        }}
                      >
                        Na entrega
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
          
          {/* Rodapé com botões */}
          <div style={{ 
            padding: '16px 24px 24px 24px', 
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={closeDinheiroModal}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f9fafb'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white'
              }}
            >
              Cancelar
            </button>
            
            <button
              onClick={() => {
                // Permitir pagamentos múltiplos em dinheiro
                // Somar o valor temporário ao valor já recebido
                const valorAtual = priceToNumber(valorRecebido)
                const valorNovo = priceToNumber(valorRecebidoTemp)
                const valorTotal = valorAtual + valorNovo
                
                setValorRecebido(`R$ ${valorTotal.toFixed(2).replace('.', ',')}`)
                setPagamentoDinheiro(pagamentoDinheiroTemp)
                setValorRecebidoTemp('R$ 0,00')
                closeDinheiroModal()
                
                // Verificar se o pedido foi totalmente pago
                const valorAPagar = priceToNumber(calcularValorAPagar())
                if (valorAPagar <= 0) {
                  // Finalizar pedido automaticamente
                  finalizarPedidoComPagamento('Dinheiro')
                }
              }}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#542583',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#4a1f6b'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#542583'
              }}
            >
              Confirmar
            </button>
          </div>
        </div>
      </>
    )}

    {/* Modal de Acréscimo/Desconto */}
    {isAcrescimoDescontoModalVisible && (
      <>
        {/* Overlay */}
        <div 
          className="fixed inset-0"
        style={{
            backgroundColor: isAcrescimoDescontoModalAnimating ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
            transition: 'all 0.3s ease-out',
            zIndex: 60
          }}
          onClick={closeAcrescimoDescontoModal}
        ></div>
        
        {/* Modal Content */}
        <div 
          className="fixed top-1/2 left-1/2 bg-white"
          style={{
            width: '400px',
            borderRadius: '4px',
            transform: isAcrescimoDescontoModalAnimating ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.3)',
            opacity: isAcrescimoDescontoModalAnimating ? 1 : 0,
            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            zIndex: 61,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Botão de fechar */}
          <button
            onClick={closeAcrescimoDescontoModal}
            className="absolute"
            style={{
              top: '8px',
              right: '16px',
              fontSize: '32px',
              lineHeight: '1',
              color: '#9ca3af',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#1f2937'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#9ca3af'
            }}
          >
            ×
          </button>
          
          {/* Cabeçalho */}
          <div style={{ padding: '24px 24px 16px 24px', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ 
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#374151',
              margin: 0,
              marginBottom: '16px'
            }}>
              Acréscimo e Desconto
            </h2>
            
            {/* Botões de navegação */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setAbaAtiva('acrescimo')}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  backgroundColor: abaAtiva === 'acrescimo' ? '#542583' : 'white',
                  color: abaAtiva === 'acrescimo' ? 'white' : '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (abaAtiva !== 'acrescimo') {
                    e.target.style.backgroundColor = '#f9fafb'
                  }
                }}
                onMouseLeave={(e) => {
                  if (abaAtiva !== 'acrescimo') {
                    e.target.style.backgroundColor = 'white'
                  }
                }}
              >
                Acréscimo
              </button>
              
              <button
                onClick={() => setAbaAtiva('desconto')}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  backgroundColor: abaAtiva === 'desconto' ? '#542583' : 'white',
                  color: abaAtiva === 'desconto' ? 'white' : '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (abaAtiva !== 'desconto') {
                    e.target.style.backgroundColor = '#f9fafb'
                  }
                }}
                onMouseLeave={(e) => {
                  if (abaAtiva !== 'desconto') {
                    e.target.style.backgroundColor = 'white'
                  }
                }}
              >
                Desconto
              </button>
            </div>
          </div>
          
          {/* Conteúdo */}
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Campo de acréscimo */}
              {abaAtiva === 'acrescimo' && (
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                    Valor do Acréscimo
                </label>
                <input
                  type="text"
                    value={valorAcrescimo}
                    onChange={(e) => {
                      setValorAcrescimo(formatMoney(e.target.value))
                      // Limpar desconto quando adicionar acréscimo
                      if (priceToNumber(e.target.value) > 0) {
                        setValorDesconto('R$ 0,00')
                      }
                    }}
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#542583'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db'
                    }}
                  />
                </div>
              )}
              
              {/* Campo de desconto */}
              {abaAtiva === 'desconto' && (
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Valor do Desconto
                  </label>
                  <input
                    type="text"
                    value={valorDesconto}
                    onChange={(e) => {
                      setValorDesconto(formatMoney(e.target.value))
                      // Limpar acréscimo quando adicionar desconto
                      if (priceToNumber(e.target.value) > 0) {
                        setValorAcrescimo('R$ 0,00')
                      }
                    }}
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#542583'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db'
                    }}
                  />
                </div>
              )}

              {/* Resumo dos valores */}
              <div style={{ 
                padding: '16px', 
                    backgroundColor: '#f9fafb',
                borderRadius: '4px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Subtotal:</span>
                  <span style={{ fontSize: '14px', color: '#374151', fontWeight: '600' }}>R$ {calculateSubtotal()}</span>
                </div>
                {abaAtiva === 'acrescimo' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Acréscimo:</span>
                    <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>{valorAcrescimo}</span>
                  </div>
                )}
                {abaAtiva === 'desconto' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Desconto:</span>
                    <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>{valorDesconto}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
                  <span style={{ fontSize: '16px', color: '#374151', fontWeight: '600' }}>Total:</span>
                  <span style={{ fontSize: '16px', color: '#542583', fontWeight: '700' }}>R$ {calculateTotal()}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Rodapé com botões */}
          <div style={{ 
            padding: '16px 24px 24px 24px', 
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={() => {
                if (abaAtiva === 'acrescimo') {
                  setValorAcrescimo('R$ 0,00')
                } else {
                  setValorDesconto('R$ 0,00')
                }
              }}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f9fafb'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white'
              }}
            >
              Cancelar
            </button>
            
            <button
              onClick={closeAcrescimoDescontoModal}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#542583',
          color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#4a1f6b'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#542583'
              }}
            >
              Confirmar
            </button>
          </div>
        </div>
      </>
    )}

    {/* Modal de Detalhes Financeiros */}
    {isDetalhesFinanceirosModalVisible && (
      <>
        {/* Overlay */}
        <div 
          className="fixed inset-0"
          style={{
            backgroundColor: isDetalhesFinanceirosModalAnimating ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
            transition: 'all 0.3s ease-out',
            zIndex: 60
          }}
          onClick={closeDetalhesFinanceirosModal}
        ></div>
        
        {/* Modal Content */}
        <div 
          className="fixed top-1/2 left-1/2 bg-white"
          style={{
            width: '500px',
          borderRadius: '4px',
            transform: isDetalhesFinanceirosModalAnimating ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.3)',
            opacity: isDetalhesFinanceirosModalAnimating ? 1 : 0,
            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            zIndex: 61,
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '80vh',
            overflow: 'hidden'
          }}
        >
          {/* Botão de fechar */}
          <button
            onClick={closeDetalhesFinanceirosModal}
            className="absolute"
            style={{
              top: '8px',
              right: '16px',
              fontSize: '32px',
              lineHeight: '1',
              color: '#9ca3af',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#1f2937'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#9ca3af'
            }}
          >
            ×
          </button>
          
          {/* Cabeçalho */}
          <div style={{ padding: '24px 24px 16px 24px', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ 
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#374151',
              margin: 0
            }}>
              Detalhes Financeiros
            </h2>
          </div>
          
          {/* Conteúdo */}
          <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Resumo Geral */}
              <div style={{ 
                padding: '16px', 
                backgroundColor: '#f9fafb', 
                borderRadius: '4px',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#374151',
                  margin: '0 0 12px 0'
                }}>
                  Resumo Geral
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Subtotal:</span>
                    <span style={{ fontSize: '14px', color: '#374151', fontWeight: '600' }}>R$ {calculateSubtotal()}</span>
                  </div>
                  {priceToNumber(valorAcrescimo) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>Acréscimo:</span>
                      <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>{valorAcrescimo}</span>
                    </div>
                  )}
                  {priceToNumber(valorDesconto) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>Desconto:</span>
                      <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>{valorDesconto}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
                    <span style={{ fontSize: '16px', color: '#374151', fontWeight: '600' }}>Total:</span>
                    <span style={{ fontSize: '16px', color: '#542583', fontWeight: '700' }}>R$ {calculateTotal()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Total Recebido:</span>
                    <span style={{ fontSize: '14px', color: '#374151', fontWeight: '600' }}>
                      R$ {(priceToNumber(valorRecebido) + priceToNumber(valorDebito) + priceToNumber(valorCredito) + priceToNumber(valorPix)).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  {(() => {
                    const totalPedido = priceToNumber(calculateTotal())
                    const totalRecebido = priceToNumber(valorRecebido) + priceToNumber(valorDebito) + priceToNumber(valorCredito) + priceToNumber(valorPix)
                    const valorAPagar = totalPedido - totalRecebido
                    
                    if (valorAPagar > 0) {
                      return (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '14px', color: '#dc2626', fontWeight: '600' }}>Valor a Pagar:</span>
                          <span style={{ fontSize: '14px', color: '#dc2626', fontWeight: '600' }}>
                            R$ {valorAPagar.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      )
                    } else if (totalRecebido > totalPedido) {
                      return (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '14px', color: '#6b7280' }}>Troco:</span>
                          <span style={{ fontSize: '14px', color: '#374151', fontWeight: '600' }}>
                            R$ {(totalRecebido - totalPedido).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      )
                    }
                    return null
                  })()}
                </div>
              </div>

              {/* Formas de Pagamento */}
              <div>
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#374151',
                  margin: '0 0 12px 0'
                }}>
                  Formas de Pagamento
                </h3>
                {/* Tabela de Formas de Pagamento */}
                <div style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  overflow: 'hidden'
                }}>
                  {/* Cabeçalho da Tabela */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    backgroundColor: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb',
                    padding: '12px 16px',
                    gap: '16px'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Forma</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', textAlign: 'center' }}>Recebido</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', textAlign: 'center' }}>Detalhes</div>
                  </div>
                  
                  {/* Linha Dinheiro */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    padding: '12px 16px',
                    borderBottom: '1px solid #e5e7eb',
                    gap: '16px',
                    alignItems: 'center',
                    backgroundColor: priceToNumber(valorRecebido) > 0 ? '#f0f9ff' : 'white'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ color: priceToNumber(valorRecebido) > 0 ? '#542583' : '#6b7280' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: priceToNumber(valorRecebido) > 0 ? '#374151' : '#6b7280' }}>Dinheiro</span>
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: '600', color: priceToNumber(valorRecebido) > 0 ? '#542583' : '#6b7280' }}>
                      {priceToNumber(valorRecebido) > 0 ? valorRecebido : 'R$ 0,00'}
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>
                      {priceToNumber(valorRecebido) > 0 ? (temTroco() ? `Troco: R$ ${calcularTrocoExibicao()}` : `A pagar: R$ ${calcularValorAPagar()}`) : '-'}
                    </div>
                  </div>
                  
                  {/* Linha Débito */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    padding: '12px 16px',
                    borderBottom: '1px solid #e5e7eb',
                    gap: '16px',
                    alignItems: 'center',
                    backgroundColor: priceToNumber(valorDebito) > 0 ? '#f0f9ff' : 'white'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ color: priceToNumber(valorDebito) > 0 ? '#542583' : '#6b7280' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: priceToNumber(valorDebito) > 0 ? '#374151' : '#6b7280' }}>Débito</span>
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: '600', color: priceToNumber(valorDebito) > 0 ? '#542583' : '#6b7280' }}>
                      {priceToNumber(valorDebito) > 0 ? valorDebito : 'R$ 0,00'}
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>
                      {priceToNumber(valorDebito) > 0 ? (pagamentoDebitoTemp === 'agora' ? 'Agora' : 'Na entrega') : '-'}
                    </div>
                  </div>
                  
                  {/* Linha Crédito */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    padding: '12px 16px',
                    borderBottom: '1px solid #e5e7eb',
                    gap: '16px',
                    alignItems: 'center',
                    backgroundColor: priceToNumber(valorCredito) > 0 ? '#f0f9ff' : 'white'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ color: priceToNumber(valorCredito) > 0 ? '#542583' : '#6b7280' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: priceToNumber(valorCredito) > 0 ? '#374151' : '#6b7280' }}>Crédito</span>
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: '600', color: priceToNumber(valorCredito) > 0 ? '#542583' : '#6b7280' }}>
                      {priceToNumber(valorCredito) > 0 ? valorCredito : 'R$ 0,00'}
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>
                      {priceToNumber(valorCredito) > 0 ? (pagamentoCredito === 'agora' ? 'Agora' : 'Na entrega') : '-'}
                    </div>
                  </div>
                  
                  {/* Linha PIX */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    padding: '12px 16px',
                    gap: '16px',
                    alignItems: 'center',
                    backgroundColor: priceToNumber(valorPix) > 0 ? '#f0f9ff' : 'white'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ color: priceToNumber(valorPix) > 0 ? '#542583' : '#6b7280' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: priceToNumber(valorPix) > 0 ? '#374151' : '#6b7280' }}>PIX</span>
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: '600', color: priceToNumber(valorPix) > 0 ? '#542583' : '#6b7280' }}>
                      {priceToNumber(valorPix) > 0 ? valorPix : 'R$ 0,00'}
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>
                      {priceToNumber(valorPix) > 0 ? (pagamentoPix === 'agora' ? 'Agora' : 'Na entrega') : '-'}
                    </div>
                  </div>
                </div>
              </div>


            </div>
          </div>
          
          {/* Rodapé */}
          <div style={{ 
            padding: '16px 24px 24px 24px', 
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={closeDetalhesFinanceirosModal}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#542583',
                color: 'white',
          fontSize: '14px',
          fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#4a1f6b'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#542583'
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      </>
    )}

    {/* Modal de Pagamento em Débito */}
    {isDebitoModalVisible && (
      <>
        {/* Overlay */}
        <div 
          className="fixed inset-0"
          style={{
            backgroundColor: isDebitoModalAnimating ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
            transition: 'all 0.3s ease-out',
            zIndex: 60
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeDebitoModal()
            }
          }}
        ></div>
        
        {/* Modal Content */}
        <div 
          className="fixed top-1/2 left-1/2 bg-white"
          style={{
            width: '400px',
            borderRadius: '4px',
            transform: isDebitoModalAnimating ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.3)',
            opacity: isDebitoModalAnimating ? 1 : 0,
            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            zIndex: 61,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Botão de fechar */}
          <button
            onClick={closeDebitoModal}
            className="absolute"
            style={{
              top: '8px',
              right: '16px',
              fontSize: '32px',
              lineHeight: '1',
              color: '#9ca3af',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#1f2937'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#9ca3af'
            }}
          >
            ×
          </button>
          
          {/* Cabeçalho */}
          <div style={{ padding: '24px 24px 16px 24px', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ 
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#374151',
              margin: 0,
              marginBottom: '16px'
            }}>
              Pagamento em Débito
            </h2>
          </div>
          
          {/* Conteúdo */}
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Campo de valor */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#374151'
                  }}>
                    Valor a Receber
                  </label>
                </div>
                <input
                  type="text"
                  value={valorDebitoTemp}
                  onChange={(e) => {
                    const novoValor = formatMoney(e.target.value)
                    const valorNumerico = priceToNumber(novoValor)
                    const totalPedido = priceToNumber(calculateTotal())
                    const totalRecebido = priceToNumber(valorRecebido) + priceToNumber(valorCredito) + priceToNumber(valorPix)
                    const valorRestante = totalPedido - totalRecebido
                    
                    if (valorNumerico <= valorRestante) {
                      setValorDebitoTemp(novoValor)
                    } else {
                      showNotification('VALOR NÃO PODE SER MAIOR QUE O RESTANTE')
                    }
                  }}
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#542583'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db'
                  }}
                />
              </div>

              {/* Dropdown de quando pagar */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Quando Receber
                </label>
                
                <div style={{ position: 'relative', width: '100%' }}>
                  <button
                    onClick={() => setDropdownPagamentoAberto(!dropdownPagamentoAberto)}
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '0 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      background: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '14px',
                      color: '#374151',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.borderColor = '#542583'}
                    onMouseLeave={(e) => e.target.style.borderColor = '#d1d5db'}
                  >
                    <span>{pagamentoDebitoTemp === 'agora' ? 'Agora' : 'Na entrega'}</span>
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      style={{
                        transform: dropdownPagamentoAberto ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s'
                      }}
                    >
                      <polyline points="6,9 12,15 18,9"></polyline>
                    </svg>
                  </button>
                  
                  {/* Menu Dropdown */}
                  {dropdownPagamentoAberto && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: '0',
                        right: '0',
                        marginTop: '4px',
                        background: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        zIndex: 10,
                        maxHeight: '200px',
                        overflowY: 'auto'
                      }}
                    >
                      <button
                        onClick={() => {
                          setPagamentoDebitoTemp('agora')
                          setDropdownPagamentoAberto(false)
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          fontSize: '14px',
                          color: '#374151',
                          background: pagamentoDebitoTemp === 'agora' ? '#f3e8ff' : 'transparent',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s',
                          display: 'block'
                        }}
                        onMouseEnter={(e) => {
                          if (pagamentoDebitoTemp !== 'agora') {
                            e.target.style.backgroundColor = '#f9fafb'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (pagamentoDebitoTemp !== 'agora') {
                            e.target.style.backgroundColor = 'transparent'
                          }
                        }}
                      >
                        Agora
                      </button>
                      <button
                        onClick={() => {
                          setPagamentoDebitoTemp('entrega')
                          setDropdownPagamentoAberto(false)
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          fontSize: '14px',
                          color: '#374151',
                          background: pagamentoDebitoTemp === 'entrega' ? '#f3e8ff' : 'transparent',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s',
                          display: 'block'
                        }}
                        onMouseEnter={(e) => {
                          if (pagamentoDebitoTemp !== 'entrega') {
                            e.target.style.backgroundColor = '#f9fafb'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (pagamentoDebitoTemp !== 'entrega') {
                            e.target.style.backgroundColor = 'transparent'
                          }
                        }}
                      >
                        Na entrega
                      </button>
                    </div>
                  )}
                </div>
              </div>


            </div>
          </div>
          
          {/* Rodapé com botões */}
          <div style={{ 
            padding: '16px 24px 24px 24px', 
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={() => {
                setValorDebitoTemp('R$ 0,00')
                setPagamentoDebitoTemp('agora')
              }}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f9fafb'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white'
              }}
            >
              Cancelar
            </button>
            
            <button
              onClick={() => {
                setValorDebito(valorDebitoTemp)
                setPagamentoDebito(pagamentoDebitoTemp)
                setValorDebitoTemp('R$ 0,00')
                setPagamentoDebitoTemp('agora')
                setDropdownPagamentoAberto(false)
                closeDebitoModal()
                
                // Verificar se o pedido foi totalmente pago
                const valorAPagar = priceToNumber(calcularValorAPagar())
                if (valorAPagar <= 0) {
                  // Finalizar pedido automaticamente
                  finalizarPedidoComPagamento('Débito')
                }
              }}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#542583',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#4a1f6b'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#542583'
              }}
            >
              Confirmar
            </button>
          </div>
        </div>
      </>
    )}

    {/* Modal de Pagamento em Crédito */}
    {isCreditoModalVisible && (
      <>
        {/* Overlay */}
        <div 
          className="fixed inset-0"
        style={{
            backgroundColor: isCreditoModalAnimating ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
            transition: 'all 0.3s ease-out',
            zIndex: 60
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeCreditoModal()
            }
          }}
        ></div>
        
        {/* Modal Content */}
        <div 
          className="fixed top-1/2 left-1/2 bg-white"
          style={{
            width: '400px',
            borderRadius: '4px',
            transform: isCreditoModalAnimating ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.3)',
            opacity: isCreditoModalAnimating ? 1 : 0,
            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            zIndex: 61,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Botão de fechar */}
          <button
            onClick={closeCreditoModal}
            className="absolute"
            style={{
              top: '8px',
              right: '16px',
              fontSize: '32px',
              lineHeight: '1',
              color: '#9ca3af',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#1f2937'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#9ca3af'
            }}
          >
            ×
          </button>
          
          {/* Cabeçalho */}
          <div style={{ padding: '24px 24px 16px 24px', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ 
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#374151',
              margin: 0,
              marginBottom: '16px'
            }}>
              Pagamento em Crédito
            </h2>
          </div>
          
          {/* Conteúdo */}
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Campo de valor */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Valor a Receber
                </label>
                <input
                  type="text"
                  value={valorCreditoTemp}
                  onChange={(e) => {
                    const novoValor = formatMoney(e.target.value)
                    const valorNumerico = priceToNumber(novoValor)
                    const totalPedido = priceToNumber(calculateTotal())
                    const totalRecebido = priceToNumber(valorRecebido) + priceToNumber(valorDebito) + priceToNumber(valorPix)
                    const valorRestante = totalPedido - totalRecebido
                    
                    if (valorNumerico <= valorRestante) {
                      setValorCreditoTemp(novoValor)
                    } else {
                      showNotification('VALOR NÃO PODE SER MAIOR QUE O RESTANTE')
                    }
                  }}
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#542583'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db'
                  }}
                />
              </div>

              {/* Dropdown de quando pagar */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Quando Receber
                </label>
                
                <div style={{ position: 'relative', width: '100%' }}>
                  <button
                    onClick={() => setDropdownPagamentoCreditoAberto(!dropdownPagamentoCreditoAberto)}
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '0 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      background: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '14px',
                      color: '#374151',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.borderColor = '#542583'}
                    onMouseLeave={(e) => e.target.style.borderColor = '#d1d5db'}
                  >
                    <span>{pagamentoCreditoTemp === 'agora' ? 'Agora' : 'Na entrega'}</span>
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      style={{
                        transform: dropdownPagamentoCreditoAberto ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s'
                      }}
                    >
                      <polyline points="6,9 12,15 18,9"></polyline>
                    </svg>
                  </button>
                  
                  {/* Menu Dropdown */}
                  {dropdownPagamentoCreditoAberto && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: '0',
                        right: '0',
                        marginTop: '4px',
                        background: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        zIndex: 10,
                        maxHeight: '200px',
                        overflowY: 'auto'
                      }}
                    >
                      <button
                        onClick={() => {
                          setPagamentoCreditoTemp('agora')
                          setDropdownPagamentoCreditoAberto(false)
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          fontSize: '14px',
                          color: '#374151',
                          background: pagamentoCreditoTemp === 'agora' ? '#f3e8ff' : 'transparent',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s',
                          display: 'block'
                        }}
                        onMouseEnter={(e) => {
                          if (pagamentoCreditoTemp !== 'agora') {
                            e.target.style.backgroundColor = '#f9fafb'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (pagamentoCreditoTemp !== 'agora') {
                            e.target.style.backgroundColor = 'transparent'
                          }
                        }}
                      >
                        Agora
                      </button>
                      <button
                        onClick={() => {
                          setPagamentoCreditoTemp('entrega')
                          setDropdownPagamentoCreditoAberto(false)
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          fontSize: '14px',
                          color: '#374151',
                          background: pagamentoCreditoTemp === 'entrega' ? '#f3e8ff' : 'transparent',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s',
                          display: 'block'
                        }}
                        onMouseEnter={(e) => {
                          if (pagamentoCreditoTemp !== 'entrega') {
                            e.target.style.backgroundColor = '#f9fafb'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (pagamentoCreditoTemp !== 'entrega') {
                            e.target.style.backgroundColor = 'transparent'
                          }
                        }}
                      >
                        Na entrega
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Resumo */}

            </div>
          </div>
          
          {/* Rodapé com botões */}
          <div style={{ 
            padding: '16px 24px 24px 24px', 
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={() => {
                setValorCreditoTemp('R$ 0,00')
                setPagamentoCreditoTemp('agora')
              }}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f9fafb'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white'
              }}
            >
              Cancelar
            </button>
            
            <button
              onClick={() => {
                setValorCredito(valorCreditoTemp)
                setPagamentoCredito(pagamentoCreditoTemp)
                setValorCreditoTemp('R$ 0,00')
                setPagamentoCreditoTemp('agora')
                setDropdownPagamentoCreditoAberto(false)
                closeCreditoModal()
                
                // Verificar se o pedido foi totalmente pago
                const valorAPagar = priceToNumber(calcularValorAPagar())
                if (valorAPagar <= 0) {
                  // Finalizar pedido automaticamente
                  finalizarPedidoComPagamento('Crédito')
                }
              }}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#542583',
          color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#4a1f6b'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#542583'
              }}
            >
              Confirmar
            </button>
          </div>
        </div>
      </>
    )}

    {/* Modal de Pagamento em PIX */}
    {isPixModalVisible && (
      <>
        {/* Overlay */}
        <div 
          className="fixed inset-0"
          style={{
            backgroundColor: isPixModalAnimating ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
            transition: 'all 0.3s ease-out',
            zIndex: 60
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closePixModal()
            }
          }}
        ></div>
        
        {/* Modal Content */}
        <div 
          className="fixed top-1/2 left-1/2 bg-white"
          style={{
            width: '400px',
          borderRadius: '4px',
            transform: isPixModalAnimating ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.3)',
            opacity: isPixModalAnimating ? 1 : 0,
            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            zIndex: 61,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Botão de fechar */}
          <button
            onClick={closePixModal}
            className="absolute"
            style={{
              top: '8px',
              right: '16px',
              fontSize: '32px',
              lineHeight: '1',
              color: '#9ca3af',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#1f2937'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#9ca3af'
            }}
          >
            ×
          </button>
          
          {/* Cabeçalho */}
          <div style={{ padding: '24px 24px 16px 24px', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ 
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#374151',
              margin: 0,
              marginBottom: '16px'
            }}>
              Pagamento em PIX
            </h2>
          </div>
          
          {/* Conteúdo */}
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Campo de valor */}
              <div>
                <label style={{ 
                  display: 'block', 
          fontSize: '14px',
          fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Valor a Receber
                </label>
                <input
                  type="text"
                  value={valorPixTemp}
                  onChange={(e) => {
                    const novoValor = formatMoney(e.target.value)
                    const valorNumerico = priceToNumber(novoValor)
                    const totalPedido = priceToNumber(calculateTotal())
                    const totalRecebido = priceToNumber(valorRecebido) + priceToNumber(valorDebito) + priceToNumber(valorCredito)
                    const valorRestante = totalPedido - totalRecebido
                    
                    // Permitir sempre atualizar o valor, mesmo que seja maior que o restante
                    // A validação será feita apenas no momento de confirmar
                      setValorPixTemp(novoValor)
                  }}
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#542583'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db'
                  }}
                />
              </div>

              {/* Dropdown de quando pagar */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Quando Receber
                </label>
                
                <div style={{ position: 'relative', width: '100%' }}>
                  <button
                    onClick={() => setDropdownPagamentoPixAberto(!dropdownPagamentoPixAberto)}
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '0 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      background: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '14px',
                      color: '#374151',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.borderColor = '#542583'}
                    onMouseLeave={(e) => e.target.style.borderColor = '#d1d5db'}
                  >
                    <span>{pagamentoPixTemp === 'agora' ? 'Agora' : 'Na entrega'}</span>
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      style={{
                        transform: dropdownPagamentoPixAberto ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s'
                      }}
                    >
                      <polyline points="6,9 12,15 18,9"></polyline>
                    </svg>
                  </button>
                  
                  {/* Menu Dropdown */}
                  {dropdownPagamentoPixAberto && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: '0',
                        right: '0',
                        marginTop: '4px',
                        background: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        zIndex: 10,
                        maxHeight: '200px',
                        overflowY: 'auto'
                      }}
                    >
                      <button
                        onClick={() => {
                          setPagamentoPixTemp('agora')
                          setDropdownPagamentoPixAberto(false)
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          fontSize: '14px',
                          color: '#374151',
                          background: pagamentoPixTemp === 'agora' ? '#f3e8ff' : 'transparent',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s',
                          display: 'block'
                        }}
                        onMouseEnter={(e) => {
                          if (pagamentoPixTemp !== 'agora') {
                            e.target.style.backgroundColor = '#f9fafb'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (pagamentoPixTemp !== 'agora') {
                            e.target.style.backgroundColor = 'transparent'
                          }
                        }}
                      >
                        Agora
                      </button>
                      <button
                        onClick={() => {
                          setPagamentoPixTemp('entrega')
                          setDropdownPagamentoPixAberto(false)
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          fontSize: '14px',
                          color: '#374151',
                          background: pagamentoPixTemp === 'entrega' ? '#f3e8ff' : 'transparent',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s',
                          display: 'block'
                        }}
                        onMouseEnter={(e) => {
                          if (pagamentoPixTemp !== 'entrega') {
                            e.target.style.backgroundColor = '#f9fafb'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (pagamentoPixTemp !== 'entrega') {
                            e.target.style.backgroundColor = 'transparent'
                          }
                        }}
                      >
                        Na entrega
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Resumo */}

            </div>
          </div>
          
          {/* Rodapé com botões */}
          <div style={{ 
            padding: '16px 24px 24px 24px', 
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={() => {
                setValorPixTemp('R$ 0,00')
                setPagamentoPixTemp('agora')
              }}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f9fafb'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white'
              }}
            >
              Cancelar
            </button>
            
            <button
              onClick={() => {
                // Validar se o valor não excede o restante
                const valorNumerico = priceToNumber(valorPixTemp)
                const valorRestante = priceToNumber(calcularValorAPagar())
                
                if (valorNumerico > valorRestante) {
                  showNotification('VALOR NÃO PODE SER MAIOR QUE O RESTANTE')
                  return
                }
                
                setValorPix(valorPixTemp)
                setPagamentoPix(pagamentoPixTemp)
                setValorPixTemp('R$ 0,00')
                setPagamentoPixTemp('agora')
                setDropdownPagamentoPixAberto(false)
                closePixModal()
                
                // Verificar se o pedido foi totalmente pago
                const valorAPagar = priceToNumber(calcularValorAPagar())
                if (valorAPagar <= 0) {
                  // Finalizar pedido automaticamente
                  finalizarPedidoComPagamento('PIX')
                }
              }}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#542583',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#4a1f6b'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#542583'
              }}
            >
              Confirmar
            </button>
          </div>
        </div>
      </>
    )}

    {/* Modal de Forma de Entrega */}
    {isFormaEntregaModalVisible && (
      <>
        {/* Overlay */}
        <div 
          className="fixed inset-0"
          style={{
            backgroundColor: isFormaEntregaModalAnimating ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
            transition: 'all 0.3s ease-out',
            zIndex: 70
          }}
          onClick={closeFormaEntregaModal}
        ></div>
        
        {/* Modal Content */}
        <div 
          className="fixed top-1/2 left-1/2 bg-white"
          style={{
            width: '600px',
            height: selectedFormaEntrega === 'E' ? '700px' : 'auto',
            display: selectedFormaEntrega === 'E' ? 'flex' : undefined,
            flexDirection: selectedFormaEntrega === 'E' ? 'column' : undefined,
            borderRadius: '4px',
            transform: isFormaEntregaModalAnimating ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.3)',
            opacity: isFormaEntregaModalAnimating ? 1 : 0,
            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            zIndex: 71,
            overflow: 'hidden'
          }}
        >
          {/* Botão X para fechar */}
          <button
            onClick={closeFormaEntregaModal}
            className="absolute text-gray-400 hover:text-gray-600 transition-colors"
            style={{ 
              fontSize: '32px', 
              lineHeight: '1',
              top: '8px',
              right: '16px'
            }}
          >
            ×
          </button>
          {/* Cabeçalho */}
          <div style={{ padding: '24px 24px 16px 24px', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ 
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#374151',
              margin: 0
            }}>
              Forma de entrega
            </h2>
          </div>
          {/* Abas de navegação */}
          <div style={{ padding: '24px 24px 16px 24px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setSelectedFormaEntrega('E')}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  backgroundColor: selectedFormaEntrega === 'E' ? '#542583' : 'white',
                  color: selectedFormaEntrega === 'E' ? 'white' : '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (selectedFormaEntrega !== 'E') {
                    e.target.style.backgroundColor = '#f9fafb'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedFormaEntrega !== 'E') {
                    e.target.style.backgroundColor = 'white'
                  }
                }}
              >
                Delivery
              </button>
              <button
                onClick={() => setSelectedFormaEntrega('R')}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  backgroundColor: selectedFormaEntrega === 'R' ? '#542583' : 'white',
                  color: selectedFormaEntrega === 'R' ? 'white' : '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (selectedFormaEntrega !== 'R') {
                    e.target.style.backgroundColor = '#f9fafb'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedFormaEntrega !== 'R') {
                    e.target.style.backgroundColor = 'white'
                  }
                }}
              >
                Retirada
              </button>
              <button
                onClick={() => setSelectedFormaEntrega('C')}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  backgroundColor: selectedFormaEntrega === 'C' ? '#542583' : 'white',
                  color: selectedFormaEntrega === 'C' ? 'white' : '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (selectedFormaEntrega !== 'C') {
                    e.target.style.backgroundColor = '#f9fafb'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedFormaEntrega !== 'C') {
                    e.target.style.backgroundColor = 'white'
                  }
                }}
              >
                Balcão
              </button>
            </div>
          </div>
          {/* Conteúdo da aba selecionada */}
          <div style={{ padding: '0px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {selectedFormaEntrega === 'E' && !showEnderecoForm && (
              <div style={{ 
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                flex: 1,
                minHeight: 0
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  flex: 1,
                  overflowY: 'auto'
                }}>
                  {enderecosSalvos.length > 0 && (
                    <>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#374151',
                        margin: '0 0 8px 0'
                      }}>
                        Endereços Salvos
                      </h3>
                      
                      {enderecosSalvos.map((endereco) => (
                        <div
                          key={endereco.id}
                          onClick={() => {
                            setEnderecoSelecionado(endereco.id)
                            setTaxaEntrega(endereco.taxaEntrega)
                          }}
                          style={{
                            border: enderecoSelecionado === endereco.id ? '2px solid #542583' : '1px solid #d1d5db',
                            borderRadius: '8px',
                            padding: '16px',
                            backgroundColor: enderecoSelecionado === endereco.id ? '#f3f4f6' : '#f9fafb',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (enderecoSelecionado !== endereco.id) {
                              e.currentTarget.style.backgroundColor = '#f3f4f6'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (enderecoSelecionado !== endereco.id) {
                              e.currentTarget.style.backgroundColor = '#f9fafb'
                            }
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '12px'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <div style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                border: enderecoSelecionado === endereco.id ? '2px solid #542583' : '2px solid #d1d5db',
                                backgroundColor: enderecoSelecionado === endereco.id ? '#542583' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                {enderecoSelecionado === endereco.id && (
                                  <div style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    backgroundColor: 'white'
                                  }} />
                                )}
                              </div>
                              <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#374151'
                              }}>
                                {endereco.rua}, {endereco.numero}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                // Carregar dados do endereço no formulário
                                setEnderecoData({
                                  cep: endereco.cep,
                                  rua: endereco.rua,
                                  numero: endereco.numero,
                                  complemento: endereco.complemento,
                                  bairro: endereco.bairro,
                                  cidade: endereco.cidade
                                })
                                setTaxaEntrega(endereco.taxaEntrega)
                                setCepValido(true)
                                setShowEnderecoForm(true)
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#542583',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                textDecoration: 'underline'
                              }}
                            >
                              Editar
                            </button>
                          </div>
                          <div style={{
                            fontSize: '14px',
                            color: '#374151',
                            lineHeight: '1.5',
                            marginLeft: '24px'
                          }}>
                            <div><strong>CEP:</strong> {endereco.cep}</div>
                            {endereco.complemento && (
                              <div><strong>Complemento:</strong> {endereco.complemento}</div>
                            )}
                            <div><strong>Bairro:</strong> {endereco.bairro}</div>
                            <div><strong>Cidade:</strong> {endereco.cidade}</div>
                            <div style={{ marginTop: '8px' }}>
                              <strong>Taxa de Entrega:</strong> {endereco.taxaEntrega}
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    padding: '16px 0',
                    borderTop: enderecosSalvos.length > 0 ? '1px solid #e5e7eb' : 'none',
                    marginTop: enderecosSalvos.length > 0 ? '8px' : '0'
                  }}>
                    <span 
                      onClick={openEnderecoModal}
                      style={{ 
                        fontSize: '18px', 
                        color: '#542583', 
                        fontWeight: '500',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Novo endereço
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {selectedFormaEntrega === 'E' && showEnderecoForm && (
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Primeira linha - CEP */}
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      CEP
                    </label>
                    <input
                      type="text"
                      value={enderecoData.cep}
                      onChange={(e) => {
                        const valor = e.target.value
                        const valorMascarado = aplicarMascaraCep(valor)
                        setEnderecoData({...enderecoData, cep: valorMascarado})
                        
                        // Buscar dados quando CEP tiver 8 dígitos
                        if (valor.replace(/\D/g, '').length === 8) {
                          buscarCep(valorMascarado)
                        }
                      }}
                      placeholder="00000-000"
                      maxLength={9}
                      style={{
                        width: '100%',
                        height: '40px',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#542583'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db'
                      }}
                    />
                  </div>

                  {/* Segunda linha - Rua */}
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Rua *
                    </label>
                    <input
                      type="text"
                      value={enderecoData.rua}
                      onChange={(e) => setEnderecoData({...enderecoData, rua: e.target.value})}
                      style={{
                        width: '100%',
                        height: '40px',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#542583'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db'
                      }}
                    />
                  </div>

                  {/* Terceira linha - Número e Complemento */}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        Número
                      </label>
                      <input
                        type="text"
                        value={enderecoData.numero}
                        onChange={(e) => setEnderecoData({...enderecoData, numero: e.target.value})}
                        style={{
                          width: '100%',
                          height: '40px',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#542583'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db'
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        Complemento
                      </label>
                      <input
                        type="text"
                        value={enderecoData.complemento}
                        onChange={(e) => setEnderecoData({...enderecoData, complemento: e.target.value})}
                        style={{
                          width: '100%',
                          height: '40px',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#542583'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db'
                        }}
                      />
                    </div>
                  </div>

                  {/* Quarta linha - Bairro e Cidade */}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        Bairro *
                      </label>
                      <input
                        type="text"
                        value={enderecoData.bairro}
                        onChange={(e) => setEnderecoData({...enderecoData, bairro: e.target.value})}
                        style={{
                          width: '100%',
                          height: '40px',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#542583'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db'
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        Cidade *
                      </label>
                      <input
                        type="text"
                        value={enderecoData.cidade}
                        onChange={(e) => setEnderecoData({...enderecoData, cidade: e.target.value})}
                        style={{
                          width: '100%',
                          height: '40px',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#542583'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db'
                        }}
                      />
                    </div>
                  </div>

                  {/* Campo de Taxa de Entrega */}
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Taxa de Entrega
                    </label>
                    <input
                      type="text"
                      value={taxaEntrega}
                      onChange={(e) => {
                        const valor = e.target.value
                        const valorFormatado = formatarValor(valor)
                        setTaxaEntrega(valorFormatado)
                      }}
                      placeholder="R$ 0,00"
                      style={{
                        width: '270px',
                        height: '40px',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#542583'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Rodapé com botões */}
          <div style={{ 
            padding: '16px 24px 24px 24px', 
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            borderTop: '1px solid #e5e7eb',
            marginTop: 'auto'
          }}>
            {(!showEnderecoForm || selectedFormaEntrega !== 'E') ? (
              <button
                onClick={() => {
                  if (selectedFormaEntrega === 'E' && enderecoSelecionado) {
                    // Encontrar o endereço selecionado
                    const endereco = enderecosSalvos.find(e => e.id === enderecoSelecionado)
                    if (endereco) {
                      // Salvar o endereço confirmado
                      setEnderecoConfirmado({
                        rua: endereco.rua,
                        numero: endereco.numero,
                        bairro: endereco.bairro,
                        cidade: endereco.cidade
                      })
                    }
                  }
                  closeFormaEntregaModal()
                }}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#542583',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#4a1f6b'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#542583'
                }}
              >
                {selectedFormaEntrega === 'E' && enderecoSelecionado ? 'Confirmar endereço' : 'Adicionar forma de entrega'}
              </button>
            ) : selectedFormaEntrega === 'E' ? (
              <>
                <button
                  onClick={closeEnderecoModal}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f9fafb'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'white'
                  }}
                >
                  Cancelar
                </button>
                
                <button
                  onClick={() => {
                    // Validar campos obrigatórios
                    if (!enderecoData.rua.trim() || !enderecoData.numero.trim() || !enderecoData.bairro.trim() || !enderecoData.cidade.trim()) {
                      showNotification('PREENCHA OS CAMPOS OBRIGATÓRIOS')
                      return
                    }
                    
                    // Validar se o CEP é válido
                    if (!cepValido) {
                      showNotification('CEP INVÁLIDO')
                      return
                    }
                    
                    // Salvar o endereço na lista
                    const novoEndereco = {
                      id: Date.now().toString(), // ID único baseado no timestamp
                      cep: enderecoData.cep,
                      rua: enderecoData.rua,
                      numero: enderecoData.numero,
                      complemento: enderecoData.complemento,
                      bairro: enderecoData.bairro,
                      cidade: enderecoData.cidade,
                      taxaEntrega: taxaEntrega
                    }
                    
                    setEnderecosSalvos(prev => [...prev, novoEndereco])
                    setEnderecoSelecionado(novoEndereco.id)
                    
                    // Manter a taxa de entrega e voltar para a aba inicial
                    setShowEnderecoForm(false)
                    setCepValido(false)
                  }}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    backgroundColor: '#542583',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#4a1f6b'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#542583'
                  }}
                >
                  Salvar Endereço
                </button>
              </>
            ) : null}
          </div>
        </div>
              </>
            )}

    {/* Modal de Observação */}
    {isObservacaoModalVisible && (
      <>
        {/* Overlay */}
        <div 
          className="fixed inset-0"
          style={{
            backgroundColor: isObservacaoModalAnimating ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
            transition: 'all 0.3s ease-out',
            zIndex: 80
          }}
          onClick={closeObservacaoModal}
        ></div>
        
        {/* Modal Content */}
        <div 
          className="fixed top-1/2 left-1/2 bg-white"
          style={{
            width: '500px',
            borderRadius: '4px',
            transform: isObservacaoModalAnimating ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.3)',
            opacity: isObservacaoModalAnimating ? 1 : 0,
            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            zIndex: 81,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Botão X para fechar */}
          <button
            onClick={closeObservacaoModal}
            className="absolute text-gray-400 hover:text-gray-600 transition-colors"
            style={{ 
              fontSize: '32px', 
              lineHeight: '1',
              top: '8px',
              right: '16px'
            }}
          >
            ×
          </button>
          
          {/* Cabeçalho */}
          <div style={{ padding: '24px 24px 16px 24px', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ 
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#374151',
              margin: 0
            }}>
              Adicionar Observação
            </h2>
          </div>
          
          {/* Conteúdo */}
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Campo de observação */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Observação
                </label>
                <textarea
                  value={observacaoTemp}
                  onChange={(e) => setObservacaoTemp(e.target.value)}
                  placeholder="Digite a observação do pedido..."
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#542583'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db'
                  }}
                />
              </div>


            </div>
          </div>
          
          {/* Rodapé com botões */}
          <div style={{ 
            padding: '16px 24px 24px 24px', 
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={() => {
                setObservacaoTemp('')
              }}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f9fafb'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white'
              }}
            >
              Cancelar
            </button>
            
            <button
              onClick={() => {
                setObservacao(observacaoTemp)
                closeObservacaoModal()
              }}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#542583',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#4a1f6b'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#542583'
              }}
            >
              Confirmar
            </button>
          </div>
        </div>
      </>
    )}

    {/* Modal de Confirmação de Limpeza */}
    {isLimparModalVisible && (
      <>
        {/* Overlay */}
        <div 
          className="fixed inset-0"
          style={{
            backgroundColor: isLimparModalAnimating ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
            transition: 'all 0.3s ease-out',
            zIndex: 90
          }}
          onClick={closeLimparModal}
        ></div>
        
        {/* Modal Content */}
        <div 
          className="fixed top-1/2 left-1/2 bg-white"
          style={{
            width: '400px',
            borderRadius: '4px',
            transform: isLimparModalAnimating ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.3)',
            opacity: isLimparModalAnimating ? 1 : 0,
            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            zIndex: 91,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Botão X para fechar */}
          <button
            onClick={closeLimparModal}
            className="absolute text-gray-400 hover:text-gray-600 transition-colors"
            style={{ 
              fontSize: '32px', 
              lineHeight: '1',
              top: '8px',
              right: '16px'
            }}
          >
            ×
          </button>
          
          {/* Conteúdo */}
          <div style={{ padding: '24px', textAlign: 'left' }}>
            {/* Título */}
            <h2 style={{ 
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#374151',
              margin: '0 0 8px 0'
            }}>
              Limpar Pagamentos
            </h2>
            
            {/* Mensagem */}
            <p style={{ 
              fontSize: '14px',
              color: '#6b7280',
              margin: '0 0 24px 0',
              lineHeight: '1.5'
            }}>
              Tem certeza que deseja limpar todas as formas de pagamento e acréscimos/descontos?
            </p>
            
            {/* Botões */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={closeLimparModal}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f9fafb'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white'
                }}
              >
                Não, manter
              </button>
              
              <button
                onClick={limparPagamentos}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#542583',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#4a1f6b'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#542583'
                }}
              >
                Sim, limpar
              </button>
            </div>
          </div>
        </div>
      </>
    )}

    {/* Modal de Confirmação de Cancelamento */}
    {isCancelarModalVisible && (
      <>
        {/* Overlay */}
        <div 
          className="fixed inset-0"
          style={{
            backgroundColor: isCancelarModalAnimating ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
            transition: 'all 0.3s ease-out',
            zIndex: 90
          }}
          onClick={closeCancelarModal}
        ></div>
        
        {/* Modal Content */}
        <div 
          className="fixed top-1/2 left-1/2 bg-white"
          style={{
            width: '400px',
            borderRadius: '4px',
            transform: isCancelarModalAnimating ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.3)',
            opacity: isCancelarModalAnimating ? 1 : 0,
            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            zIndex: 91,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Botão X para fechar */}
          <button
            onClick={closeCancelarModal}
            className="absolute text-gray-400 hover:text-gray-600 transition-colors"
            style={{ 
              fontSize: '32px', 
              lineHeight: '1',
              top: '8px',
              right: '16px'
            }}
          >
            ×
          </button>
          
          {/* Conteúdo */}
          <div style={{ padding: '24px', textAlign: 'left' }}>
            {/* Título */}
            <h2 style={{ 
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#374151',
              margin: '0 0 8px 0'
            }}>
              Atenção
            </h2>
            
            {/* Mensagem */}
            <p style={{ 
              fontSize: '14px',
              color: '#6b7280',
              margin: '0 0 24px 0',
              lineHeight: '1.5'
            }}>
              Tem certeza que deseja cancelar esta venda? Todos os dados serão perdidos.
            </p>
            
            {/* Botões */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={closeCancelarModal}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f9fafb'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white'
                }}
              >
                Não, manter
              </button>
              
              <button
                onClick={confirmarCancelamento}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#b91c1c'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#dc2626'
                }}
              >
                Sim, cancelar
              </button>
            </div>
          </div>
        </div>
      </>
    )}

    {/* Modal de Detalhes */}
    {isDetalhesModalVisible && (
      <>
        {/* Overlay */}
        <div 
          className="fixed inset-0"
          style={{
            backgroundColor: isDetalhesModalAnimating ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
            transition: 'all 0.3s ease-out',
            zIndex: 100
          }}
          onClick={closeDetalhesModal}
        ></div>
        
        {/* Modal Content */}
        <div 
          className="fixed top-1/2 left-1/2 bg-white"
          style={{
            width: '600px',
            minHeight: '600px',
            maxHeight: '85vh',
            borderRadius: '4px',
            transform: isDetalhesModalAnimating ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.3)',
            opacity: isDetalhesModalAnimating ? 1 : 0,
            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            zIndex: 101,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Botão X para fechar */}
          <button
            onClick={closeDetalhesModal}
            className="absolute text-gray-400 hover:text-gray-600 transition-colors"
            style={{ 
              fontSize: '32px', 
              lineHeight: '1',
              top: '8px',
              right: '16px'
            }}
          >
            ×
          </button>
          

          
          {/* Conteúdo */}
          <div style={{ 
            padding: '20px', 
            flex: '1', 
            display: 'flex', 
            flexDirection: 'column',
            overflowY: 'auto'
          }}>
            {/* Título */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              margin: '0 0 24px 0',
              position: 'relative'
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#374151',
                margin: 0
              }}>
                Pedido #{pedidoDetalhes?.numeroPedido || (pedidoDetalhes?.mesaNumero ? `V${pedidoDetalhes.mesaNumero.toString().padStart(3, '0')}` : 'V001')}
              </h2>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)'
              }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#542583',
                  backgroundColor: '#f3f4f6',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  border: '1px solid #e5e7eb'
                }}>
                  {tempoDecorrido}
                </div>
                
                {/* Ícone Impressora */}
                <button
                  onClick={() => {
                    console.error('Imprimir pedido:', pedidoDetalhes?.id)
                    // TODO: Implementar funcionalidade de impressão
                  }}
                  style={{
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'transparent',
                    border: '1px solid #d1d5db',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    height="24px" 
                    viewBox="0 -960 960 960" 
                    width="24px" 
                    fill="#6b7280"
                  >
                    <path d="M720-680H240v-160h480v160Zm0 220q17 0 28.5-11.5T760-500q0-17-11.5-28.5T720-540q-17 0-28.5 11.5T680-500q0 17 11.5 28.5T720-460Zm-80 260v-160H320v160h320Zm80 80H240v-160H80v-240q0-51 35-85.5t85-34.5h560q51 0 85.5 34.5T880-520v240H720v160Z"/>
                  </svg>
                </button>
                
                {/* Ícone Editar */}
                <button
                  onClick={() => {
                    console.error('Editar pedido:', pedidoDetalhes?.id)
                    // TODO: Implementar funcionalidade de edição
                  }}
                  style={{
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'transparent',
                    border: '1px solid #d1d5db',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    height="24px" 
                    viewBox="0 -960 960 960" 
                    width="24px" 
                    fill="#6b7280"
                  >
                    <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 43-28-29 57 57-29-28Z"/>
                  </svg>
                </button>
                
                {/* Ícone WhatsApp */}
                <button
                  onClick={() => {
                    console.error('Enviar WhatsApp para pedido:', pedidoDetalhes?.id)
                    // TODO: Implementar funcionalidade de WhatsApp
                    if (pedidoDetalhes?.telefone) {
                      const mensagem = `Olá! Aqui está o resumo do seu pedido #${pedidoDetalhes?.numeroPedido || (pedidoDetalhes?.mesaNumero ? `V${pedidoDetalhes.mesaNumero.toString().padStart(3, '0')}` : 'V001')}:\n\nCliente: ${pedidoDetalhes.cliente}\nTotal: ${pedidoDetalhes.total}\nStatus: ${pedidoDetalhes.status}`
                      const url = `https://wa.me/55${pedidoDetalhes.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(mensagem)}`
                      window.open(url, '_blank')
                    }
                  }}
                  style={{
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'transparent',
                    border: '1px solid #d1d5db',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <svg 
                    width="30" 
                    height="30" 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    style={{ color: '#25D366' }}
                  >
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7 8.5 7 9.71C7 10.93 7.89 12.1 8 12.27C8.14 12.44 9.76 14.94 12.25 16C12.84 16.27 13.3 16.42 13.66 16.53C14.25 16.72 14.79 16.69 15.22 16.63C15.7 16.56 16.68 16.03 16.89 15.45C17.1 14.87 17.1 14.38 17.04 14.27C16.97 14.17 16.81 14.11 16.56 14C16.31 13.86 15.09 13.26 14.87 13.18C14.64 13.1 14.5 13.06 14.31 13.3C14.15 13.55 13.67 14.11 13.53 14.27C13.38 14.44 13.24 14.46 13 14.34C12.74 14.21 11.94 13.95 11 13.11C10.26 12.45 9.77 11.64 9.62 11.39C9.5 11.15 9.61 11 9.73 10.89C9.84 10.78 10 10.6 10.1 10.45C10.23 10.31 10.27 10.2 10.35 10.04C10.43 9.87 10.39 9.73 10.33 9.61C10.27 9.5 9.77 8.26 9.56 7.77C9.36 7.29 9.16 7.35 9 7.34C8.86 7.34 8.7 7.33 8.53 7.33Z"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Informações do pedido */}
            {pedidoDetalhes && (
              <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '16px' }}>


                {/* Layout em duas colunas: Informações + Produtos */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  {/* Informações do Pedido - Primeira Coluna */}
                  <div style={{ 
                    backgroundColor: 'white', 
                    borderRadius: '6px', 
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden',
                    flex: '0 0 280px'
                  }}>
                    <div style={{ 
                      backgroundColor: '#f9fafb', 
                      padding: '12px 16px',
                      borderBottom: '1px solid #e5e7eb',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>Informações do Pedido</span>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                        {pedidoDetalhes.tipo || 'Pedido'}
                      </span>
                    </div>
                    
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151', minWidth: '80px' }}>Cliente:</span>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>
                          {pedidoDetalhes.cliente || 'Não informado'}
                        </span>
                      </div>
                      
                      <div style={{ width: 'calc(100% + 32px)', height: '1px', backgroundColor: '#e5e7eb', margin: '4px -16px' }}></div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151', minWidth: '80px' }}>Status:</span>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>{pedidoDetalhes.status || 'Não informado'}</span>
                      </div>
                      
                      <div style={{ width: 'calc(100% + 32px)', height: '1px', backgroundColor: '#e5e7eb', margin: '4px -16px' }}></div>
                      

                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151', minWidth: '80px' }}>Horário:</span>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>{pedidoDetalhes.horarioPedido || 'Não informado'}</span>
                      </div>
                      
                      <div style={{ width: 'calc(100% + 32px)', height: '1px', backgroundColor: '#e5e7eb', margin: '4px -16px' }}></div>
                      
                      {pedidoDetalhes.endereco && (
                        <>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '6px 0' }}>
                            <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151', minWidth: '80px' }}>Endereço:</span>
                            <div style={{ 
                              fontSize: '14px', 
                              color: '#6b7280',
                              wordBreak: 'break-word',
                              lineHeight: '1.4',
                              flex: '1'
                            }}>
                              {typeof pedidoDetalhes.endereco === 'object' ? (
                                <>
                                  <div>{pedidoDetalhes.endereco.rua} {pedidoDetalhes.endereco.numero}</div>
                                  <div>{pedidoDetalhes.endereco.bairro}, {pedidoDetalhes.endereco.cidade}</div>
                                  {pedidoDetalhes.endereco.complemento && (
                                    <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '1px' }}>
                                      {pedidoDetalhes.endereco.complemento}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div>{pedidoDetalhes.endereco || 'Endereço não informado'}</div>
                              )}
                            </div>
                          </div>
                          
                          <div style={{ width: 'calc(100% + 32px)', height: '1px', backgroundColor: '#e5e7eb', margin: '4px -16px' }}></div>
                        </>
                      )}
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151', minWidth: '80px' }}>Pagamento:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          {/* NOVA LÓGICA DE EXIBIÇÃO DO PAGAMENTO */}
                          {(() => {
                            // Coleta os valores e status de cada forma
                            const pagamentos = [];
                            
                            // Verificar se tem dados completos do pedido
                            const dadosCompletos = pedidoDetalhes.dadosCompletos || pedidoDetalhes;
                            
                            if (dadosCompletos.valorRecebido && dadosCompletos.valorRecebido !== 'R$ 0,00') {
                              pagamentos.push({
                                tipo: 'Dinheiro',
                                valor: dadosCompletos.valorRecebido,
                                status: dadosCompletos.pagamentoDinheiro || 'agora',
                                troco: dadosCompletos.troco
                              });
                            }
                            if (dadosCompletos.valorPix && dadosCompletos.valorPix !== 'R$ 0,00') {
                              pagamentos.push({
                                tipo: 'PIX',
                                valor: dadosCompletos.valorPix,
                                status: dadosCompletos.pagamentoPix || 'agora',
                              });
                            }
                            if (dadosCompletos.valorDebito && dadosCompletos.valorDebito !== 'R$ 0,00') {
                              pagamentos.push({
                                tipo: 'Débito',
                                valor: dadosCompletos.valorDebito,
                                status: dadosCompletos.pagamentoDebito || 'agora',
                              });
                            }
                            if (dadosCompletos.valorCredito && dadosCompletos.valorCredito !== 'R$ 0,00') {
                              pagamentos.push({
                                tipo: 'Crédito',
                                valor: dadosCompletos.valorCredito,
                                status: dadosCompletos.pagamentoCredito || 'agora',
                              });
                            }
                            
                            if (pagamentos.length === 0 && pedidoDetalhes.formaPagamento) {
                              // fallback para string antiga
                              return <span style={{ fontSize: '14px', color: '#6b7280' }}>{pedidoDetalhes.formaPagamento}</span>;
                            }
                            return pagamentos.map((p, idx) => (
                              <span key={p.tipo} style={{ fontSize: '14px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                                {p.tipo}: {p.status === 'agora' ? 'Pago' : 'Pagamento na entrega'}
                                {p.tipo === 'Dinheiro' && p.troco && p.troco !== 'R$ 0,00' && (
                                  <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: 4 }}>(Troco: {p.troco})</span>
                                )}
                                {idx < pagamentos.length - 1 && <span style={{ margin: '0 4px' }}>|</span>}
                              </span>
                            ));
                          })()}
                        </div>
                      </div>
                      
                      <div style={{ width: 'calc(100% + 32px)', height: '1px', backgroundColor: '#e5e7eb', margin: '4px -16px' }}></div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151', minWidth: '80px' }}>Origem:</span>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>
                          {pedidoDetalhes.origem === 'cardapio' ? 'Cardápio Digital' : 'PDV'}
                        </span>
                      </div>
                      
                      <div style={{ width: 'calc(100% + 32px)', height: '1px', backgroundColor: '#e5e7eb', margin: '4px -16px' }}></div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151', minWidth: '80px' }}>Telefone:</span>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>{pedidoDetalhes.telefone || 'Não informado'}</span>
                      </div>
                      
                      {(pedidoDetalhes.observacoesGerais && pedidoDetalhes.observacoesGerais !== 'Sem observações' && pedidoDetalhes.observacoesGerais !== 'Dados do pedido não disponíveis no momento') && (
                        <>
                          <div style={{ width: 'calc(100% + 32px)', height: '1px', backgroundColor: '#e5e7eb', margin: '4px -16px' }}></div>
                          
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '6px 0' }}>
                            <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151', minWidth: '80px' }}>Observação:</span>
                            <span style={{ fontSize: '14px', color: '#6b7280', wordBreak: 'break-word', lineHeight: '1.4' }}>
                              {pedidoDetalhes.observacoesGerais}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Lista de Produtos - Segunda Coluna */}
                  <div style={{ 
                    backgroundColor: 'white', 
                    borderRadius: '6px', 
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden',
                    flex: '1'
                  }}>
                    <div style={{ 
                      backgroundColor: '#f9fafb', 
                      padding: '12px 16px',
                      borderBottom: '1px solid #e5e7eb',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>Produtos do Pedido</span>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                        {pedidoDetalhes.produtos?.length || 0} itens
                      </span>
                    </div>
                    
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {pedidoDetalhes.produtos?.map((produto: any, index: number) => (
                        <div key={produto.id} style={{ 
                          padding: '12px 16px',
                          borderBottom: index < pedidoDetalhes.produtos.length - 1 ? '1px solid #f3f4f6' : 'none'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', flex: '1', marginRight: '12px' }}>
                              {produto.quantidade}x {produto.nome}
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#542583', flexShrink: 0, whiteSpace: 'nowrap' }}>
                              {produto.subtotal || produto.preco}
                            </div>
                          </div>
                          
                          {produto.observacoes && (
                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                              {produto.observacoes}
                            </div>
                          )}
                          
                          {produto.adicionais && produto.adicionais.length > 0 && (
                            <div style={{ fontSize: '12px', color: '#542583' }}>
                              {produto.adicionais.map((adicional: any, index: number) => {
                                // Extrair quantidade do nome do adicional (ex: "Sim preciso de talher descartável! (3)")
                                const nomeCompleto = adicional.nome || adicional;
                                const match = nomeCompleto.match(/\((\d+)\)/);
                                const quantidade = match ? match[1] : '1';
                                const nomeLimpo = nomeCompleto.replace(/\s*\(\d+\)/, '');
                                
                                return (
                                  <div key={index} style={{ 
                                    marginBottom: '2px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                  }}>
                                    <span>{quantidade}x {nomeLimpo}</span>
                                    {adicional.preco && (
                                      <span style={{ 
                                        fontSize: '11px', 
                                        color: '#6b7280',
                                        fontWeight: '500',
                                        flexShrink: 0,
                                        marginLeft: '8px'
                                      }}>
                                        {adicional.preco}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Resumo Financeiro */}
                    <div style={{ 
                      borderTop: '1px solid #e5e7eb',
                      backgroundColor: '#f9fafb',
                      padding: '16px'
                    }}>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#374151', 
                        marginBottom: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span>Resumo Financeiro</span>
                        <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                          {pedidoDetalhes.produtos?.length || 0} itens
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '14px', color: '#6b7280' }}>Subtotal:</span>
                          <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>{pedidoDetalhes.subtotal}</span>
                        </div>
                        
                        {pedidoDetalhes.valorAcrescimo && pedidoDetalhes.valorAcrescimo !== 'R$ 0,00' && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '14px', color: '#6b7280' }}>Acréscimo:</span>
                            <span style={{ fontSize: '14px', color: '#059669', fontWeight: '500' }}>{pedidoDetalhes.valorAcrescimo}</span>
                          </div>
                        )}
                        
                        {pedidoDetalhes.valorDesconto && pedidoDetalhes.valorDesconto !== 'R$ 0,00' && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '14px', color: '#6b7280' }}>Desconto:</span>
                            <span style={{ fontSize: '14px', color: '#dc2626', fontWeight: '500' }}>{pedidoDetalhes.valorDesconto}</span>
                          </div>
                        )}
                        
                        {pedidoDetalhes.taxaEntrega && pedidoDetalhes.taxaEntrega !== 'R$ 0,00' && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '14px', color: '#6b7280' }}>Taxa de Entrega:</span>
                            <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>{pedidoDetalhes.taxaEntrega}</span>
                          </div>
                        )}
                        
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          borderTop: '1px solid #e5e7eb',
                          paddingTop: '8px',
                          marginTop: '4px'
                        }}>
                          <span style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>Total:</span>
                          <span style={{ fontSize: '16px', fontWeight: '700', color: '#542583' }}>{pedidoDetalhes.total}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Rodapé do Modal */}
          <div style={{ 
            borderTop: '1px solid #e5e7eb',
            padding: '16px 24px',
            backgroundColor: '#f9fafb',
            borderRadius: '0 0 4px 4px',
            display: 'flex',
            justifyContent: 'flex-end',
            flexShrink: 0
          }}>
            <button
              onClick={closeDetalhesModal}
              style={{
                background: 'transparent',
                color: '#374151',
                border: '1px solid #d1d5db',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                height: '40px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              Fechar
            </button>
          </div>
        </div>
      </>
    )}

    {/* Banner de notificação horizontal */}
    {notification.visible && (
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#542583',
          color: '#000000',
          padding: '16px 20px 0px 20px',
          borderRadius: '8px 8px 0px 0px',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 1000,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          width: '280px',
          textAlign: 'center',
          animation: 'slideInRight 0.3s ease-out',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ 
          fontSize: '14px', 
          fontWeight: 'bold',
          color: '#ffffff',
          textTransform: 'uppercase',
          letterSpacing: '0.3px',
          marginBottom: '12px'
        }}>
        {notification.message}
        </div>
        {/* Barra de timer verde grossa */}
        <div
          style={{
            width: 'calc(100% + 40px)',
            height: '8px',
            backgroundColor: '#CCC2C2',
            borderRadius: '0px',
            overflow: 'hidden',
            marginLeft: '-20px',
            marginRight: '-20px'
          }}
        >
          <div
            style={{
              width: `${timerProgress}%`,
              height: '100%',
              backgroundColor: '#6CA23D',
              borderRadius: '0px',
              transition: 'width 0.1s linear'
            }}
          />
        </div>
      </div>
    )}
    </ProtectedRoute>
  )
  }


