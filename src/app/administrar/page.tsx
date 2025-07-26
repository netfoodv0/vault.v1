'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { useAdministrarLoja } from '@/hooks/useAdministrarLoja'
import { useMotoboyFirebase } from '@/hooks/useMotoboyFirebase'
import { useStoreUsers } from '@/hooks/useStoreUsers'
import { useEntregas } from '@/hooks/useEntregas'
import { useConfiguracaoEntrega } from '@/hooks/useConfiguracaoEntrega'
import DeliveryMap from '@/components/maps/DeliveryMap'
import toast from 'react-hot-toast'

// Função utilitária para corrigir tipagem de eventos
const getEventTarget = (e: React.MouseEvent | React.FocusEvent): HTMLElement => {
  return e.target as HTMLElement
}

// Função utilitária para corrigir tipagem de eventos com propriedade disabled
const getEventTargetWithDisabled = (e: React.MouseEvent): HTMLButtonElement => {
  return e.target as HTMLButtonElement
}

export default function AdministrarPage() {
  const pathname = usePathname()
  const isPedidosActive = pathname === '/pedidos'
  const isCardapioActive = pathname === '/cardapio'
  const isAdministrarLojaActive = pathname === '/administrar'
  const isRelatoriosActive = pathname === '/relatorios'
  const { signOut, canAccessUsers } = useAuth()
  const [paginaAtiva, setPaginaAtiva] = useState('dados-loja')
  
  // Detectar hash inicial e mudanças
  useEffect(() => {
    if (pathname !== '/administrar') return;
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setPaginaAtiva(hash);
    }
  }, [pathname]);

  useEffect(() => {
    if (pathname !== '/administrar') return;
    const onHashChange = () => {
      setPaginaAtiva(window.location.hash.replace('#', ''));
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [pathname]);
  
  // Hook para gerenciar dados da loja
  const {
    configuracao,
    loading: configLoading,
    salvarDadosLoja,
    salvarConfiguracaoPagamento,
    salvarHorarios,
    salvarConfiguracaoImpressao,
    uploadImage,
    deleteImage
  } = useAdministrarLoja()

  // Hook para gerenciar motoboys
  const {
    motoboys: listaMotoboys,
    loading: motoboyLoading,
    createMotoboy,
    updateMotoboy,
    deleteMotoboy,
    toggleMotoboyStatus
  } = useMotoboyFirebase()

  // Hook do Firebase para usuários da loja
  const {
    storeUsers,
    loading: usersLoading,
    createStoreUser,
    updateStoreUser,
    deleteStoreUser,
    toggleUserStatus
  } = useStoreUsers()

  // Hook para gerenciar entregas
  const {
    entregas,
    loading: entregasLoading,
    estatisticas,
    atualizarStatusEntrega,
    atribuirMotoboy,
    criarEntrega,
    criarEntregasDemo
  } = useEntregas()

  // Hook para gerenciar configurações de entrega
  const {
    configuracao: configuracaoEntrega,
    loading: entregaConfigLoading,
    salvarEnderecoLoja,
    adicionarRaioEntrega,
    atualizarRaioEntrega,
    excluirRaioEntrega,
    salvarConfiguracoesEntrega,
    salvarTipoCalculoEntrega,
    calcularDistanciaRotaReal
  } = useConfiguracaoEntrega()
  
  // Estados locais dos formulários
  const [nomeLoja, setNomeLoja] = useState('')
  const [descricaoLoja, setDescricaoLoja] = useState('')
  const [linkPersonalizado, setLinkPersonalizado] = useState('')
  const [logoUrl, setLogoUrl] = useState('/product-placeholder.jpg')
  const [bannerUrl, setBannerUrl] = useState('/product-placeholder.jpg')
  const [aceitarDelivery, setAceitarDelivery] = useState(true)
  const [aceitarRetirada, setAceitarRetirada] = useState(true)
  const [aceitarBalcao, setAceitarBalcao] = useState(true)
  const [aceitarDinheiro, setAceitarDinheiro] = useState(true)
  const [aceitarPix, setAceitarPix] = useState(false)
  const [tipoChavePix, setTipoChavePix] = useState('CPF')
  const [chavePix, setChavePix] = useState('')
  const [dropdownChavePixAberto, setDropdownChavePixAberto] = useState(false)
  const [placeholderChavePix, setPlaceholderChavePix] = useState('000.000.000-00')
  const [nomeRecebedorPix, setNomeRecebedorPix] = useState('')
  const [cidadeRecebedorPix, setCidadeRecebedorPix] = useState('')
  
  // Estados para motoboys
  const [ativarMotoboys, setAtivarMotoboys] = useState(false)
  const [showNovoMotoboyModal, setShowNovoMotoboyModal] = useState(false)
  const [nomeMotoboy, setNomeMotoboy] = useState('')
  const [whatsappMotoboy, setWhatsappMotoboy] = useState('')
  const [motoboyAtivo, setMotoboyAtivo] = useState(true)
  const [editandoMotoboy, setEditandoMotoboy] = useState<{ id: string; nome: string; whatsapp: string; ativo: boolean } | null>(null)
  const [showVisualizarMotoboyModal, setShowVisualizarMotoboyModal] = useState(false)
  const [motoboyVisualizando, setMotoboyVisualizando] = useState<{ id: string; nome: string; whatsapp: string; ativo: boolean } | null>(null)

  // Estados para modal de confirmação de exclusão de motoboy
  const [showConfirmarExclusaoMotoboyModal, setShowConfirmarExclusaoMotoboyModal] = useState(false)
  const [motoboyParaExcluir, setMotoboyParaExcluir] = useState<{ id: string; nome: string } | null>(null)


  // Funções de máscara
  const aplicarMascaraCPF = (valor: string) => {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1')
  }

  const aplicarMascaraCNPJ = (valor: string) => {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1')
  }

  const aplicarMascaraCelular = (valor: string) => {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{1,4})/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1')
  }

  const aplicarMascaraEmail = (valor: string) => {
    // Para email, apenas remove espaços
    return valor.replace(/\s/g, '').toLowerCase()
  }

  const aplicarMascaraChaveAleatoria = (valor: string) => {
    // Para chave aleatória, permite apenas caracteres alfanuméricos e hífens
    return valor.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()
  }

  const aplicarMascara = (valor: string, tipo: string) => {
    switch (tipo) {
      case 'CPF':
        return aplicarMascaraCPF(valor)
      case 'CNPJ':
        return aplicarMascaraCNPJ(valor)
      case 'Celular':
        return aplicarMascaraCelular(valor)
      case 'E-mail':
        return aplicarMascaraEmail(valor)
      case 'Chave Aleatória':
        return aplicarMascaraChaveAleatoria(valor)
      default:
        return valor
    }
  }

  const aplicarMascaraWhatsApp = (valor: string) => {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{1,4})/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1')
  }

  const validarChavePix = (valor: string, tipo: string) => {
    if (!valor) return false
    
    switch (tipo) {
      case 'CPF':
        return valor.replace(/\D/g, '').length === 11
      case 'CNPJ':
        return valor.replace(/\D/g, '').length === 14
      case 'Celular':
        return valor.replace(/\D/g, '').length === 11
      case 'E-mail':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)
      case 'Chave Aleatória':
        return valor.length >= 8
      default:
        return false
    }
  }

  // Função para formatar preço em moeda brasileira (igual ao cardápio)
  const formatPrice = (value: string) => {
    // Remove tudo que não for número
    const numbers = value.replace(/\D/g, '')
    
    // Se vazio, retorna R$ 0,00
    if (!numbers) return 'R$ 0,00'
    
    // Converte para número e divide por 100 para ter centavos
    const amount = parseInt(numbers) / 100
    
    // Formata em moeda brasileira
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  // Função para lidar com mudança no pedido mínimo
  const handlePedidoMinimoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPrice(e.target.value)
    setPedidoMinimoEntrega(formatted)
  }

  // Função para lidar com mudança no valor mínimo para frete grátis
  const handleValorMinimoFreteGratisChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPrice(e.target.value)
    setValorMinimoFreteGratis(formatted)
  }
  const [aceitarCredito, setAceitarCredito] = useState(true)
  const [aceitarDebito, setAceitarDebito] = useState(true)
  
  // Estados das bandeiras de cartão
  const [bandeirasMastercard, setBandeirasMastercard] = useState({ credito: true, debito: true })
  const [bandeirasVisa, setBandeirasVisa] = useState({ credito: true, debito: true })
  const [bandeirasAmericanExpress, setBandeirasAmericanExpress] = useState({ credito: true, debito: true })
  const [bandeirasElo, setBandeirasElo] = useState({ credito: true, debito: true })
  const [bandeirasHipercard, setBandeirasHipercard] = useState({ credito: true, debito: true })
  
  // Estado para bandeiras personalizadas
  const [bandeirasPersonalizadas, setBandeirasPersonalizadas] = useState<Array<{id: number; nome: string; credito: boolean; debito: boolean}>>([])
  
  // Estado do modal de nova bandeira
  const [showNovaBandeiraModal, setShowNovaBandeiraModal] = useState(false)
  const [nomeBandeira, setNomeBandeira] = useState('')
  const [tiposBandeira, setTiposBandeira] = useState({ credito: false, debito: false })
  
  // Estados para configurações de impressão
  const [mostrarCnpjLoja, setMostrarCnpjLoja] = useState(true)
  const [mostrarCategoriaProdutos, setMostrarCategoriaProdutos] = useState(true)
  const [mostrarDescricaoProdutos, setMostrarDescricaoProdutos] = useState(true)
  const [tipoExibicaoPizza, setTipoExibicaoPizza] = useState('nome-completo') // 'nome-completo' ou 'por-fracao'
  const [quantidadeAdicionais, setQuantidadeAdicionais] = useState('agrupar-manter') // 'agrupar-manter', 'agrupar-multiplicar', 'exibir-separadamente'
  
  // Estados para modal de usuário
  const [showNovoUsuarioModal, setShowNovoUsuarioModal] = useState(false)
  const [nomeCompleto, setNomeCompleto] = useState('')
  const [funcaoUsuario, setFuncaoUsuario] = useState('operador')
  const [emailUsuario, setEmailUsuario] = useState('')
  const [cpfUsuario, setCpfUsuario] = useState('')
  const [whatsappUsuario, setWhatsappUsuario] = useState('')
  const [senhaUsuario, setSenhaUsuario] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [dropdownFuncaoAberto, setDropdownFuncaoAberto] = useState(false)
  
  // Estados para modal de visualizar usuário
  const [showVisualizarUsuarioModal, setShowVisualizarUsuarioModal] = useState(false)
  const [usuarioVisualizando, setUsuarioVisualizando] = useState<{ id: string; name: string; email: string; role?: string; cpf?: string; whatsapp?: string } | null>(null)
  
  // Estados para modal de editar usuário
  const [showEditarUsuarioModal, setShowEditarUsuarioModal] = useState(false)
  const [usuarioEditando, setUsuarioEditando] = useState<{ id: string; name: string; email: string; role?: string; cpf?: string; whatsapp?: string } | null>(null)
  const [nomeCompletoEdit, setNomeCompletoEdit] = useState('')
  const [funcaoUsuarioEdit, setFuncaoUsuarioEdit] = useState('operador')
  const [emailUsuarioEdit, setEmailUsuarioEdit] = useState('')
  const [cpfUsuarioEdit, setCpfUsuarioEdit] = useState('')
  const [whatsappUsuarioEdit, setWhatsappUsuarioEdit] = useState('')
  const [dropdownFuncaoEditAberto, setDropdownFuncaoEditAberto] = useState(false)

  // Estados para modal de confirmação de exclusão de usuário
  const [showConfirmarExclusaoUsuarioModal, setShowConfirmarExclusaoUsuarioModal] = useState(false)
  const [usuarioParaExcluir, setUsuarioParaExcluir] = useState<{ id: string; name: string } | null>(null)
  

  
  // Estado do relógio
  const [horaAtual, setHoraAtual] = useState('')
  const [fusoSelecionado, setFusoSelecionado] = useState('America/Sao_Paulo')
  const [dropdownAberto, setDropdownAberto] = useState(false)
  
  // Estados para configuração de entrega
  const [calculoEntregaSelecionado, setCalculoEntregaSelecionado] = useState('distancia_linha')
  const [dropdownCalculoEntregaAberto, setDropdownCalculoEntregaAberto] = useState(false)
  const [pedidoMinimoEntrega, setPedidoMinimoEntrega] = useState('R$ 0,00')
  const [freteGratisAtivo, setFreteGratisAtivo] = useState(false)
  const [valorMinimoFreteGratis, setValorMinimoFreteGratis] = useState('R$ 0,00')
  const [secaoAtiva, setSecaoAtiva] = useState('sessao-entrega') // 'sessao-entrega' ou 'endereco'
  
  // Estados para controlar foco dos campos de endereço
  const [camposFocados, setCamposFocados] = useState({
    rua: false,
    numero: false,
    complemento: false,
    pontoReferencia: false,
    bairro: false,
    cidade: false,
    estado: false,
    cep: false
  })

  // Função de busca do mapa (será definida pelo componente DeliveryMap)
  const [buscarEnderecoNoMapa, setBuscarEnderecoNoMapa] = useState<(() => void) | null>(null)

  // Estados para modal de raio de entrega
  const [modalRaioEntregaAberto, setModalRaioEntregaAberto] = useState(false)
  const [distanciaRaio, setDistanciaRaio] = useState(1) // km
  const [tempoMaximo, setTempoMaximo] = useState('') // minutos
  const [precoRaio, setPrecoRaio] = useState('') // valor em reais
  const [raiosEntrega, setRaiosEntrega] = useState<Array<{id: number; distancia: number; tempoMaximo: number; preco: string; createdAt: Date}>>([]) // lista de raios cadastrados (carregada do Firebase)
  const [editandoRaio, setEditandoRaio] = useState<{ id: number; distancia: number; tempoMaximo: number; preco: string } | null>(null) // raio sendo editado
  
  // Estados para valores dos campos de endereço
  const [valoresCampos, setValoresCampos] = useState({
    rua: '',
    numero: '',
    complemento: '',
    pontoReferencia: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: ''
  })

  // Estados para erros de validação dos campos de endereço
  const [errosCampos, setErrosCampos] = useState({
    rua: '',
    numero: '',
    complemento: '',
    pontoReferencia: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: ''
  })
  
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
  
  // Estados para dropdown do país
  const [dropdownPaisAberto, setDropdownPaisAberto] = useState(false)
  const [paisSelecionado, setPaisSelecionado] = useState('Brasil')
  
  // Lista de países
  const paises = [
    'Brasil',
    'Argentina',
    'Chile',
    'Uruguai',
    'Paraguai',
    'Bolívia',
    'Peru',
    'Colômbia',
    'Venezuela',
    'Equador'
  ]
  
  // Opções de cálculo de entrega
  const opcoesCalculoEntrega = [
    { value: 'distancia_linha', label: 'Entrega por distância (linha reta)', descricao: 'Recomendado', recomendado: true },
    { value: 'distancia_rota', label: 'Entrega por distância (rota)', descricao: 'Calcula baseado na rota real' },
    { value: 'bairro', label: 'Entrega por bairro', descricao: 'Divide a cidade por bairros' }
  ]
  
  // Estados dos horários de funcionamento
  const [horariosFuncionamento, setHorariosFuncionamento] = useState([
    { dia: 'Segunda-feira', horarios: [{ abertura: '18:00', fechamento: '19:30' }], fechado: false },
    { dia: 'Terça-feira', horarios: [{ abertura: '18:00', fechamento: '19:30' }], fechado: false },
    { dia: 'Quarta-feira', horarios: [{ abertura: '18:00', fechamento: '19:30' }], fechado: false },
    { dia: 'Quinta-feira', horarios: [{ abertura: '18:00', fechamento: '19:30' }], fechado: false },
    { dia: 'Sexta-feira', horarios: [{ abertura: '18:00', fechamento: '19:30' }], fechado: false },
    { dia: 'Sábado', horarios: [{ abertura: '18:00', fechamento: '19:30' }], fechado: false },
    { dia: 'Domingo', horarios: [{ abertura: '18:00', fechamento: '19:30' }], fechado: false }
  ])

  // Estados para o modal de crop de imagem
  const [showCropModal, setShowCropModal] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string>('')
  const [uploadingForBanner, setUploadingForBanner] = useState(false)
  const [cropPosition, setCropPosition] = useState({ x: 45, y: 45 })
  const [cropSize, setCropSize] = useState({ width: 210, height: 210 })
  const [imageDimensions, setImageDimensions] = useState({ width: 400, height: 400 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState('')
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageRefreshKey, setImageRefreshKey] = useState(0)

  // Carregar dados da configuração quando disponível
  useEffect(() => {
    if (configuracao) {
      setNomeLoja(configuracao.nomeLoja)
      setDescricaoLoja(configuracao.descricaoLoja || '')
      setLinkPersonalizado(configuracao.linkPersonalizado)
      setLogoUrl(configuracao.logoUrl)
      setBannerUrl(configuracao.bannerUrl)
      setAceitarDelivery(configuracao.aceitarDelivery)
      setAceitarRetirada(configuracao.aceitarRetirada)
      setAceitarBalcao(configuracao.aceitarBalcao)
      setFusoSelecionado(configuracao.fusoHorario)
      setHorariosFuncionamento(configuracao.horariosFuncionamento)
      
      // Carregar configurações de pagamento
      if (configuracao.aceitarDinheiro !== undefined) {
        setAceitarDinheiro(configuracao.aceitarDinheiro)
      }
      if (configuracao.aceitarPix !== undefined) {
        setAceitarPix(configuracao.aceitarPix)
      }
      if (configuracao.aceitarCredito !== undefined) {
        setAceitarCredito(configuracao.aceitarCredito)
      }
      if (configuracao.aceitarDebito !== undefined) {
        setAceitarDebito(configuracao.aceitarDebito)
      }
      if (configuracao.bandeirasMastercard) {
        setBandeirasMastercard(configuracao.bandeirasMastercard)
      }
      if (configuracao.bandeirasVisa) {
        setBandeirasVisa(configuracao.bandeirasVisa)
      }
      if (configuracao.bandeirasAmericanExpress) {
        setBandeirasAmericanExpress(configuracao.bandeirasAmericanExpress)
      }
      if (configuracao.bandeirasElo) {
        setBandeirasElo(configuracao.bandeirasElo)
      }
      if (configuracao.bandeirasHipercard) {
        setBandeirasHipercard(configuracao.bandeirasHipercard)
      }
      if (configuracao.bandeirasPersonalizadas) {
        setBandeirasPersonalizadas(configuracao.bandeirasPersonalizadas)
      }
      
      // Carregar configurações de impressão
      if (configuracao.mostrarCnpjLoja !== undefined) {
        setMostrarCnpjLoja(configuracao.mostrarCnpjLoja)
      }
      if (configuracao.mostrarCategoriaProdutos !== undefined) {
        setMostrarCategoriaProdutos(configuracao.mostrarCategoriaProdutos)
      }
      if (configuracao.mostrarDescricaoProdutos !== undefined) {
        setMostrarDescricaoProdutos(configuracao.mostrarDescricaoProdutos)
      }
      if (configuracao.tipoExibicaoPizza) {
        setTipoExibicaoPizza(configuracao.tipoExibicaoPizza)
      }
      if (configuracao.quantidadeAdicionais) {
        setQuantidadeAdicionais(configuracao.quantidadeAdicionais)
      }
    }
  }, [configuracao])

  // Carregar dados da configuração de entrega quando disponível
  useEffect(() => {
    if (configuracaoEntrega) {
      // Carregar endereço da loja
      setValoresCampos({
        rua: configuracaoEntrega.enderecoLoja.rua,
        numero: configuracaoEntrega.enderecoLoja.numero,
        complemento: configuracaoEntrega.enderecoLoja.complemento,
        pontoReferencia: configuracaoEntrega.enderecoLoja.pontoReferencia,
        bairro: configuracaoEntrega.enderecoLoja.bairro,
        cidade: configuracaoEntrega.enderecoLoja.cidade,
        estado: configuracaoEntrega.enderecoLoja.estado,
        cep: configuracaoEntrega.enderecoLoja.cep
      })
      setPaisSelecionado(configuracaoEntrega.enderecoLoja.pais)
      
      // Carregar raios de entrega
      setRaiosEntrega(configuracaoEntrega.raiosEntrega)
      
      // Carregar tipo de cálculo de entrega
      if (configuracaoEntrega.tipoCalculoEntrega) {
        setCalculoEntregaSelecionado(configuracaoEntrega.tipoCalculoEntrega)
      }
    }
  }, [configuracaoEntrega])

  const handleLogout = async () => {
    await signOut()
  }

  // Função para salvar dados da loja
  const handleSalvarDadosLoja = async () => {
    try {
      await salvarDadosLoja({
        nomeLoja,
        descricaoLoja,
        linkPersonalizado,
        logoUrl,
        bannerUrl,
        aceitarDelivery,
        aceitarRetirada,
        aceitarBalcao
      })
    } catch (error) {
      console.error('Erro ao salvar dados da loja:', error)
    }
  }

  // Função para salvar horários
  const handleSalvarHorarios = async () => {
    try {
      await salvarHorarios(horariosFuncionamento, fusoSelecionado)
    } catch (error) {
      console.error('Erro ao salvar horários:', error)
    }
  }

  // Função para validar campos obrigatórios
  const validarCamposEndereco = () => {
    const novosErros = {
      rua: '',
      numero: '',
      complemento: '',
      pontoReferencia: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: ''
    }

    let temErro = false

    // Validar todos os campos como obrigatórios
    if (!valoresCampos.rua.trim()) {
      novosErros.rua = 'Campo obrigatório'
      temErro = true
    }

    if (!valoresCampos.numero.trim()) {
      novosErros.numero = 'Campo obrigatório'
      temErro = true
    }

    if (!valoresCampos.complemento.trim()) {
      novosErros.complemento = 'Campo obrigatório'
      temErro = true
    }

    if (!valoresCampos.pontoReferencia.trim()) {
      novosErros.pontoReferencia = 'Campo obrigatório'
      temErro = true
    }

    if (!valoresCampos.bairro.trim()) {
      novosErros.bairro = 'Campo obrigatório'
      temErro = true
    }

    if (!valoresCampos.cidade.trim()) {
      novosErros.cidade = 'Campo obrigatório'
      temErro = true
    }

    if (!valoresCampos.estado.trim()) {
      novosErros.estado = 'Campo obrigatório'
      temErro = true
    }

    if (!valoresCampos.cep.trim()) {
      novosErros.cep = 'Campo obrigatório'
      temErro = true
    }

    setErrosCampos(novosErros)
    return !temErro
  }

  // Função para salvar endereço da loja
  const handleSalvarEnderecoLoja = async () => {
    // Validar campos antes de salvar
    if (!validarCamposEndereco()) {
      return
    }

    try {
      const endereco = {
        rua: valoresCampos.rua,
        numero: valoresCampos.numero,
        complemento: valoresCampos.complemento,
        pontoReferencia: valoresCampos.pontoReferencia,
        bairro: valoresCampos.bairro,
        cidade: valoresCampos.cidade,
        estado: valoresCampos.estado,
        cep: valoresCampos.cep,
        pais: paisSelecionado
      }
      
      await salvarEnderecoLoja(endereco)
      
      // Limpar erros após salvar com sucesso
      setErrosCampos({
        rua: '',
        numero: '',
        complemento: '',
        pontoReferencia: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: ''
      })
      
      // Também localizar no mapa após salvar
      if (buscarEnderecoNoMapa) {
        buscarEnderecoNoMapa()
      }
    } catch (error) {
      console.error('Erro ao salvar endereço da loja:', error)
    }
  }

  // Função para lidar com upload de imagens
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, tipo: 'logo' | 'banner') => {
    const file = event.target.files?.[0]
    if (file) {
      // Detectar se é upload para banner ou logo
      setUploadingForBanner(tipo === 'banner')
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImageToCrop(result)
        // Reset do crop para valores padrão baseado no tipo
        if (tipo === 'logo') {
          setCropSize({ width: 156, height: 156 })
          setCropPosition({ x: 45, y: 45 })
        } else {
          setCropSize({ width: 355, height: 156 })
          setCropPosition({ x: 45, y: 45 })
        }
        setImageDimensions({ width: 400, height: 400 })
        setShowCropModal(true)
      }
      reader.readAsDataURL(file)
    }
    // Reset do input para permitir selecionar a mesma imagem novamente
    event.target.value = ''
  }

  // Função para confirmar o crop da imagem
  const handleCropConfirm = async () => {
    // Criar canvas para fazer o crop real da imagem
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = async () => {
      // Definir tamanho do canvas como o tamanho do crop
      canvas.width = cropSize.width
      canvas.height = cropSize.height
      
      // Calcular a escala entre a imagem original e a imagem exibida
      const displayedImg = document.querySelector('#crop-image') as HTMLImageElement
      const scaleX = img.naturalWidth / displayedImg.offsetWidth
      const scaleY = img.naturalHeight / displayedImg.offsetHeight
      
      // Calcular as coordenadas reais na imagem original
      const sourceX = cropPosition.x * scaleX
      const sourceY = cropPosition.y * scaleY
      const sourceWidth = cropSize.width * scaleX
      const sourceHeight = cropSize.height * scaleY
      
      // Desenhar apenas a área recortada no canvas
      ctx?.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight, // Área de origem
        0, 0, cropSize.width, cropSize.height // Área de destino
      )
      
      // Converter canvas para blob e fazer upload
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            // Criar arquivo a partir do blob
            const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' })
            
            // Deletar imagem anterior se não for placeholder
            const imagemAnterior = uploadingForBanner ? bannerUrl : logoUrl
            if (imagemAnterior !== '/product-placeholder.jpg') {
              await deleteImage(imagemAnterior)
            }

            // Fazer upload da nova imagem
            const tipo = uploadingForBanner ? 'banner' : 'logo'
            const novaImagemUrl = await uploadImage(file, tipo)
            
            // Atualizar estado local
            if (uploadingForBanner) {
              setBannerUrl(novaImagemUrl)
            } else {
              setLogoUrl(novaImagemUrl)
            }
            
            // Forçar atualização da imagem
            setImageRefreshKey(prev => prev + 1)
          } catch (error) {
            console.error('Erro ao fazer upload da imagem:', error)
          }
        }
      }, 'image/jpeg', 1.0)
      
      // Fechar modal e resetar estado
      setShowCropModal(false)
      setImageToCrop('')
      setUploadingForBanner(false)
    }
    
    img.src = imageToCrop
  }

  // Função para cancelar o crop
  const handleCropCancel = () => {
    setShowCropModal(false)
    setImageToCrop('')
    setUploadingForBanner(false)
    setCropPosition({ x: 45, y: 45 })
    setCropSize({ width: 210, height: 210 })
  }

  // Funções para controlar o drag do crop
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - cropPosition.x,
      y: e.clientY - cropPosition.y
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y
      
      // Limitar movimento dentro da área da imagem
      const maxX = imageDimensions.width - cropSize.width
      const maxY = imageDimensions.height - cropSize.height
      
      setCropPosition({
        x: Math.max(0, Math.min(maxX, newX)),
        y: Math.max(0, Math.min(maxY, newY))
      })
    } else if (isResizing) {
      const currentMouseX = e.clientX
      const currentMouseY = e.clientY
      
      const containerRect = e.currentTarget.getBoundingClientRect()
      const relativeX = currentMouseX - containerRect.left
      const relativeY = currentMouseY - containerRect.top
      
      let newWidth = cropSize.width
      let newHeight = cropSize.height
      let newX = cropPosition.x
      let newY = cropPosition.y
      
      // Redimensionamento mantendo proporção para logo (quadrado) ou livre para banner
      if (!uploadingForBanner) {
        // Logo: sempre quadrado
        let newSize = cropSize.width
        const centerX = newX + newWidth / 2
        const centerY = newY + newHeight / 2
        
        switch (resizeDirection) {
          case 'right':
          case 'left':
            newSize = Math.max(50, Math.abs(relativeX - centerX) * 2)
            break
          case 'bottom':
          case 'top':
            newSize = Math.max(50, Math.abs(relativeY - centerY) * 2)
            break
          case 'topleft':
          case 'topright':
          case 'bottomleft':
          case 'bottomright':
            const deltaX = Math.abs(relativeX - centerX)
            const deltaY = Math.abs(relativeY - centerY)
            newSize = Math.max(50, Math.max(deltaX, deltaY) * 2)
            break
        }
        
        // Limitar o tamanho para caber na imagem
        const maxSize = Math.min(imageDimensions.width, imageDimensions.height)
        newSize = Math.min(newSize, maxSize)
        
        // Ajustar posição para manter centralizado
        newX = Math.max(0, Math.min(imageDimensions.width - newSize, centerX - newSize / 2))
        newY = Math.max(0, Math.min(imageDimensions.height - newSize, centerY - newSize / 2))
        
        newWidth = newSize
        newHeight = newSize
      } else {
        // Banner: redimensionamento livre mantendo proporção 355:156
        const aspectRatio = 355 / 156
        
        switch (resizeDirection) {
          case 'right':
            newWidth = Math.max(100, relativeX - newX)
            newHeight = newWidth / aspectRatio
            break
          case 'bottom':
            newHeight = Math.max(50, relativeY - newY)
            newWidth = newHeight * aspectRatio
            break
          case 'bottomright':
            newWidth = Math.max(100, relativeX - newX)
            newHeight = newWidth / aspectRatio
            break
        }
        
        // Limitar para não sair da imagem
        newWidth = Math.min(newWidth, imageDimensions.width - newX)
        newHeight = Math.min(newHeight, imageDimensions.height - newY)
      }
      
      setCropSize({ width: newWidth, height: newHeight })
      setCropPosition({ x: newX, y: newY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
    setResizeDirection('')
  }

  // Função para iniciar redimensionamento
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation()
    setIsResizing(true)
    setResizeDirection(direction)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  // Funções para gerenciar nova bandeira
  const handleAbrirModalNovaBandeira = () => {
    setNomeBandeira('')
    setTiposBandeira({ credito: false, debito: false })
    setShowNovaBandeiraModal(true)
  }

  const handleFecharModalNovaBandeira = () => {
    setShowNovaBandeiraModal(false)
    setNomeBandeira('')
    setTiposBandeira({ credito: false, debito: false })
  }

  const handleAdicionarBandeira = () => {
    if (nomeBandeira.trim() && (tiposBandeira.credito || tiposBandeira.debito)) {
      const novaBandeira = {
        id: Date.now(),
        nome: nomeBandeira.trim(),
        credito: tiposBandeira.credito,
        debito: tiposBandeira.debito
      }
      setBandeirasPersonalizadas(prev => [...prev, novaBandeira])
      handleFecharModalNovaBandeira()
    }
  }

  const handleRemoverBandeira = (id: number) => {
    setBandeirasPersonalizadas(prev => prev.filter(bandeira => bandeira.id !== id))
  }

  // Funções para gerenciar modal de novo motoboy
  const handleAbrirModalNovoMotoboy = () => {
    setEditandoMotoboy(null)
    setNomeMotoboy('')
    setWhatsappMotoboy('')
    setMotoboyAtivo(true)
    setShowNovoMotoboyModal(true)
  }

  const handleAbrirModalEditarMotoboy = (motoboy: { id: string; nome: string; whatsapp: string; ativo: boolean }) => {
    setEditandoMotoboy(motoboy)
    setNomeMotoboy(motoboy.nome)
    setWhatsappMotoboy(motoboy.whatsapp)
    setMotoboyAtivo(motoboy.ativo)
    setShowNovoMotoboyModal(true)
  }

  const handleFecharModalNovoMotoboy = () => {
    setShowNovoMotoboyModal(false)
    setEditandoMotoboy(null)
    setNomeMotoboy('')
    setWhatsappMotoboy('')
    setMotoboyAtivo(true)
  }

  const handleCadastrarMotoboy = async () => {
    if (nomeMotoboy.trim() && whatsappMotoboy.trim()) {
      try {
        if (editandoMotoboy) {
          // Editando motoboy existente
          await updateMotoboy(editandoMotoboy.id, {
            nome: nomeMotoboy.trim(),
            whatsapp: whatsappMotoboy.trim(),
            ativo: motoboyAtivo
          })
        } else {
          // Criando novo motoboy
          await createMotoboy({
            nome: nomeMotoboy.trim(),
            whatsapp: whatsappMotoboy.trim(),
            ativo: motoboyAtivo
          })
        }
        handleFecharModalNovoMotoboy()
      } catch (error) {
        console.error('Erro ao salvar motoboy:', error)
      }
    }
  }

  const handleToggleStatusMotoboy = async (id: string) => {
    try {
      await toggleMotoboyStatus(id)
    } catch (error) {
      console.error('Erro ao alterar status do motoboy:', error)
    }
  }

  const handleRemoverMotoboy = async (motoboy: { id: string; nome: string }) => {
    setMotoboyParaExcluir(motoboy)
    setShowConfirmarExclusaoMotoboyModal(true)
  }

  const handleConfirmarExclusaoMotoboy = async () => {
    if (motoboyParaExcluir) {
      try {
        await deleteMotoboy(motoboyParaExcluir.id)
        setShowConfirmarExclusaoMotoboyModal(false)
        setMotoboyParaExcluir(null)
      } catch (error) {
        console.error('Erro ao remover motoboy:', error)
      }
    }
  }

  const handleCancelarExclusaoMotoboy = () => {
    setShowConfirmarExclusaoMotoboyModal(false)
    setMotoboyParaExcluir(null)
  }

  const handleAbrirModalVisualizarMotoboy = (motoboy: { id: string; nome: string; whatsapp: string; ativo: boolean }) => {
    setMotoboyVisualizando(motoboy)
    setShowVisualizarMotoboyModal(true)
  }

  const handleFecharModalVisualizarMotoboy = () => {
    setShowVisualizarMotoboyModal(false)
    setMotoboyVisualizando(null)
  }

  const handleAbrirModalVisualizarUsuario = (usuario: { id: string; name: string; email: string; role?: string }) => {
    setUsuarioVisualizando(usuario)
    setShowVisualizarUsuarioModal(true)
  }

  const handleFecharModalVisualizarUsuario = () => {
    setShowVisualizarUsuarioModal(false)
    setUsuarioVisualizando(null)
  }

  const handleAbrirModalEditarUsuario = (usuario: { id: string; name: string; email: string; role?: string; cpf?: string; whatsapp?: string }) => {
    setUsuarioEditando(usuario)
    setNomeCompletoEdit(usuario.name)
    setFuncaoUsuarioEdit(usuario.role || 'operador')
    setEmailUsuarioEdit(usuario.email)
    setCpfUsuarioEdit(usuario.cpf || '')
    setWhatsappUsuarioEdit(usuario.whatsapp || '')
    setShowEditarUsuarioModal(true)
  }

  const handleFecharModalEditarUsuario = () => {
    setShowEditarUsuarioModal(false)
    setUsuarioEditando(null)
    setNomeCompletoEdit('')
    setFuncaoUsuarioEdit('operador')
    setEmailUsuarioEdit('')
    setCpfUsuarioEdit('')
    setWhatsappUsuarioEdit('')
    setDropdownFuncaoEditAberto(false)
  }

  const handleSalvarEdicaoUsuario = async () => {
    if (!nomeCompletoEdit.trim() || !cpfUsuarioEdit.trim() || !whatsappUsuarioEdit.trim()) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    if (!validarCpf(cpfUsuarioEdit)) {
      toast.error('CPF inválido')
      return
    }

    if (!usuarioEditando) return
    
    const success = await updateStoreUser(usuarioEditando.id, {
      name: nomeCompletoEdit.trim(),
      cpf: cpfUsuarioEdit.trim(),
      whatsapp: whatsappUsuarioEdit.trim(),
      role: funcaoUsuarioEdit as 'dono' | 'gerente' | 'operador'
    })

    if (success) {
      handleFecharModalEditarUsuario()
    }
  }

  const handleExcluirUsuario = async (usuario: { id: string; name: string }) => {
    setUsuarioParaExcluir(usuario)
    setShowConfirmarExclusaoUsuarioModal(true)
  }

  const handleConfirmarExclusaoUsuario = async () => {
    if (!usuarioParaExcluir) return

    const success = await deleteStoreUser(usuarioParaExcluir.id)
    
    if (success) {
      setShowConfirmarExclusaoUsuarioModal(false)
      setUsuarioParaExcluir(null)
    }
  }

  const handleCancelarExclusaoUsuario = () => {
    setShowConfirmarExclusaoUsuarioModal(false)
    setUsuarioParaExcluir(null)
  }

  // Funções para gerenciar modal de novo usuário
  const handleAbrirModalNovoUsuario = () => {
    setNomeCompleto('')
    setFuncaoUsuario('operador')
    setEmailUsuario('')
    setCpfUsuario('')
    setWhatsappUsuario('')
    setSenhaUsuario('')
    setMostrarSenha(false)
    setShowNovoUsuarioModal(true)
  }

  const handleFecharModalNovoUsuario = () => {
    setShowNovoUsuarioModal(false)
    setNomeCompleto('')
    setFuncaoUsuario('operador')
    setEmailUsuario('')
    setCpfUsuario('')
    setWhatsappUsuario('')
    setSenhaUsuario('')
    setMostrarSenha(false)
    setDropdownFuncaoAberto(false)
  }

  const handleCadastrarUsuario = async () => {
    if (!nomeCompleto.trim() || !emailUsuario.trim() || !cpfUsuario.trim() || !whatsappUsuario.trim() || !senhaUsuario.trim()) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    if (!validarCpf(cpfUsuario)) {
      toast.error('CPF inválido')
      return
    }

    if (senhaUsuario.length < 6) {
      toast.error('A senha deve ter no mínimo 6 dígitos')
      return
    }

    const success = await createStoreUser({
      name: nomeCompleto.trim(),
      email: emailUsuario.trim(),
      cpf: cpfUsuario.trim(),
      whatsapp: whatsappUsuario.trim(),
      role: funcaoUsuario as 'dono' | 'gerente' | 'operador',
      password: senhaUsuario.trim()
    })

    if (success) {
      handleFecharModalNovoUsuario()
    }
  }

  // Função para aplicar máscara no WhatsApp
  const aplicarMascaraWhatsAppUsuario = (valor: string) => {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{1,4})/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1')
  }

  // Função para aplicar máscara no CPF
  const aplicarMascaraCpfUsuario = (valor: string) => {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1')
  }

  // Função para validar CPF
  const validarCpf = (cpf: string) => {
    // Remove caracteres não numéricos
    const cpfLimpo = cpf.replace(/\D/g, '')
    
    // Verifica se tem 11 dígitos
    if (cpfLimpo.length !== 11) return false
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpfLimpo)) return false
    
    // Validação do primeiro dígito verificador
    let soma = 0
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (10 - i)
    }
    let resto = soma % 11
    let digitoVerificador1 = resto < 2 ? 0 : 11 - resto
    
    if (parseInt(cpfLimpo.charAt(9)) !== digitoVerificador1) return false
    
    // Validação do segundo dígito verificador
    soma = 0
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (11 - i)
    }
    resto = soma % 11
    let digitoVerificador2 = resto < 2 ? 0 : 11 - resto
    
    return parseInt(cpfLimpo.charAt(10)) === digitoVerificador2
  }

  // Funções para modal de raio de entrega
  const handleAbrirModalRaioEntrega = () => {
    setEditandoRaio(null)
    setDistanciaRaio(1)
    setTempoMaximo('')
    setPrecoRaio('')
    setModalRaioEntregaAberto(true)
  }

  const handleAbrirModalEditarRaio = (raio: { id: number; distancia: number; tempoMaximo: number; preco: string }) => {
    setEditandoRaio(raio)
    setDistanciaRaio(raio.distancia)
    setTempoMaximo(raio.tempoMaximo.toString())
    setPrecoRaio(raio.preco)
    setModalRaioEntregaAberto(true)
  }

  const handleFecharModalRaioEntrega = () => {
    setModalRaioEntregaAberto(false)
    setEditandoRaio(null)
    // Resetar valores
    setDistanciaRaio(1)
    setTempoMaximo('')
    setPrecoRaio('')
  }

  const handleSalvarRaioEntrega = async () => {
    try {
    if (editandoRaio) {
      // Editando raio existente
        await atualizarRaioEntrega(editandoRaio.id, {
          distancia: distanciaRaio,
          tempoMaximo: parseInt(tempoMaximo),
          preco: precoRaio
        })
    } else {
      // Criando novo raio
        await adicionarRaioEntrega({
          distancia: distanciaRaio,
          tempoMaximo: parseInt(tempoMaximo),
          preco: precoRaio
        })
    }
    
    handleFecharModalRaioEntrega()
    } catch (error) {
      console.error('Erro ao salvar raio de entrega:', error)
    }
  }

  const handleExcluirRaio = async (id: number) => {
    try {
      await excluirRaioEntrega(id)
    } catch (error) {
      console.error('Erro ao excluir raio de entrega:', error)
    }
  }

  const formatarPrecoRaio = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    
    // Converte para número e divide por 100 para ter centavos
    const amount = parseInt(numbers || '0') / 100
    
    // Formata como moeda brasileira
    return amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const handlePrecoRaioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatarPrecoRaio(e.target.value)
    setPrecoRaio(formatted)
  }

  // Opções de fuso horário do Brasil
  const fusosHorarios = [
    { value: 'America/Sao_Paulo', label: 'São Paulo (GMT-3)', cidade: 'São Paulo' },
    { value: 'America/Rio_Branco', label: 'Acre (GMT-5)', cidade: 'Rio Branco' },
    { value: 'America/Manaus', label: 'Amazonas (GMT-4)', cidade: 'Manaus' },
    { value: 'America/Cuiaba', label: 'Mato Grosso (GMT-4)', cidade: 'Cuiabá' },
    { value: 'America/Campo_Grande', label: 'Mato Grosso do Sul (GMT-4)', cidade: 'Campo Grande' },
    { value: 'America/Fortaleza', label: 'Ceará (GMT-3)', cidade: 'Fortaleza' },
    { value: 'America/Recife', label: 'Pernambuco (GMT-3)', cidade: 'Recife' },
    { value: 'America/Bahia', label: 'Bahia (GMT-3)', cidade: 'Salvador' }
  ]

  // Função para atualizar o horário baseado no fuso selecionado
  useEffect(() => {
    const atualizarHorario = () => {
      const agora = new Date()
      const horarioLocal = agora.toLocaleString('pt-BR', {
        timeZone: fusoSelecionado,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      setHoraAtual(horarioLocal)
    }

    // Atualizar imediatamente
    atualizarHorario()
    
    // Atualizar a cada segundo
    const intervalo = setInterval(atualizarHorario, 1000)
    
    // Limpar intervalo quando o componente for desmontado
    return () => clearInterval(intervalo)
  }, [fusoSelecionado])

  // Mostrar loading enquanto carrega configuração
  if (configLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#ececec' }}>
          <div className="text-center">
            <svg className="spinner" width="80px" height="80px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
              <circle className="path" fill="none" strokeWidth="6" strokeLinecap="round" cx="33" cy="33" r="30"></circle>
            </svg>
          </div>
        </div>
        <style jsx global>{`
          .spinner {
            animation: rotator 1.4s linear infinite;
          }

          @keyframes rotator {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(270deg); }
          }

          .path {
            stroke-dasharray: 187;
            stroke-dashoffset: 0;
            transform-origin: center;
            animation: dash 1.4s ease-in-out infinite;
            stroke: #542583;
          }

          @keyframes dash {
            0% { stroke-dashoffset: 187; }
            50% {
              stroke-dashoffset: 46.75;
              transform: rotate(135deg);
            }
            100% {
              stroke-dashoffset: 187;
              transform: rotate(450deg);
            }
          }

          @keyframes modalEnter {
            from {
              transform: scale(0.3);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }

          @keyframes fadeInZoom {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ 
        backgroundColor: '#ececec'
      }}>
        
        {/* Main Content */}
        <div className="flex-1" style={{ padding: '32px' }}>
          <div className="flex flex-col">
            {/* Caixa branca com botões */}
            <div 
              className="bg-white"
              style={{ 
                borderRadius: '8px 8px 0 0',
                padding: '16px',
                width: 'fit-content'
              }}
            >
              {/* Linha de botões cinzas */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setPaginaAtiva('dados-loja');
                    window.location.hash = '#dados-loja';
                  }}
                  style={{
                    background: paginaAtiva === 'dados-loja' ? '#542583' : 'transparent',
                    color: paginaAtiva === 'dados-loja' ? 'white' : '#374151',
                    border: paginaAtiva === 'dados-loja' ? '1px solid #542583' : '1px solid #d1d5db',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    height: '40px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (paginaAtiva !== 'dados-loja') {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (paginaAtiva !== 'dados-loja') {
                      (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  Dados da loja
                </button>
                
                <button
                  onClick={() => {
                    setPaginaAtiva('horarios');
                    window.location.hash = '#horarios';
                  }}
                  style={{
                    background: paginaAtiva === 'horarios' ? '#542583' : 'transparent',
                    color: paginaAtiva === 'horarios' ? 'white' : '#374151',
                    border: paginaAtiva === 'horarios' ? '1px solid #542583' : '1px solid #d1d5db',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    height: '40px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (paginaAtiva !== 'horarios') {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (paginaAtiva !== 'horarios') {
                      (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  Horários
                </button>
                
                <button
                  onClick={() => {
                    setPaginaAtiva('entrega');
                    window.location.hash = '#entrega';
                  }}
                  style={{
                    background: paginaAtiva === 'entrega' ? '#542583' : 'transparent',
                    color: paginaAtiva === 'entrega' ? 'white' : '#374151',
                    border: paginaAtiva === 'entrega' ? '1px solid #542583' : '1px solid #d1d5db',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    height: '40px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (paginaAtiva !== 'entrega') {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (paginaAtiva !== 'entrega') {
                      (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  Entrega
                </button>
                
                <button
                  onClick={() => {
                    setPaginaAtiva('pagamento');
                    window.location.hash = '#pagamento';
                  }}
                  style={{
                    background: paginaAtiva === 'pagamento' ? '#542583' : 'transparent',
                    color: paginaAtiva === 'pagamento' ? 'white' : '#374151',
                    border: paginaAtiva === 'pagamento' ? '1px solid #542583' : '1px solid #d1d5db',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    height: '40px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (paginaAtiva !== 'pagamento') {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (paginaAtiva !== 'pagamento') {
                      (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  Pagamento
                </button>
                
                <button
                  onClick={() => {
                    setPaginaAtiva('motoboys');
                    window.location.hash = '#motoboys';
                  }}
                  style={{
                    background: paginaAtiva === 'motoboys' ? '#542583' : 'transparent',
                    color: paginaAtiva === 'motoboys' ? 'white' : '#374151',
                    border: paginaAtiva === 'motoboys' ? '1px solid #542583' : '1px solid #d1d5db',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    height: '40px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (paginaAtiva !== 'motoboys') {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (paginaAtiva !== 'motoboys') {
                      (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  Motoboys
                </button>
                
                <button
                  onClick={() => {
                    setPaginaAtiva('impressao');
                    window.location.hash = '#impressao';
                  }}
                  style={{
                    background: paginaAtiva === 'impressao' ? '#542583' : 'transparent',
                    color: paginaAtiva === 'impressao' ? 'white' : '#374151',
                    border: paginaAtiva === 'impressao' ? '1px solid #542583' : '1px solid #d1d5db',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    height: '40px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (paginaAtiva !== 'impressao') {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (paginaAtiva !== 'impressao') {
                      (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  Impressão
                </button>
                
                {canAccessUsers() && (
                  <button
                    onClick={() => {
                      setPaginaAtiva('usuarios');
                      window.location.hash = '#usuarios';
                    }}
                    style={{
                      background: paginaAtiva === 'usuarios' ? '#542583' : 'transparent',
                      color: paginaAtiva === 'usuarios' ? 'white' : '#374151',
                      border: paginaAtiva === 'usuarios' ? '1px solid #542583' : '1px solid #d1d5db',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      height: '40px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (paginaAtiva !== 'usuarios') {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (paginaAtiva !== 'usuarios') {
                        (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
                      }
                    }}
                  >
                    Usuários
                  </button>
                )}
              </div>
            </div>

            {/* Segunda caixa branca embaixo dos botões */}
            <div 
              className={paginaAtiva === 'entrega' ? '' : 'bg-white'}
              style={{ 
                borderRadius: paginaAtiva === 'entrega' ? '0' : '0 8px 8px 8px',
                padding: paginaAtiva === 'entrega' ? '0' : '32px',
                width: '100%',
                marginBottom: paginaAtiva === 'entrega' ? '0' : '40px'
              }}
            >
              {/* Renderização condicional baseada na página ativa */}
              {paginaAtiva === 'dados-loja' && (
                <div className="flex justify-between">
                  {/* Lado esquerdo - Títulos e subtítulos */}
                  <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ 
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#374151',
                      marginBottom: '8px',
                      lineHeight: '1.2'
                    }}>
                      Informações da Loja
                    </h2>
                    <p style={{ 
                      fontSize: '14px',
                      color: '#6b7280',
                      lineHeight: '1.5',
                      marginBottom: '24px'
                    }}>
                      Preencha os detalhes da sua loja.
                    </p>
                  </div>

                  {/* Lado direito - Todos os elementos alinhados à direita */}
                  <div className="flex flex-col items-end gap-6">
                    {/* Botão Salvar Configuração */}
                    <button
                      onClick={handleSalvarDadosLoja}
                      disabled={configLoading}
                      style={{
                        backgroundColor: configLoading ? '#9ca3af' : '#542583',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        height: '40px',
                        border: 'none',
                        cursor: configLoading ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (!configLoading) {
                          (e.target as HTMLButtonElement).style.backgroundColor = '#7209bd'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!configLoading) {
                          (e.target as HTMLButtonElement).style.backgroundColor = '#542583'
                        }
                      }}
                    >
                      {configLoading ? 'Salvando...' : 'Salvar configuração'}
                    </button>
                    
                    {/* Container das fotos */}
                    <div className="flex gap-4">
                      {/* Container do Logo */}
                      <div className="flex flex-col">
                        {/* Caixa de foto do logo 156x156 */}
                        <div style={{
                          width: '156px',
                          height: '156px',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          position: 'relative',
                          backgroundColor: '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <img 
                            key={`logo-${imageRefreshKey}`}
                            src={logoUrl} 
                            alt="Logo da loja"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}

                          />
                        </div>
                        
                        {/* Botão Adicionar Logo */}
                        <label 
                          htmlFor="logo-upload"
                          className="cursor-pointer hover:bg-gray-300 transition-colors duration-200"
                          style={{ 
                            width: '156px', 
                            height: '40px',
                            backgroundColor: '#f3f4f6',
                            border: '1px solid #d1d5db',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: '4px'
                          }}
                        >
                          <div className="flex items-center gap-2 text-gray-500">
                            <svg 
                              className="w-5 h-5" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" 
                              />
                            </svg>
                            <span className="text-sm truncate">Selecione uma...</span>
                          </div>
                          <input
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'logo')}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Container do Banner */}
                      <div className="flex flex-col">
                        {/* Caixa de foto do banner 355x156 */}
                        <div style={{
                          width: '355px',
                          height: '156px',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          position: 'relative',
                          backgroundColor: '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <img 
                            key={`banner-${imageRefreshKey}`}
                            src={bannerUrl} 
                            alt="Banner da loja"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}

                          />
                        </div>
                        
                        {/* Botão Adicionar Banner */}
                        <label 
                          htmlFor="banner-upload"
                          className="cursor-pointer hover:bg-gray-300 transition-colors duration-200"
                          style={{ 
                            width: '355px', 
                            height: '40px',
                            backgroundColor: '#f3f4f6',
                            border: '1px solid #d1d5db',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: '4px'
                          }}
                        >
                          <div className="flex items-center gap-2 text-gray-500">
                            <svg 
                              className="w-5 h-5" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" 
                              />
                            </svg>
                            <span className="text-sm">Selecione um banner</span>
                          </div>
                          <input
                            id="banner-upload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'banner')}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                    
                    {/* Campos de input alinhados à direita */}
                    <div className="flex flex-col gap-6" style={{ width: '526px' }}>
                      {/* Campo Nome da Loja */}
                      <div>
                        <label className="block text-gray-700 font-medium mb-2" style={{ fontSize: '16px' }}>
                          Nome da loja
                        </label>
                        <input
                          type="text"
                          value={nomeLoja}
                          onChange={(e) => setNomeLoja(e.target.value)}
                          placeholder="Digite o nome da sua loja"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          style={{
                            height: '40px',
                            fontSize: '16px'
                          }}
                        />
                      </div>
                      
                      {/* Campo Descrição da Loja */}
                      <div>
                        <label className="block text-gray-700 font-medium mb-2" style={{ fontSize: '16px' }}>
                          Descrição da loja
                        </label>
                        <textarea
                          value={descricaoLoja}
                          onChange={(e) => setDescricaoLoja(e.target.value)}
                          placeholder="Digite uma descrição para sua loja"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                          style={{
                            height: '80px',
                            fontSize: '16px',
                            lineHeight: '1.5'
                          }}
                        />
                        <p style={{
                          color: '#6b7280',
                          fontSize: '12px',
                          marginTop: '4px',
                          marginBottom: '0'
                        }}>
                          Esta descrição aparecerá no modal "Ver Mais" do seu cardápio
                        </p>
                      </div>
                      
                      {/* Campo Link Personalizado */}
                      <div>
                        <label className="block text-gray-700 font-medium mb-2" style={{ fontSize: '16px' }}>
                          Link personalizado do seu cardápio
                        </label>
                        <input
                          type="text"
                          value={linkPersonalizado}
                          onChange={(e) => setLinkPersonalizado(e.target.value)}
                          placeholder="Digite o link personalizado"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          style={{
                            height: '40px',
                            fontSize: '16px'
                          }}
                        />
                        
                        {/* Caixa de aviso roxa */}
                        <div 
                          className="mt-3 p-3 rounded-md"
                          style={{
                            backgroundColor: '#f3e8ff',
                            border: '1px solid #542583',
                            borderRadius: '6px'
                          }}
                        >
                          <p style={{
                            color: '#542583',
                            fontSize: '14px',
                            margin: '0',
                            fontWeight: '500'
                          }}>
                            Este será o link do seu cardápio: vault.menu.com.br/{linkPersonalizado}
                          </p>
                        </div>
                        
                        {/* Botão para visualizar cardápio */}
                        {linkPersonalizado && (
                          <div className="mt-3">
                            <button
                              onClick={() => window.open(`/loja/${linkPersonalizado}`, '_blank')}
                              style={{
                                backgroundColor: '#542583',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '500',
                                height: '40px',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}
                              onMouseEnter={(e) => {
                                (e.target as HTMLButtonElement).style.backgroundColor = '#7209bd'
                              }}
                              onMouseLeave={(e) => {
                                (e.target as HTMLButtonElement).style.backgroundColor = '#542583'
                              }}
                            >
                              <svg 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2"
                              >
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                <polyline points="15,3 21,3 21,9"/>
                                <line x1="10" y1="14" x2="21" y2="3"/>
                              </svg>
                              Visualizar Cardápio
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {paginaAtiva === 'dados-loja' && (
                <>
                  {/* Linha divisória que atravessa toda a largura */}
                  <div 
                    style={{ 
                      width: '100%',
                      height: '1px',
                      backgroundColor: '#d1d5db',
                      marginTop: '24px'
                    }}
                  ></div>
                  
                  {/* Seção Modos de pedidos - após a linha divisória */}
                  <div className="flex justify-between" style={{ marginTop: '32px' }}>
                    {/* Lado esquerdo - Título */}
                    <div>
                      <h2 style={{ 
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#374151',
                        marginBottom: '8px',
                        lineHeight: '1.2'
                      }}>
                        Modos de pedidos
                      </h2>
                      <p style={{ 
                        fontSize: '14px',
                        color: '#6b7280',
                        lineHeight: '1.5'
                      }}>
                        Escolha os modos de pedidos disponíveis para a sua loja.
                      </p>
                    </div>
                    
                    {/* Lado direito - Toggles */}
                    <div className="flex flex-col gap-6" style={{ width: '526px' }}>
                      {/* Toggle Delivery */}
                      <div className="flex items-center gap-3">
                        <div 
                          className={`toggle-switch cursor-pointer ${aceitarDelivery ? 'active' : 'inactive'}`}
                          onClick={() => setAceitarDelivery(!aceitarDelivery)}
                          style={{
                            width: '44px',
                            height: '24px',
                            borderRadius: '12px',
                            backgroundColor: aceitarDelivery ? '#542583' : '#d1d5db',
                            position: 'relative',
                            transition: 'all 0.3s ease-in-out'
                          }}
                        >
                          <div 
                            className="toggle-handle"
                            style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              backgroundColor: 'white',
                              position: 'absolute',
                              top: '4px',
                              transform: aceitarDelivery ? 'translateX(24px)' : 'translateX(4px)',
                              transition: 'all 0.3s ease-in-out'
                            }}
                          ></div>
                        </div>
                        <span style={{ fontSize: '16px', color: '#374151', fontWeight: '500' }}>
                          Aceitar pedidos para delivery
                        </span>
                      </div>
                      
                      {/* Toggle Retirada */}
                      <div className="flex items-center gap-3">
                        <div 
                          className={`toggle-switch cursor-pointer ${aceitarRetirada ? 'active' : 'inactive'}`}
                          onClick={() => setAceitarRetirada(!aceitarRetirada)}
                          style={{
                            width: '44px',
                            height: '24px',
                            borderRadius: '12px',
                            backgroundColor: aceitarRetirada ? '#542583' : '#d1d5db',
                            position: 'relative',
                            transition: 'all 0.3s ease-in-out'
                          }}
                        >
                          <div 
                            className="toggle-handle"
                            style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              backgroundColor: 'white',
                              position: 'absolute',
                              top: '4px',
                              transform: aceitarRetirada ? 'translateX(24px)' : 'translateX(4px)',
                              transition: 'all 0.3s ease-in-out'
                            }}
                          ></div>
                        </div>
                        <span style={{ fontSize: '16px', color: '#374151', fontWeight: '500' }}>
                          Aceitar pedidos para retirada
                        </span>
                      </div>
                      
                      {/* Toggle Balcão */}
                      <div className="flex items-center gap-3">
                        <div 
                          className={`toggle-switch cursor-pointer ${aceitarBalcao ? 'active' : 'inactive'}`}
                          onClick={() => setAceitarBalcao(!aceitarBalcao)}
                          style={{
                            width: '44px',
                            height: '24px',
                            borderRadius: '12px',
                            backgroundColor: aceitarBalcao ? '#542583' : '#d1d5db',
                            position: 'relative',
                            transition: 'all 0.3s ease-in-out'
                          }}
                        >
                          <div 
                            className="toggle-handle"
                            style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              backgroundColor: 'white',
                              position: 'absolute',
                              top: '4px',
                              transform: aceitarBalcao ? 'translateX(24px)' : 'translateX(4px)',
                              transition: 'all 0.3s ease-in-out'
                            }}
                          ></div>
                        </div>
                        <span style={{ fontSize: '16px', color: '#374151', fontWeight: '500' }}>
                          Aceitar pedidos no balcão (consumo no local)
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {/* Página de Horários */}
              {paginaAtiva === 'horarios' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div>
                      <h2 style={{ 
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#374151',
                        marginBottom: '8px',
                        lineHeight: '1.2'
                      }}>
                        Horários de funcionamento
                      </h2>
                      <p style={{ 
                        fontSize: '14px',
                        color: '#6b7280',
                        lineHeight: '1.5',
                        marginBottom: '8px'
                      }}>
                        Configure abaixo os dias e horários em que sua loja estará aberta para pedidos.
                      </p>
                      <p style={{ 
                        fontSize: '14px',
                        color: '#6b7280',
                        lineHeight: '1.5',
                        fontWeight: '500'
                      }}>
                        <strong>Importante:</strong> os horários de funcionamento levam em consideração o fuso horário da sua loja.
                      </p>
                    </div>
                    
                    {/* Botão Salvar Horários */}
                    <button
                      onClick={handleSalvarHorarios}
                      disabled={configLoading}
                      style={{
                        backgroundColor: configLoading ? '#9ca3af' : '#542583',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        height: '40px',
                        border: 'none',
                        cursor: configLoading ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.2s',
                        flexShrink: 0
                      }}
                      onMouseEnter={(e) => {
                        if (!configLoading) {
                          (e.target as HTMLButtonElement).style.backgroundColor = '#7209bd'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!configLoading) {
                          (e.target as HTMLButtonElement).style.backgroundColor = '#542583'
                        }
                      }}
                    >
                      {configLoading ? 'Salvando...' : 'Salvar horários'}
                    </button>
                  </div>
                  
                  {/* Linha divisória */}
                  <div 
                    style={{ 
                      width: '100%',
                      height: '1px',
                      backgroundColor: '#d1d5db'
                    }}
                  ></div>
                  
                  {/* Seção Horário Atual */}
                  <div style={{ marginTop: '32px' }}>
                    <h3 style={{ 
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#374151',
                      marginBottom: '16px',
                      lineHeight: '1.2'
                    }}>
                      Horário atual na loja
                    </h3>
                    
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      {/* Relógio */}
                      <div 
                        style={{
                          backgroundColor: '#f9fafb',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          padding: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          width: 'fit-content'
                        }}
                      >
                        {/* Ícone do relógio */}
                        <div style={{ color: '#542583' }}>
                          <svg 
                            width="24" 
                            height="24" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12,6 12,12 16,14"></polyline>
                          </svg>
                        </div>
                        
                        {/* Horário */}
                        <div>
                          <p style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: '#374151',
                            margin: '0',
                            lineHeight: '1.2'
                          }}>
                            {horaAtual || 'Carregando...'}
                          </p>
                          <p style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            margin: '2px 0 0 0',
                            lineHeight: '1.2'
                          }}>
                            {fusosHorarios.find(f => f.value === fusoSelecionado)?.label || 'Fuso horário'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Dropdown de Fuso Horário */}
                      <div style={{ position: 'relative', width: '280px' }}>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: '8px'
                        }}>
                          Selecionar fuso horário
                        </label>
                        
                        <button
                          onClick={() => setDropdownAberto(!dropdownAberto)}
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
                            fontSize: '16px',
                            color: '#374151',
                            cursor: 'pointer',
                            transition: 'border-color 0.2s'
                          }}
                          onMouseEnter={(e) => getEventTarget(e).style.borderColor = '#542583'}
                          onMouseLeave={(e) => getEventTarget(e).style.borderColor = '#d1d5db'}
                        >
                          <span>{fusosHorarios.find(f => f.value === fusoSelecionado)?.cidade || 'Selecione'}</span>
                          <svg 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2"
                            style={{
                              transform: dropdownAberto ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s'
                            }}
                          >
                            <polyline points="6,9 12,15 18,9"></polyline>
                          </svg>
                        </button>
                        
                        {/* Menu Dropdown */}
                        {dropdownAberto && (
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
                            {fusosHorarios.map((fuso) => (
                              <button
                                key={fuso.value}
                                onClick={() => {
                                  setFusoSelecionado(fuso.value)
                                  setDropdownAberto(false)
                                }}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  fontSize: '14px',
                                  color: '#374151',
                                  background: fusoSelecionado === fuso.value ? '#f3e8ff' : 'transparent',
                                  border: 'none',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.15s',
                                  display: 'block'
                                }}
                                onMouseEnter={(e) => {
                                  if (fusoSelecionado !== fuso.value) {
                                    (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (fusoSelecionado !== fuso.value) {
                                    (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
                                  }
                                }}
                              >
                                <div>
                                  <div style={{ fontWeight: '500' }}>{fuso.cidade}</div>
                                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{fuso.label}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Linha divisória */}
                    <div 
                      style={{ 
                        width: '100%',
                        height: '1px',
                        backgroundColor: '#d1d5db',
                        marginTop: '32px'
                      }}
                    ></div>
                    
                    {/* Seção Horários de Funcionamento */}
                    <div style={{ marginTop: '32px' }}>
                      <h3 style={{ 
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#374151',
                        marginBottom: '16px',
                        lineHeight: '1.2'
                      }}>
                        Horários de funcionamento
                      </h3>
                      
                      {/* Lista de dias da semana */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {horariosFuncionamento.map((diaConfig, diaIndex) => (
                          <div key={diaIndex}>
                                                         {/* Container do dia */}
                             <div 
                               style={{
                                 display: 'flex',
                                 alignItems: diaConfig.horarios.length > 1 ? 'flex-start' : 'center',
                                 gap: '16px',
                                 padding: '16px 24px',
                                 backgroundColor: diaConfig.fechado ? '#f9fafb' : 'white',
                                 border: '1px solid #d1d5db',
                                 borderRadius: '6px',
                                 minHeight: '69.58px',
                                 boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                                 opacity: diaConfig.fechado ? 0.6 : 1,
                                 transition: 'all 0.2s'
                               }}
                             >
                                                             {/* Nome do dia */}
                               <div style={{ 
                                 minWidth: '140px',
                                 fontSize: '16px',
                                 fontWeight: '500',
                                 color: '#374151',
                                 display: 'flex',
                                 alignItems: 'center',
                                 gap: '8px'
                               }}>
                                 {diaConfig.dia}
                                 {diaConfig.fechado && (
                                   <span style={{
                                     fontSize: '12px',
                                     color: '#dc2626',
                                     fontWeight: '500',
                                     backgroundColor: '#fef2f2',
                                     padding: '2px 6px',
                                     borderRadius: '4px',
                                     border: '1px solid #fecaca'
                                   }}>
                                     FECHADO
                                   </span>
                                 )}
                               </div>
                              
                                                                                            {/* Horários do dia */}
                               <div style={{ 
                                 display: 'flex', 
                                 flexWrap: 'wrap', 
                                 gap: '12px', 
                                 flex: 1,
                                 alignItems: 'center'
                               }}>
                                 {diaConfig.fechado ? (
                                   <span style={{
                                     fontSize: '14px',
                                     color: '#6b7280',
                                     fontStyle: 'italic'
                                   }}>
                                     Loja fechada neste dia
                                   </span>
                                 ) : (
                                   diaConfig.horarios.map((horario, horarioIndex) => (
                                  <div key={horarioIndex} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                         {/* Input Abertura */}
                                     <input
                                       type="time"
                                       value={horario.abertura}
                                       onChange={(e) => {
                                         const novosHorarios = [...horariosFuncionamento]
                                         novosHorarios[diaIndex].horarios[horarioIndex].abertura = e.target.value
                                         setHorariosFuncionamento(novosHorarios)
                                       }}
                                       style={{
                                         width: '100px',
                                         height: '40px',
                                         padding: '0 8px',
                                         border: '1px solid #d1d5db',
                                         borderRadius: '6px',
                                         fontSize: '14px',
                                         textAlign: 'center',
                                         fontFamily: 'inherit',
                                         outline: 'none',
                                         transition: 'border-color 0.2s'
                                       }}
                                       onFocus={(e) => getEventTarget(e).style.borderColor = '#542583'}
                                       onBlur={(e) => getEventTarget(e).style.borderColor = '#d1d5db'}
                                     />
                                     
                                     {/* Texto "até" */}
                                     <span style={{ 
                                       fontSize: '14px', 
                                       color: '#6b7280',
                                       margin: '0 8px',
                                       fontWeight: '500'
                                     }}>
                                       até
                                     </span>
                                     
                                     {/* Input Fechamento */}
                                     <input
                                       type="time"
                                       value={horario.fechamento}
                                       onChange={(e) => {
                                         const novosHorarios = [...horariosFuncionamento]
                                         novosHorarios[diaIndex].horarios[horarioIndex].fechamento = e.target.value
                                         setHorariosFuncionamento(novosHorarios)
                                       }}
                                       style={{
                                         width: '100px',
                                         height: '40px',
                                         padding: '0 8px',
                                         border: '1px solid #d1d5db',
                                         borderRadius: '6px',
                                         fontSize: '14px',
                                         textAlign: 'center',
                                         fontFamily: 'inherit',
                                         outline: 'none',
                                         transition: 'border-color 0.2s'
                                       }}
                                       onFocus={(e) => getEventTarget(e).style.borderColor = '#542583'}
                                       onBlur={(e) => getEventTarget(e).style.borderColor = '#d1d5db'}
                                     />
                                    
                                     {/* Botão Lixeira - Só mostra se há mais de 1 horário */}
                                     {diaConfig.horarios.length > 1 && (
                                       <button
                                         onClick={() => {
                                           const novosHorarios = [...horariosFuncionamento]
                                           novosHorarios[diaIndex].horarios.splice(horarioIndex, 1)
                                           setHorariosFuncionamento(novosHorarios)
                                         }}
                                         style={{
                                           background: 'transparent',
                                           border: 'none',
                                           padding: '8px',
                                           cursor: 'pointer',
                                           display: 'flex',
                                           alignItems: 'center',
                                           justifyContent: 'center',
                                           borderRadius: '4px',
                                           transition: 'background-color 0.2s'
                                         }}
                                         onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6'}
                                         onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
                                         title="Remover horário"
                                       >
                                         <svg width="16" height="16" viewBox="0 0 24 24" fill="#6b7280">
                                           <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                         </svg>
                                       </button>
                                     )}
                                                                         
                                   </div>
                                 )))}
                              </div>
                              
                                                                                            {/* Botões de ação */}
                               <div style={{ 
                                 display: 'flex', 
                                 gap: '8px', 
                                 alignItems: 'center',
                                 flexShrink: 0,
                                 alignSelf: 'center'
                               }}>
                                 {/* Botão Fechar/Abrir Loja */}
                                 <button
                                   onClick={() => {
                                     const novosHorarios = [...horariosFuncionamento]
                                     novosHorarios[diaIndex].fechado = !novosHorarios[diaIndex].fechado
                                     setHorariosFuncionamento(novosHorarios)
                                   }}
                                   style={{
                                     background: diaConfig.fechado ? '#dc2626' : 'transparent',
                                     color: diaConfig.fechado ? 'white' : '#374151',
                                     border: diaConfig.fechado ? '1px solid #dc2626' : '1px solid #d1d5db',
                                     padding: '8px 16px',
                                     borderRadius: '6px',
                                     fontSize: '14px',
                                     fontWeight: '500',
                                     height: '40px',
                                     cursor: 'pointer',
                                     transition: 'all 0.2s',
                                     display: 'flex',
                                     alignItems: 'center',
                                     gap: '6px'
                                   }}
                                   onMouseEnter={(e) => {
                                     if (diaConfig.fechado) {
                                       (e.target as HTMLButtonElement).style.backgroundColor = '#b91c1c'
                                     } else {
                                       (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'
                                     }
                                   }}
                                   onMouseLeave={(e) => {
                                     if (diaConfig.fechado) {
                                       (e.target as HTMLButtonElement).style.backgroundColor = '#dc2626'
                                     } else {
                                       (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
                                     }
                                   }}
                                 >
                                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                     {diaConfig.fechado ? (
                                       // Ícone de "abrir" (unlock)
                                       <>
                                         <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                         <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                                       </>
                                     ) : (
                                       // Ícone de "fechar" (lock)
                                       <>
                                         <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                         <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                       </>
                                     )}
                                   </svg>
                                   {diaConfig.fechado ? 'Abrir loja' : 'Fechar loja'}
                                 </button>
                                 
                                 {!diaConfig.fechado && (
                                   <>
                                     {/* Botão Copiar horário acima - Estilo Secundário */}
                                     <button
                                       onClick={() => {
                                         if (diaIndex > 0) {
                                           const novosHorarios = [...horariosFuncionamento]
                                           novosHorarios[diaIndex].horarios = [...horariosFuncionamento[diaIndex - 1].horarios]
                                           setHorariosFuncionamento(novosHorarios)
                                         }
                                       }}
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
                                       onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'}
                                       onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
                                     >
                                       Copiar horário acima
                                     </button>
                                     
                                     {/* Botão Novo período - Estilo Primário */}
                                     <button
                                       onClick={() => {
                                         const novosHorarios = [...horariosFuncionamento]
                                         novosHorarios[diaIndex].horarios.push({ abertura: '12:00', fechamento: '14:00' })
                                         setHorariosFuncionamento(novosHorarios)
                                       }}
                                       style={{
                                         backgroundColor: '#542583',
                                         color: 'white',
                                         border: 'none',
                                         padding: '8px 16px',
                                         borderRadius: '6px',
                                         fontSize: '14px',
                                         fontWeight: '500',
                                         height: '40px',
                                         cursor: 'pointer',
                                         display: 'flex',
                                         alignItems: 'center',
                                         gap: '6px',
                                         transition: 'background-color 0.2s'
                                       }}
                                       onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#7209bd'}
                                       onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#542583'}
                                     >
                                       <span style={{ fontSize: '16px', lineHeight: '1' }}>+</span>
                                       Novo período
                                     </button>
                                   </>
                                 )}
                               </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Página de Pagamento */}
              {paginaAtiva === 'pagamento' && (
                <div>
                  {/* Botão Salvar no topo */}
                  <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={async () => {
                        try {
                          await salvarConfiguracaoPagamento({
                            aceitarDinheiro,
                            aceitarPix,
                            aceitarCredito,
                            aceitarDebito,
                            bandeirasMastercard,
                            bandeirasVisa,
                            bandeirasAmericanExpress,
                            bandeirasElo,
                            bandeirasHipercard,
                            bandeirasPersonalizadas
                          })
                          toast.success('Configurações de pagamento salvas com sucesso!')
                        } catch (error) {
                          console.error('Erro ao salvar configurações de pagamento:', error)
                          toast.error('Erro ao salvar configurações de pagamento')
                        }
                      }}
                      style={{
                        backgroundColor: '#542583',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        height: '40px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#7209bd'}
                      onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#542583'}
                    >
                      Salvar configurações
                    </button>
                  </div>
                  
                  <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ 
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#374151',
                      marginBottom: '8px',
                      lineHeight: '1.2'
                    }}>
                      Formas de pagamento
                    </h2>
                    <p style={{ 
                      fontSize: '14px',
                      color: '#6b7280',
                      lineHeight: '1.5',
                      maxWidth: '370px'
                    }}>
                      Selecione como seus clientes poderão pagar.
                    </p>
                  </div>
                  
                  {/* Linha divisória */}
                  <div 
                    style={{ 
                      width: '100%',
                      height: '1px',
                      backgroundColor: '#d1d5db',
                      marginBottom: '32px'
                    }}
                  ></div>
                  
                  {/* Seção Dinheiro */}
                  <div style={{ marginBottom: '32px' }}>
                    <div className="flex" style={{ alignItems: 'flex-start' }}>
                      {/* Lado esquerdo - Título e descrição */}
                      <div style={{ flex: '1 1 auto', marginRight: '50px', maxWidth: '280px' }}>
                        <h3 style={{ 
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: '#374151',
                          marginBottom: '8px',
                          lineHeight: '1.2'
                        }}>
                          Dinheiro
                        </h3>
                        <p style={{ 
                          fontSize: '14px',
                          color: '#6b7280',
                          lineHeight: '1.5',
                          maxWidth: '370px'
                        }}>
                          Ative esta opção para aceitar pagamentos em dinheiro.
                        </p>
                      </div>
                      
                      {/* Lado direito - Toggle alinhado */}
                      <div style={{ 
                        alignSelf: 'flex-start', 
                        paddingTop: '2px',
                        marginLeft: 'auto',
                        width: '526px'
                      }}>
                        <div className="flex items-center gap-3">
                          <div 
                            className={`toggle-switch cursor-pointer ${aceitarDinheiro ? 'active' : 'inactive'}`}
                            onClick={() => setAceitarDinheiro(!aceitarDinheiro)}
                            style={{
                              width: '44px',
                              height: '24px',
                              borderRadius: '12px',
                              backgroundColor: aceitarDinheiro ? '#542583' : '#d1d5db',
                              position: 'relative',
                              transition: 'all 0.3s ease-in-out'
                            }}
                          >
                            <div 
                              className="toggle-handle"
                              style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                backgroundColor: 'white',
                                position: 'absolute',
                                top: '4px',
                                transform: aceitarDinheiro ? 'translateX(24px)' : 'translateX(4px)',
                                transition: 'all 0.3s ease-in-out'
                              }}
                            ></div>
                          </div>
                          <span style={{ fontSize: '16px', color: '#374151', fontWeight: '500' }}>
                            Aceitar pagamento em dinheiro
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Linha divisória */}
                  <div 
                    style={{ 
                      width: '100%',
                      height: '1px',
                      backgroundColor: '#d1d5db',
                      marginBottom: '32px'
                    }}
                  ></div>
                  
                  {/* Seção PIX */}
                  <div style={{ marginBottom: '32px' }}>
                    <div className="flex" style={{ alignItems: 'flex-start' }}>
                      {/* Lado esquerdo - Título e descrição */}
                      <div style={{ flex: '1 1 auto', marginRight: '50px', maxWidth: '280px' }}>
                        <h3 style={{ 
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: '#374151',
                          marginBottom: '8px',
                          lineHeight: '1.2'
                        }}>
                          Pix
                        </h3>
                        <p style={{ 
                          fontSize: '14px',
                          color: '#6b7280',
                          lineHeight: '1.5',
                          maxWidth: '370px'
                        }}>
                          Ative esta opção para aceitar pagamentos em Pix.
                        </p>
                      </div>
                      
                      {/* Lado direito - Toggle e formulário alinhado */}
                      <div style={{ 
                        alignSelf: 'flex-start', 
                        paddingTop: '2px',
                        marginLeft: 'auto',
                        width: '526px'
                      }}>
                        {/* Toggle */}
                        <div className="flex items-center gap-3" style={{ marginBottom: aceitarPix ? '24px' : '0' }}>
                          <div 
                            className={`toggle-switch cursor-pointer ${aceitarPix ? 'active' : 'inactive'}`}
                            onClick={() => setAceitarPix(!aceitarPix)}
                            style={{
                              width: '44px',
                              height: '24px',
                              borderRadius: '12px',
                              backgroundColor: aceitarPix ? '#542583' : '#d1d5db',
                              position: 'relative',
                              transition: 'all 0.3s ease-in-out'
                            }}
                          >
                            <div 
                              className="toggle-handle"
                              style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                backgroundColor: 'white',
                                position: 'absolute',
                                top: '4px',
                                transform: aceitarPix ? 'translateX(24px)' : 'translateX(4px)',
                                transition: 'all 0.3s ease-in-out'
                              }}
                            ></div>
                          </div>
                          <span style={{ fontSize: '16px', color: '#374151', fontWeight: '500' }}>
                            Aceitar pagamento em Pix
                          </span>
                        </div>
                        
                        {/* Formulário de dados PIX - aparece quando PIX está ativo */}
                        {aceitarPix && (
                          <div style={{ 
                            width: '100%'
                          }}>
                            <div style={{ marginBottom: '24px' }}>
                              <label style={{ 
                                display: 'block',
                                fontSize: '16px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '8px'
                              }}>
                                Chave PIX
                              </label>
                              <div style={{ position: 'relative', width: '100%', maxWidth: '526px' }}>
                                <input
                                  type="text"
                                  value={chavePix}
                                  onChange={(e) => {
                                    const valorMascarado = aplicarMascara(e.target.value, tipoChavePix)
                                    setChavePix(valorMascarado)
                                  }}
                                  placeholder={placeholderChavePix}
                                  style={{
                                    width: '100%',
                                    height: '40px',
                                    padding: '0 12px',
                                    paddingRight: '80px',
                                    border: `1px solid ${
                                      chavePix && !validarChavePix(chavePix, tipoChavePix) 
                                        ? '#dc2626' 
                                        : chavePix && validarChavePix(chavePix, tipoChavePix)
                                        ? '#059669'
                                        : '#d1d5db'
                                    }`,
                                    borderRadius: '6px',
                                    fontSize: '16px',
                                    background: 'white',
                                    transition: 'all 0.2s'
                                  }}
                                  onFocus={(e) => {
                                    getEventTarget(e).style.outline = 'none'
                                    getEventTarget(e).style.borderColor = 'transparent'
                                    getEventTarget(e).style.boxShadow = '0 0 0 2px #542583'
                                  }}
                                  onBlur={(e) => {
                                    getEventTarget(e).style.boxShadow = 'none'
                                    // Restaurar cor da borda baseada na validação
                                    if (chavePix && !validarChavePix(chavePix, tipoChavePix)) {
                                      getEventTarget(e).style.borderColor = '#dc2626'
                                    } else if (chavePix && validarChavePix(chavePix, tipoChavePix)) {
                                      getEventTarget(e).style.borderColor = '#059669'
                                    } else {
                                      getEventTarget(e).style.borderColor = '#d1d5db'
                                    }
                                  }}
                                                                  />
                                
                                {/* Indicador de validação */}
                                {chavePix && (
                                  <div style={{
                                    position: 'absolute',
                                    right: '75px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    zIndex: 5
                                  }}>
                                    {validarChavePix(chavePix, tipoChavePix) ? (
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20,6 9,17 4,12"></polyline>
                                      </svg>
                                    ) : (
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="15" y1="9" x2="9" y2="15"></line>
                                        <line x1="9" y1="9" x2="15" y2="15"></line>
                                      </svg>
                                    )}
                                  </div>
                                )}
                                
                                {/* Dropdown integrado à direita */}
                                <div style={{ 
                                  position: 'absolute',
                                  right: '1px',
                                  top: '1px',
                                  bottom: '1px',
                                  width: '70px',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}>
                                  <button
                                    onClick={() => setDropdownChavePixAberto(!dropdownChavePixAberto)}
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      background: '#f3e8ff',
                                      border: 'none',
                                      borderRadius: '0 5px 5px 0',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: 'pointer',
                                      fontSize: '12px',
                                      fontWeight: '500',
                                      color: '#542583',
                                      gap: '4px',
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                      (e.target as HTMLElement).style.background = '#e9d5ff'
                                    }}
                                    onMouseLeave={(e) => {
                                      (e.target as HTMLElement).style.background = '#f3e8ff'
                                    }}
                                  >
                                    <span>{tipoChavePix}</span>
                                    <svg 
                                      width="12" 
                                      height="12" 
                                      viewBox="0 0 24 24" 
                                      fill="none" 
                                      stroke="currentColor" 
                                      strokeWidth="2" 
                                      strokeLinecap="round" 
                                      strokeLinejoin="round"
                                      style={{ 
                                        transform: dropdownChavePixAberto ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.2s'
                                      }}
                                    >
                                      <polyline points="6,9 12,15 18,9"></polyline>
                                    </svg>
                                  </button>
                                  
                                  {dropdownChavePixAberto && (
                                    <div 
                                      style={{
                                        position: 'absolute',
                                        top: '100%',
                                        right: 0,
                                        marginTop: '4px',
                                        background: '#f3e8ff',
                                        border: '1px solid #542583',
                                        borderRadius: '6px',
                                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                        zIndex: 10,
                                        minWidth: '120px',
                                        animation: 'fadeInZoom 0.2s ease-out'
                                      }}
                                    >
                                      {[
                                        { tipo: 'CPF', formato: '000.000.000-00' },
                                        { tipo: 'CNPJ', formato: '00.000.000/0000-00' },
                                        { tipo: 'E-mail', formato: 'email@exemplo.com' },
                                        { tipo: 'Celular', formato: '(00) 00000-0000' },
                                        { tipo: 'Chave Aleatória', formato: 'chave-aleatoria-123' }
                                      ].map(({ tipo, formato }) => (
                                        <div
                                          key={tipo}
                                          onClick={() => {
                                            setTipoChavePix(tipo)
                                            setChavePix('')
                                            setPlaceholderChavePix(formato)
                                            setDropdownChavePixAberto(false)
                                          }}
                                          style={{
                                            padding: '8px 12px',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.15s',
                                            backgroundColor: tipoChavePix === tipo ? '#e9d5ff' : 'transparent',
                                            color: tipoChavePix === tipo ? '#542583' : '#542583'
                                          }}
                                          onMouseEnter={(e) => {
                                            if (tipoChavePix !== tipo) {
                                              (e.target as HTMLButtonElement).style.backgroundColor = '#e9d5ff'
                                            }
                                          }}
                                          onMouseLeave={(e) => {
                                            if (tipoChavePix !== tipo) {
                                              (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
                                            }
                                          }}
                                        >
                                          {tipo}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div style={{ marginBottom: '24px' }}>
                              <label style={{ 
                                display: 'block',
                                fontSize: '16px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '8px'
                              }}>
                                Nome do recebedor
                              </label>
                              <input
                                type="text"
                                value={nomeRecebedorPix}
                                onChange={(e) => setNomeRecebedorPix(e.target.value)}
                                placeholder="Nome da empresa ou pessoa que receberá o PIX"
                                style={{
                                  width: '100%',
                                  maxWidth: '526px',
                                  height: '40px',
                                  padding: '0 12px',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '6px',
                                  fontSize: '16px',
                                  background: 'white',
                                  transition: 'all 0.2s'
                                }}
                                onFocus={(e) => {
                                  getEventTarget(e).style.outline = 'none'
                                  getEventTarget(e).style.borderColor = 'transparent'
                                  getEventTarget(e).style.boxShadow = '0 0 0 2px #542583'
                                }}
                                onBlur={(e) => {
                                  getEventTarget(e).style.borderColor = '#d1d5db'
                                  getEventTarget(e).style.boxShadow = 'none'
                                }}
                              />
                            </div>
                            
                            <div style={{ marginBottom: '24px' }}>
                              <label style={{ 
                                display: 'block',
                                fontSize: '16px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '8px'
                              }}>
                                Cidade do recebedor
                              </label>
                              <input
                                type="text"
                                value={cidadeRecebedorPix}
                                onChange={(e) => setCidadeRecebedorPix(e.target.value)}
                                placeholder="Cidade onde está localizado o recebedor"
                                style={{
                                  width: '100%',
                                  maxWidth: '526px',
                                  height: '40px',
                                  padding: '0 12px',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '6px',
                                  fontSize: '16px',
                                  background: 'white',
                                  transition: 'all 0.2s'
                                }}
                                onFocus={(e) => {
                                  getEventTarget(e).style.outline = 'none'
                                  getEventTarget(e).style.borderColor = 'transparent'
                                  getEventTarget(e).style.boxShadow = '0 0 0 2px #542583'
                                }}
                                onBlur={(e) => {
                                  getEventTarget(e).style.borderColor = '#d1d5db'
                                  getEventTarget(e).style.boxShadow = 'none'
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Linha divisória */}
                  <div 
                    style={{ 
                      width: '100%',
                      height: '1px',
                      backgroundColor: '#d1d5db',
                      marginBottom: '32px'
                    }}
                  ></div>
                  
                  {/* Seção Cartões */}
                  <div style={{ marginBottom: '32px' }}>
                    <div className="flex" style={{ alignItems: 'flex-start' }}>
                      {/* Lado esquerdo - Título, descrição e botão */}
                      <div style={{ flex: '1 1 auto', marginRight: '50px', maxWidth: '280px' }}>
                        <h3 style={{ 
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: '#374151',
                          marginBottom: '8px',
                          lineHeight: '1.2'
                        }}>
                          Cartões
                        </h3>
                        <p style={{ 
                          fontSize: '14px',
                          color: '#6b7280',
                          lineHeight: '1.5',
                          marginBottom: '16px',
                          maxWidth: '370px'
                        }}>
                          Selecione as bandeiras de cartão aceitas para pagamentos na entrega.
                        </p>
                        
                        {/* Botão Nova bandeira */}
                        <button
                          onClick={handleAbrirModalNovaBandeira}
                          style={{
                            backgroundColor: '#542583',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            height: '40px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#7209bd'}
                          onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#542583'}
                        >
                          <span style={{ fontSize: '16px', lineHeight: '1' }}>+</span>
                          Nova bandeira
                        </button>
                      </div>
                      
                      {/* Lado direito - Opções de cartão alinhado */}
                      <div style={{ 
                        alignSelf: 'flex-start', 
                        paddingTop: '2px',
                        marginLeft: 'auto',
                        width: '526px'
                      }}>
                        {/* Toggle Aceitar pagamento com crédito */}
                        <div style={{ marginBottom: '24px' }}>
                          <div className="flex items-center gap-3" style={{ marginBottom: '12px' }}>
                            <div 
                              className={`toggle-switch cursor-pointer ${aceitarCredito ? 'active' : 'inactive'}`}
                              onClick={() => setAceitarCredito(!aceitarCredito)}
                              style={{
                                width: '44px',
                                height: '24px',
                                borderRadius: '12px',
                                backgroundColor: aceitarCredito ? '#542583' : '#d1d5db',
                                position: 'relative',
                                transition: 'all 0.3s ease-in-out'
                              }}
                            >
                              <div 
                                className="toggle-handle"
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  borderRadius: '50%',
                                  backgroundColor: 'white',
                                  position: 'absolute',
                                  top: '4px',
                                  transform: aceitarCredito ? 'translateX(24px)' : 'translateX(4px)',
                                  transition: 'all 0.3s ease-in-out'
                                }}
                              ></div>
                            </div>
                            <span style={{ fontSize: '16px', color: '#374151', fontWeight: '500' }}>
                              Aceitar pagamento com crédito
                            </span>
                          </div>
                          
                                                    {/* Bandeiras de crédito */}
                          {aceitarCredito && (
                            <div style={{ 
                              marginLeft: '56px', 
                              display: 'grid', 
                              gridTemplateColumns: '1fr 1fr', 
                              gap: '8px 16px',
                              maxWidth: '400px'
                            }}>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <div 
                                  className="custom-checkbox"
                                  onClick={() => setBandeirasMastercard(prev => ({ ...prev, credito: !prev.credito }))}
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    border: '2px solid #d1d5db',
                                    borderRadius: '3px',
                                    backgroundColor: bandeirasMastercard.credito ? '#542583' : 'white',
                                    borderColor: bandeirasMastercard.credito ? '#542583' : '#d1d5db',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease-in-out',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {bandeirasMastercard.credito && (
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  )}
                                </div>
                                <span style={{ fontSize: '14px', color: '#374151' }}>Mastercard</span>
                              </label>
                              
                              <label className="flex items-center gap-2 cursor-pointer">
                                <div 
                                  className="custom-checkbox"
                                  onClick={() => setBandeirasVisa(prev => ({ ...prev, credito: !prev.credito }))}
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    border: '2px solid #d1d5db',
                                    borderRadius: '3px',
                                    backgroundColor: bandeirasVisa.credito ? '#542583' : 'white',
                                    borderColor: bandeirasVisa.credito ? '#542583' : '#d1d5db',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease-in-out',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {bandeirasVisa.credito && (
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  )}
                                </div>
                                <span style={{ fontSize: '14px', color: '#374151' }}>Visa</span>
                              </label>
                              
                              <label className="flex items-center gap-2 cursor-pointer">
                                <div 
                                  className="custom-checkbox"
                                  onClick={() => setBandeirasAmericanExpress(prev => ({ ...prev, credito: !prev.credito }))}
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    border: '2px solid #d1d5db',
                                    borderRadius: '3px',
                                    backgroundColor: bandeirasAmericanExpress.credito ? '#542583' : 'white',
                                    borderColor: bandeirasAmericanExpress.credito ? '#542583' : '#d1d5db',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease-in-out',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {bandeirasAmericanExpress.credito && (
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  )}
                                </div>
                                <span style={{ fontSize: '14px', color: '#374151' }}>American Express</span>
                              </label>
                              
                              <label className="flex items-center gap-2 cursor-pointer">
                                <div 
                                  className="custom-checkbox"
                                  onClick={() => setBandeirasElo(prev => ({ ...prev, credito: !prev.credito }))}
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    border: '2px solid #d1d5db',
                                    borderRadius: '3px',
                                    backgroundColor: bandeirasElo.credito ? '#542583' : 'white',
                                    borderColor: bandeirasElo.credito ? '#542583' : '#d1d5db',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease-in-out',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {bandeirasElo.credito && (
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  )}
                                </div>
                                <span style={{ fontSize: '14px', color: '#374151' }}>Elo</span>
                              </label>
                              
                              <label className="flex items-center gap-2 cursor-pointer">
                                <div 
                                  className="custom-checkbox"
                                  onClick={() => setBandeirasHipercard(prev => ({ ...prev, credito: !prev.credito }))}
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    border: '2px solid #d1d5db',
                                    borderRadius: '3px',
                                    backgroundColor: bandeirasHipercard.credito ? '#542583' : 'white',
                                    borderColor: bandeirasHipercard.credito ? '#542583' : '#d1d5db',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease-in-out',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {bandeirasHipercard.credito && (
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  )}
                                </div>
                                <span style={{ fontSize: '14px', color: '#374151' }}>Hipercard</span>
                              </label>
                            </div>
                          )}
                          
                          {/* Bandeiras personalizadas para crédito - sempre visíveis quando há bandeiras */}
                          {bandeirasPersonalizadas.filter(b => b.credito).length > 0 && (
                            <div style={{ 
                              marginLeft: '56px', 
                              marginTop: aceitarCredito ? '8px' : '12px',
                              display: 'grid', 
                              gridTemplateColumns: '1fr 1fr', 
                              gap: '8px 16px',
                              maxWidth: '400px'
                            }}>
                              {bandeirasPersonalizadas.filter(b => b.credito).map(bandeira => (
                                <label key={`credito-${bandeira.id}`} className="flex items-center gap-2 cursor-pointer">
                                  <div 
                                    className="custom-checkbox"
                                    style={{
                                      width: '16px',
                                      height: '16px',
                                      border: '2px solid #542583',
                                      borderRadius: '3px',
                                      backgroundColor: '#542583',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      transition: 'all 0.2s ease-in-out',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </div>
                                  <span style={{ fontSize: '14px', color: '#374151' }}>{bandeira.nome}</span>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault()
                                      handleRemoverBandeira(bandeira.id)
                                    }}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: '#dc2626',
                                      cursor: 'pointer',
                                      padding: '4px',
                                      marginLeft: '6px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      borderRadius: '3px',
                                      transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#fee2e2'}
                                    onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
                                    title="Remover bandeira"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                          <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm80-160h80v-360h-80v360Zm160 0h80v-360h-80v360Z"/>
                                    </svg>
                                  </button>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Toggle Aceitar pagamento com débito */}
                        <div>
                          <div className="flex items-center gap-3" style={{ marginBottom: '12px' }}>
                            <div 
                              className={`toggle-switch cursor-pointer ${aceitarDebito ? 'active' : 'inactive'}`}
                              onClick={() => setAceitarDebito(!aceitarDebito)}
                              style={{
                                width: '44px',
                                height: '24px',
                                borderRadius: '12px',
                                backgroundColor: aceitarDebito ? '#542583' : '#d1d5db',
                                position: 'relative',
                                transition: 'all 0.3s ease-in-out'
                              }}
                            >
                              <div 
                                className="toggle-handle"
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  borderRadius: '50%',
                                  backgroundColor: 'white',
                                  position: 'absolute',
                                  top: '4px',
                                  transform: aceitarDebito ? 'translateX(24px)' : 'translateX(4px)',
                                  transition: 'all 0.3s ease-in-out'
                                }}
                              ></div>
                            </div>
                            <span style={{ fontSize: '16px', color: '#374151', fontWeight: '500' }}>
                              Aceitar pagamento com débito
                            </span>
                          </div>
                          
                                                    {/* Bandeiras de débito */}
                          {aceitarDebito && (
                            <div style={{ 
                              marginLeft: '56px', 
                              display: 'grid', 
                              gridTemplateColumns: '1fr 1fr', 
                              gap: '8px 16px',
                              maxWidth: '400px'
                            }}>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <div 
                                  className="custom-checkbox"
                                  onClick={() => setBandeirasMastercard(prev => ({ ...prev, debito: !prev.debito }))}
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    border: '2px solid #d1d5db',
                                    borderRadius: '3px',
                                    backgroundColor: bandeirasMastercard.debito ? '#542583' : 'white',
                                    borderColor: bandeirasMastercard.debito ? '#542583' : '#d1d5db',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease-in-out',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {bandeirasMastercard.debito && (
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  )}
                                </div>
                                <span style={{ fontSize: '14px', color: '#374151' }}>Mastercard</span>
                              </label>
                              
                              <label className="flex items-center gap-2 cursor-pointer">
                                <div 
                                  className="custom-checkbox"
                                  onClick={() => setBandeirasVisa(prev => ({ ...prev, debito: !prev.debito }))}
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    border: '2px solid #d1d5db',
                                    borderRadius: '3px',
                                    backgroundColor: bandeirasVisa.debito ? '#542583' : 'white',
                                    borderColor: bandeirasVisa.debito ? '#542583' : '#d1d5db',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease-in-out',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {bandeirasVisa.debito && (
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  )}
                                </div>
                                <span style={{ fontSize: '14px', color: '#374151' }}>Visa</span>
                              </label>
                              
                              <label className="flex items-center gap-2 cursor-pointer">
                                <div 
                                  className="custom-checkbox"
                                  onClick={() => setBandeirasAmericanExpress(prev => ({ ...prev, debito: !prev.debito }))}
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    border: '2px solid #d1d5db',
                                    borderRadius: '3px',
                                    backgroundColor: bandeirasAmericanExpress.debito ? '#542583' : 'white',
                                    borderColor: bandeirasAmericanExpress.debito ? '#542583' : '#d1d5db',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease-in-out',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {bandeirasAmericanExpress.debito && (
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  )}
                                </div>
                                <span style={{ fontSize: '14px', color: '#374151' }}>American Express</span>
                              </label>
                              
                              <label className="flex items-center gap-2 cursor-pointer">
                                <div 
                                  className="custom-checkbox"
                                  onClick={() => setBandeirasElo(prev => ({ ...prev, debito: !prev.debito }))}
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    border: '2px solid #d1d5db',
                                    borderRadius: '3px',
                                    backgroundColor: bandeirasElo.debito ? '#542583' : 'white',
                                    borderColor: bandeirasElo.debito ? '#542583' : '#d1d5db',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease-in-out',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {bandeirasElo.debito && (
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  )}
                                </div>
                                <span style={{ fontSize: '14px', color: '#374151' }}>Elo</span>
                              </label>
                              
                              <label className="flex items-center gap-2 cursor-pointer">
                                <div 
                                  className="custom-checkbox"
                                  onClick={() => setBandeirasHipercard(prev => ({ ...prev, debito: !prev.debito }))}
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    border: '2px solid #d1d5db',
                                    borderRadius: '3px',
                                    backgroundColor: bandeirasHipercard.debito ? '#542583' : 'white',
                                    borderColor: bandeirasHipercard.debito ? '#542583' : '#d1d5db',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease-in-out',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {bandeirasHipercard.debito && (
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  )}
                                </div>
                                <span style={{ fontSize: '14px', color: '#374151' }}>Hipercard</span>
                              </label>
                            </div>
                          )}
                          
                          {/* Bandeiras personalizadas para débito - sempre visíveis quando há bandeiras */}
                          {bandeirasPersonalizadas.filter(b => b.debito).length > 0 && (
                            <div style={{ 
                              marginLeft: '56px', 
                              marginTop: aceitarDebito ? '8px' : '12px',
                              display: 'grid', 
                              gridTemplateColumns: '1fr 1fr', 
                              gap: '8px 16px',
                              maxWidth: '400px'
                            }}>
                              {bandeirasPersonalizadas.filter(b => b.debito).map(bandeira => (
                                <label key={`debito-${bandeira.id}`} className="flex items-center gap-2 cursor-pointer">
                                  <div 
                                    className="custom-checkbox"
                                    style={{
                                      width: '16px',
                                      height: '16px',
                                      border: '2px solid #542583',
                                      borderRadius: '3px',
                                      backgroundColor: '#542583',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      transition: 'all 0.2s ease-in-out',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </div>
                                  <span style={{ fontSize: '14px', color: '#374151' }}>{bandeira.nome}</span>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault()
                                      handleRemoverBandeira(bandeira.id)
                                    }}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: '#dc2626',
                                      cursor: 'pointer',
                                      padding: '4px',
                                      marginLeft: '6px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      borderRadius: '3px',
                                      transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#fee2e2'}
                                    onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
                                    title="Remover bandeira"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                          <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm80-160h80v-360h-80v360Zm160 0h80v-360h-80v360Z"/>
                                    </svg>
                                  </button>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Página de Entregas */}
              {paginaAtiva === 'entrega' && (
                <div style={{
                  position: 'relative',
                  height: 'calc(100vh - 140px)',
                  borderRadius: '0 8px 8px 8px',
                  overflow: 'hidden'
                }}>
                  {/* Mapa ocupando toda a área */}
                  <DeliveryMap 
                    entregas={entregas}
                    lojaLatLng={configuracaoEntrega?.coordenadas || [-46.6333, -23.5505]}
                    endereco={
                      // Criar endereço formatado corretamente para geocodificação
                      (() => {
                        const partes = []
                        
                        // Rua + Número juntos (formato mais preciso)
                        if (valoresCampos.rua) {
                          const ruaCompleta = valoresCampos.numero 
                            ? `${valoresCampos.rua}, ${valoresCampos.numero}`
                            : valoresCampos.rua
                          partes.push(ruaCompleta)
                        }
                        
                        // Bairro
                        if (valoresCampos.bairro) {
                          partes.push(valoresCampos.bairro)
                        }
                        
                        // Cidade
                        if (valoresCampos.cidade) {
                          partes.push(valoresCampos.cidade)
                        }
                        
                        // Estado
                        if (valoresCampos.estado) {
                          partes.push(valoresCampos.estado)
                        }
                        
                        // CEP (se disponível)
                        if (valoresCampos.cep) {
                          partes.push(valoresCampos.cep)
                        }
                        
                        return partes.join(', ')
                      })()
                    }
                    raiosEntrega={configuracaoEntrega?.raiosEntrega || raiosEntrega}
                    onBuscarEndereco={(endereco: string) => {
                      // Aqui você pode implementar a lógica para buscar o endereço
                      console.log('Buscando endereço:', endereco)
                    }}
                    tipoCalculoAtivo={calculoEntregaSelecionado as 'distancia_linha' | 'distancia_rota' | 'bairro'}
                    className="w-full h-full"
                  />
                  
                  {/* Card com botões sobreposto no mapa - canto superior direito */}
                  <div 
                    className="delivery-card-scrollbar"
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      width: '450px',
                      height: '600px',
                      backgroundColor: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      zIndex: 10,
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                    {/* Cabeçalho fixo */}
                    <div style={{
                      padding: '20px 20px 16px 20px',
                      borderBottom: '1px solid #d1d5db',
                      backgroundColor: 'white',
                      borderRadius: '8px 8px 0 0'
                    }}>
                      {/* Botões */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        {/* Botão Sessão de Entrega */}
                        <button
                          style={{
                            background: secaoAtiva === 'sessao-entrega' ? '#542583' : 'transparent',
                            color: secaoAtiva === 'sessao-entrega' ? 'white' : '#374151',
                            border: secaoAtiva === 'sessao-entrega' ? '1px solid #542583' : '1px solid #d1d5db',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            height: '40px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (secaoAtiva !== 'sessao-entrega') {
                              (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (secaoAtiva !== 'sessao-entrega') {
                              (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
                            }
                          }}
                          onClick={() => {
                            setSecaoAtiva('sessao-entrega')
                          }}
                        >
                          Sessão de Entrega
                        </button>

                        {/* Botão Endereço */}
                        <button
                          style={{
                            background: secaoAtiva === 'endereco' ? '#542583' : 'transparent',
                            color: secaoAtiva === 'endereco' ? 'white' : '#374151',
                            border: secaoAtiva === 'endereco' ? '1px solid #542583' : '1px solid #d1d5db',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            height: '40px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (secaoAtiva !== 'endereco') {
                              (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (secaoAtiva !== 'endereco') {
                              (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
                            }
                          }}
                          onClick={() => {
                            setSecaoAtiva('endereco')
                          }}
                        >
                          Endereço
                        </button>
                      </div>
                    </div>

                    {/* Conteúdo com scroll */}
                    <div style={{ 
                      flex: '1',
                      overflowY: 'auto',
                      padding: '20px'
                    }}>
                      {/* Seção de Entrega */}
                      {secaoAtiva === 'sessao-entrega' && (
                        <>
                          <h2 style={{ 
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#374151',
                            marginBottom: '4px',
                            lineHeight: '1.2'
                          }}>
                            Configurações de Entrega
                          </h2>
                          <p style={{ 
                            fontSize: '14px',
                            color: '#6b7280',
                            lineHeight: '1.4',
                            margin: '0 0 16px 0'
                          }}>
                            Defina as áreas e tipos de entrega<br />disponíveis para sua loja.
                          </p>
                          
                          {/* Linha divisória */}
                          <div style={{ 
                            width: '100%',
                            height: '1px',
                            backgroundColor: '#d1d5db',
                            margin: '12px 0 16px 0'
                          }}></div>
                          
                          {/* Dropdown de cálculo de entrega */}
                          <div style={{ position: 'relative', width: '100%' }}>
                            <label style={{
                              display: 'block',
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#374151',
                              marginBottom: '8px'
                            }}>
                              Defina a forma do cálculo de entrega
                            </label>
                            
                            <button
                              onClick={() => setDropdownCalculoEntregaAberto(!dropdownCalculoEntregaAberto)}
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
                              onMouseEnter={(e) => getEventTarget(e).style.borderColor = '#542583'}
                              onMouseLeave={(e) => getEventTarget(e).style.borderColor = '#d1d5db'}
                            >
                              <span>{opcoesCalculoEntrega.find(o => o.value === calculoEntregaSelecionado)?.label || 'Selecione'}</span>
                              <svg 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2"
                                style={{
                                  transform: dropdownCalculoEntregaAberto ? 'rotate(180deg)' : 'rotate(0deg)',
                                  transition: 'transform 0.2s'
                                }}
                              >
                                <polyline points="6,9 12,15 18,9"></polyline>
                              </svg>
                            </button>
                            
                            {/* Menu Dropdown */}
                            {dropdownCalculoEntregaAberto && (
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
                                {opcoesCalculoEntrega.map((opcao) => (
                                  <button
                                    key={opcao.value}
                                    onClick={async () => {
                                      setCalculoEntregaSelecionado(opcao.value)
                                      setDropdownCalculoEntregaAberto(false)
                                      
                                      // Salvar o tipo de cálculo selecionado
                                      try {
                                        await salvarTipoCalculoEntrega(opcao.value as 'distancia_linha' | 'distancia_rota' | 'bairro')
                                        toast.success('Tipo de cálculo de entrega atualizado!')
                                      } catch (error) {
                                        console.error('Erro ao salvar tipo de cálculo:', error)
                                        toast.error('Erro ao salvar tipo de cálculo')
                                      }
                                    }}
                                    style={{
                                      width: '100%',
                                      padding: '8px 12px',
                                      fontSize: '14px',
                                      color: '#374151',
                                      background: calculoEntregaSelecionado === opcao.value ? '#f3e8ff' : 'transparent',
                                      border: 'none',
                                      textAlign: 'left',
                                      cursor: 'pointer',
                                      transition: 'background-color 0.15s',
                                      display: 'block'
                                    }}
                                    onMouseEnter={(e) => {
                                      if (calculoEntregaSelecionado !== opcao.value) {
                                        (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (calculoEntregaSelecionado !== opcao.value) {
                                        (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
                                      }
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <div>
                                        <div style={{ fontWeight: '500' }}>{opcao.label}</div>
                                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{opcao.descricao}</div>
                                      </div>
                                      {opcao.recomendado && (
                                        <span style={{
                                          fontSize: '11px',
                                          fontWeight: '600',
                                          color: '#059669',
                                          backgroundColor: '#d1fae5',
                                          padding: '2px 6px',
                                          borderRadius: '4px',
                                          border: '1px solid #a7f3d0'
                                        }}>
                                          RECOMENDADO
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {/* Campo Pedido Mínimo para Entrega */}
                          <div style={{ marginTop: '16px' }}>
                            <label style={{
                              display: 'block',
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#374151',
                              marginBottom: '8px'
                            }}>
                              Pedido mínimo para entrega
                            </label>
                            <input
                              type="text"
                              value={pedidoMinimoEntrega}
                              onChange={handlePedidoMinimoChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              style={{
                                height: '40px',
                                fontSize: '14px'
                              }}
                            />
                          </div>

                          {/* Toggle Frete Grátis */}
                          <div style={{ marginTop: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div 
                                className={`toggle-switch cursor-pointer ${freteGratisAtivo ? 'active' : 'inactive'}`}
                                onClick={() => setFreteGratisAtivo(!freteGratisAtivo)}
                                style={{
                                  width: '44px',
                                  height: '24px',
                                  borderRadius: '12px',
                                  backgroundColor: freteGratisAtivo ? '#542583' : '#d1d5db',
                                  position: 'relative',
                                  transition: 'all 0.3s ease-in-out'
                                }}
                              >
                                <div 
                                  className="toggle-handle"
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '50%',
                                    backgroundColor: 'white',
                                    position: 'absolute',
                                    top: '4px',
                                    transform: freteGratisAtivo ? 'translateX(24px)' : 'translateX(4px)',
                                    transition: 'all 0.3s ease-in-out'
                                  }}
                                ></div>
                              </div>
                              <span style={{ 
                                fontSize: '14px', 
                                color: '#374151',
                                fontWeight: '500'
                              }}>
                                Frete grátis para pedidos a partir de um valor
                              </span>
                            </div>
                          </div>

                          {/* Campo Valor Mínimo para Frete Grátis (condicional) */}
                          {freteGratisAtivo && (
                            <div style={{ marginTop: '16px' }}>
                              <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '8px'
                              }}>
                                Valor mínimo para frete grátis
                              </label>
                              <input
                                type="text"
                                value={valorMinimoFreteGratis}
                                onChange={handleValorMinimoFreteGratisChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                style={{
                                  height: '40px',
                                  fontSize: '14px'
                                }}
                              />
                            </div>
                          )}

                          {/* Botão Cadastrar Novo Raio de Entrega */}
                          <div style={{ marginTop: '24px' }}>
                            <button
                              onClick={handleAbrirModalRaioEntrega}
                              style={{
                                backgroundColor: '#542583',
                                color: 'white',
                                border: 'none',
                                padding: '10px 16px',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '500',
                                height: '44px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                width: '100%',
                                justifyContent: 'center'
                              }}
                              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#7209bd'}
                              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#542583'}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="16"/>
                                <line x1="8" y1="12" x2="16" y2="12"/>
                              </svg>
                              Cadastrar Novo Raio de Entrega
                            </button>
                          </div>

                          {/* Lista de Raios Cadastrados */}
                          {raiosEntrega.length > 0 && (
                            <div 
                              style={{ 
                                marginTop: '20px'
                              }}>
                              <h4 style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '12px'
                              }}>
                                Raios Cadastrados ({raiosEntrega.length})
                              </h4>
                              <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '12px',
                                maxHeight: '200px',
                                overflowY: 'auto',
                                paddingRight: '8px'
                              }}>
                                {raiosEntrega
                                  .sort((a, b) => a.distancia - b.distancia)
                                  .map((raio, index, array) => {
                                    const proximoRaio = array[index + 1]
                                    const distanciaInicial = index === 0 ? 0 : array[index - 1].distancia
                                    const distanciaFinal = raio.distancia
                                    
                                    return (
                                      <div
                                        key={raio.id}
                                        style={{
                                          backgroundColor: '#f9fafb',
                                          border: '1px solid #e5e7eb',
                                          borderRadius: '6px',
                                          padding: '12px',
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          transition: 'all 0.2s'
                                        }}
                                      >
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                          <div style={{ 
                                            fontSize: '14px', 
                                            fontWeight: '600', 
                                            color: '#374151'
                                          }}>
                                            {distanciaInicial}-{distanciaFinal} km
                                          </div>
                                          <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '12px',
                                            fontSize: '13px',
                                            color: '#6b7280'
                                          }}>
                                            <span style={{ fontWeight: '500', color: '#542583' }}>
                                              R$ {raio.preco}
                                            </span>
                                            <span>
                                              {raio.tempoMaximo}-{raio.tempoMaximo + 10} min
                                            </span>
                                          </div>
                                        </div>
                                        
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                          {/* Botão Editar */}
                                          <button
                                            onClick={() => handleAbrirModalEditarRaio(raio)}
                                            style={{
                                              background: 'none',
                                              border: 'none',
                                              cursor: 'pointer',
                                              padding: '4px',
                                              borderRadius: '4px',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              transition: 'background-color 0.2s'
                                            }}
                                            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#e5e7eb'}
                                            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
                                            title="Editar raio"
                                          >
                                            <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#6b7280">
                                              <path d="M360-600v-80h360v80H360Zm0 120v-80h360v80H360ZM560-80v-123l221-220q9-9 20-13t22-4q12 0 23 4.5t20 13.5l37 37q8 9 12.5 20t4.5 22q0 11-4 22.5T903-300L683-80H560Zm263-224 37-39-37-37-38 38 38 38ZM240-80q-50 0-85-35t-35-85v-120h120v-560h600v361q-20-2-40.5 1.5T760-505v-295H320v480h240l-80 80v160H240Z"/>
                                            </svg>
                                          </button>
                                          
                                          {/* Botão Excluir */}
                                          <button
                                            onClick={() => handleExcluirRaio(raio.id)}
                                            style={{
                                              background: 'none',
                                              border: 'none',
                                              cursor: 'pointer',
                                              padding: '4px',
                                              borderRadius: '4px',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              transition: 'background-color 0.2s'
                                            }}
                                            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#fee2e2'}
                                            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
                                            title="Excluir raio"
                                          >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm80-160h80v-360h-80v360Zm160 0h80v-360h-80v360Z"/>
                                            </svg>
                                          </button>
                                        </div>
                                      </div>
                                    )
                                  })}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Seção de Endereço */}
                      {secaoAtiva === 'endereco' && (
                        <>
                          {/* Header com título e botão salvar */}
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-start',
                            marginBottom: '16px'
                          }}>
                            <div>
                              <h2 style={{ 
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: '#374151',
                                marginBottom: '4px',
                                lineHeight: '1.2'
                              }}>
                                Endereço da loja
                              </h2>
                              <p style={{ 
                                fontSize: '14px',
                                color: '#6b7280',
                                lineHeight: '1.4',
                                margin: '0'
                              }}>
                                Insira as informações do endereço<br />da sua loja.
                              </p>
                            </div>
                            
                            {/* Botão Salvar */}
                            <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={handleSalvarEnderecoLoja}
                              style={{
                                backgroundColor: '#542583',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '500',
                                height: '40px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#7209bd'}
                              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#542583'}
                            >
                                Salvar
                            </button>
                            </div>
                          </div>
                          
                          {/* Linha divisória */}
                          <div style={{ 
                            width: '100%',
                            height: '1px',
                            backgroundColor: '#d1d5db',
                            margin: '12px 0 16px 0'
                          }}></div>
                          
                          {/* Campos do endereço */}
                          <div style={{ display: 'grid', gap: '32px', paddingTop: '8px' }}>
                            {/* Primeira linha - Rua e Número */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '12px', alignItems: 'end' }}>
                              <div style={{ position: 'relative' }}>
                                <label style={{
                                  position: 'absolute',
                                  top: (camposFocados.rua || valoresCampos.rua) ? '-8px' : '50%',
                                  left: '12px',
                                  fontSize: (camposFocados.rua || valoresCampos.rua) ? '12px' : '14px',
                                  fontWeight: '500',
                                  color: (camposFocados.rua || valoresCampos.rua) ? '#542583' : '#6b7280',
                                  backgroundColor: (camposFocados.rua || valoresCampos.rua) ? 'white' : 'transparent',
                                  padding: (camposFocados.rua || valoresCampos.rua) ? '0 4px' : '0',
                                  zIndex: 1,
                                  transform: (camposFocados.rua || valoresCampos.rua) ? 'translateY(0)' : 'translateY(-50%)',
                                  transition: 'all 0.15s ease',
                                  pointerEvents: 'none'
                                }}>
                                  Rua
                                </label>
                                <input
                                  type="text"
                                  value={valoresCampos.rua}
                                  onChange={(e) => {
                                    setValoresCampos(prev => ({ ...prev, rua: e.target.value }))
                                    // Limpar erro quando usuário digitar
                                    if (errosCampos.rua) {
                                      setErrosCampos(prev => ({ ...prev, rua: '' }))
                                    }
                                  }}
                                  onFocus={() => setCamposFocados(prev => ({ ...prev, rua: true }))}
                                  onBlur={() => setCamposFocados(prev => ({ ...prev, rua: false }))}
                                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    errosCampos.rua ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                  style={{
                                    height: '40px',
                                    fontSize: '16px'
                                  }}
                                  required
                                />
                                {errosCampos.rua && (
                                  <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: '0',
                                    fontSize: '12px',
                                    color: '#dc2626',
                                    marginTop: '4px',
                                    fontWeight: '500'
                                  }}>
                                    {errosCampos.rua}
                                  </div>
                                )}
                              </div>
                              <div style={{ position: 'relative' }}>
                                <label style={{
                                  position: 'absolute',
                                  top: (camposFocados.numero || valoresCampos.numero) ? '-8px' : '50%',
                                  left: '12px',
                                  fontSize: (camposFocados.numero || valoresCampos.numero) ? '12px' : '14px',
                                  fontWeight: '500',
                                  color: (camposFocados.numero || valoresCampos.numero) ? '#542583' : '#6b7280',
                                  backgroundColor: (camposFocados.numero || valoresCampos.numero) ? 'white' : 'transparent',
                                  padding: (camposFocados.numero || valoresCampos.numero) ? '0 4px' : '0',
                                  zIndex: 1,
                                  transform: (camposFocados.numero || valoresCampos.numero) ? 'translateY(0)' : 'translateY(-50%)',
                                  transition: 'all 0.15s ease',
                                  pointerEvents: 'none'
                                }}>
                                  Número
                                </label>
                                <input
                                  type="text"
                                  value={valoresCampos.numero}
                                  onChange={(e) => {
                                    setValoresCampos(prev => ({ ...prev, numero: e.target.value }))
                                    if (errosCampos.numero) {
                                      setErrosCampos(prev => ({ ...prev, numero: '' }))
                                    }
                                  }}
                                  onFocus={() => setCamposFocados(prev => ({ ...prev, numero: true }))}
                                  onBlur={() => setCamposFocados(prev => ({ ...prev, numero: false }))}
                                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    errosCampos.numero ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                  style={{
                                    height: '40px',
                                    fontSize: '16px'
                                  }}
                                  required
                                />
                                {errosCampos.numero && (
                                  <div style={{
                                  position: 'absolute',
                                    top: '100%',
                                    left: '0',
                                    fontSize: '12px',
                                    color: '#dc2626',
                                    marginTop: '4px',
                                    fontWeight: '500'
                                  }}>
                                    {errosCampos.numero}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Segunda linha - Complemento e Ponto de Referência */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'end' }}>
                              <div style={{ position: 'relative' }}>
                                <label style={{
                                  position: 'absolute',
                                  top: (camposFocados.complemento || valoresCampos.complemento) ? '-8px' : '50%',
                                  left: '12px',
                                  fontSize: (camposFocados.complemento || valoresCampos.complemento) ? '12px' : '14px',
                                  fontWeight: '500',
                                  color: (camposFocados.complemento || valoresCampos.complemento) ? '#542583' : '#6b7280',
                                  backgroundColor: (camposFocados.complemento || valoresCampos.complemento) ? 'white' : 'transparent',
                                  padding: (camposFocados.complemento || valoresCampos.complemento) ? '0 4px' : '0',
                                  zIndex: 1,
                                  transform: (camposFocados.complemento || valoresCampos.complemento) ? 'translateY(0)' : 'translateY(-50%)',
                                  transition: 'all 0.15s ease',
                                  pointerEvents: 'none'
                                }}>
                                  Complemento
                                </label>
                                <input
                                  type="text"
                                  value={valoresCampos.complemento}
                                  onChange={(e) => {
                                    setValoresCampos(prev => ({ ...prev, complemento: e.target.value }))
                                    if (errosCampos.complemento) {
                                      setErrosCampos(prev => ({ ...prev, complemento: '' }))
                                    }
                                  }}
                                  onFocus={() => setCamposFocados(prev => ({ ...prev, complemento: true }))}
                                  onBlur={() => setCamposFocados(prev => ({ ...prev, complemento: false }))}
                                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    errosCampos.complemento ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                  style={{
                                    height: '40px',
                                    fontSize: '16px'
                                  }}
                                  required
                                />
                                {errosCampos.complemento && (
                                  <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: '0',
                                    fontSize: '12px',
                                    color: '#dc2626',
                                    marginTop: '4px',
                                    fontWeight: '500'
                                  }}>
                                    {errosCampos.complemento}
                                  </div>
                                )}
                              </div>
                              <div style={{ position: 'relative' }}>
                                <label style={{
                                  position: 'absolute',
                                  top: (camposFocados.pontoReferencia || valoresCampos.pontoReferencia) ? '-8px' : '50%',
                                  left: '12px',
                                  fontSize: (camposFocados.pontoReferencia || valoresCampos.pontoReferencia) ? '12px' : '14px',
                                  fontWeight: '500',
                                  color: (camposFocados.pontoReferencia || valoresCampos.pontoReferencia) ? '#542583' : '#6b7280',
                                  backgroundColor: (camposFocados.pontoReferencia || valoresCampos.pontoReferencia) ? 'white' : 'transparent',
                                  padding: (camposFocados.pontoReferencia || valoresCampos.pontoReferencia) ? '0 4px' : '0',
                                  zIndex: 1,
                                  transform: (camposFocados.pontoReferencia || valoresCampos.pontoReferencia) ? 'translateY(0)' : 'translateY(-50%)',
                                  transition: 'all 0.15s ease',
                                  pointerEvents: 'none'
                                }}>
                                  Ponto de Referência
                                </label>
                                <input
                                  type="text"
                                  value={valoresCampos.pontoReferencia}
                                  onChange={(e) => {
                                    setValoresCampos(prev => ({ ...prev, pontoReferencia: e.target.value }))
                                    if (errosCampos.pontoReferencia) {
                                      setErrosCampos(prev => ({ ...prev, pontoReferencia: '' }))
                                    }
                                  }}
                                  onFocus={() => setCamposFocados(prev => ({ ...prev, pontoReferencia: true }))}
                                  onBlur={() => setCamposFocados(prev => ({ ...prev, pontoReferencia: false }))}
                                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    errosCampos.pontoReferencia ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                  style={{
                                    height: '40px',
                                    fontSize: '16px'
                                  }}
                                  required
                                />
                                {errosCampos.pontoReferencia && (
                                  <div style={{
                                  position: 'absolute',
                                    top: '100%',
                                    left: '0',
                                    fontSize: '12px',
                                    color: '#dc2626',
                                    marginTop: '4px',
                                    fontWeight: '500'
                                  }}>
                                    {errosCampos.pontoReferencia}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Terceira linha - Bairro e Cidade */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'end' }}>
                              <div style={{ position: 'relative' }}>
                                <label style={{
                                  position: 'absolute',
                                  top: (camposFocados.bairro || valoresCampos.bairro) ? '-8px' : '50%',
                                  left: '12px',
                                  fontSize: (camposFocados.bairro || valoresCampos.bairro) ? '12px' : '14px',
                                  fontWeight: '500',
                                  color: (camposFocados.bairro || valoresCampos.bairro) ? '#542583' : '#6b7280',
                                  backgroundColor: (camposFocados.bairro || valoresCampos.bairro) ? 'white' : 'transparent',
                                  padding: (camposFocados.bairro || valoresCampos.bairro) ? '0 4px' : '0',
                                  zIndex: 1,
                                  transform: (camposFocados.bairro || valoresCampos.bairro) ? 'translateY(0)' : 'translateY(-50%)',
                                  transition: 'all 0.15s ease',
                                  pointerEvents: 'none'
                                }}>
                                  Bairro
                                </label>
                                <input
                                  type="text"
                                  value={valoresCampos.bairro}
                                  onChange={(e) => {
                                    setValoresCampos(prev => ({ ...prev, bairro: e.target.value }))
                                    if (errosCampos.bairro) {
                                      setErrosCampos(prev => ({ ...prev, bairro: '' }))
                                    }
                                  }}
                                  onFocus={() => setCamposFocados(prev => ({ ...prev, bairro: true }))}
                                  onBlur={() => setCamposFocados(prev => ({ ...prev, bairro: false }))}
                                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    errosCampos.bairro ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                  style={{
                                    height: '40px',
                                    fontSize: '16px'
                                  }}
                                  required
                                />
                                {errosCampos.bairro && (
                                  <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: '0',
                                    fontSize: '12px',
                                    color: '#dc2626',
                                    marginTop: '4px',
                                    fontWeight: '500'
                                  }}>
                                    {errosCampos.bairro}
                                  </div>
                                )}
                              </div>
                              <div style={{ position: 'relative' }}>
                                <label style={{
                                  position: 'absolute',
                                  top: (camposFocados.cidade || valoresCampos.cidade) ? '-8px' : '50%',
                                  left: '12px',
                                  fontSize: (camposFocados.cidade || valoresCampos.cidade) ? '12px' : '14px',
                                  fontWeight: '500',
                                  color: (camposFocados.cidade || valoresCampos.cidade) ? '#542583' : '#6b7280',
                                  backgroundColor: (camposFocados.cidade || valoresCampos.cidade) ? 'white' : 'transparent',
                                  padding: (camposFocados.cidade || valoresCampos.cidade) ? '0 4px' : '0',
                                  zIndex: 1,
                                  transform: (camposFocados.cidade || valoresCampos.cidade) ? 'translateY(0)' : 'translateY(-50%)',
                                  transition: 'all 0.15s ease',
                                  pointerEvents: 'none'
                                }}>
                                  Cidade
                                </label>
                                <input
                                  type="text"
                                  value={valoresCampos.cidade}
                                  onChange={(e) => {
                                    setValoresCampos(prev => ({ ...prev, cidade: e.target.value }))
                                    if (errosCampos.cidade) {
                                      setErrosCampos(prev => ({ ...prev, cidade: '' }))
                                    }
                                  }}
                                  onFocus={() => setCamposFocados(prev => ({ ...prev, cidade: true }))}
                                  onBlur={() => setCamposFocados(prev => ({ ...prev, cidade: false }))}
                                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    errosCampos.cidade ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                  style={{
                                    height: '40px',
                                    fontSize: '16px'
                                  }}
                                  required
                                />
                                {errosCampos.cidade && (
                                  <div style={{
                                  position: 'absolute',
                                    top: '100%',
                                    left: '0',
                                    fontSize: '12px',
                                    color: '#dc2626',
                                    marginTop: '4px',
                                    fontWeight: '500'
                                  }}>
                                    {errosCampos.cidade}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Quarta linha - Estado, País e CEP */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', alignItems: 'end' }}>
                              <div style={{ position: 'relative' }}>
                                <label style={{
                                  position: 'absolute',
                                  top: (camposFocados.estado || valoresCampos.estado) ? '-8px' : '50%',
                                  left: '12px',
                                  fontSize: (camposFocados.estado || valoresCampos.estado) ? '12px' : '14px',
                                  fontWeight: '500',
                                  color: (camposFocados.estado || valoresCampos.estado) ? '#542583' : '#6b7280',
                                  backgroundColor: (camposFocados.estado || valoresCampos.estado) ? 'white' : 'transparent',
                                  padding: (camposFocados.estado || valoresCampos.estado) ? '0 4px' : '0',
                                  zIndex: 1,
                                  transform: (camposFocados.estado || valoresCampos.estado) ? 'translateY(0)' : 'translateY(-50%)',
                                  transition: 'all 0.15s ease',
                                  pointerEvents: 'none'
                                }}>
                                  Estado
                                </label>
                                <input
                                  type="text"
                                  value={valoresCampos.estado}
                                  onChange={(e) => {
                                    setValoresCampos(prev => ({ ...prev, estado: e.target.value }))
                                    if (errosCampos.estado) {
                                      setErrosCampos(prev => ({ ...prev, estado: '' }))
                                    }
                                  }}
                                  onFocus={() => setCamposFocados(prev => ({ ...prev, estado: true }))}
                                  onBlur={() => setCamposFocados(prev => ({ ...prev, estado: false }))}
                                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    errosCampos.estado ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                  style={{
                                    height: '40px',
                                    fontSize: '16px'
                                  }}
                                  required
                                />
                                {errosCampos.estado && (
                                  <div style={{
                                  position: 'absolute',
                                    top: '100%',
                                    left: '0',
                                    fontSize: '12px',
                                    color: '#dc2626',
                                    marginTop: '4px',
                                    fontWeight: '500'
                                  }}>
                                    {errosCampos.estado}
                                  </div>
                                )}
                              </div>
                              
                              {/* Dropdown do País */}
                              <div style={{ position: 'relative' }}>
                                <label style={{
                                  position: 'absolute',
                                  top: '-8px',
                                  left: '12px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  color: '#542583',
                                  backgroundColor: 'white',
                                  padding: '0 4px',
                                  zIndex: 1
                                }}>
                                  País
                                </label>
                                <button
                                  onClick={() => setDropdownPaisAberto(!dropdownPaisAberto)}
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
                                    fontSize: '16px',
                                    color: '#374151',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                  }}
                                                                     onMouseEnter={(e) => getEventTarget(e).style.borderColor = '#542583'}
                                   onMouseLeave={(e) => getEventTarget(e).style.borderColor = '#d1d5db'}
                                >
                                  <span>{paisSelecionado}</span>
                                  <svg 
                                    width="16" 
                                    height="16" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2"
                                    style={{
                                      transform: dropdownPaisAberto ? 'rotate(180deg)' : 'rotate(0deg)',
                                      transition: 'transform 0.2s'
                                    }}
                                  >
                                    <polyline points="6,9 12,15 18,9"></polyline>
                                  </svg>
                                </button>
                                
                                {/* Menu Dropdown do País */}
                                {dropdownPaisAberto && (
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
                                    {paises.map((pais) => (
                                      <button
                                        key={pais}
                                        onClick={() => {
                                          setPaisSelecionado(pais)
                                          setDropdownPaisAberto(false)
                                        }}
                                        style={{
                                          width: '100%',
                                          padding: '8px 12px',
                                          fontSize: '14px',
                                          color: '#374151',
                                          background: paisSelecionado === pais ? '#f3e8ff' : 'transparent',
                                          border: 'none',
                                          textAlign: 'left',
                                          cursor: 'pointer',
                                          transition: 'background-color 0.15s',
                                          display: 'block'
                                        }}
                                        onMouseEnter={(e) => {
                                          if (paisSelecionado !== pais) {
                                            (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'
                                          }
                                        }}
                                        onMouseLeave={(e) => {
                                          if (paisSelecionado !== pais) {
                                            (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
                                          }
                                        }}
                                      >
                                        {pais}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div style={{ position: 'relative' }}>
                                <label style={{
                                  position: 'absolute',
                                  top: (camposFocados.cep || valoresCampos.cep) ? '-8px' : '50%',
                                  left: '12px',
                                  fontSize: (camposFocados.cep || valoresCampos.cep) ? '12px' : '14px',
                                  fontWeight: '500',
                                  color: (camposFocados.cep || valoresCampos.cep) ? '#542583' : '#6b7280',
                                  backgroundColor: (camposFocados.cep || valoresCampos.cep) ? 'white' : 'transparent',
                                  padding: (camposFocados.cep || valoresCampos.cep) ? '0 4px' : '0',
                                  zIndex: 1,
                                  transform: (camposFocados.cep || valoresCampos.cep) ? 'translateY(0)' : 'translateY(-50%)',
                                  transition: 'all 0.15s ease',
                                  pointerEvents: 'none'
                                }}>
                                  CEP
                                </label>
                                <input
                                  type="text"
                                  value={valoresCampos.cep}
                                  onChange={(e) => {
                                    const valorMascarado = aplicarMascaraCep(e.target.value)
                                    setValoresCampos(prev => ({ ...prev, cep: valorMascarado }))
                                    if (errosCampos.cep) {
                                      setErrosCampos(prev => ({ ...prev, cep: '' }))
                                    }
                                  }}
                                  onFocus={() => setCamposFocados(prev => ({ ...prev, cep: true }))}
                                  onBlur={() => setCamposFocados(prev => ({ ...prev, cep: false }))}
                                  maxLength={9}
                                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    errosCampos.cep ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                  style={{
                                    height: '40px',
                                    fontSize: '16px'
                                  }}
                                  required
                                />
                                {errosCampos.cep && (
                                  <div style={{
                                  position: 'absolute',
                                    top: '100%',
                                    left: '0',
                                    fontSize: '12px',
                                    color: '#dc2626',
                                    marginTop: '4px',
                                    fontWeight: '500'
                                  }}>
                                    {errosCampos.cep}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Página de Motoboys */}
              {paginaAtiva === 'motoboys' && (
                <div>
                  {/* Botão Salvar configurações */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
                    <button
                      onClick={async () => {
                        try {
                          // Por enquanto, apenas mostra uma mensagem de sucesso
                          // Futuramente pode salvar configurações específicas de motoboys
                          toast.success('Configurações de motoboys salvas!')
                        } catch (error) {
                          console.error('Erro ao salvar configurações:', error)
                          toast.error('Erro ao salvar configurações')
                        }
                      }}
                      style={{
                        backgroundColor: '#542583',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        height: '40px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#7209bd'}
                      onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#542583'}
                    >
                      Salvar configurações
                    </button>
                  </div>

                  <div style={{ marginBottom: '32px' }}>
                    <div className="flex" style={{ alignItems: 'flex-start' }}>
                      {/* Lado esquerdo - Título e descrição */}
                      <div style={{ flex: '1 1 auto', marginRight: '50px', maxWidth: '280px' }}>
                        <h2 style={{ 
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: '#374151',
                          marginBottom: '8px',
                          lineHeight: '1.2'
                        }}>
                          Motoboys
                        </h2>
                        <p style={{ 
                          fontSize: '14px',
                          color: '#6b7280',
                          lineHeight: '1.5',
                          maxWidth: '370px'
                        }}>
                          Cadastre motoboys próprios para realizar entregas.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Linha divisória */}
                  <div 
                    style={{ 
                      width: '100%',
                      height: '1px',
                      backgroundColor: '#d1d5db',
                      marginBottom: '32px'
                    }}
                  ></div>
                  
                  {/* Seção principal com layout duas colunas */}
                  <div style={{ marginBottom: '32px' }}>
                    <div className="flex" style={{ alignItems: 'flex-start' }}>
                      {/* Lado esquerdo - Botão */}
                      <div style={{ flex: '1 1 auto', marginRight: '50px', maxWidth: '280px' }}>
                        <button
                          onClick={handleAbrirModalNovoMotoboy}
                          style={{
                            backgroundColor: '#542583',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            height: '40px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#7209bd'}
                          onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#542583'}
                        >
                          <span style={{ fontSize: '16px', lineHeight: '1' }}>+</span>
                          Novo motoboy
                        </button>
                      </div>
                      
                      {/* Lado direito - Toggle alinhado */}
                      <div style={{ 
                        alignSelf: 'flex-start', 
                        paddingTop: '2px',
                        marginLeft: 'auto',
                        width: '526px'
                      }}>
                        <div className="flex items-center gap-3">
                          <div 
                            className={`toggle-switch cursor-pointer ${ativarMotoboys ? 'active' : 'inactive'}`}
                            onClick={() => setAtivarMotoboys(!ativarMotoboys)}
                            style={{
                              width: '44px',
                              height: '24px',
                              borderRadius: '12px',
                              backgroundColor: ativarMotoboys ? '#542583' : '#d1d5db',
                              position: 'relative',
                              transition: 'all 0.3s ease-in-out'
                            }}
                          >
                            <div 
                              className="toggle-handle"
                              style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                backgroundColor: 'white',
                                position: 'absolute',
                                top: '4px',
                                transform: ativarMotoboys ? 'translateX(24px)' : 'translateX(4px)',
                                transition: 'all 0.3s ease-in-out'
                              }}
                            ></div>
                          </div>
                          <span style={{ fontSize: '16px', color: '#374151', fontWeight: '500' }}>
                            Ativar módulo de motoboys próprios
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lista de Motoboys */}
                  {listaMotoboys.length > 0 && (
                    <div style={{ marginTop: '32px' }}>
                      <div 
                        style={{
                          backgroundColor: 'white',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          overflow: 'hidden'
                        }}
                      >
                        {/* Cabeçalho da tabela */}
                        <div 
                          style={{
                            backgroundColor: '#f9fafb',
                            borderBottom: '1px solid #d1d5db',
                            padding: '12px 24px',
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr 1fr',
                            gap: '16px',
                            alignItems: 'center'
                          }}
                        >
                          <div style={{ 
                            fontSize: '14px', 
                            fontWeight: '600', 
                            color: '#374151',
                            textAlign: 'left'
                          }}>
                            Nome
                          </div>
                          <div style={{ 
                            fontSize: '14px', 
                            fontWeight: '600', 
                            color: '#374151',
                            textAlign: 'center'
                          }}>
                            WhatsApp
                          </div>
                          <div style={{ 
                            fontSize: '14px', 
                            fontWeight: '600', 
                            color: '#374151',
                            textAlign: 'center'
                          }}>
                            Ativo
                          </div>
                          <div style={{ 
                            fontSize: '14px', 
                            fontWeight: '600', 
                            color: '#374151',
                            textAlign: 'center'
                          }}>
                            Ações
                          </div>
                        </div>

                        {/* Linhas da tabela */}
                        {listaMotoboys.map((motoboy, index) => (
                          <div 
                            key={motoboy.id}
                            onClick={() => handleAbrirModalVisualizarMotoboy(motoboy)}
                            style={{
                              padding: '12px 24px',
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr 1fr 1fr',
                              gap: '16px',
                              alignItems: 'center',
                              borderBottom: index < listaMotoboys.length - 1 ? '1px solid #e5e7eb' : 'none',
                              backgroundColor: 'white',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'}
                            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'white'}
                          >
                            {/* Nome */}
                            <div style={{ 
                              fontSize: '14px', 
                              color: '#374151',
                              fontWeight: '500',
                              textAlign: 'left'
                            }}>
                              {motoboy.nome}
                            </div>

                            {/* WhatsApp */}
                            <div style={{ 
                              fontSize: '14px', 
                              color: '#6b7280',
                              textAlign: 'center'
                            }}>
                              {motoboy.whatsapp}
                            </div>

                            {/* Status */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <div 
                                className={`toggle-switch cursor-pointer ${motoboy.ativo ? 'active' : 'inactive'}`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleToggleStatusMotoboy(motoboy.id)
                                }}
                                style={{
                                  width: '44px',
                                  height: '24px',
                                  borderRadius: '12px',
                                  backgroundColor: motoboy.ativo ? '#542583' : '#d1d5db',
                                  position: 'relative',
                                  transition: 'all 0.3s ease-in-out'
                                }}
                              >
                                <div 
                                  className="toggle-handle"
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '50%',
                                    backgroundColor: 'white',
                                    position: 'absolute',
                                    top: '4px',
                                    transform: motoboy.ativo ? 'translateX(24px)' : 'translateX(4px)',
                                    transition: 'all 0.3s ease-in-out'
                                  }}
                                ></div>
                              </div>
                            </div>

                            {/* Ações */}
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                              {/* Botão Visualizar */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleAbrirModalVisualizarMotoboy(motoboy)
                                }}
                                style={{
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  padding: '0',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#6b7280'
                                }}
                                title="Visualizar motoboy"
                              >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                  <circle cx="12" cy="12" r="3"/>
                                </svg>
                              </button>

                              {/* Botão Editar */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleAbrirModalEditarMotoboy(motoboy)
                                }}
                                style={{
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  padding: '0',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#6b7280'
                                }}
                                title="Editar motoboy"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                                  <path d="M360-600v-80h360v80H360Zm0 120v-80h360v80H360ZM560-80v-123l221-220q9-9 20-13t22-4q12 0 23 4.5t20 13.5l37 37q8 9 12.5 20t4.5 22q0 11-4 22.5T903-300L683-80H560Zm263-224 37-39-37-37-38 38 38 38ZM240-80q-50 0-85-35t-35-85v-120h120v-560h600v361q-20-2-40.5 1.5T760-505v-295H320v480h240l-80 80v160H240Z"/>
                                </svg>
                              </button>

                              {/* Botão Remover */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRemoverMotoboy(motoboy)
                                }}
                                style={{
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  padding: '0',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#6b7280'
                                }}
                                title="Remover motoboy"
                              >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                      <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm80-160h80v-360h-80v360Zm160 0h80v-360h-80v360Z"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Página de Impressão */}
              {paginaAtiva === 'impressao' && (
                <div>
                  {/* Botão Salvar configurações */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
                    <button
                      onClick={async () => {
                        try {
                          await salvarConfiguracaoImpressao({
                            mostrarCnpjLoja,
                            mostrarCategoriaProdutos,
                            mostrarDescricaoProdutos,
                            tipoExibicaoPizza,
                            quantidadeAdicionais
                          })
                        } catch (error) {
                          console.error('Erro ao salvar configurações:', error)
                          toast.error('Erro ao salvar configurações')
                        }
                      }}
                      style={{
                        backgroundColor: '#542583',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        height: '40px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#7209bd'}
                      onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#542583'}
                    >
                      Salvar configurações
                    </button>
                  </div>

                  <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ 
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#374151',
                      marginBottom: '8px',
                      lineHeight: '1.2'
                    }}>
                      Configuração da notinha
                    </h2>
                    <p style={{ 
                      fontSize: '14px',
                      color: '#6b7280',
                      lineHeight: '1.5',
                      maxWidth: '370px'
                    }}>
                      Defina suas preferências para as notas impressas dos pedidos.
                    </p>
                  </div>
                  
                  {/* Linha divisória */}
                  <div 
                    style={{ 
                      width: '100%',
                      height: '1px',
                      backgroundColor: '#d1d5db',
                      marginBottom: '32px'
                    }}
                  ></div>
                  
                  {/* Seção principal com layout duas colunas */}
                  <div style={{ marginBottom: '32px' }}>
                    <div className="flex" style={{ alignItems: 'flex-start' }}>
                      {/* Lado esquerdo - Preview da nota fiscal */}
                      <div style={{ flex: '1 1 auto', marginRight: '50px', maxWidth: '350px' }}>
                        <div style={{
                          backgroundColor: '#f9fafb',
                          border: '2px solid #d1d5db',
                          borderRadius: '8px',
                          padding: '24px',
                          fontFamily: 'monospace',
                          fontSize: '13px',
                          lineHeight: '1.5',
                          color: '#374151',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}>
                          {/* Cabeçalho da loja */}
                          <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '2px' }}>
                              {nomeLoja || 'Sua Loja'}
                            </div>
                            {mostrarCnpjLoja && (
                              <div style={{ fontSize: '12px' }}>00.000.000/0001-00</div>
                            )}
                          </div>
                          
                          {/* Linha divisória */}
                          <div style={{ 
                            borderTop: '2px solid #d1d5db', 
                            margin: '15px 0',
                            position: 'relative'
                          }}>
                            <div style={{
                              content: '""',
                              position: 'absolute',
                              top: '-1px',
                              left: '0',
                              right: '0',
                              borderTop: '1px dashed #9ca3af'
                            }}></div>
                          </div>
                          
                          {/* Informações do pedido */}
                          <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '3px' }}>Pedido</div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>B-0001</div>
                          </div>
                          
                          {/* Linha divisória */}
                          <div style={{ 
                            borderTop: '2px solid #d1d5db', 
                            margin: '15px 0',
                            position: 'relative'
                          }}>
                            <div style={{
                              content: '""',
                              position: 'absolute',
                              top: '-1px',
                              left: '0',
                              right: '0',
                              borderTop: '1px dashed #9ca3af'
                            }}></div>
                          </div>
                          
                          {/* Itens do pedido */}
                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>ITENS DO PEDIDO</div>
                            <div style={{ marginBottom: '12px', fontSize: '12px', fontStyle: 'italic' }}>Total de itens: 4</div>
                            
                            {/* Seção Pizzas */}
                            <div style={{ marginBottom: '15px' }}>
                              {mostrarCategoriaProdutos && (
                                <div style={{ 
                                  fontWeight: 'bold', 
                                  fontSize: '13px', 
                                  marginBottom: '5px',
                                  borderBottom: '1px solid #e5e7eb',
                                  paddingBottom: '2px'
                                }}>
                                  Pizzas
                                </div>
                              )}
                              <div style={{ marginLeft: '8px' }}>
                                <div style={{ fontWeight: '500' }}>
                                  {tipoExibicaoPizza === 'nome-completo' 
                                    ? '1 Pizza Grande Mussarela/Calabresa' 
                                    : '1 Pizza Grande'}
                                </div>
                                {mostrarDescricaoProdutos && tipoExibicaoPizza === 'nome-completo' && (
                                  <div style={{ 
                                    fontSize: '11px', 
                                    color: '#6b7280', 
                                    marginLeft: '12px',
                                    fontStyle: 'italic',
                                    marginBottom: '4px'
                                  }}>
                                    Mussarela, molho de tomate e manjericão
                                  </div>
                                )}
                                {tipoExibicaoPizza === 'por-fracao' && (
                                  <div style={{ marginLeft: '20px', fontSize: '11px' }}>
                                    <div>• 1/2 Calabresa</div>
                                    <div>• 1/2 Marguerita</div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Linha divisória entre categorias */}
                            <div style={{ 
                              borderTop: '1px dashed #d1d5db', 
                              margin: '12px 0'
                            }}></div>
                            
                            {/* Seção Hamburguers */}
                            <div>
                              {mostrarCategoriaProdutos && (
                                <div style={{ 
                                  fontWeight: 'bold', 
                                  fontSize: '13px', 
                                  marginBottom: '5px',
                                  borderBottom: '1px solid #e5e7eb',
                                  paddingBottom: '2px'
                                }}>
                                  Hamburguers
                                </div>
                              )}
                              <div style={{ marginLeft: '8px' }}>
                                {quantidadeAdicionais === 'exibir-separadamente' ? (
                                  <>
                                    <div style={{ fontWeight: '500', marginBottom: '8px' }}>1 Hamburguer Pink Australiano</div>
                                    {mostrarDescricaoProdutos && (
                                      <div style={{ 
                                        fontSize: '11px', 
                                        color: '#6b7280', 
                                        marginLeft: '12px',
                                        fontStyle: 'italic',
                                        marginBottom: '4px'
                                      }}>
                                        Hamburguer artesanal com 150g de alcatra, molho,<br/>
                                        mussarela, bacon, alface e tomate, pão australiano
                                      </div>
                                    )}
                                    <div style={{ marginLeft: '20px', fontSize: '11px', marginTop: '6px', marginBottom: '12px' }}>
                                      <div>• 1 Batata frita</div>
                                      <div>• 1 Pudim</div>
                                      <div>• 2 Maionese extra</div>
                                    </div>
                                    
                                    <div style={{ fontWeight: '500', marginBottom: '8px' }}>1 Hamburguer Pink Australiano</div>
                                    {mostrarDescricaoProdutos && (
                                      <div style={{ 
                                        fontSize: '11px', 
                                        color: '#6b7280', 
                                        marginLeft: '12px',
                                        fontStyle: 'italic',
                                        marginBottom: '4px'
                                      }}>
                                        Hamburguer artesanal com 150g de alcatra, molho,<br/>
                                        mussarela, bacon, alface e tomate, pão australiano
                                      </div>
                                    )}
                                    <div style={{ marginLeft: '20px', fontSize: '11px', marginTop: '6px', marginBottom: '12px' }}>
                                      <div>• 1 Batata frita</div>
                                      <div>• 1 Pudim</div>
                                      <div>• 2 Maionese extra</div>
                                    </div>
                                    
                                    <div style={{ fontWeight: '500', marginBottom: '8px' }}>1 Hamburguer Pink Australiano</div>
                                    {mostrarDescricaoProdutos && (
                                      <div style={{ 
                                        fontSize: '11px', 
                                        color: '#6b7280', 
                                        marginLeft: '12px',
                                        fontStyle: 'italic',
                                        marginBottom: '4px'
                                      }}>
                                        Hamburguer artesanal com 150g de alcatra, molho,<br/>
                                        mussarela, bacon, alface e tomate, pão australiano
                                      </div>
                                    )}
                                    <div style={{ marginLeft: '20px', fontSize: '11px', marginTop: '6px' }}>
                                      <div>• 1 Batata frita</div>
                                      <div>• 1 Pudim</div>
                                      <div>• 2 Maionese extra</div>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div style={{ fontWeight: '500' }}>3 Hamburguer Pink Australiano</div>
                                    {mostrarDescricaoProdutos && (
                                      <div style={{ 
                                        fontSize: '11px', 
                                        color: '#6b7280', 
                                        marginLeft: '12px',
                                        fontStyle: 'italic',
                                        marginBottom: '4px'
                                      }}>
                                        Hamburguer artesanal com 150g de alcatra, molho,<br/>
                                        mussarela, bacon, alface e tomate, pão australiano
                                      </div>
                                    )}
                                    <div style={{ marginLeft: '20px', fontSize: '11px', marginTop: '6px' }}>
                                      {quantidadeAdicionais === 'agrupar-manter' ? (
                                        <>
                                          <div>• 1 Batata frita</div>
                                          <div>• 1 Pudim</div>
                                          <div>• 2 Maionese extra</div>
                                        </>
                                      ) : (
                                        <>
                                          <div>• 3 Batata frita</div>
                                          <div>• 3 Pudim</div>
                                          <div>• 6 Maionese extra</div>
                                        </>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Lado direito - Toggles agrupados */}
                      <div style={{ 
                        alignSelf: 'flex-start', 
                        paddingTop: '2px',
                        marginLeft: 'auto',
                        width: '526px'
                      }}>
                        {/* Toggle CNPJ da loja */}
                        <div className="flex items-center gap-3" style={{ marginBottom: '24px' }}>
                          <div 
                            className={`toggle-switch cursor-pointer ${mostrarCnpjLoja ? 'active' : 'inactive'}`}
                            onClick={() => setMostrarCnpjLoja(!mostrarCnpjLoja)}
                            style={{
                              width: '44px',
                              height: '24px',
                              borderRadius: '12px',
                              backgroundColor: mostrarCnpjLoja ? '#542583' : '#d1d5db',
                              position: 'relative',
                              transition: 'all 0.3s ease-in-out'
                            }}
                          >
                            <div 
                              className="toggle-handle"
                              style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                backgroundColor: 'white',
                                position: 'absolute',
                                top: '4px',
                                transform: mostrarCnpjLoja ? 'translateX(24px)' : 'translateX(4px)',
                                transition: 'all 0.3s ease-in-out'
                              }}
                            ></div>
                          </div>
                          <span style={{ fontSize: '16px', color: '#374151', fontWeight: '500' }}>
                            Mostrar CNPJ da loja
                          </span>
                        </div>
                        
                        {/* Toggle categoria dos produtos */}
                        <div className="flex items-center gap-3" style={{ marginBottom: '24px' }}>
                          <div 
                            className={`toggle-switch cursor-pointer ${mostrarCategoriaProdutos ? 'active' : 'inactive'}`}
                            onClick={() => setMostrarCategoriaProdutos(!mostrarCategoriaProdutos)}
                            style={{
                              width: '44px',
                              height: '24px',
                              borderRadius: '12px',
                              backgroundColor: mostrarCategoriaProdutos ? '#542583' : '#d1d5db',
                              position: 'relative',
                              transition: 'all 0.3s ease-in-out'
                            }}
                          >
                            <div 
                              className="toggle-handle"
                              style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                backgroundColor: 'white',
                                position: 'absolute',
                                top: '4px',
                                transform: mostrarCategoriaProdutos ? 'translateX(24px)' : 'translateX(4px)',
                                transition: 'all 0.3s ease-in-out'
                              }}
                            ></div>
                          </div>
                          <span style={{ fontSize: '16px', color: '#374151', fontWeight: '500' }}>
                            Mostrar categoria dos produtos
                          </span>
                        </div>
                        
                        {/* Toggle descrição dos produtos */}
                        <div className="flex items-center gap-3" style={{ marginBottom: '32px' }}>
                          <div 
                            className={`toggle-switch cursor-pointer ${mostrarDescricaoProdutos ? 'active' : 'inactive'}`}
                            onClick={() => setMostrarDescricaoProdutos(!mostrarDescricaoProdutos)}
                            style={{
                              width: '44px',
                              height: '24px',
                              borderRadius: '12px',
                              backgroundColor: mostrarDescricaoProdutos ? '#542583' : '#d1d5db',
                              position: 'relative',
                              transition: 'all 0.3s ease-in-out'
                            }}
                          >
                            <div 
                              className="toggle-handle"
                              style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                backgroundColor: 'white',
                                position: 'absolute',
                                top: '4px',
                                transform: mostrarDescricaoProdutos ? 'translateX(24px)' : 'translateX(4px)',
                                transition: 'all 0.3s ease-in-out'
                              }}
                            ></div>
                          </div>
                          <span style={{ fontSize: '16px', color: '#374151', fontWeight: '500' }}>
                            Mostrar descrição dos produtos
                          </span>
                        </div>
                        
                        {/* Seção Como mostrar produtos do tipo pizza */}
                        <div>
                          <div style={{ marginBottom: '16px' }}>
                            <span style={{ 
                              fontSize: '16px', 
                              color: '#374151', 
                              fontWeight: '500' 
                            }}>
                              Como você prefere mostrar os produtos do tipo pizza?
                            </span>
                          </div>
                          
                          {/* Botões de status lado a lado */}
                          <div style={{ display: 'flex', gap: '12px' }}>
                            {/* Botão Nome completo */}
                            <button
                              className={`px-4 py-2 rounded-md text-sm font-medium ${
                                tipoExibicaoPizza === 'nome-completo'
                                  ? 'shadow-sm'
                                  : 'text-gray-700 border border-gray-300 hover:bg-gray-50'
                              }`}
                              style={{
                                backgroundColor: tipoExibicaoPizza === 'nome-completo' ? '#f3e8ff' : 'transparent',
                                color: tipoExibicaoPizza === 'nome-completo' ? '#542583' : undefined,
                                border: tipoExibicaoPizza === 'nome-completo' ? 'none' : '1px solid #d1d5db',
                                transition: 'all 0.2s'
                              }}
                              onClick={() => setTipoExibicaoPizza('nome-completo')}
                            >
                              Nome completo
                            </button>
                            
                            {/* Botão Por fração */}
                            <button
                              className={`px-4 py-2 rounded-md text-sm font-medium ${
                                tipoExibicaoPizza === 'por-fracao'
                                  ? 'shadow-sm'
                                  : 'text-gray-700 border border-gray-300 hover:bg-gray-50'
                              }`}
                              style={{
                                backgroundColor: tipoExibicaoPizza === 'por-fracao' ? '#f3e8ff' : 'transparent',
                                color: tipoExibicaoPizza === 'por-fracao' ? '#542583' : undefined,
                                border: tipoExibicaoPizza === 'por-fracao' ? 'none' : '1px solid #d1d5db',
                                transition: 'all 0.2s'
                              }}
                              onClick={() => setTipoExibicaoPizza('por-fracao')}
                            >
                              Por fração
                            </button>
                          </div>
                        </div>
                        
                        {/* Seção Como mostrar quantidade de adicionais */}
                        <div style={{ marginTop: '32px' }}>
                          <div style={{ marginBottom: '16px' }}>
                            <span style={{ 
                              fontSize: '16px', 
                              color: '#374151', 
                              fontWeight: '500' 
                            }}>
                              Como você prefere mostrar a quantidade de adicionais no produto?
                            </span>
                          </div>
                          
                          {/* Botões radio verticais */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {/* Opção Agrupar produtos e manter quantidade de adicionais */}
                            <label className="flex items-center gap-3 cursor-pointer">
                              <div 
                                onClick={() => setQuantidadeAdicionais('agrupar-manter')}
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  border: '2px solid #542583',
                                  borderRadius: '50%',
                                  backgroundColor: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease-in-out',
                                  flexShrink: 0
                                }}
                              >
                                {quantidadeAdicionais === 'agrupar-manter' && (
                                  <div 
                                    style={{
                                      width: '10px',
                                      height: '10px',
                                      borderRadius: '50%',
                                      backgroundColor: '#542583',
                                      margin: '0 auto'
                                    }}
                                  />
                                )}
                              </div>
                              <span style={{ fontSize: '16px', color: '#374151', fontWeight: '500' }}>
                                Agrupar produtos e manter quantidade de adicionais
                              </span>
                            </label>
                            
                            {/* Opção Agrupar produtos e multiplicar adicionais */}
                            <label className="flex items-center gap-3 cursor-pointer">
                              <div 
                                onClick={() => setQuantidadeAdicionais('agrupar-multiplicar')}
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  border: '2px solid #542583',
                                  borderRadius: '50%',
                                  backgroundColor: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease-in-out',
                                  flexShrink: 0
                                }}
                              >
                                {quantidadeAdicionais === 'agrupar-multiplicar' && (
                                  <div 
                                    style={{
                                      width: '10px',
                                      height: '10px',
                                      borderRadius: '50%',
                                      backgroundColor: '#542583',
                                      margin: '0 auto'
                                    }}
                                  />
                                )}
                              </div>
                              <span style={{ fontSize: '16px', color: '#374151', fontWeight: '500' }}>
                                Agrupar produtos e multiplicar adicionais
                              </span>
                            </label>
                            
                            {/* Opção Exibir cada produto separadamente */}
                            <label className="flex items-center gap-3 cursor-pointer">
                              <div 
                                onClick={() => setQuantidadeAdicionais('exibir-separadamente')}
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  border: '2px solid #542583',
                                  borderRadius: '50%',
                                  backgroundColor: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease-in-out',
                                  flexShrink: 0
                                }}
                              >
                                {quantidadeAdicionais === 'exibir-separadamente' && (
                                  <div 
                                    style={{
                                      width: '10px',
                                      height: '10px',
                                      borderRadius: '50%',
                                      backgroundColor: '#542583',
                                      margin: '0 auto'
                                    }}
                                  />
                                )}
                              </div>
                              <span style={{ fontSize: '16px', color: '#374151', fontWeight: '500' }}>
                                Exibir cada produto separadamente
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Página de Usuários */}
              {paginaAtiva === 'usuarios' && canAccessUsers() && (
                <div>
                  {/* Botão Salvar configurações */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
                    <button
                      onClick={async () => {
                        try {
                          // Por enquanto, apenas mostra uma mensagem de sucesso
                          // Futuramente pode salvar configurações específicas de usuários
                          toast.success('Configurações de usuários salvas!')
                        } catch (error) {
                          console.error('Erro ao salvar configurações:', error)
                          toast.error('Erro ao salvar configurações')
                        }
                      }}
                      style={{
                        backgroundColor: '#542583',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        height: '40px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#7209bd'}
                      onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#542583'}
                    >
                      Salvar configurações
                    </button>
                  </div>

                  <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ 
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#374151',
                      marginBottom: '8px',
                      lineHeight: '1.2'
                    }}>
                      Usuários
                    </h2>
                    <p style={{ 
                      fontSize: '14px',
                      color: '#6b7280',
                      lineHeight: '1.5',
                      maxWidth: '370px'
                    }}>
                      Cadastre e gerencie usuários.
                    </p>
                  </div>
                  
                  {/* Linha divisória */}
                  <div 
                    style={{ 
                      width: '100%',
                      height: '1px',
                      backgroundColor: '#d1d5db',
                      marginBottom: '32px'
                    }}
                  ></div>
                  
                  {/* Seção principal com botão */}
                  <div style={{ marginBottom: '32px' }}>
                    <button
                      onClick={handleAbrirModalNovoUsuario}
                      style={{
                        backgroundColor: '#542583',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        height: '40px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#7209bd'}
                      onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#542583'}
                    >
                      <span style={{ fontSize: '16px', lineHeight: '1' }}>+</span>
                      Novo usuário
                    </button>
                  </div>

                  {/* Tabela de usuários */}
                  <div style={{
                    backgroundColor: 'white',
                    border: '1px solid rgb(209, 213, 219)',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}>
                    {/* Cabeçalho da tabela */}
                    <div style={{
                      backgroundColor: 'rgb(249, 250, 251)',
                      borderBottom: '1px solid rgb(209, 213, 219)',
                      padding: '12px 24px',
                      display: 'grid',
                      gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 1fr',
                      gap: '12px',
                      alignItems: 'center'
                    }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: 'rgb(55, 65, 81)',
                        textAlign: 'left'
                      }}>
                        Nome
                      </div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: 'rgb(55, 65, 81)',
                        textAlign: 'left'
                      }}>
                        Email
                      </div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: 'rgb(55, 65, 81)',
                        textAlign: 'center'
                      }}>
                        CPF
                      </div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: 'rgb(55, 65, 81)',
                        textAlign: 'center'
                      }}>
                        WhatsApp
                      </div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: 'rgb(55, 65, 81)',
                        textAlign: 'center'
                      }}>
                        Ações
                      </div>
                    </div>

                    {/* Lista de usuários do Firebase */}
                    {usersLoading ? (
                      <div style={{
                        padding: '24px',
                        textAlign: 'center',
                        fontSize: '14px',
                        color: 'rgb(107, 114, 128)'
                      }}>
                        Carregando usuários...
                      </div>
                    ) : storeUsers.length === 0 ? (
                      <div style={{
                        padding: '24px',
                        textAlign: 'center',
                        fontSize: '14px',
                        color: 'rgb(107, 114, 128)'
                      }}>
                        Nenhum usuário cadastrado
                      </div>
                    ) : (
                      storeUsers.map((usuario) => (
                        <div 
                          key={usuario.id}
                          style={{
                            padding: '12px 24px',
                            display: 'grid',
                            gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 1fr',
                            gap: '12px',
                            alignItems: 'center',
                            borderBottom: 'none',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            height: '48px'
                          }}
                          onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'}
                          onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'white'}
                          onClick={() => handleAbrirModalVisualizarUsuario(usuario)}
                        >
                          <div style={{
                            fontSize: '14px',
                            color: 'rgb(55, 65, 81)',
                            fontWeight: '500',
                            textAlign: 'left'
                          }}>
                            {usuario.name}
                          </div>
                          <div style={{
                            fontSize: '14px',
                            color: 'rgb(107, 114, 128)',
                            textAlign: 'left'
                          }}>
                            {usuario.email}
                          </div>
                          <div style={{
                            fontSize: '14px',
                            color: 'rgb(107, 114, 128)',
                            textAlign: 'center'
                          }}>
                            {usuario.cpf}
                          </div>
                          <div style={{
                            fontSize: '14px',
                            color: 'rgb(107, 114, 128)',
                            textAlign: 'center'
                          }}>
                            {usuario.whatsapp}
                          </div>
                          <div style={{
                            display: 'flex',
                            gap: '8px',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <button 
                              title="Visualizar usuário"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAbrirModalVisualizarUsuario(usuario)
                              }}
                              style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                padding: '0px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'rgb(107, 114, 128)',
                                transition: 'color 0.2s'
                              }}
                              onMouseEnter={(e) => getEventTarget(e).style.color = 'rgb(55, 65, 81)'}
                              onMouseLeave={(e) => getEventTarget(e).style.color = 'rgb(107, 114, 128)'}
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>
                            <button 
                              title="Editar usuário"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAbrirModalEditarUsuario(usuario)
                              }}
                              style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                padding: '0px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'rgb(107, 114, 128)',
                                transition: 'color 0.2s'
                              }}
                              onMouseEnter={(e) => getEventTarget(e).style.color = 'rgb(55, 65, 81)'}
                              onMouseLeave={(e) => getEventTarget(e).style.color = 'rgb(107, 114, 128)'}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                                <path d="M360-600v-80h360v80H360Zm0 120v-80h360v80H360ZM560-80v-123l221-220q9-9 20-13t22-4q12 0 23 4.5t20 13.5l37 37q8 9 12.5 20t4.5 22q0 11-4 22.5T903-300L683-80H560Zm263-224 37-39-37-37-38 38 38 38ZM240-80q-50 0-85-35t-35-85v-120h120v-560h600v361q-20-2-40.5 1.5T760-505v-295H320v480h240l-80 80v160H240Z"/>
                              </svg>
                            </button>
                            <button 
                              title="Remover usuário"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleExcluirUsuario(usuario)
                              }}
                              style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                padding: '0px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'rgb(107, 114, 128)',
                                transition: 'color 0.2s'
                              }}
                              onMouseEnter={(e) => getEventTarget(e).style.color = '#ef4444'}
                              onMouseLeave={(e) => getEventTarget(e).style.color = 'rgb(107, 114, 128)'}
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm80-160h80v-360h-80v360Zm160 0h80v-360h-80v360Z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Outras páginas - placeholder por enquanto */}
              {paginaAtiva !== 'dados-loja' && paginaAtiva !== 'horarios' && paginaAtiva !== 'pagamento' && paginaAtiva !== 'motoboys' && paginaAtiva !== 'impressao' && paginaAtiva !== 'usuarios' && paginaAtiva !== 'entrega' && (
                <div style={{ padding: '32px', textAlign: 'center' }}>
                  <h2 style={{ 
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#374151',
                    marginBottom: '16px'
                  }}>
                    {paginaAtiva.charAt(0).toUpperCase() + paginaAtiva.slice(1).replace('-', ' ')}
                  </h2>
                  <p style={{ 
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    Conteúdo da página {paginaAtiva} será implementado em breve.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Crop de Imagem */}
      {showCropModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="bg-white rounded-lg p-6"
            style={{ 
              width: '600px', 
              height: '500px'
            }}
          >
            {/* Header do modal */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Recortar {uploadingForBanner ? 'Banner' : 'Logo'}
              </h3>
              <button
                onClick={handleCropCancel}
                className="text-gray-400 hover:text-gray-600"
                style={{ fontSize: '24px' }}
              >
                ×
              </button>
            </div>

            {/* Área de preview da imagem */}
            <div className="flex flex-col items-center mb-6">
              <div 
                className="flex items-center justify-center mb-4 select-none"
                style={{ 
                  position: 'relative',
                  display: 'inline-block'
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img 
                  id="crop-image"
                  src={imageToCrop}
                  alt="Imagem para recortar"
                  className="block pointer-events-none"
                  style={{ maxWidth: '400px', maxHeight: '400px' }}
                  onLoad={(e) => {
                    const img = e.target as HTMLImageElement
                    setImageDimensions({ 
                      width: img.offsetWidth, 
                      height: img.offsetHeight 
                    })
                    // Centralizar o crop na imagem com tamanho padrão
                    if (uploadingForBanner) {
                      setCropSize({ width: 355, height: 156 })
                      setCropPosition({ 
                        x: Math.max(0, (img.offsetWidth - 355) / 2), 
                        y: Math.max(0, (img.offsetHeight - 156) / 2) 
                      })
                    } else {
                      setCropSize({ width: 156, height: 156 })
                      setCropPosition({ 
                        x: Math.max(0, (img.offsetWidth - 156) / 2), 
                        y: Math.max(0, (img.offsetHeight - 156) / 2) 
                      })
                    }
                  }}
                />
                
                {/* Overlay escuro nas áreas fora do recorte */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Área superior */}
                  <div 
                    className="absolute bg-black bg-opacity-60"
                    style={{
                      top: 0,
                      left: 0,
                      right: 0,
                      height: `${cropPosition.y}px`
                    }}
                  />
                  {/* Área inferior */}
                  <div 
                    className="absolute bg-black bg-opacity-60"
                    style={{
                      top: `${cropPosition.y + cropSize.height}px`,
                      left: 0,
                      right: 0,
                      bottom: 0
                    }}
                  />
                  {/* Área esquerda */}
                  <div 
                    className="absolute bg-black bg-opacity-60"
                    style={{
                      top: `${cropPosition.y}px`,
                      left: 0,
                      width: `${cropPosition.x}px`,
                      height: `${cropSize.height}px`
                    }}
                  />
                  {/* Área direita */}
                  <div 
                    className="absolute bg-black bg-opacity-60"
                    style={{
                      top: `${cropPosition.y}px`,
                      left: `${cropPosition.x + cropSize.width}px`,
                      right: 0,
                      height: `${cropSize.height}px`
                    }}
                  />
                </div>

                {/* Quadrado de crop móvel */}
                <div 
                  className="absolute border-2 border-purple-500 bg-purple-500 bg-opacity-10 cursor-move"
                  style={{ 
                    width: `${cropSize.width}px`, 
                    height: `${cropSize.height}px`,
                    left: `${cropPosition.x}px`,
                    top: `${cropPosition.y}px`,
                    userSelect: 'none'
                  }}
                  onMouseDown={handleMouseDown}
                >
                  {/* Linhas de grade */}
                  <div className="w-full h-full relative">
                    {/* Linha vertical 1/3 */}
                    <div 
                      className="absolute bg-white bg-opacity-50"
                      style={{ 
                        left: '33.33%', 
                        top: '0', 
                        width: '1px', 
                        height: '100%' 
                      }}
                    />
                    {/* Linha vertical 2/3 */}
                    <div 
                      className="absolute bg-white bg-opacity-50"
                      style={{ 
                        left: '66.66%', 
                        top: '0', 
                        width: '1px', 
                        height: '100%' 
                      }}
                    />
                    {/* Linha horizontal 1/3 */}
                    <div 
                      className="absolute bg-white bg-opacity-50"
                      style={{ 
                        top: '33.33%', 
                        left: '0', 
                        height: '1px', 
                        width: '100%' 
                      }}
                    />
                    {/* Linha horizontal 2/3 */}
                    <div 
                      className="absolute bg-white bg-opacity-50"
                      style={{ 
                        top: '66.66%', 
                        left: '0', 
                        height: '1px', 
                        width: '100%' 
                      }}
                    />
                  </div>
                  
                  {/* Controles de redimensionamento nos cantos */}
                  <div 
                    className="absolute -top-1 -left-1 w-3 h-3 bg-purple-500 border border-white cursor-nw-resize"
                    onMouseDown={(e) => handleResizeStart(e, 'topleft')}
                  ></div>
                  <div 
                    className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 border border-white cursor-ne-resize"
                    onMouseDown={(e) => handleResizeStart(e, 'topright')}
                  ></div>
                  <div 
                    className="absolute -bottom-1 -left-1 w-3 h-3 bg-purple-500 border border-white cursor-sw-resize"
                    onMouseDown={(e) => handleResizeStart(e, 'bottomleft')}
                  ></div>
                  <div 
                    className="absolute -bottom-1 -right-1 w-3 h-3 bg-purple-500 border border-white cursor-se-resize"
                    onMouseDown={(e) => handleResizeStart(e, 'bottomright')}
                  ></div>
                </div>
              </div>

              {/* Informações sobre o tamanho recomendado */}
              <div className="text-sm text-gray-600 text-center mb-4">
                {uploadingForBanner ? (
                  <>
                    <p className="font-medium text-gray-700 mb-1">📏 Tamanho ideal: 355×156 pixels</p>
                    <p className="text-xs text-gray-500">📁 Formatos: JPG, PNG • 🎯 Proporção: 2.28:1</p>
                    <p className="text-xs text-gray-500 mt-1">💡 Dica: Use imagens de alta qualidade para melhor resultado</p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-gray-700 mb-1">📏 Tamanho ideal: 156×156 pixels</p>
                    <p className="text-xs text-gray-500">📁 Formatos: JPG, PNG • 🎯 Proporção: 1:1 (quadrado)</p>
                    <p className="text-xs text-gray-500 mt-1">💡 Dica: Use imagens de alta qualidade para melhor resultado</p>
                  </>
                )}
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCropCancel}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCropConfirm}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                style={{ backgroundColor: '#542583' }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nova Bandeira */}
      {showNovaBandeiraModal && (
        <div 
          className="modal-overlay fixed inset-0 flex items-center justify-center z-50"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            transition: 'all 0.3s ease-out'
          }}
        >
          <div 
            className="modal-container bg-white relative"
            style={{ 
              width: '400px',
              minHeight: '311px',
              padding: '24px',
              borderRadius: '4px',
              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              animation: 'modalEnter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            {/* Botão de fechar modal - padrão documentado */}
            <button
              className="modal-close-button absolute"
              onClick={handleFecharModalNovaBandeira}
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
              onMouseEnter={(e) => getEventTarget(e).style.color = '#6b7280'}
              onMouseLeave={(e) => getEventTarget(e).style.color = '#9ca3af'}
            >
              ×
            </button>

            {/* Título do modal */}
            <h3 style={{ 
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#374151',
              marginBottom: '24px',
              marginTop: '8px'
            }}>
              Nova Bandeira
            </h3>

            {/* Campo nome da bandeira */}
            <div style={{ marginBottom: '24px' }}>
              <label 
                className="input-label"
                style={{ 
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}
              >
                Nome da bandeira
              </label>
              <input
                className="input-field"
                type="text"
                value={nomeBandeira}
                onChange={(e) => setNomeBandeira(e.target.value)}
                placeholder="Ex: Dinners, Sorocred, Banricompras..."
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '16px',
                  background: 'white',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  getEventTarget(e).style.outline = 'none'
                  getEventTarget(e).style.borderColor = 'transparent'
                  getEventTarget(e).style.boxShadow = '0 0 0 2px #542583'
                }}
                onBlur={(e) => {
                  getEventTarget(e).style.borderColor = '#d1d5db'
                  getEventTarget(e).style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Tipos de pagamento */}
            <div style={{ marginBottom: '24px' }}>
              <label 
                className="input-label"
                style={{ 
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '12px'
                }}
              >
                Tipos de pagamento aceitos
              </label>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div 
                    className="custom-checkbox"
                    onClick={() => setTiposBandeira(prev => ({ ...prev, credito: !prev.credito }))}
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #d1d5db',
                      borderRadius: '3px',
                      backgroundColor: tiposBandeira.credito ? '#542583' : 'white',
                      borderColor: tiposBandeira.credito ? '#542583' : '#d1d5db',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease-in-out',
                      cursor: 'pointer'
                    }}
                  >
                    {tiposBandeira.credito && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Crédito</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <div 
                    className="custom-checkbox"
                    onClick={() => setTiposBandeira(prev => ({ ...prev, debito: !prev.debito }))}
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #d1d5db',
                      borderRadius: '3px',
                      backgroundColor: tiposBandeira.debito ? '#542583' : 'white',
                      borderColor: tiposBandeira.debito ? '#542583' : '#d1d5db',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease-in-out',
                      cursor: 'pointer'
                    }}
                  >
                    {tiposBandeira.debito && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Débito</span>
                </label>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex justify-end gap-3">
              <button
                className="btn-secondary"
                onClick={handleFecharModalNovaBandeira}
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
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
              >
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={handleAdicionarBandeira}
                disabled={!nomeBandeira.trim() || (!tiposBandeira.credito && !tiposBandeira.debito)}
                style={{
                  backgroundColor: (!nomeBandeira.trim() || (!tiposBandeira.credito && !tiposBandeira.debito)) ? '#d1d5db' : '#542583',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  height: '40px',
                  cursor: (!nomeBandeira.trim() || (!tiposBandeira.credito && !tiposBandeira.debito)) ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                  opacity: (!nomeBandeira.trim() || (!tiposBandeira.credito && !tiposBandeira.debito)) ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!(e.target as HTMLButtonElement).disabled) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#7209bd'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(e.target as HTMLButtonElement).disabled) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#542583'
                  }
                }}
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Novo Motoboy */}
      {showNovoMotoboyModal && (
        <div 
          className="modal-overlay fixed inset-0 flex items-center justify-center z-50"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            transition: 'all 0.3s ease-out'
          }}
        >
          <div 
            className="modal-container bg-white relative"
            style={{ 
              width: '400px',
              minHeight: '400px',
              padding: '24px',
              borderRadius: '4px',
              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              animation: 'modalEnter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            {/* Botão de fechar modal */}
            <button
              className="modal-close-button absolute"
              onClick={handleFecharModalNovoMotoboy}
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
              onMouseEnter={(e) => getEventTarget(e).style.color = '#6b7280'}
              onMouseLeave={(e) => getEventTarget(e).style.color = '#9ca3af'}
            >
              ×
            </button>

            {/* Título do modal */}
            <h3 style={{ 
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#374151',
              marginBottom: '24px',
              marginTop: '8px'
            }}>
              {editandoMotoboy ? 'Editar motoboy' : 'Cadastrar novo motoboy'}
            </h3>

            {/* Campo Nome do motoboy */}
            <div style={{ marginBottom: '24px' }}>
              <label 
                className="input-label"
                style={{ 
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}
              >
                Nome do motoboy
              </label>
              <input
                className="input-field"
                type="text"
                value={nomeMotoboy}
                onChange={(e) => setNomeMotoboy(e.target.value)}
                placeholder="Digite o nome completo"
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '16px',
                  background: 'white',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  getEventTarget(e).style.outline = 'none'
                  getEventTarget(e).style.borderColor = 'transparent'
                  getEventTarget(e).style.boxShadow = '0 0 0 2px #542583'
                }}
                onBlur={(e) => {
                  getEventTarget(e).style.borderColor = '#d1d5db'
                  getEventTarget(e).style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Campo WhatsApp do motoboy */}
            <div style={{ marginBottom: '24px' }}>
              <label 
                className="input-label"
                style={{ 
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}
              >
                WhatsApp do motoboy
              </label>
              <input
                className="input-field"
                type="text"
                value={whatsappMotoboy}
                onChange={(e) => {
                  const valorMascarado = aplicarMascaraWhatsApp(e.target.value)
                  setWhatsappMotoboy(valorMascarado)
                }}
                placeholder="(00) 00000-0000"
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '16px',
                  background: 'white',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  getEventTarget(e).style.outline = 'none'
                  getEventTarget(e).style.borderColor = 'transparent'
                  getEventTarget(e).style.boxShadow = '0 0 0 2px #542583'
                }}
                onBlur={(e) => {
                  getEventTarget(e).style.borderColor = '#d1d5db'
                  getEventTarget(e).style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Toggle Ativo/Inativo */}
            <div style={{ marginBottom: '32px' }}>
              <label 
                className="input-label"
                style={{ 
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '12px'
                }}
              >
                Status do motoboy
              </label>
              
              <div className="flex items-center gap-3">
                <div 
                  className={`toggle-switch cursor-pointer ${motoboyAtivo ? 'active' : 'inactive'}`}
                  onClick={() => setMotoboyAtivo(!motoboyAtivo)}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    backgroundColor: motoboyAtivo ? '#542583' : '#d1d5db',
                    position: 'relative',
                    transition: 'all 0.3s ease-in-out'
                  }}
                >
                  <div 
                    className="toggle-handle"
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      position: 'absolute',
                      top: '4px',
                      transform: motoboyAtivo ? 'translateX(24px)' : 'translateX(4px)',
                      transition: 'all 0.3s ease-in-out'
                    }}
                  ></div>
                </div>
                <span style={{ fontSize: '14px', color: '#374151' }}>
                  {motoboyAtivo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex justify-end gap-3">
              <button
                className="btn-secondary"
                onClick={handleFecharModalNovoMotoboy}
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
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
              >
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={handleCadastrarMotoboy}
                disabled={!nomeMotoboy.trim() || !whatsappMotoboy.trim()}
                style={{
                  backgroundColor: (!nomeMotoboy.trim() || !whatsappMotoboy.trim()) ? '#d1d5db' : '#542583',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  height: '40px',
                  cursor: (!nomeMotoboy.trim() || !whatsappMotoboy.trim()) ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                  opacity: (!nomeMotoboy.trim() || !whatsappMotoboy.trim()) ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!(e.target as HTMLButtonElement).disabled) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#7209bd'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(e.target as HTMLButtonElement).disabled) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#542583'
                  }
                }}
              >
                {editandoMotoboy ? 'Salvar alterações' : 'Cadastrar motoboy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualizar Motoboy */}
      {showVisualizarMotoboyModal && motoboyVisualizando && (
        <div 
          className="modal-overlay fixed inset-0 flex items-center justify-center z-50"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            transition: 'all 0.3s ease-out'
          }}
        >
          <div 
            className="modal-container bg-white relative"
            style={{ 
              width: '600px',
              minHeight: '200px',
              padding: '24px',
              borderRadius: '4px',
              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              animation: 'modalEnter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            {/* Botão de fechar modal */}
            <button
              className="modal-close-button absolute"
              onClick={handleFecharModalVisualizarMotoboy}
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
              onMouseEnter={(e) => getEventTarget(e).style.color = '#6b7280'}
              onMouseLeave={(e) => getEventTarget(e).style.color = '#9ca3af'}
            >
              ×
            </button>

            {/* Título do modal */}
            <h3 style={{ 
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#374151',
              marginBottom: '24px',
              marginTop: '8px'
            }}>
              Detalhes do Motoboy
            </h3>

            {/* Conteúdo do modal */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
              {/* Nome */}
              <div>
                <span style={{ 
                  fontSize: '14px',
                  fontWeight: '400',
                  color: '#374151'
                }}>
                  Nome: 
                </span>
                <span style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  fontWeight: '400'
                }}>
                  {motoboyVisualizando.nome}
                </span>
              </div>

              {/* WhatsApp */}
              <div>
                <span style={{ 
                  fontSize: '14px',
                  fontWeight: '400',
                  color: '#374151'
                }}>
                  Telefone: 
                </span>
                <span style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  fontWeight: '400'
                }}>
                  {motoboyVisualizando.whatsapp}
                </span>
              </div>

              {/* Status */}
              <div>
                <span style={{ 
                  fontSize: '14px',
                  fontWeight: '400',
                  color: '#374151'
                }}>
                  Status: 
                </span>
                <span style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  fontWeight: '400'
                }}>
                  {motoboyVisualizando.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              {/* Linha divisória */}
              <div style={{
                width: '100%',
                height: '1px',
                backgroundColor: '#e5e7eb',
                margin: '8px 0'
              }}></div>

              {/* Título Histórico de Entregas */}
              <div style={{ marginBottom: '12px' }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#374151',
                  margin: '0'
                }}>
                  Histórico de Entregas
                </h4>
              </div>

              {/* Cabeçalho da tabela */}
              <div style={{
                width: '100%',
                height: '40px',
                backgroundColor: '#e5e7eb',
                borderRadius: '4px 4px 0 0',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                {/* Pedido */}
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#6b7280'
                  }}>
                    Pedido
                  </div>
                </div>

                {/* Cliente */}
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#6b7280'
                  }}>
                    Cliente
                  </div>
                </div>

                {/* Pagamento */}
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#6b7280'
                  }}>
                    Pagamento
                  </div>
                </div>

                {/* Status */}
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#6b7280'
                  }}>
                    Status
                  </div>
                </div>
              </div>

              {/* Dados dos pedidos */}
              <div style={{
                width: '100%',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderTop: 'none',
                borderRadius: '0 0 4px 4px',
                maxHeight: '200px',
                overflowY: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px',
                color: '#9ca3af',
                fontSize: '14px'
              }}>
                Nenhum pedido encontrado para este motoboy
              </div>
            </div>

            {/* Botões de ação */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              marginTop: '32px'
            }}>
              <button
                onClick={handleFecharModalVisualizarMotoboy}
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
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão de Motoboy */}
      {showConfirmarExclusaoMotoboyModal && motoboyParaExcluir && (
        <div 
          className="modal-overlay fixed inset-0 flex items-center justify-center z-50"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            transition: 'all 0.3s ease-out'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCancelarExclusaoMotoboy()
            }
          }}
        >
          <div 
            className="modal-container bg-white relative"
            style={{ 
              width: '400px',
              minHeight: '200px',
              padding: '24px',
              borderRadius: '4px',
              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              animation: 'modalEnter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Título */}
            <h3 style={{ 
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#374151',
              textAlign: 'left',
              marginBottom: '16px'
            }}>
              Excluir motoboy
            </h3>

            {/* Mensagem */}
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              textAlign: 'left',
              marginBottom: '0px',
              lineHeight: '1.5',
              flex: '1'
            }}>
              Deseja realmente excluir o motoboy {motoboyParaExcluir.nome}?
            </p>

            {/* Botões */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: 'auto',
              paddingTop: '24px'
            }}>
              <button
                onClick={handleCancelarExclusaoMotoboy}
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
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarExclusaoMotoboy}
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  height: '40px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#b91c1c'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#dc2626'}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Novo Usuário */}
      {showNovoUsuarioModal && (
        <div 
          className="modal-overlay fixed inset-0 flex items-center justify-center z-50"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            transition: 'all 0.3s ease-out'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleFecharModalNovoUsuario()
            }
          }}
        >
                     <div 
             className="modal-container bg-white relative"
             style={{ 
               width: '500px',
               minHeight: '680px',
               padding: '24px',
               borderRadius: '4px',
               transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
               animation: 'modalEnter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
             }}
           >
            {/* Botão de fechar modal */}
            <button
              className="modal-close-button absolute"
              onClick={handleFecharModalNovoUsuario}
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
              onMouseEnter={(e) => getEventTarget(e).style.color = '#6b7280'}
              onMouseLeave={(e) => getEventTarget(e).style.color = '#9ca3af'}
            >
              ×
            </button>

            {/* Título do modal */}
            <h3 style={{ 
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#374151',
              marginBottom: '24px',
              marginTop: '8px'
            }}>
              Novo Usuário
            </h3>

            {/* Formulário */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Campo Nome Completo */}
              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  placeholder="Digite o nome completo"
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px',
                    background: 'white',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    getEventTarget(e).style.outline = 'none'
                    getEventTarget(e).style.borderColor = 'transparent'
                    getEventTarget(e).style.boxShadow = '0 0 0 2px #542583'
                  }}
                  onBlur={(e) => {
                    getEventTarget(e).style.borderColor = '#d1d5db'
                    getEventTarget(e).style.boxShadow = 'none'
                  }}
                />
              </div>

              {/* Campo Função */}
              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Função
                </label>
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setDropdownFuncaoAberto(!dropdownFuncaoAberto)}
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
                      fontSize: '16px',
                      color: '#374151',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      getEventTarget(e).style.outline = 'none'
                      getEventTarget(e).style.borderColor = 'transparent'
                      getEventTarget(e).style.boxShadow = '0 0 0 2px #542583'
                    }}
                    onBlur={(e) => {
                      getEventTarget(e).style.borderColor = '#d1d5db'
                      getEventTarget(e).style.boxShadow = 'none'
                    }}
                  >
                    <span>
                      {funcaoUsuario === 'operador' && 'Operador'}
                      {funcaoUsuario === 'gerente' && 'Gerente'}
                      {funcaoUsuario === 'dono' && 'Dono'}
                    </span>
                    <svg 
                      style={{ 
                        width: '20px', 
                        height: '20px',
                        transform: dropdownFuncaoAberto ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s'
                      }} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown menu */}
                  {dropdownFuncaoAberto && (
                    <div style={{
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
                      overflow: 'hidden'
                    }}>
                      {['operador', 'gerente', 'dono'].map((funcao) => (
                        <div 
                          key={funcao}
                          onClick={() => {
                            setFuncaoUsuario(funcao)
                            setDropdownFuncaoAberto(false)
                          }}
                          style={{ 
                            padding: '12px 16px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s',
                            backgroundColor: funcaoUsuario === funcao ? '#f3e8ff' : 'transparent',
                            color: funcaoUsuario === funcao ? '#542583' : '#374151'
                          }}
                          onMouseEnter={(e) => {
                            if (funcaoUsuario !== funcao) {
                              (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (funcaoUsuario !== funcao) {
                              (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
                            }
                          }}
                        >
                          {funcao === 'operador' && 'Operador'}
                          {funcao === 'gerente' && 'Gerente'}
                          {funcao === 'dono' && 'Dono'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

                             {/* Campo Email */}
               <div>
                 <label style={{ 
                   display: 'block',
                   fontSize: '16px',
                   fontWeight: '500',
                   color: '#374151',
                   marginBottom: '8px'
                 }}>
                   Email
                 </label>
                 <input
                   type="email"
                   value={emailUsuario}
                   onChange={(e) => setEmailUsuario(e.target.value)}
                   placeholder="exemplo@email.com"
                   style={{
                     width: '100%',
                     height: '40px',
                     padding: '0 12px',
                     border: '1px solid #d1d5db',
                     borderRadius: '6px',
                     fontSize: '16px',
                     background: 'white',
                     transition: 'all 0.2s'
                   }}
                   onFocus={(e) => {
                     getEventTarget(e).style.outline = 'none'
                     getEventTarget(e).style.borderColor = 'transparent'
                     getEventTarget(e).style.boxShadow = '0 0 0 2px #542583'
                   }}
                   onBlur={(e) => {
                     getEventTarget(e).style.borderColor = '#d1d5db'
                     getEventTarget(e).style.boxShadow = 'none'
                   }}
                 />
               </div>

               {/* Campo CPF */}
               <div>
                 <label style={{ 
                   display: 'block',
                   fontSize: '16px',
                   fontWeight: '500',
                   color: '#374151',
                   marginBottom: '8px'
                 }}>
                   CPF
                 </label>
                 <input
                   type="text"
                   value={cpfUsuario}
                   onChange={(e) => {
                     const valorMascarado = aplicarMascaraCpfUsuario(e.target.value)
                     setCpfUsuario(valorMascarado)
                   }}
                   placeholder="000.000.000-00"
                   style={{
                     width: '100%',
                     height: '40px',
                     padding: '0 12px',
                     border: `1px solid ${cpfUsuario && !validarCpf(cpfUsuario) ? '#ef4444' : '#d1d5db'}`,
                     borderRadius: '6px',
                     fontSize: '16px',
                     background: 'white',
                     transition: 'all 0.2s'
                   }}
                   onFocus={(e) => {
                     getEventTarget(e).style.outline = 'none'
                     getEventTarget(e).style.borderColor = 'transparent'
                     getEventTarget(e).style.boxShadow = '0 0 0 2px #542583'
                   }}
                   onBlur={(e) => {
                     getEventTarget(e).style.borderColor = cpfUsuario && !validarCpf(cpfUsuario) ? '#ef4444' : '#d1d5db'
                     getEventTarget(e).style.boxShadow = 'none'
                   }}
                 />
                 {cpfUsuario && !validarCpf(cpfUsuario) && (
                   <p style={{
                     fontSize: '14px',
                     color: '#ef4444',
                     marginTop: '4px',
                     marginBottom: '0'
                   }}>
                     CPF inválido
                   </p>
                 )}
               </div>

              {/* Campo WhatsApp */}
              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  WhatsApp
                </label>
                <input
                  type="text"
                  value={whatsappUsuario}
                  onChange={(e) => {
                    const valorMascarado = aplicarMascaraWhatsAppUsuario(e.target.value)
                    setWhatsappUsuario(valorMascarado)
                  }}
                  placeholder="(11) 99999-9999"
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px',
                    background: 'white',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    getEventTarget(e).style.outline = 'none'
                    getEventTarget(e).style.borderColor = 'transparent'
                    getEventTarget(e).style.boxShadow = '0 0 0 2px #542583'
                  }}
                  onBlur={(e) => {
                    getEventTarget(e).style.borderColor = '#d1d5db'
                    getEventTarget(e).style.boxShadow = 'none'
                  }}
                />
              </div>

                             {/* Campo Senha */}
               <div>
                 <label style={{ 
                   display: 'block',
                   fontSize: '16px',
                   fontWeight: '500',
                   color: '#374151',
                   marginBottom: '8px'
                 }}>
                   Senha
                 </label>
                 <div style={{ position: 'relative' }}>
                   <input
                     type={mostrarSenha ? "text" : "password"}
                     value={senhaUsuario}
                     onChange={(e) => setSenhaUsuario(e.target.value)}
                     placeholder="Digite uma senha segura (mín. 6 dígitos)"
                     style={{
                       width: '100%',
                       height: '40px',
                       padding: '0 12px 0 12px',
                       paddingRight: '40px',
                       border: `1px solid ${senhaUsuario && senhaUsuario.length < 6 ? '#ef4444' : '#d1d5db'}`,
                       borderRadius: '6px',
                       fontSize: '16px',
                       background: 'white',
                       transition: 'all 0.2s'
                     }}
                     onFocus={(e) => {
                       getEventTarget(e).style.outline = 'none'
                       getEventTarget(e).style.borderColor = 'transparent'
                       getEventTarget(e).style.boxShadow = '0 0 0 2px #542583'
                     }}
                     onBlur={(e) => {
                       getEventTarget(e).style.borderColor = senhaUsuario && senhaUsuario.length < 6 ? '#ef4444' : '#d1d5db'
                       getEventTarget(e).style.boxShadow = 'none'
                     }}
                   />
                   <button
                     type="button"
                     onClick={() => setMostrarSenha(!mostrarSenha)}
                     style={{
                       position: 'absolute',
                       right: '8px',
                       top: '50%',
                       transform: 'translateY(-50%)',
                       background: 'none',
                       border: 'none',
                       cursor: 'pointer',
                       padding: '4px',
                       color: '#9ca3af',
                       transition: 'color 0.2s'
                     }}
                     onMouseEnter={(e) => getEventTarget(e).style.color = '#6b7280'}
                     onMouseLeave={(e) => getEventTarget(e).style.color = '#9ca3af'}
                   >
                     {mostrarSenha ? (
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                         <path d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z"></path>
                       </svg>
                     ) : (
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                         <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"></path>
                       </svg>
                     )}
                   </button>
                 </div>
                 {senhaUsuario && senhaUsuario.length < 6 && (
                   <p style={{
                     fontSize: '14px',
                     color: '#ef4444',
                     marginTop: '4px',
                     marginBottom: '0'
                   }}>
                     A senha deve ter no mínimo 6 dígitos
                   </p>
                 )}
               </div>


            </div>

            {/* Botões de ação */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '12px',
              marginTop: '32px'
            }}>
              <button
                onClick={handleFecharModalNovoUsuario}
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
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
              >
                Cancelar
              </button>
                             <button
                 onClick={handleCadastrarUsuario}
                 disabled={!nomeCompleto.trim() || !emailUsuario.trim() || !cpfUsuario.trim() || !validarCpf(cpfUsuario) || !whatsappUsuario.trim() || !senhaUsuario.trim() || senhaUsuario.length < 6}
                 style={{
                   backgroundColor: (!nomeCompleto.trim() || !emailUsuario.trim() || !cpfUsuario.trim() || !validarCpf(cpfUsuario) || !whatsappUsuario.trim() || !senhaUsuario.trim() || senhaUsuario.length < 6) ? '#d1d5db' : '#542583',
                   color: 'white',
                   border: 'none',
                   padding: '8px 16px',
                   borderRadius: '6px',
                   fontSize: '14px',
                   fontWeight: '500',
                   height: '40px',
                   cursor: (!nomeCompleto.trim() || !emailUsuario.trim() || !cpfUsuario.trim() || !validarCpf(cpfUsuario) || !whatsappUsuario.trim() || !senhaUsuario.trim() || senhaUsuario.length < 6) ? 'not-allowed' : 'pointer',
                   transition: 'background-color 0.2s',
                   opacity: (!nomeCompleto.trim() || !emailUsuario.trim() || !cpfUsuario.trim() || !validarCpf(cpfUsuario) || !whatsappUsuario.trim() || !senhaUsuario.trim() || senhaUsuario.length < 6) ? 0.6 : 1
                 }}
                onMouseEnter={(e) => {
                  const target = getEventTargetWithDisabled(e)
                  if (!target.disabled) {
                    target.style.backgroundColor = '#7209bd'
                  }
                }}
                onMouseLeave={(e) => {
                  const target = getEventTargetWithDisabled(e)
                  if (!target.disabled) {
                    target.style.backgroundColor = '#542583'
                  }
                }}
              >
                Cadastrar usuário
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualizar Usuário */}
      {showVisualizarUsuarioModal && usuarioVisualizando && (
        <div 
          className="modal-overlay fixed inset-0 flex items-center justify-center z-50"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            transition: 'all 0.3s ease-out'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleFecharModalVisualizarUsuario()
            }
          }}
        >
          <div 
            className="modal-container bg-white relative"
            style={{ 
              width: '600px',
              minHeight: '200px',
              padding: '24px',
              borderRadius: '4px',
              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              animation: 'modalEnter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            {/* Botão de fechar modal */}
            <button
              className="modal-close-button absolute"
              onClick={handleFecharModalVisualizarUsuario}
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
              onMouseEnter={(e) => getEventTarget(e).style.color = '#6b7280'}
              onMouseLeave={(e) => getEventTarget(e).style.color = '#9ca3af'}
            >
              ×
            </button>

            {/* Título do modal */}
            <h3 style={{ 
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#374151',
              marginBottom: '24px',
              marginTop: '8px'
            }}>
              Detalhes do Usuário
            </h3>

            {/* Informações do usuário */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
              <div>
                <span style={{ fontSize: '14px', fontWeight: '400', color: '#374151' }}>Nome: </span>
                <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '400' }}>{usuarioVisualizando.name}</span>
              </div>
              <div>
                <span style={{ fontSize: '14px', fontWeight: '400', color: '#374151' }}>Email: </span>
                <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '400' }}>{usuarioVisualizando.email}</span>
              </div>
              <div>
                <span style={{ fontSize: '14px', fontWeight: '400', color: '#374151' }}>CPF: </span>
                <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '400' }}>{usuarioVisualizando.cpf}</span>
              </div>
              <div>
                <span style={{ fontSize: '14px', fontWeight: '400', color: '#374151' }}>WhatsApp: </span>
                <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '400' }}>{usuarioVisualizando.whatsapp}</span>
              </div>
              <div>
                <span style={{ fontSize: '14px', fontWeight: '400', color: '#374151' }}>Função: </span>
                <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '400' }}>
                  {usuarioVisualizando.role === 'operador' && 'Operador'}
                  {usuarioVisualizando.role === 'gerente' && 'Gerente'}
                  {usuarioVisualizando.role === 'dono' && 'Dono'}
                </span>
              </div>


            </div>

            {/* Botão de fechar */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              marginTop: '32px' 
            }}>
              <button
                onClick={handleFecharModalVisualizarUsuario}
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
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Editar Usuário */}
      {showEditarUsuarioModal && usuarioEditando && (
        <div 
          className="modal-overlay fixed inset-0 flex items-center justify-center z-50"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            transition: 'all 0.3s ease-out'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleFecharModalEditarUsuario()
            }
          }}
        >
          <div 
            className="modal-container bg-white relative"
            style={{ 
              width: '500px',
              minHeight: '600px',
              padding: '24px',
              borderRadius: '4px',
              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              animation: 'modalEnter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            {/* Botão de fechar modal */}
            <button
              className="modal-close-button absolute"
              onClick={handleFecharModalEditarUsuario}
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
              onMouseEnter={(e) => getEventTarget(e).style.color = '#6b7280'}
              onMouseLeave={(e) => getEventTarget(e).style.color = '#9ca3af'}
            >
              ×
            </button>

            {/* Título do modal */}
            <h3 style={{ 
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#374151',
              marginBottom: '24px',
              marginTop: '8px'
            }}>
              Editar Usuário
            </h3>

            {/* Formulário */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Campo Nome Completo */}
              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={nomeCompletoEdit}
                  onChange={(e) => setNomeCompletoEdit(e.target.value)}
                  placeholder="Digite o nome completo"
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px',
                    background: 'white',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    getEventTarget(e).style.outline = 'none'
                    getEventTarget(e).style.borderColor = 'transparent'
                    getEventTarget(e).style.boxShadow = '0 0 0 2px #542583'
                  }}
                  onBlur={(e) => {
                    getEventTarget(e).style.borderColor = '#d1d5db'
                    getEventTarget(e).style.boxShadow = 'none'
                  }}
                />
              </div>

              {/* Campo Função */}
              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Função
                </label>
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setDropdownFuncaoEditAberto(!dropdownFuncaoEditAberto)}
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
                      fontSize: '16px',
                      color: '#374151',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      getEventTarget(e).style.outline = 'none'
                      getEventTarget(e).style.borderColor = 'transparent'
                      getEventTarget(e).style.boxShadow = '0 0 0 2px #542583'
                    }}
                    onBlur={(e) => {
                      getEventTarget(e).style.borderColor = '#d1d5db'
                      getEventTarget(e).style.boxShadow = 'none'
                    }}
                  >
                    <span>
                      {funcaoUsuarioEdit === 'operador' && 'Operador'}
                      {funcaoUsuarioEdit === 'gerente' && 'Gerente'}
                      {funcaoUsuarioEdit === 'dono' && 'Dono'}
                    </span>
                    <svg 
                      style={{ 
                        width: '20px', 
                        height: '20px',
                        transform: dropdownFuncaoEditAberto ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s'
                      }} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown menu */}
                  {dropdownFuncaoEditAberto && (
                    <div style={{
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
                      overflow: 'hidden'
                    }}>
                      {['operador', 'gerente', 'dono'].map((funcao) => (
                        <div 
                          key={funcao}
                          onClick={() => {
                            setFuncaoUsuarioEdit(funcao)
                            setDropdownFuncaoEditAberto(false)
                          }}
                          style={{ 
                            padding: '12px 16px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s',
                            backgroundColor: funcaoUsuarioEdit === funcao ? '#f3e8ff' : 'transparent',
                            color: funcaoUsuarioEdit === funcao ? '#542583' : '#374151'
                          }}
                          onMouseEnter={(e) => {
                            if (funcaoUsuarioEdit !== funcao) {
                              (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (funcaoUsuarioEdit !== funcao) {
                              (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
                            }
                          }}
                        >
                          {funcao === 'operador' && 'Operador'}
                          {funcao === 'gerente' && 'Gerente'}
                          {funcao === 'dono' && 'Dono'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Campo Email (somente leitura) */}
              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Email <span style={{ fontSize: '14px', color: '#6b7280' }}>(não pode ser alterado)</span>
                </label>
                <input
                  type="email"
                  value={emailUsuarioEdit}
                  readOnly
                  disabled
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px',
                    background: '#f9fafb',
                    color: '#6b7280',
                    cursor: 'not-allowed'
                  }}
                />
              </div>

                             {/* Campo CPF */}
               <div>
                 <label style={{ 
                   display: 'block',
                   fontSize: '16px',
                   fontWeight: '500',
                   color: '#374151',
                   marginBottom: '8px'
                 }}>
                   CPF
                 </label>
                 <input
                   type="text"
                   value={cpfUsuarioEdit}
                   onChange={(e) => {
                     const valorMascarado = aplicarMascaraCpfUsuario(e.target.value)
                     setCpfUsuarioEdit(valorMascarado)
                   }}
                   placeholder="000.000.000-00"
                   style={{
                     width: '100%',
                     height: '40px',
                     padding: '0 12px',
                     border: `1px solid ${cpfUsuarioEdit && !validarCpf(cpfUsuarioEdit) ? '#ef4444' : '#d1d5db'}`,
                     borderRadius: '6px',
                     fontSize: '16px',
                     background: 'white',
                     transition: 'all 0.2s'
                   }}
                   onFocus={(e) => {
                     getEventTarget(e).style.outline = 'none'
                     getEventTarget(e).style.borderColor = 'transparent'
                     getEventTarget(e).style.boxShadow = '0 0 0 2px #542583'
                   }}
                   onBlur={(e) => {
                     getEventTarget(e).style.borderColor = cpfUsuarioEdit && !validarCpf(cpfUsuarioEdit) ? '#ef4444' : '#d1d5db'
                     getEventTarget(e).style.boxShadow = 'none'
                   }}
                 />
                 {cpfUsuarioEdit && !validarCpf(cpfUsuarioEdit) && (
                   <p style={{
                     fontSize: '14px',
                     color: '#ef4444',
                     marginTop: '4px',
                     marginBottom: '0'
                   }}>
                     CPF inválido
                   </p>
                 )}
               </div>

              {/* Campo WhatsApp */}
              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  WhatsApp
                </label>
                <input
                  type="text"
                  value={whatsappUsuarioEdit}
                  onChange={(e) => {
                    const valorMascarado = aplicarMascaraWhatsAppUsuario(e.target.value)
                    setWhatsappUsuarioEdit(valorMascarado)
                  }}
                  placeholder="(11) 99999-9999"
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px',
                    background: 'white',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    getEventTarget(e).style.outline = 'none'
                    getEventTarget(e).style.borderColor = 'transparent'
                    getEventTarget(e).style.boxShadow = '0 0 0 2px #542583'
                  }}
                  onBlur={(e) => {
                    getEventTarget(e).style.borderColor = '#d1d5db'
                    getEventTarget(e).style.boxShadow = 'none'
                  }}
                />
              </div>
            </div>

            {/* Botões de ação */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '12px',
              marginTop: '32px'
            }}>
              <button
                onClick={handleFecharModalEditarUsuario}
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
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
              >
                Cancelar
              </button>
                             <button
                 onClick={handleSalvarEdicaoUsuario}
                 disabled={!nomeCompletoEdit.trim() || !cpfUsuarioEdit.trim() || !validarCpf(cpfUsuarioEdit) || !whatsappUsuarioEdit.trim()}
                 style={{
                   backgroundColor: (!nomeCompletoEdit.trim() || !cpfUsuarioEdit.trim() || !validarCpf(cpfUsuarioEdit) || !whatsappUsuarioEdit.trim()) ? '#d1d5db' : '#542583',
                   color: 'white',
                   border: 'none',
                   padding: '8px 16px',
                   borderRadius: '6px',
                   fontSize: '14px',
                   fontWeight: '500',
                   height: '40px',
                   cursor: (!nomeCompletoEdit.trim() || !cpfUsuarioEdit.trim() || !validarCpf(cpfUsuarioEdit) || !whatsappUsuarioEdit.trim()) ? 'not-allowed' : 'pointer',
                   transition: 'background-color 0.2s',
                   opacity: (!nomeCompletoEdit.trim() || !cpfUsuarioEdit.trim() || !validarCpf(cpfUsuarioEdit) || !whatsappUsuarioEdit.trim()) ? 0.6 : 1
                 }}
                onMouseEnter={(e) => {
                  if (!getEventTargetWithDisabled(e).disabled) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#7209bd'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!getEventTargetWithDisabled(e).disabled) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#542583'
                  }
                }}
              >
                Salvar alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão de Usuário */}
      {showConfirmarExclusaoUsuarioModal && usuarioParaExcluir && (
        <div 
          className="modal-overlay fixed inset-0 flex items-center justify-center z-50"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            transition: 'all 0.3s ease-out'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCancelarExclusaoUsuario()
            }
          }}
        >
          <div 
            className="modal-container bg-white relative"
            style={{ 
              width: '400px',
              minHeight: '200px',
              padding: '24px',
              borderRadius: '4px',
              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              animation: 'modalEnter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Título */}
            <h3 style={{ 
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#374151',
              textAlign: 'left',
              marginBottom: '16px'
            }}>
              Excluir usuário
            </h3>

            {/* Mensagem */}
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              textAlign: 'left',
              marginBottom: '0px',
              lineHeight: '1.5',
              flex: '1'
            }}>
              Deseja realmente excluir o usuário {usuarioParaExcluir.name}?
            </p>

            {/* Botões */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: 'auto',
              paddingTop: '24px'
            }}>
              <button
                onClick={handleCancelarExclusaoUsuario}
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
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarExclusaoUsuario}
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  height: '40px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#b91c1c'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#dc2626'}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cadastro de Raio de Entrega */}
      {modalRaioEntregaAberto && (
        <div 
          className="modal-overlay fixed inset-0 flex items-center justify-center z-50"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            transition: 'all 0.3s ease-out'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleFecharModalRaioEntrega()
            }
          }}
        >
          <div 
            className="modal-container bg-white relative"
            style={{ 
              width: '450px',
              maxHeight: '500px',
              minHeight: '380px',
              padding: '24px',
              borderRadius: '4px',
              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              animation: 'modalEnter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              overflowY: 'auto'
            }}
          >
            {/* Botão de fechar modal */}
            <button
              className="modal-close-button absolute"
              onClick={handleFecharModalRaioEntrega}
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
              onMouseEnter={(e) => getEventTarget(e).style.color = '#6b7280'}
              onMouseLeave={(e) => getEventTarget(e).style.color = '#9ca3af'}
            >
              ×
            </button>

            {/* Título do modal */}
            <h3 style={{ 
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#374151',
              marginBottom: '24px',
              marginTop: '8px'
            }}>
              {editandoRaio ? 'Editar Raio de Entrega' : 'Novo Raio de Entrega'}
            </h3>

            {/* Formulário */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Barra de ajuste de distância */}
              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '12px'
                }}>
                  Distância: {distanciaRaio < 1 ? `${distanciaRaio * 1000}m` : `${distanciaRaio} km`}
                </label>
                                 <input
                   type="range"
                   min="0.5"
                   max="50"
                   step="0.5"
                   value={distanciaRaio}
                   onChange={(e) => setDistanciaRaio(parseFloat(e.target.value))}
                   className="range-slider"
                   style={{
                     width: '100%',
                     height: '8px',
                     borderRadius: '4px',
                     outline: 'none',
                     background: `linear-gradient(to right, #542583 0%, #542583 ${(distanciaRaio - 0.5) / 49.5 * 100}%, #e5e7eb ${(distanciaRaio - 0.5) / 49.5 * 100}%, #e5e7eb 100%)`,
                     cursor: 'pointer',
                     appearance: 'none'
                   }}
                 />
                 
                 <style jsx>{`
                   .range-slider::-webkit-slider-thumb {
                     appearance: none;
                     width: 20px;
                     height: 20px;
                     border-radius: 50%;
                     background: #542583;
                     cursor: pointer;
                     border: 2px solid white;
                     box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                   }
                   
                   .range-slider::-moz-range-thumb {
                     width: 20px;
                     height: 20px;
                     border-radius: 50%;
                     background: #542583;
                     cursor: pointer;
                     border: 2px solid white;
                     box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                   }
                 `}</style>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  <span>500m</span>
                  <span>50 km</span>
                </div>
              </div>

              {/* Campo Tempo Máximo */}
              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Tempo máximo de entrega (minutos)
                </label>
                <input
                  type="number"
                  value={tempoMaximo}
                  onChange={(e) => setTempoMaximo(e.target.value)}
                  placeholder="Ex: 45"
                  min="1"
                  max="300"
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px',
                    background: 'white',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    getEventTarget(e).style.outline = 'none'
                    getEventTarget(e).style.borderColor = 'transparent'
                    getEventTarget(e).style.boxShadow = '0 0 0 2px #542583'
                  }}
                  onBlur={(e) => {
                    getEventTarget(e).style.borderColor = '#d1d5db'
                    getEventTarget(e).style.boxShadow = 'none'
                  }}
                />
              </div>

              {/* Campo Preço */}
              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Preço da entrega (R$)
                </label>
                <input
                  type="text"
                  value={precoRaio}
                  onChange={handlePrecoRaioChange}
                  placeholder="0,00"
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px',
                    background: 'white',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    getEventTarget(e).style.outline = 'none'
                    getEventTarget(e).style.borderColor = 'transparent'
                    getEventTarget(e).style.boxShadow = '0 0 0 2px #542583'
                  }}
                  onBlur={(e) => {
                    getEventTarget(e).style.borderColor = '#d1d5db'
                    getEventTarget(e).style.boxShadow = 'none'
                  }}
                />
              </div>
            </div>

            {/* Botões de ação */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '12px',
              marginTop: '32px'
            }}>
              <button
                onClick={handleFecharModalRaioEntrega}
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
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarRaioEntrega}
                disabled={!tempoMaximo.trim() || !precoRaio.trim()}
                style={{
                  backgroundColor: (!tempoMaximo.trim() || !precoRaio.trim()) ? '#d1d5db' : '#542583',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  height: '40px',
                  cursor: (!tempoMaximo.trim() || !precoRaio.trim()) ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                  opacity: (!tempoMaximo.trim() || !precoRaio.trim()) ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!getEventTargetWithDisabled(e).disabled) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#7209bd'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!getEventTargetWithDisabled(e).disabled) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#542583'
                  }
                }}
              >
                {editandoRaio ? 'Salvar Alterações' : 'Cadastrar Raio'}
              </button>
            </div>
          </div>
        </div>
      )}


    </ProtectedRoute>
  )
} 
