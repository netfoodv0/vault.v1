'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { useCuponsFirebase, Cupom } from '@/hooks/useCuponsFirebase'

export default function CuponsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Estados para o modal de novo cupom
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isModalAnimating, setIsModalAnimating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [cupomEmEdicao, setCupomEmEdicao] = useState<any>(null)
  const [codigoCupom, setCodigoCupom] = useState('')
  const [descricaoCupom, setDescricaoCupom] = useState('')
  const [tipoDesconto, setTipoDesconto] = useState('percentual') // 'percentual' ou 'valor_fixo'
  const [valorDesconto, setValorDesconto] = useState('0,00')
  const [valorMinimo, setValorMinimo] = useState('0,00')
  const [dataValidade, setDataValidade] = useState('')
  const [maxUsos, setMaxUsos] = useState('')
  const [cupomAtivo, setCupomAtivo] = useState(true)
  const [limitarTotalUsos, setLimitarTotalUsos] = useState(false)
  const [limitarUsosPorCliente, setLimitarUsosPorCliente] = useState(false)
  const [cupomComDataValidade, setCupomComDataValidade] = useState(false)
  const [cupomPrimeiraCompra, setCupomPrimeiraCompra] = useState(false)
  const [quantidadeMaximaUsos, setQuantidadeMaximaUsos] = useState('')
  const [usosPorCliente, setUsosPorCliente] = useState('1')
  const [dataExpiracao, setDataExpiracao] = useState('')
  const [erroDataExpiracao, setErroDataExpiracao] = useState('')
  
  // Estados para erros de validação
  const [erroCodigoCupom, setErroCodigoCupom] = useState('')
  const [erroDescricaoCupom, setErroDescricaoCupom] = useState('')
  const [erroValorDesconto, setErroValorDesconto] = useState('')
  const [erroQuantidadeMaximaUsos, setErroQuantidadeMaximaUsos] = useState('')
  const [erroUsosPorCliente, setErroUsosPorCliente] = useState('')

  // Hook do Firebase para cupons
  const { cupons, loading: cuponsLoading, saving, addCupom, updateCupom, deleteCupom } = useCuponsFirebase()

  // Função para formatar valores monetários
  const formatarValorMonetario = (valor: string) => {
    // Remove tudo que não é número
    const numeros = valor.replace(/\D/g, '')
    
    if (numeros === '') return ''
    
    // Converte para centavos e depois para reais
    const centavos = parseInt(numeros, 10)
    const reais = (centavos / 100).toFixed(2)
    
    // Formata com vírgula como separador decimal
    return reais.replace('.', ',')
  }

  // Função para formatar porcentagem
  const formatarPorcentagem = (valor: string) => {
    // Remove tudo que não é número
    const numeros = valor.replace(/\D/g, '')
    
    if (numeros === '') return ''
    
    // Limita a 100%
    const numero = Math.min(parseInt(numeros, 10), 100)
    
    return numero.toString()
  }

  // Função para formatar número inteiro
  const formatarNumeroInteiro = (valor: string) => {
    // Remove tudo que não é número
    const numeros = valor.replace(/\D/g, '')
    
    return numeros
  }

  // Função para validar data (DD/MM/AAAA) baseada no horário de São Paulo
  const validarData = (dataString: string): { valida: boolean; erro: string } => {
    if (!dataString || dataString.length < 10) {
      return { valida: false, erro: '' }
    }

    try {
      // Converter DD/MM/AAAA para Date
      const partes = dataString.split('/')
      if (partes.length !== 3) {
        return { valida: false, erro: 'Formato inválido' }
      }

      const dia = parseInt(partes[0], 10)
      const mes = parseInt(partes[1], 10) - 1 // Mês começa em 0
      const ano = parseInt(partes[2], 10)

      // Validar se os números fazem sentido
      if (dia < 1 || dia > 31 || mes < 0 || mes > 11 || ano < 2024) {
        return { valida: false, erro: 'Data inválida' }
      }

      // Criar data e verificar se ela realmente existe
      const dataCupom = new Date(ano, mes, dia)
      
      // Verificar se a data criada corresponde aos valores inseridos
      // Isso detecta datas inexistentes como 31/02/2025
      if (dataCupom.getDate() !== dia || 
          dataCupom.getMonth() !== mes || 
          dataCupom.getFullYear() !== ano) {
        return { valida: false, erro: 'Data não existe' }
      }

      // Criar data no fuso horário de São Paulo (GMT-3) para comparação
      const dataCupomFinal = new Date(ano, mes, dia, 23, 59, 59) // Final do dia
      
      // Obter data atual em São Paulo
      const agora = new Date()
      const dataAtualSP = new Date(agora.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}))
      
      // Comparar apenas a data (sem hora)
      const dataAtualSPNormalizada = new Date(dataAtualSP.getFullYear(), dataAtualSP.getMonth(), dataAtualSP.getDate())

      if (dataCupomFinal < dataAtualSPNormalizada) {
        return { valida: false, erro: 'Data deve ser futura' }
      }

      return { valida: true, erro: '' }
    } catch (error) {
      return { valida: false, erro: 'Data inválida' }
    }
  }

  // Função para formatar data (DD/MM/AAAA)
  const formatarData = (valor: string) => {
    // Remove tudo que não é número
    const numeros = valor.replace(/\D/g, '')
    
    if (numeros.length <= 2) {
      return numeros
    } else if (numeros.length <= 4) {
      return `${numeros.slice(0, 2)}/${numeros.slice(2)}`
    } else {
      return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4, 8)}`
    }
  }

  // Função para validar campos obrigatórios
  const validarCamposObrigatorios = (): boolean => {
    let valido = true

    // Limpar erros anteriores
    setErroCodigoCupom('')
    setErroDescricaoCupom('')
    setErroValorDesconto('')
    setErroQuantidadeMaximaUsos('')
    setErroUsosPorCliente('')

    // 1. Código do cupom é obrigatório
    if (!codigoCupom.trim()) {
      setErroCodigoCupom('Código do cupom é obrigatório')
      valido = false
    } else if (codigoCupom.trim().length < 3) {
      setErroCodigoCupom('Código deve ter pelo menos 3 caracteres')
      valido = false
    }

    // 2. Descrição é obrigatória para todos os tipos exceto brinde
    if (tipoDesconto !== 'brinde' && !descricaoCupom.trim()) {
      setErroDescricaoCupom('Descrição é obrigatória')
      valido = false
    }

    // 3. Para brinde, a descrição é obrigatória
    if (tipoDesconto === 'brinde' && !descricaoCupom.trim()) {
      setErroDescricaoCupom('Descrição do brinde é obrigatória')
      valido = false
    }

    // 4. Valor do desconto é obrigatório para percentual e fixo
    if ((tipoDesconto === 'percentual' || tipoDesconto === 'fixo') && 
        (!valorDesconto || valorDesconto === '0,00' || valorDesconto === '0')) {
      setErroValorDesconto('Valor do desconto é obrigatório')
      valido = false
    }

    // 5. Se limitar total de usos está marcado, quantidade é obrigatória
    if (limitarTotalUsos && (!quantidadeMaximaUsos || parseInt(quantidadeMaximaUsos) <= 0)) {
      setErroQuantidadeMaximaUsos('Quantidade máxima de usos é obrigatória')
      valido = false
    }

    // 6. Se limitar usos por cliente está marcado, quantidade é obrigatória
    if (limitarUsosPorCliente && (!usosPorCliente || parseInt(usosPorCliente) <= 0)) {
      setErroUsosPorCliente('Usos por cliente é obrigatório')
      valido = false
    }

    // 7. Se data de validade está marcada, data é obrigatória
    if (cupomComDataValidade && !dataExpiracao) {
      setErroDataExpiracao('Data de expiração é obrigatória')
      valido = false
    }

    return valido
  }



  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const openModal = () => {
    setIsEditing(false)
    setCupomEmEdicao(null)
    setIsModalVisible(true)
    setTimeout(() => setIsModalAnimating(true), 10)
  }

  const openEditModal = (cupom: any) => {
    setIsEditing(true)
    setCupomEmEdicao(cupom)
    
    // Preencher os campos com os dados do cupom
    setCodigoCupom(cupom.codigo)
    setDescricaoCupom(cupom.descricao)
    
    // Determinar o tipo de desconto baseado no valor
    if (cupom.desconto.includes('%')) {
      setTipoDesconto('percentual')
      setValorDesconto(cupom.desconto.replace('%', ''))
    } else if (cupom.desconto.includes('R$')) {
      setTipoDesconto('fixo')
      setValorDesconto(cupom.desconto.replace('R$ ', ''))
    } else if (cupom.desconto === 'Frete Grátis') {
      setTipoDesconto('frete')
    } else {
      setTipoDesconto('brinde')
    }
    
    // Extrair valor mínimo
    setValorMinimo(cupom.valorMinimo.replace('R$ ', ''))
    
    // Status
    setCupomAtivo(cupom.status === 'Ativo')
    
    // Limites
    setLimitarTotalUsos(cupom.maxUsos > 0)
    setQuantidadeMaximaUsos(cupom.maxUsos > 0 ? cupom.maxUsos.toString() : '')
    
    setLimitarUsosPorCliente(cupom.usosPorCliente > 0)
    setUsosPorCliente(cupom.usosPorCliente > 0 ? cupom.usosPorCliente.toString() : '1')
    
    // Data de validade
    setCupomComDataValidade(cupom.validade !== 'Não aplicável')
    setDataExpiracao(cupom.validade !== 'Não aplicável' ? cupom.validade : '')
    
    // Primeira compra
    setCupomPrimeiraCompra(cupom.primeiraCompra || false)
    
    setIsModalVisible(true)
    setTimeout(() => setIsModalAnimating(true), 10)
  }

  const closeModal = () => {
    setIsModalAnimating(false)
    setTimeout(() => {
      setIsModalVisible(false)
      setIsEditing(false)
      setCupomEmEdicao(null)
      // Limpar campos
      setCodigoCupom('')
      setDescricaoCupom('')
      setTipoDesconto('percentual')
      setValorDesconto('0,00')
      setValorMinimo('0,00')
      setDataValidade('')
      setMaxUsos('')
      setCupomAtivo(true)
      setLimitarTotalUsos(false)
      setLimitarUsosPorCliente(false)
      setCupomComDataValidade(false)
      setCupomPrimeiraCompra(false)
      setQuantidadeMaximaUsos('')
      setUsosPorCliente('1')
      setDataExpiracao('')
      setErroDataExpiracao('')
      // Limpar erros de validação
      setErroCodigoCupom('')
      setErroDescricaoCupom('')
      setErroValorDesconto('')
      setErroQuantidadeMaximaUsos('')
      setErroUsosPorCliente('')
    }, 400)
  }

  const handleSaveCupom = async () => {
    // Validar campos obrigatórios
    if (!validarCamposObrigatorios()) {
      return
    }

    // Validar data se estiver habilitada
    if (cupomComDataValidade && dataExpiracao) {
      const validacao = validarData(dataExpiracao)
      if (!validacao.valida) {
        setErroDataExpiracao(validacao.erro)
        return
      }
    }

    try {
      const cupomData = {
        codigo: codigoCupom,
        descricao: descricaoCupom,
        desconto: tipoDesconto === 'percentual' ? `${valorDesconto}%` : 
                  tipoDesconto === 'fixo' ? `R$ ${valorDesconto}` :
                  tipoDesconto === 'frete' ? 'Frete Grátis' :
                  tipoDesconto === 'brinde' ? descricaoCupom : valorDesconto,
        valorMinimo: valorMinimo ? `R$ ${valorMinimo}` : 'R$ 0,00',
        validade: cupomComDataValidade ? dataExpiracao : 'Não aplicável',
        status: (cupomAtivo ? 'Ativo' : 'Inativo') as 'Ativo' | 'Inativo',
        usos: isEditing ? cupomEmEdicao.usos : 0,
        maxUsos: limitarTotalUsos ? parseInt(quantidadeMaximaUsos, 10) : 0,
        primeiraCompra: cupomPrimeiraCompra,
        usosPorCliente: limitarUsosPorCliente ? parseInt(usosPorCliente, 10) : 0,
        dataExpiracao: cupomComDataValidade ? dataExpiracao : null,
      };
      
      if (isEditing && cupomEmEdicao?.id) {
        // Atualizar cupom existente
        await updateCupom(cupomEmEdicao.id, cupomData);
      } else {
        // Adicionar novo cupom
        await addCupom(cupomData);
      }
      
      closeModal();
    } catch (error) {
      console.error('Erro ao salvar cupom:', error)
      // Aqui você pode adicionar um toast de erro se quiser
    }
  };

  const columns = [
    { header: 'Código', field: 'codigo' },
    { header: 'Descrição', field: 'descricao' },
    { header: 'Desconto', field: 'desconto' },
    { header: 'Valor Mínimo', field: 'valorMinimo' },
    { header: 'Validade', field: 'validade' },
    { header: 'Status', field: 'status' },
    { header: 'Usos', field: 'usos', align: 'center' as const },
    { 
      header: 'Ações', 
      field: 'acoes', 
      align: 'center' as const,
      render: (item: any) => {
        console.log('Renderizando ações para item:', item)
        return (
          <div className="flex gap-2 justify-center" style={{ minWidth: '80px' }}>
            <button 
              className="text-gray-600 hover:text-gray-900 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                console.log('Clicou em editar:', item)
                openEditModal(item)
              }}
              style={{ padding: '4px' }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                height="20px" 
                viewBox="0 -960 960 960" 
                width="20px" 
                fill="currentColor"
              >
                <path d="M360-600v-80h360v80H360Zm0 120v-80h360v80H360ZM560-80v-123l221-220q9-9 20-13t22-4q12 0 23 4.5t20 13.5l37 37q8 9 12.5 20t4.5 22q0 11-4 22.5T903-300L683-80H560Zm263-224 37-39-37-37-38 38 38 38ZM240-80q-50 0-85-35t-35-85v-120h120v-560h600v361q-20-2-40.5 1.5T760-505v-295H320v480h240l-80 80v160H240Z"/>
              </svg>
            </button>
            <button 
              className="text-gray-600 hover:text-red-600 transition-colors"
              onClick={async (e) => {
                e.stopPropagation()
                console.log('Clicou em deletar:', item)
                if (confirm('Tem certeza que deseja excluir este cupom?')) {
                  try {
                    await deleteCupom(item.id!)
                  } catch (error) {
                    console.error('Erro ao excluir cupom:', error)
                  }
                }
              }}
              style={{ padding: '4px' }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                height="20px" 
                viewBox="0 -960 960 960" 
                width="20px" 
                fill="currentColor"
              >
                <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm80-160h80v-360h-80v360Zm160 0h80v-360h-80v360Z"/>
              </svg>
            </button>
          </div>
        )
      }
    }
  ]

  // Só mostrar loading se estiver carregando inicialmente
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="spinner" width="80px" height="80px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
            <circle className="path" fill="none" strokeWidth="6" strokeLinecap="round" cx="33" cy="33" r="30"></circle>
          </svg>
        </div>
        <style jsx>{`
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
        `}</style>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="text-left">
            <h1 className="text-lg font-bold text-gray-900 mb-2">Cupons</h1>
            <p className="text-sm text-gray-600">Gerencie os cupons de desconto da sua loja</p>
          </div>
          
          <button 
            onClick={openModal}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Cupom
          </button>
        </div>
        
        {/* Tabela de Cupons */}
        {cuponsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <svg className="spinner" width="40px" height="40px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
                <circle className="path" fill="none" strokeWidth="6" strokeLinecap="round" cx="33" cy="33" r="30"></circle>
              </svg>
              <p className="mt-2 text-sm text-gray-600">Carregando cupons...</p>
            </div>
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={cupons}
            onRowClick={(item) => openEditModal(item)}
          />
        )}
        
        <style jsx>{`
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
        `}</style>
      </div>

      {/* Modal de Novo Cupom */}
      {isModalVisible && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0"
            style={{
              backgroundColor: isModalAnimating ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
              transition: 'all 0.3s ease-out',
              zIndex: 70,
              pointerEvents: saving ? 'none' : 'auto'
            }}
            onClick={saving ? undefined : closeModal}
          ></div>
          
          {/* Modal Content */}
          <div 
            className="fixed top-1/2 left-1/2 bg-white"
            style={{
              width: '800px',
              maxHeight: '90vh',
              borderRadius: '4px',
              transform: isModalAnimating ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.3)',
              opacity: isModalAnimating ? 1 : 0,
              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              zIndex: 71,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Cabeçalho Fixo */}
            <div 
              className="flex items-center justify-between"
              style={{
                padding: '24px 24px 16px 24px',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: 'white',
                flexShrink: 0
              }}
            >
              <h2 className="text-xl font-bold text-gray-800">
                {isEditing ? 'Editar cupom' : 'Novo cupom'}
              </h2>
              
              {/* Botão de fechar */}
              <button
                onClick={closeModal}
                disabled={saving}
                style={{
                  fontSize: '32px',
                  lineHeight: '1',
                  color: '#9ca3af',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
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
            </div>

            {/* Conteúdo Rolável */}
            <div className="flex-1 overflow-y-auto" style={{ padding: '24px 24px' }}>
              <div className="mb-4 flex items-center gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Código do cupom</label>
                  <input
                    type="text"
                    value={codigoCupom}
                    onChange={(e) => setCodigoCupom(e.target.value.toUpperCase())}
                    placeholder="Ex: DESCONTO10"
                    className={`px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:border-transparent ${
                      erroCodigoCupom ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                    }`}
                    style={{ width: '300px' }}
                  />
                  {erroCodigoCupom && (
                    <p className="text-red-500 text-xs mt-1">{erroCodigoCupom}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-6">
                   <div
                     className="cursor-pointer"
                     onClick={() => setCupomAtivo(!cupomAtivo)}
                     style={{
                       width: '44px',
                       height: '24px',
                       borderRadius: '12px',
                       backgroundColor: cupomAtivo ? '#542583' : '#d1d5db',
                       position: 'relative',
                       transition: 'all 0.3s ease-in-out'
                     }}
                   >
                     <div
                       style={{
                         width: '16px',
                         height: '16px',
                         borderRadius: '50%',
                         backgroundColor: 'white',
                         position: 'absolute',
                         top: '4px',
                         transform: cupomAtivo ? 'translateX(24px)' : 'translateX(4px)',
                         transition: 'all 0.3s ease-in-out'
                       }}
                     ></div>
                   </div>
                   <span className={`text-sm font-medium ${cupomAtivo ? 'text-purple-700' : 'text-gray-400'}`}>{cupomAtivo ? 'Ativo' : 'Inativo'}</span>
                </div>
              </div>
              <div className="border-b border-gray-200 my-6"></div>
              <h3 className="text-base font-semibold text-gray-800 mb-4">Tipo do cupom</h3>
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setTipoDesconto('fixo')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors duration-200
                    ${tipoDesconto === 'fixo' ? 'bg-purple-50 border-purple-600 text-purple-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  type="button"
                >
                  {/* Ícone desconto fixo */}
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                    <path d="M260-361v-40H160v-80h200v-80H200q-17 0-28.5-11.5T160-601v-160q0-17 11.5-28.5T200-801h60v-40h80v40h100v80H240v80h160q17 0 28.5 11.5T440-601v160q0 17-11.5 28.5T400-401h-60v40h-80Zm298 240L388-291l56-56 114 114 226-226 56 56-282 282Z"/>
                  </svg>
                  Desconto Fixo
                </button>
                <button
                  onClick={() => setTipoDesconto('percentual')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors duration-200
                    ${tipoDesconto === 'percentual' ? 'bg-purple-50 border-purple-600 text-purple-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  type="button"
                >
                  {/* Ícone desconto percentual */}
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                    <path d="M300-520q-58 0-99-41t-41-99q0-58 41-99t99-41q58 0 99 41t41 99q0 58-41 99t-99 41Zm0-80q25 0 42.5-17.5T360-660q0-25-17.5-42.5T300-720q-25 0-42.5 17.5T240-660q0 25 17.5 42.5T300-600Zm360 440q-58 0-99-41t-41-99q0-58 41-99t99-41q58 0 99 41t41 99q0 58-41 99t-99 41Zm0-80q25 0 42.5-17.5T720-300q0-25-17.5-42.5T660-360q-25 0-42.5 17.5T600-300q0 25 17.5 42.5T660-240Zm-444 80-56-56 584-584 56 56-584 584Z"/>
                  </svg>
                  Desconto Percentual
                </button>
                <button
                  onClick={() => setTipoDesconto('frete')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors duration-200
                    ${tipoDesconto === 'frete' ? 'bg-purple-50 border-purple-600 text-purple-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  type="button"
                >
                  {/* Ícone frete grátis */}
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                    <path d="M120-640v-200h280v200H120Zm80-80h120v-40H200v40Zm80 520q-50 0-85-35t-35-85H80v-120q0-66 47-113t113-47h160v200h140l140-174v-106H560v-80h120q33 0 56.5 23.5T760-680v134L580-320H400q0 50-35 85t-85 35Zm0-80q17 0 28.5-11.5T320-320h-80q0 17 11.5 28.5T280-280Zm480 80q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35Zm0-80q17 0 28.5-11.5T800-320q0-17-11.5-28.5T760-360q-17 0-28.5 11.5T720-320q0 17 11.5 28.5T760-280ZM160-400h160v-120h-80q-33 0-56.5 23.5T160-440v40Zm160-320v-40 40Zm0 320Z"/>
                  </svg>
                  Frete Grátis
                </button>
                <button
                  onClick={() => setTipoDesconto('brinde')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors duration-200
                    ${tipoDesconto === 'brinde' ? 'bg-purple-50 border-purple-600 text-purple-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  type="button"
                >
                  {/* Ícone brinde */}
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                    <path d="M160-80v-440H80v-240h208q-5-9-6.5-19t-1.5-21q0-50 35-85t85-35q23 0 43 8.5t37 23.5q17-16 37-24t43-8q50 0 85 35t35 85q0 11-2 20.5t-6 19.5h208v240h-80v440H160Zm400-760q-17 0-28.5 11.5T520-800q0 17 11.5 28.5T560-760q17 0 28.5-11.5T600-800q0-17-11.5-28.5T560-840Zm-200 40q0 17 11.5 28.5T400-760q17 0 28.5-11.5T440-800q0-17-11.5-28.5T400-840q-17 0-28.5 11.5T360-800ZM160-680v80h280v-80H160Zm280 520v-360H240v360h200Zm80 0h200v-360H520v360Zm280-440v-80H520v80h280Z"/>
                  </svg>
                  Brinde
                </button>
              </div>
              {tipoDesconto === 'fixo' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                  <p className="text-sm text-blue-800">Ofereça um desconto de valor fixo no total da compra!</p>
                </div>
              )}
              {tipoDesconto === 'fixo' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descrição do cupom</label>
                  <input
                    type="text"
                    value={descricaoCupom}
                    onChange={(e) => setDescricaoCupom(e.target.value)}
                    placeholder="Ex: Desconto de R$ 5,00"
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:border-transparent ${
                      erroDescricaoCupom ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                    }`}
                  />
                  {erroDescricaoCupom && (
                    <p className="text-red-500 text-xs mt-1">{erroDescricaoCupom}</p>
                  )}
                </div>
              )}
              {tipoDesconto === 'fixo' && (
                <div className="flex gap-6 mb-6">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valor do desconto</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">R$</span>
                      <input
                        type="text"
                        value={valorDesconto}
                        onChange={(e) => setValorDesconto(formatarValorMonetario(e.target.value))}
                        placeholder="0,00"
                        className={`w-full pl-8 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:border-transparent ${
                          erroValorDesconto ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                        }`}
                      />
                    </div>
                    {erroValorDesconto && (
                      <p className="text-red-500 text-xs mt-1">{erroValorDesconto}</p>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valor mínimo da compra (sem frete)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">R$</span>
                      <input
                        type="text"
                        value={valorMinimo}
                        onChange={(e) => setValorMinimo(formatarValorMonetario(e.target.value))}
                        placeholder="0,00"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}
              {tipoDesconto === 'percentual' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                  <p className="text-sm text-blue-800">Reduza um percentual do total do pedido. Ideal para promoções flexíveis!</p>
                </div>
              )}
              {tipoDesconto === 'percentual' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descrição do cupom</label>
                  <input
                    type="text"
                    value={descricaoCupom}
                    onChange={(e) => setDescricaoCupom(e.target.value)}
                    placeholder="Ex: Desconto de 10%"
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:border-transparent ${
                      erroDescricaoCupom ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                    }`}
                  />
                  {erroDescricaoCupom && (
                    <p className="text-red-500 text-xs mt-1">{erroDescricaoCupom}</p>
                  )}
                </div>
              )}
              {tipoDesconto === 'percentual' && (
                <div className="flex gap-6 mb-6">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Porcentagem do desconto</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={valorDesconto}
                        onChange={(e) => setValorDesconto(formatarPorcentagem(e.target.value))}
                        placeholder="0"
                        className={`w-full pr-8 pl-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:border-transparent ${
                          erroValorDesconto ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                        }`}
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">%</span>
                    </div>
                    {erroValorDesconto && (
                      <p className="text-red-500 text-xs mt-1">{erroValorDesconto}</p>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valor mínimo da compra (sem frete)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">R$</span>
                      <input
                        type="text"
                        value={valorMinimo}
                        onChange={(e) => setValorMinimo(formatarValorMonetario(e.target.value))}
                        placeholder="0,00"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}
              {tipoDesconto === 'frete' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                  <p className="text-sm text-blue-800">Incentive os pedidos eliminando o custo de entrega!</p>
                </div>
              )}
              {tipoDesconto === 'frete' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descrição do cupom</label>
                  <input
                    type="text"
                    value={descricaoCupom}
                    onChange={(e) => setDescricaoCupom(e.target.value)}
                    placeholder="Ex: Frete grátis"
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:border-transparent ${
                      erroDescricaoCupom ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                    }`}
                  />
                  {erroDescricaoCupom && (
                    <p className="text-red-500 text-xs mt-1">{erroDescricaoCupom}</p>
                  )}
                </div>
              )}
              {tipoDesconto === 'frete' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valor mínimo da compra (sem frete)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">R$</span>
                    <input
                      type="text"
                      value={valorMinimo}
                      onChange={(e) => setValorMinimo(formatarValorMonetario(e.target.value))}
                      placeholder="0,00"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      style={{ maxWidth: '300px' }}
                    />
                  </div>
                </div>
              )}
              {tipoDesconto === 'brinde' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                  <p className="text-sm text-blue-800">Presenteie seus clientes com algo especial, como uma bebida grátis!</p>
                </div>
              )}
              {tipoDesconto === 'brinde' && (
                <div className="flex gap-6 mb-6">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brinde</label>
                    <input
                      type="text"
                      value={descricaoCupom}
                      onChange={(e) => setDescricaoCupom(e.target.value)}
                      placeholder="Ex: Coca grátis"
                      className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:border-transparent ${
                        erroDescricaoCupom ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                      }`}
                    />
                    {erroDescricaoCupom && (
                      <p className="text-red-500 text-xs mt-1">{erroDescricaoCupom}</p>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valor mínimo da compra (sem frete)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">R$</span>
                      <input
                        type="text"
                        value={valorMinimo}
                        onChange={(e) => setValorMinimo(formatarValorMonetario(e.target.value))}
                        placeholder="0,00"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}
              <div className="border-b border-gray-200 my-6"></div>
              <h3 className="text-base font-semibold text-gray-800 mb-4">Limites de uso do cupom</h3>
              <div className="space-y-3 mb-6">
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={limitarTotalUsos}
                      onChange={(e) => setLimitarTotalUsos(e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-700">Limitar o cupom pela quantidade total de usos</span>
                  </label>
                  {limitarTotalUsos && (
                    <div className="ml-7 mt-2">
                      <label className="block text-sm text-gray-700 mb-2">Quantidade máxima de usos</label>
                      <input
                        type="text"
                        value={quantidadeMaximaUsos}
                        onChange={(e) => setQuantidadeMaximaUsos(formatarNumeroInteiro(e.target.value))}
                        placeholder="Ex: 50"
                        className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:border-transparent ${
                          erroQuantidadeMaximaUsos ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                        }`}
                        style={{ maxWidth: '300px' }}
                      />
                      {erroQuantidadeMaximaUsos && (
                        <p className="text-red-500 text-xs mt-1 ml-7">{erroQuantidadeMaximaUsos}</p>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={limitarUsosPorCliente}
                      onChange={(e) => setLimitarUsosPorCliente(e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-700">Limitar o cupom pela quantidade de usos por cliente</span>
                  </label>
                  {limitarUsosPorCliente && (
                    <div className="ml-7 mt-2">
                      <label className="block text-sm text-gray-700 mb-2">Usos por cliente</label>
                      <input
                        type="text"
                        value={usosPorCliente}
                        onChange={(e) => setUsosPorCliente(formatarNumeroInteiro(e.target.value))}
                        placeholder="1"
                        className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:border-transparent ${
                          erroUsosPorCliente ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                        }`}
                        style={{ maxWidth: '300px' }}
                      />
                      {erroUsosPorCliente && (
                        <p className="text-red-500 text-xs mt-1 ml-7">{erroUsosPorCliente}</p>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cupomComDataValidade}
                      onChange={(e) => setCupomComDataValidade(e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-700">Cupom com data de validade</span>
                  </label>
                  {cupomComDataValidade && (
                    <div className="ml-7 mt-2">
                      <label className="block text-sm text-gray-700 mb-2">Data de expiração</label>
                      <input
                        type="text"
                        value={dataExpiracao}
                        onChange={(e) => {
                          const dataFormatada = formatarData(e.target.value)
                          setDataExpiracao(dataFormatada)
                          
                          // Validar a data quando estiver completa
                          if (dataFormatada.length === 10) {
                            const validacao = validarData(dataFormatada)
                            setErroDataExpiracao(validacao.erro)
                          } else {
                            setErroDataExpiracao('')
                          }
                        }}
                        placeholder="DD/MM/YYYY"
                        className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          erroDataExpiracao ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                        }`}
                        style={{ maxWidth: '300px' }}
                      />
                      {erroDataExpiracao && (
                        <p className="text-red-500 text-xs mt-1 ml-7">{erroDataExpiracao}</p>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cupomPrimeiraCompra}
                      onChange={(e) => setCupomPrimeiraCompra(e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-700">Cupom válido somente para primeira compra</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Rodapé Fixo */}
            <div 
              className="flex gap-3 justify-end"
              style={{
                padding: '16px 24px 24px 24px',
                borderTop: '1px solid #e5e7eb',
                backgroundColor: 'white',
                flexShrink: 0
              }}
            >
              <button
                onClick={closeModal}
                disabled={saving}
                className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors duration-200 ${
                  saving 
                    ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCupom}
                disabled={saving}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  saving 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
                style={{ backgroundColor: saving ? undefined : '#542583' }}
              >
                {saving ? 'Salvando...' : (isEditing ? 'Atualizar cupom' : 'Salvar cupom')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
} 
