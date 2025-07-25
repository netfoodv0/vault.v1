'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DataTable } from '@/components/ui/DataTable'
import DateRangePicker from '@/components/ui/DateRangePicker'
import { useHistoricoPedidos } from '@/hooks/useHistoricoPedidos'
import { useState } from 'react'

export default function HistoricoPedidosPage() {
  // Usar o hook real do Firebase
  const { historicoPedidos, loading, estatisticas } = useHistoricoPedidos()

  // Estados para o modal de detalhes
  const [isDetalhesModalVisible, setIsDetalhesModalVisible] = useState(false)
  const [isDetalhesModalAnimating, setIsDetalhesModalAnimating] = useState(false)
  const [pedidoDetalhes, setPedidoDetalhes] = useState<any>(null)

  // Estado para filtro de data
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    new Date(new Date().setDate(new Date().getDate() - 7)), // 7 dias atrás
    new Date() // hoje
  ])

  // Função para converter data brasileira (DD/MM/YYYY) para Date
  const converterDataBrasileira = (dataString: string): Date => {
    try {
      // Formato esperado: DD/MM/YYYY
      const [dia, mes, ano] = dataString.split('/').map(Number)
      return new Date(ano, mes - 1, dia) // mes - 1 porque Date usa 0-11 para meses
    } catch (error) {
      console.error('Erro ao converter data:', dataString, error)
      return new Date(0) // Data inválida
    }
  }

  // Função para filtrar pedidos por data
  const filtrarPedidosPorData = (pedidos: any[]) => {
    if (!dateRange[0] || !dateRange[1]) return pedidos

    // Criar datas de início e fim do período selecionado
    const dataInicio = new Date(dateRange[0])
    const dataFim = new Date(dateRange[1])
    
    // Ajustar para incluir o dia inteiro
    dataInicio.setHours(0, 0, 0, 0)
    dataFim.setHours(23, 59, 59, 999)

    console.log('🔍 Filtro de data:', {
      dataInicio: dataInicio.toLocaleDateString('pt-BR'),
      dataFim: dataFim.toLocaleDateString('pt-BR'),
      totalPedidos: pedidos.length
    })

    return pedidos.filter(pedido => {
      // Converter data do pedido (formato DD/MM/YYYY) para Date
      const dataPedido = converterDataBrasileira(pedido.data)
      
      // Verificar se a data do pedido está dentro do período
      const estaNoPeriodo = dataPedido >= dataInicio && dataPedido <= dataFim
      
      if (estaNoPeriodo) {
        console.log('✅ Pedido incluído:', {
          cliente: pedido.cliente,
          data: pedido.data,
          dataConvertida: dataPedido.toLocaleDateString('pt-BR')
        })
      }
      
      return estaNoPeriodo
    })
  }

  // Pedidos filtrados por data
  const pedidosFiltrados = filtrarPedidosPorData(historicoPedidos)

  // Estatísticas dos pedidos filtrados
  const estatisticasFiltradas = {
    total: pedidosFiltrados.length,
    entregues: pedidosFiltrados.filter(p => p.status === 'Entregue').length,
    cancelados: pedidosFiltrados.filter(p => p.status === 'Cancelado').length,
    valorTotal: pedidosFiltrados.reduce((total, pedido) => {
      const valor = parseFloat(pedido.valor.replace('R$ ', '').replace(',', '.'))
      return total + valor
    }, 0)
  }

  // Função para obter texto do período filtrado
  const getTextoPeriodoFiltrado = () => {
    if (!dateRange[0] || !dateRange[1]) return 'Todos os períodos'
    
    const dataInicio = dateRange[0].toLocaleDateString('pt-BR')
    const dataFim = dateRange[1].toLocaleDateString('pt-BR')
    
    if (dataInicio === dataFim) {
      return `Data: ${dataInicio}`
    }
    
    return `Período: ${dataInicio} a ${dataFim}`
  }

  // Função para verificar se há filtro ativo
  const temFiltroAtivo = () => {
    if (!dateRange[0] || !dateRange[1]) return false
    
    const hoje = new Date()
    const seteDiasAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    return dateRange[0].getTime() !== seteDiasAtras.getTime() || 
           dateRange[1].getTime() !== hoje.getTime()
  }

  // Função para abrir modal de detalhes
  const openDetalhesModal = (pedido: any) => {
    console.log('🔍 Dados do pedido histórico:', pedido)
    console.log('📦 Produtos:', pedido.produtos || pedido.itens)
    console.log('📋 Dados completos:', pedido.dadosCompletos)
    console.log('📋 Dados completos.itens:', pedido.dadosCompletos?.itens)
    console.log('📋 Dados completos.produtos:', pedido.dadosCompletos?.produtos)
    setPedidoDetalhes(pedido)
    setIsDetalhesModalVisible(true)
    setTimeout(() => {
      setIsDetalhesModalAnimating(true)
    }, 10)
  }

  // Função para fechar modal de detalhes
  const closeDetalhesModal = () => {
    setIsDetalhesModalAnimating(false)
    setTimeout(() => {
      setIsDetalhesModalVisible(false)
      setPedidoDetalhes(null)
    }, 300)
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

  // Definição das colunas da tabela
  const columns = [
    {
      header: 'Cliente',
      field: 'cliente',
      align: 'left' as const
    },
    {
      header: 'Telefone',
      field: 'telefone',
      align: 'left' as const
    },
    {
      header: 'Valor',
      field: 'valor',
      align: 'center' as const
    },
    {
      header: 'Status',
      field: 'status',
      align: 'center' as const,
      render: (item: any) => (
        <span 
          style={{
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500',
            backgroundColor: item.status === 'Entregue' ? '#dcfce7' : '#fef2f2',
            color: item.status === 'Entregue' ? '#166534' : '#dc2626'
          }}
        >
          {item.status}
        </span>
      )
    },
    {
      header: 'Data',
      field: 'data',
      align: 'center' as const
    },
    {
      header: 'Pagamento',
      field: 'formaPagamento',
      align: 'center' as const
    },
    {
      header: 'Tipo',
      field: 'tipo',
      align: 'center' as const
    }
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: '#ececec' }}>
        <div className="p-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6">
              {/* Título */}
              <div className="text-left mb-4">
                <h1 className="text-lg font-bold text-gray-900 mb-2">Histórico de Pedidos</h1>
                <p className="text-sm text-gray-600">Visualize todos os pedidos realizados</p>
              </div>
              
              {/* Filtro de Data */}
              <div className="mb-4">
                <DateRangePicker 
                  selectedDateRange={dateRange}
                  onDateRangeChange={setDateRange}
                  showTodayButton={true}
                />
              </div>
              
              {/* Estatísticas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div 
                  className="bg-white p-3 rounded-lg border border-gray-200 text-center"
                  style={{ minWidth: '120px' }}
                >
                  <div className="text-2xl font-bold text-gray-600 mb-1">{estatisticasFiltradas.total}</div>
                  <div className="text-sm text-gray-600 font-medium">Total</div>
                </div>
                <div 
                  className="bg-white p-3 rounded-lg border border-gray-200 text-center"
                  style={{ minWidth: '120px' }}
                >
                  <div className="text-2xl font-bold text-gray-600 mb-1">{estatisticasFiltradas.entregues}</div>
                  <div className="text-sm text-gray-600 font-medium">Entregues</div>
                </div>
                <div 
                  className="bg-white p-3 rounded-lg border border-gray-200 text-center"
                  style={{ minWidth: '120px' }}
                >
                  <div className="text-2xl font-bold text-gray-600 mb-1">{estatisticasFiltradas.cancelados}</div>
                  <div className="text-sm text-gray-600 font-medium">Cancelados</div>
                </div>
                <div 
                  className="bg-white p-3 rounded-lg border border-gray-200 text-center"
                  style={{ minWidth: '120px' }}
                >
                  <div className="text-2xl font-bold text-gray-600 mb-1">
                    R$ {estatisticasFiltradas.valorTotal.toFixed(2).replace('.', ',')}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Valor Total</div>
                </div>
              </div>
            </div>
            
            {/* Tabela de Histórico de Pedidos */}
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">Carregando histórico de pedidos...</div>
              </div>
            ) : pedidosFiltrados.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-2">
                  {temFiltroAtivo() 
                    ? `Nenhum pedido encontrado no período selecionado (${getTextoPeriodoFiltrado()})`
                    : 'Nenhum pedido encontrado no histórico'
                  }
                </div>
                {temFiltroAtivo() && (
                  <button
                    onClick={() => setDateRange([
                      new Date(new Date().setDate(new Date().getDate() - 7)),
                      new Date()
                    ])}
                    className="text-sm text-purple-600 hover:text-purple-700 underline"
                  >
                    Voltar para últimos 7 dias
                  </button>
                )}
              </div>
            ) : (
              <DataTable 
                columns={columns} 
                data={pedidosFiltrados}
                onRowClick={openDetalhesModal}
              />
            )}
          </div>
        </div>

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
                    Pedido #{pedidoDetalhes?.numeroPedido || (pedidoDetalhes?.id ? pedidoDetalhes.id.slice(-6) : 'HIST')}
                  </h2>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}>
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
                      onMouseEnter={(e) => handleMouseEvent(e, '#f3f4f6')}
                      onMouseLeave={(e) => handleMouseEvent(e, 'transparent')}
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
                      onMouseEnter={(e) => handleMouseEvent(e, '#f3f4f6')}
                      onMouseLeave={(e) => handleMouseEvent(e, 'transparent')}
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
                          const mensagem = `Olá! Aqui está o resumo do seu pedido #${pedidoDetalhes?.id ? pedidoDetalhes.id.slice(-6) : 'HIST'}:\n\nCliente: ${pedidoDetalhes.cliente}\nTotal: ${pedidoDetalhes.valor}\nStatus: ${pedidoDetalhes.status}\nData: ${pedidoDetalhes.data}`
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
                      onMouseEnter={(e) => handleMouseEvent(e, '#f3f4f6')}
                      onMouseLeave={(e) => handleMouseEvent(e, 'transparent')}
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
                            <span style={{ 
                              fontSize: '14px', 
                              color: '#166534',
                              backgroundColor: '#dcfce7',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontWeight: '500'
                            }}>
                              Entregue
                            </span>
                          </div>
                          
                          <div style={{ width: 'calc(100% + 32px)', height: '1px', backgroundColor: '#e5e7eb', margin: '4px -16px' }}></div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                            <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151', minWidth: '80px' }}>Data:</span>
                            <span style={{ fontSize: '14px', color: '#6b7280' }}>{pedidoDetalhes.data || 'Não informado'}</span>
                          </div>
                          
                          <div style={{ width: 'calc(100% + 32px)', height: '1px', backgroundColor: '#e5e7eb', margin: '4px -16px' }}></div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                            <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151', minWidth: '80px' }}>Hora:</span>
                            <span style={{ fontSize: '14px', color: '#6b7280' }}>{pedidoDetalhes.hora || 'Não informado'}</span>
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
                              {/* LÓGICA DE EXIBIÇÃO DO PAGAMENTO COMPLETA */}
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
                                  return <span style={{ fontSize: '11px', color: '#6b7280' }}>{pedidoDetalhes.formaPagamento}</span>;
                                }
                                return pagamentos.map((p, idx) => (
                                  <span key={p.tipo} style={{ fontSize: '11px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
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
                            <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151', minWidth: '80px' }}>Telefone:</span>
                            <span style={{ fontSize: '14px', color: '#6b7280' }}>{pedidoDetalhes.telefone || 'Não informado'}</span>
                          </div>
                          
                          <div style={{ width: 'calc(100% + 32px)', height: '1px', backgroundColor: '#e5e7eb', margin: '4px -16px' }}></div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                            <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151', minWidth: '80px' }}>Origem:</span>
                            <span style={{ fontSize: '14px', color: '#6b7280' }}>
                              {pedidoDetalhes.origem === 'cardapio' ? 'Cardápio Digital' : 'PDV'}
                            </span>
                          </div>
                          
                          {pedidoDetalhes.observacao && (
                            <>
                              <div style={{ width: 'calc(100% + 32px)', height: '1px', backgroundColor: '#e5e7eb', margin: '4px -16px' }}></div>
                              
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '6px 0' }}>
                                <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151', minWidth: '80px' }}>Observação:</span>
                                <span style={{ fontSize: '14px', color: '#6b7280', wordBreak: 'break-word', lineHeight: '1.4' }}>
                                  {pedidoDetalhes.observacao}
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
                            {(() => {
                              const dadosCompletos = pedidoDetalhes.dadosCompletos || pedidoDetalhes;
                              const produtos = dadosCompletos.produtos || dadosCompletos.itens || pedidoDetalhes.produtos || pedidoDetalhes.itens || [];
                              return produtos.length;
                            })()} itens
                          </span>
                        </div>
                        
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                          {/* Renderização simplificada dos produtos */}
                          {(() => {
                            try {
                              const dadosCompletos = pedidoDetalhes.dadosCompletos || pedidoDetalhes;
                              let produtos = dadosCompletos.produtos || dadosCompletos.itens || pedidoDetalhes.produtos || pedidoDetalhes.itens || [];
                              
                              console.log('🔍 Produtos encontrados:', produtos);
                              
                              if (!produtos || produtos.length === 0) {
                                return (
                                  <div style={{ 
                                    padding: '16px',
                                    textAlign: 'center',
                                    color: '#6b7280',
                                    fontSize: '14px'
                                  }}>
                                    Produtos não disponíveis
                                  </div>
                                );
                              }
                              
                              return produtos.map((item: any, index: number) => {
                                const nome = item.nome || item.name || 'Produto';
                                const quantidade = item.quantidade || item.quantity || 1;
                                const preco = item.preco || item.price || 'R$ 0,00';
                                
                                return (
                                  <div key={index} style={{ 
                                    padding: '12px 16px',
                                    borderBottom: index < produtos.length - 1 ? '1px solid #f3f4f6' : 'none'
                                  }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', flex: '1', marginRight: '12px' }}>
                                        {quantidade}x {nome}
                                      </div>
                                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#542583', flexShrink: 0 }}>
                                        {preco}
                                      </div>
                                    </div>
                                  </div>
                                );
                              });
                            } catch (error) {
                              console.error('❌ Erro ao renderizar produtos:', error);
                              return (
                                <div style={{ 
                                  padding: '16px',
                                  textAlign: 'center',
                                  color: '#dc2626',
                                  fontSize: '14px'
                                }}>
                                  Erro ao carregar produtos
                                </div>
                              );
                            }
                          })()}
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
                              {(() => {
                                const dadosCompletos = pedidoDetalhes.dadosCompletos || pedidoDetalhes;
                                const produtos = dadosCompletos.produtos || dadosCompletos.itens || pedidoDetalhes.produtos || pedidoDetalhes.itens || [];
                                return produtos.length;
                              })()} itens
                            </span>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '14px', color: '#6b7280' }}>Subtotal:</span>
                              <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>{pedidoDetalhes.subtotal || pedidoDetalhes.valor}</span>
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
                              <span style={{ fontSize: '16px', fontWeight: '700', color: '#542583' }}>{pedidoDetalhes.valor}</span>
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
      </div>
    </ProtectedRoute>
  )
} 