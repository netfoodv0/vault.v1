'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { useHistoricoPedidos } from '@/hooks/useHistoricoPedidos'
import DateRangePicker from '@/components/ui/DateRangePicker'
import ReportSummary from '@/components/ui/ReportSummary'
import { DataTable, Toggle } from '@/components/ui/DataTable'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import ClientsTableSkeleton from '@/components/ui/ClientsTableSkeleton'
import ProductsTableSkeleton from '@/components/ui/ProductsTableSkeleton'
import DataTableRowsSkeleton from '@/components/ui/DataTableRowsSkeleton'

const DollarSignIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
);

const ReceiptIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"></path></svg>
);

const PackageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
);

const TruckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"></path><path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"></path><circle cx="7" cy="18" r="2"></circle><path d="M15 18H9"></path><circle cx="17" cy="18" r="2"></circle></svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);

const UserPlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <line x1="19" y1="8" x2="19" y2="14"></line>
    <line x1="22" y1="11" x2="16" y2="11"></line>
  </svg>
);

const UserCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <polyline points="16 11 18 13 22 9"></polyline>
  </svg>
);

const UserXIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <line x1="18" y1="8" x2="23" y2="13"></line>
    <line x1="23" y1="8" x2="18" y2="13"></line>
  </svg>
);

const PercentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
);

const WalletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
);

const CORES_PAGAMENTOS = ['#60A5FA', '#34D399', '#F472B6', '#FBBF24'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}) => {
  if (!cx || !cy || !midAngle || !innerRadius || !outerRadius || !percent) return null;
  
  const radius = outerRadius * 0.7;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontWeight="bold" fontSize={14}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Funções de filtro removidas - agora usando processamento otimizado com useMemo

// Dados mockados removidos - agora usando dados reais do histórico de pedidos

export default function RelatoriosPage() {
  const pathname = usePathname()
  const { signOut } = useAuth()
  
  // Hook para dados reais do histórico de pedidos
  const { historicoPedidos, loading: loadingHistorico, estatisticas: estatisticasHistorico } = useHistoricoPedidos()
  
  const [paginaAtiva, setPaginaAtiva] = useState('geral')
  const [visualizacaoGeral, setVisualizacaoGeral] = useState('pedidos_entregas');
  const [periodoPadrao, setPeriodoPadrao] = useState('mensal');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [subPaginaAtiva, setSubPaginaAtiva] = useState('pedidos');
  const [subPaginaClientes, setSubPaginaClientes] = useState('todos');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    new Date(new Date().setDate(new Date().getDate() - 7)), // 7 dias atrás
    new Date() // hoje
  ])
  
  // Estados para filtro de data - agora usando dateRange diretamente
  
  // Estados de loading para cada seção - agora usando loadingHistorico

  // Estados de paginação para cada tabela
  const [clientesExibidos, setClientesExibidos] = useState(8)
  const [produtosExibidos, setProdutosExibidos] = useState(8)

  // Estados de loading de paginação
  const [loadingPaginaClientes, setLoadingPaginaClientes] = useState(false)
  const [loadingPaginaProdutos, setLoadingPaginaProdutos] = useState(false)

  // Função para converter data brasileira (DD/MM/YYYY) para Date
  const converterDataBrasileira = (dataString: string): Date => {
    try {
      const [dia, mes, ano] = dataString.split('/').map(Number)
      return new Date(ano, mes - 1, dia)
    } catch (error) {
      console.error('Erro ao converter data:', dataString, error)
      return new Date(0)
    }
  }

  // Função para extrair valor numérico de string de preço
  const extrairValorNumerico = (valorString: string): number => {
    try {
      return parseFloat(valorString.replace('R$ ', '').replace(',', '.')) || 0
    } catch (error) {
      console.error('Erro ao extrair valor:', valorString, error)
      return 0
    }
  }

  // Processar dados reais do histórico com useMemo para otimização
  const pedidosFiltrados = useMemo(() => {
    if (!dateRange[0] || !dateRange[1]) return historicoPedidos

    const dataInicio = new Date(dateRange[0])
    const dataFim = new Date(dateRange[1])
    
    dataInicio.setHours(0, 0, 0, 0)
    dataFim.setHours(23, 59, 59, 999)

    return historicoPedidos.filter(pedido => {
      if (!pedido.data) return false
      const dataPedido = converterDataBrasileira(pedido.data)
      return dataPedido >= dataInicio && dataPedido <= dataFim
    })
  }, [historicoPedidos, dateRange])

  // Calcular estatísticas reais com useMemo
  const estatisticasReais = useMemo(() => {
    const valorTotal = pedidosFiltrados.reduce((total, pedido) => {
      return total + extrairValorNumerico(pedido.valor || 'R$ 0,00')
    }, 0)

    return {
      total: pedidosFiltrados.length,
      entregues: pedidosFiltrados.filter(p => p.status === 'Entregue').length,
      cancelados: pedidosFiltrados.filter(p => p.status === 'Cancelado').length,
      valorTotal,
      ticketMedio: pedidosFiltrados.length > 0 ? valorTotal / pedidosFiltrados.length : 0
    }
  }, [pedidosFiltrados])

  // Processar dados para gráficos com useMemo
  const { dadosMensais, dadosSemanais } = useMemo(() => {
    const dadosMensais = Array(12).fill(0).map((_, i) => ({
      name: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][i],
      pedidos: 0,
      valor: 0
    }))

    const dadosSemanais = Array(7).fill(0).map((_, i) => ({
      name: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i],
      pedidos: 0,
      valor: 0
    }))

    pedidosFiltrados.forEach(pedido => {
      if (!pedido.data) return
      
      const dataPedido = converterDataBrasileira(pedido.data)
      const mes = dataPedido.getMonth()
      const diaSemana = dataPedido.getDay()
      const valor = extrairValorNumerico(pedido.valor || 'R$ 0,00')

      dadosMensais[mes].pedidos++
      dadosMensais[mes].valor += valor
      dadosSemanais[diaSemana].pedidos++
      dadosSemanais[diaSemana].valor += valor
    })

    return { dadosMensais, dadosSemanais }
  }, [pedidosFiltrados])

  // Processar dados de pagamento com useMemo
  const { dadosPagamentosReais, totalPagamentosReais } = useMemo(() => {
    const pagamentos = {
      'Cartão de Crédito': 0,
      'PIX': 0,
      'Dinheiro': 0,
      'Cartão de Débito': 0
    }

    pedidosFiltrados.forEach(pedido => {
      const formaPagamento = pedido.formaPagamento || 'Não informado'
      const valor = extrairValorNumerico(pedido.valor || 'R$ 0,00')
      
      if (formaPagamento.includes('Crédito') || formaPagamento.includes('credito')) {
        pagamentos['Cartão de Crédito'] += valor
      } else if (formaPagamento.includes('PIX') || formaPagamento.includes('pix')) {
        pagamentos['PIX'] += valor
      } else if (formaPagamento.includes('Dinheiro') || formaPagamento.includes('dinheiro')) {
        pagamentos['Dinheiro'] += valor
      } else if (formaPagamento.includes('Débito') || formaPagamento.includes('debito')) {
        pagamentos['Cartão de Débito'] += valor
      }
    })

    const dadosPagamentos = Object.entries(pagamentos).map(([name, value]) => ({ name, value }))
    const total = dadosPagamentos.reduce((acc, entry) => acc + entry.value, 0)

    return { dadosPagamentosReais: dadosPagamentos, totalPagamentosReais: total }
  }, [pedidosFiltrados])

  // Processar dados para tabelas com useMemo
  const { dadosClientes, dadosProdutos, estatisticasProdutos, estatisticasClientes } = useMemo(() => {


    // Dados de clientes (agrupados por cliente)
    const clientesMap = new Map()
    pedidosFiltrados.forEach(pedido => {
      const clienteNome = pedido.cliente || 'Cliente não informado'
      if (!clientesMap.has(clienteNome)) {
        clientesMap.set(clienteNome, {
          id: clienteNome,
          nome: clienteNome,
          whatsapp: pedido.telefone || '',
          ultimoPedido: pedido.data || '',
          totalPedidos: 0,
          valorTotal: 0,
          status: 'Ativo',
          tipo: 'ativo'
        })
      }
      
      const cliente = clientesMap.get(clienteNome)
      cliente.totalPedidos++
      cliente.valorTotal += extrairValorNumerico(pedido.valor || 'R$ 0,00')
      
      // Atualizar último pedido se for mais recente
      if (pedido.data) {
        const dataPedido = converterDataBrasileira(pedido.data)
        const dataUltimo = converterDataBrasileira(cliente.ultimoPedido)
        if (dataPedido > dataUltimo) {
          cliente.ultimoPedido = pedido.data
        }
      }
    })

    const dadosClientes = Array.from(clientesMap.values())

    // Calcular estatísticas específicas dos clientes
    const faturamentoClientes = dadosClientes.reduce((total, cliente) => {
      return total + cliente.valorTotal
    }, 0)

    const totalPedidosClientes = dadosClientes.reduce((total, cliente) => {
      return total + cliente.totalPedidos
    }, 0)

    const ticketMedioClientes = totalPedidosClientes > 0 ? faturamentoClientes / totalPedidosClientes : 0

    // Classificar clientes por categoria
    const hoje = new Date()
    const trintaDiasAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000)
    const quinzeDiasAtras = new Date(hoje.getTime() - 15 * 24 * 60 * 60 * 1000)
    
    const clientesPotencial = dadosClientes.filter(cliente => {
      // Cliente em potencial: 1 pedido nos últimos 30 dias
      if (cliente.totalPedidos !== 1) return false
      if (!cliente.ultimoPedido) return false
      
      const dataUltimoPedido = converterDataBrasileira(cliente.ultimoPedido)
      return dataUltimoPedido >= trintaDiasAtras
    })
    
    const clientesAtivos = dadosClientes.filter(cliente => {
      // Cliente ativo: 2+ pedidos, último há menos de 15 dias
      if (cliente.totalPedidos < 2) return false
      if (!cliente.ultimoPedido) return false
      
      const dataUltimoPedido = converterDataBrasileira(cliente.ultimoPedido)
      return dataUltimoPedido >= quinzeDiasAtras
    })
    
    const clientesInativos = dadosClientes.filter(cliente => {
      // Cliente inativo: último pedido há mais de 30 dias
      if (!cliente.ultimoPedido) return true
      
      const dataUltimoPedido = converterDataBrasileira(cliente.ultimoPedido)
      return dataUltimoPedido < trintaDiasAtras
    })

    const estatisticasClientes = {
      faturamento: faturamentoClientes,
      ticketMedio: ticketMedioClientes,
      totalPedidos: totalPedidosClientes,
      clientesAtivos: clientesAtivos.length,
      clientesInativos: clientesInativos.length,
      clientesPotencial: clientesPotencial.length
    }

    // Dados de produtos (agrupados por produto)
    const produtosMap = new Map()
    pedidosFiltrados.forEach(pedido => {
      const produtos = pedido.itens || pedido.produtos || []
      produtos.forEach((item: any) => {
        const nomeProduto = item.nome || item.name || 'Produto'
        if (!produtosMap.has(nomeProduto)) {
          produtosMap.set(nomeProduto, {
            id: nomeProduto,
            produto: nomeProduto,
            categoria: 'Geral',
            quantidadeVendida: 0,
            valorUnitario: item.preco || item.price || 'R$ 0,00',
            faturamentoTotal: 0,
            ultimaVenda: pedido.data || '',
            status: 'Disponível'
          })
        }
        
        const produto = produtosMap.get(nomeProduto)
        produto.quantidadeVendida += item.quantidade || item.quantity || 1
        const valorUnitario = extrairValorNumerico(item.preco || item.price || 'R$ 0,00')
        produto.faturamentoTotal += valorUnitario * (item.quantidade || item.quantity || 1)
        
        // Atualizar última venda se for mais recente
        if (pedido.data) {
          const dataPedido = converterDataBrasileira(pedido.data)
          const dataUltima = converterDataBrasileira(produto.ultimaVenda)
          if (dataPedido > dataUltima) {
            produto.ultimaVenda = pedido.data
          }
        }
      })
    })

    const dadosProdutos = Array.from(produtosMap.values()).map(produto => ({
      ...produto,
      faturamentoTotal: `R$ ${produto.faturamentoTotal.toFixed(2).replace('.', ',')}`
    }))



    // Calcular estatísticas específicas dos produtos
    const faturamentoProdutos = dadosProdutos.reduce((total, produto) => {
      return total + extrairValorNumerico(produto.faturamentoTotal)
    }, 0)

    const ticketMedioProdutos = dadosProdutos.length > 0 ? faturamentoProdutos / dadosProdutos.length : 0

    const estatisticasProdutos = {
      faturamento: faturamentoProdutos,
      ticketMedio: ticketMedioProdutos,
      totalProdutos: dadosProdutos.length
    }

    return { dadosClientes, dadosProdutos, estatisticasProdutos, estatisticasClientes }
  }, [pedidosFiltrados])

  // Funções de carregamento simuladas removidas - agora usando dados reais do histórico

  // Resetar paginação quando mudar filtros
  useEffect(() => {
    setClientesExibidos(8)
    setProdutosExibidos(8)
  }, [dateRange, subPaginaClientes])

  // Verificar se há dados para exibir
  const temDados = pedidosFiltrados.length > 0

  // Filtrar clientes baseado na categoria selecionada
  const clientesFiltrados = useMemo(() => {
    const hoje = new Date()
    const trintaDiasAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000)
    const quinzeDiasAtras = new Date(hoje.getTime() - 15 * 24 * 60 * 60 * 1000)
    
    switch (subPaginaClientes) {
      case 'todos':
        return dadosClientes
      case 'potencial':
        return dadosClientes.filter(cliente => {
          // Cliente em potencial: 1 pedido nos últimos 30 dias
          if (cliente.totalPedidos !== 1) return false
          if (!cliente.ultimoPedido) return false
          
          const dataUltimoPedido = converterDataBrasileira(cliente.ultimoPedido)
          return dataUltimoPedido >= trintaDiasAtras
        })
      case 'inativos':
        return dadosClientes.filter(cliente => {
          // Cliente inativo: último pedido há mais de 30 dias
          if (!cliente.ultimoPedido) return true
          
          const dataUltimoPedido = converterDataBrasileira(cliente.ultimoPedido)
          return dataUltimoPedido < trintaDiasAtras
        })
      case 'ativos':
        return dadosClientes.filter(cliente => {
          // Cliente ativo: 2+ pedidos, último há menos de 15 dias
          if (cliente.totalPedidos < 2) return false
          if (!cliente.ultimoPedido) return false
          
          const dataUltimoPedido = converterDataBrasileira(cliente.ultimoPedido)
          return dataUltimoPedido >= quinzeDiasAtras
        })
      default:
        return dadosClientes
    }
  }, [dadosClientes, subPaginaClientes])

  // Funções para carregar mais itens
  const carregarMaisClientes = async () => {
    setLoadingPaginaClientes(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    setClientesExibidos(prev => prev + 8)
    setLoadingPaginaClientes(false)
  }

  const carregarMaisProdutos = async () => {
    setLoadingPaginaProdutos(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    setProdutosExibidos(prev => prev + 8)
    setLoadingPaginaProdutos(false)
  }

  useEffect(() => {
    if (pathname !== '/relatorios') return;
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setPaginaAtiva(hash);
    }
  }, [pathname]);

  useEffect(() => {
    if (pathname !== '/relatorios') return;
    const onHashChange = () => {
      setPaginaAtiva(window.location.hash.replace('#', ''));
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [pathname]);

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: '#ececec' }}>

        {/* Conteúdo principal */}
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
              {/* Linha de botões */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setPaginaAtiva('geral');
                    window.location.hash = '#geral';
                  }}
                  style={{
                    background: paginaAtiva === 'geral' ? '#542583' : 'transparent',
                    color: paginaAtiva === 'geral' ? 'white' : '#374151',
                    border: paginaAtiva === 'geral' ? '1px solid #542583' : '1px solid #d1d5db',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    height: '40px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (paginaAtiva !== 'geral') {
                      (e.target as HTMLElement).style.backgroundColor = '#f9fafb'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (paginaAtiva !== 'geral') {
                      (e.target as HTMLElement).style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  Geral
                </button>


                
                <button
                  onClick={() => {
                    setPaginaAtiva('clientes');
                    window.location.hash = '#clientes';
                  }}
                  style={{
                    background: paginaAtiva === 'clientes' ? '#542583' : 'transparent',
                    color: paginaAtiva === 'clientes' ? 'white' : '#374151',
                    border: paginaAtiva === 'clientes' ? '1px solid #542583' : '1px solid #d1d5db',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    height: '40px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (paginaAtiva !== 'clientes') {
                      (e.target as HTMLElement).style.backgroundColor = '#f9fafb'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (paginaAtiva !== 'clientes') {
                      (e.target as HTMLElement).style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  Clientes
                </button>
                
                <button
                  onClick={() => {
                    setPaginaAtiva('produtos');
                    window.location.hash = '#produtos';
                  }}
                  style={{
                    background: paginaAtiva === 'produtos' ? '#542583' : 'transparent',
                    color: paginaAtiva === 'produtos' ? 'white' : '#374151',
                    border: paginaAtiva === 'produtos' ? '1px solid #542583' : '1px solid #d1d5db',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    height: '40px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (paginaAtiva !== 'produtos') {
                      (e.target as HTMLElement).style.backgroundColor = '#f9fafb'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (paginaAtiva !== 'produtos') {
                      (e.target as HTMLElement).style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  Produtos
                </button>
                

              </div>
            </div>
            
            {/* Conteúdo da página selecionada */}
            <div 
              className="bg-white p-6"
              style={{ 
                borderRadius: '0 8px 8px 8px',
                minHeight: '500px'
              }}
            >
              {loadingHistorico && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="text-gray-500 mb-2">Carregando dados...</div>
                    <div className="text-sm text-gray-400">Aguarde enquanto buscamos as informações</div>
                  </div>
                </div>
              )}
              
              {!loadingHistorico && !temDados && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="text-gray-500 mb-2">
                      {dateRange[0] && dateRange[1] 
                        ? `Nenhum pedido encontrado no período selecionado`
                        : 'Nenhum pedido encontrado no histórico'
                      }
                    </div>
                    <div className="text-sm text-gray-400">
                      {dateRange[0] && dateRange[1] 
                        ? `Tente selecionar um período diferente`
                        : 'Os pedidos aparecerão aqui quando forem realizados'
                      }
                    </div>
                  </div>
                </div>
              )}
              
              {!loadingHistorico && temDados && (
                <>
              {paginaAtiva === 'geral' && (
                <div id="geral">
                  <h2 className="text-xl font-semibold mb-4">Relatório Geral</h2>
                  <DateRangePicker 
                    initialDateRange={dateRange}
                    onDateRangeChange={setDateRange}
                    showTodayButton={true}
                  />
                  <div className="mt-6">
                    <ReportSummary
                      title=""
                      data={[
                        { 
                          label: 'Faturamento', 
                          value: `R$ ${estatisticasReais.valorTotal.toFixed(2).replace('.', ',')}`, 
                          icon: <DollarSignIcon /> 
                        },
                        { 
                          label: 'Ticket médio', 
                          value: `R$ ${estatisticasReais.ticketMedio.toFixed(2).replace('.', ',')}`, 
                          icon: <ReceiptIcon /> 
                        },
                        { 
                          label: 'Total de pedidos', 
                          value: estatisticasReais.total, 
                          icon: <PackageIcon /> 
                        },
                      ]}
                    />

                    <div className="flex gap-4 items-center">
                      <button
                        onClick={() => setVisualizacaoGeral('pedidos_entregas')}
                        style={{
                          background: visualizacaoGeral === 'pedidos_entregas' ? '#542583' : 'transparent',
                          color: visualizacaoGeral === 'pedidos_entregas' ? 'white' : '#374151',
                          border: visualizacaoGeral === 'pedidos_entregas' ? '1px solid #542583' : '1px solid #d1d5db',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          height: '40px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (visualizacaoGeral !== 'pedidos_entregas') {
                            (e.target as HTMLElement).style.backgroundColor = '#f9fafb'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (visualizacaoGeral !== 'pedidos_entregas') {
                            (e.target as HTMLElement).style.backgroundColor = 'transparent'
                          }
                        }}
                      >
                        Pedidos e Entregas
                      </button>

                      <button
                        onClick={() => setVisualizacaoGeral('faturamento')}
                        style={{
                          background: visualizacaoGeral === 'faturamento' ? '#542583' : 'transparent',
                          color: visualizacaoGeral === 'faturamento' ? 'white' : '#374151',
                          border: visualizacaoGeral === 'faturamento' ? '1px solid #542583' : '1px solid #d1d5db',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          height: '40px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (visualizacaoGeral !== 'faturamento') {
                            (e.target as HTMLElement).style.backgroundColor = '#f9fafb'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (visualizacaoGeral !== 'faturamento') {
                            (e.target as HTMLElement).style.backgroundColor = 'transparent'
                          }
                        }}
                      >
                        Faturamento
                      </button>

                      <button
                        onClick={() => setVisualizacaoGeral('formas_pagamento')}
                        style={{
                          background: visualizacaoGeral === 'formas_pagamento' ? '#542583' : 'transparent',
                          color: visualizacaoGeral === 'formas_pagamento' ? 'white' : '#374151',
                          border: visualizacaoGeral === 'formas_pagamento' ? '1px solid #542583' : '1px solid #d1d5db',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          height: '40px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (visualizacaoGeral !== 'formas_pagamento') {
                            (e.target as HTMLElement).style.backgroundColor = '#f9fafb'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (visualizacaoGeral !== 'formas_pagamento') {
                            (e.target as HTMLElement).style.backgroundColor = 'transparent'
                          }
                        }}
                      >
                        Formas de pagamento
                      </button>

                      <div className="relative ml-auto">
                        <button
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          style={{
                            width: '140px',
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
                          onMouseEnter={(e) => {
                            (e.target as HTMLElement).style.borderColor = '#542583';
                          }}
                          onMouseLeave={(e) => {
                            (e.target as HTMLElement).style.borderColor = '#d1d5db';
                          }}
                        >
                          <span>{periodoPadrao === 'mensal' ? 'Mensal' : 'Semanal'}</span>
                          <svg 
                            width="20" 
                            height="20" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            style={{
                              transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                              transition: 'transform 0.2s'
                            }}
                          >
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </button>

                        {isDropdownOpen && (
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
                              zIndex: 10
                            }}
                          >
                            <button
                              onClick={() => {
                                setPeriodoPadrao('mensal');
                                setIsDropdownOpen(false);
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                fontSize: '14px',
                                color: periodoPadrao === 'mensal' ? '#542583' : '#374151',
                                background: periodoPadrao === 'mensal' ? '#f3e8ff' : 'transparent',
                                border: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'background-color 0.15s'
                              }}
                              onMouseEnter={(e) => {
                                if (periodoPadrao !== 'mensal') {
                                  (e.target as HTMLElement).style.backgroundColor = '#f9fafb';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (periodoPadrao !== 'mensal') {
                                  (e.target as HTMLElement).style.backgroundColor = 'transparent';
                                }
                              }}
                            >
                              Mensal
                            </button>
                            <button
                              onClick={() => {
                                setPeriodoPadrao('semanal');
                                setIsDropdownOpen(false);
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                fontSize: '14px',
                                color: periodoPadrao === 'semanal' ? '#542583' : '#374151',
                                background: periodoPadrao === 'semanal' ? '#f3e8ff' : 'transparent',
                                border: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'background-color 0.15s'
                              }}
                              onMouseEnter={(e) => {
                                if (periodoPadrao !== 'semanal') {
                                  (e.target as HTMLElement).style.backgroundColor = '#f9fafb';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (periodoPadrao !== 'semanal') {
                                  (e.target as HTMLElement).style.backgroundColor = 'transparent';
                                }
                              }}
                            >
                              Semanal
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {visualizacaoGeral === 'pedidos_entregas' && (
                      <div className="mt-6">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                          <h4 className="text-lg font-medium mb-4 text-gray-600">Volume de Pedidos por {periodoPadrao === 'mensal' ? 'Mês' : 'Dia da Semana'}</h4>
                          <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                              <BarChart 
                                data={periodoPadrao === 'mensal' ? dadosMensais : dadosSemanais} 
                                margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis 
                                  dataKey="name" 
                                  axisLine={false}
                                  tickLine={false}
                                  tick={{ fill: '#6B7280', fontSize: 12 }}
                                />
                                <YAxis 
                                  axisLine={false}
                                  tickLine={false}
                                  tick={{ fill: '#6B7280', fontSize: 12 }}
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    background: 'white',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '6px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                  }}
                                />
                                <Bar 
                                  dataKey="pedidos" 
                                  fill="#60A5FA" 
                                  radius={[4, 4, 0, 0]}
                                  maxBarSize={50}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {visualizacaoGeral === 'faturamento' && (
                      <div className="mt-6">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                          <h4 className="text-lg font-medium mb-4 text-gray-600">Faturamento por {periodoPadrao === 'mensal' ? 'Mês' : 'Dia da Semana'}</h4>
                          <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                              <LineChart 
                                data={periodoPadrao === 'mensal' ? dadosMensais : dadosSemanais} 
                                margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis 
                                  dataKey="name" 
                                  axisLine={false}
                                  tickLine={false}
                                  tick={{ fill: '#6B7280', fontSize: 12 }}
                                />
                                <YAxis 
                                  axisLine={false}
                                  tickLine={false}
                                  tick={{ fill: '#6B7280', fontSize: 12 }}
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    background: 'white',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '6px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                  }}
                                  formatter={(value) => [`R$ ${value},00`, 'Faturamento']}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="valor" 
                                  stroke="#542583" 
                                  strokeWidth={2}
                                  dot={{ fill: '#542583', strokeWidth: 2 }}
                                  activeDot={{ r: 6 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {visualizacaoGeral === 'formas_pagamento' && (
                      <div className="mt-6">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                          <h4 className="text-lg font-medium mb-4">Distribuição por Forma de Pagamento</h4>
                          <div style={{ width: '100%', height: 300 }} className="flex items-center justify-between">
                            <div style={{ width: '50%', height: '100%' }}>
                              <ResponsiveContainer>
                                <PieChart>
                                  <Pie
                                    data={dadosPagamentosReais}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    dataKey="value"
                                    isAnimationActive={true}
                                  >
                                    {dadosPagamentosReais.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={CORES_PAGAMENTOS[index % CORES_PAGAMENTOS.length]} />
                                    ))}
                                  </Pie>
                                  <Tooltip 
                                    contentStyle={{ 
                                      background: 'white',
                                      border: '1px solid #E5E7EB',
                                      borderRadius: '6px',
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                    formatter={(value: any, name: any) => {
                                        const percentage = ((Number(value) / totalPagamentos) * 100).toFixed(1);
                                        return [`R$ ${Number(value).toFixed(2)} (${percentage}%)`, name];
                                    }}
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="flex flex-col gap-4 w-1/2 pl-8">
                              {dadosPagamentosReais.map((entry, index) => {
                                const percentage = ((entry.value / totalPagamentosReais) * 100).toFixed(1);
                                return (
                                  <div key={entry.name} className="flex flex-col">
                                    <div className="flex items-center mb-1">
                                      <div 
                                        className="w-3 h-3 rounded-full mr-2 flex-shrink-0" 
                                        style={{ backgroundColor: CORES_PAGAMENTOS[index] }}
                                      />
                                      <span className="text-sm text-gray-600">{entry.name}</span>
                                    </div>
                                    <div className="ml-5">
                                      <span className="text-lg font-semibold text-gray-800">{`R$ ${entry.value.toFixed(2)}`}</span>
                                      <span className="text-sm text-gray-500 ml-2">{`${percentage}%`}</span>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}



              {paginaAtiva === 'clientes' && (
                <div id="clientes">
                  <h2 className="text-xl font-semibold mb-4">Relatório de Vendas</h2>
                  
                  {/* Seletor de Data */}
                  <div className="flex items-center gap-4">
                    <DateRangePicker 
                      initialDateRange={dateRange}
                      onDateRangeChange={setDateRange}
                      showTodayButton={true}
                    />
                  </div>

                  {/* Cards de Métricas */}
                  <div className="mt-6">
                    <ReportSummary
                      title=""
                      data={[
                        { 
                          label: (
                            <div className="flex items-center gap-2">
                              <span>Clientes em Potencial</span>
                              <div className="relative group">
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  width="16" 
                                  height="16" 
                                  viewBox="0 0 24 24" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                  className="text-gray-400 cursor-help"
                                >
                                  <circle cx="12" cy="12" r="10"/>
                                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                                  <path d="M12 17h.01"/>
                                </svg>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                  1 pedido nos últimos 30 dias
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                </div>
                              </div>
                            </div>
                          ), 
                          value: estatisticasClientes.clientesPotencial, 
                          icon: <UserPlusIcon /> 
                        },
                        { 
                          label: (
                            <div className="flex items-center gap-2">
                              <span>Clientes Inativos</span>
                              <div className="relative group">
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  width="16" 
                                  height="16" 
                                  viewBox="0 0 24 24" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                  className="text-gray-400 cursor-help"
                                >
                                  <circle cx="12" cy="12" r="10"/>
                                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                                  <path d="M12 17h.01"/>
                                </svg>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                  Último pedido há mais de 30 dias
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                </div>
                              </div>
                            </div>
                          ), 
                          value: estatisticasClientes.clientesInativos, 
                          icon: <UserXIcon /> 
                        },
                        { 
                          label: (
                            <div className="flex items-center gap-2">
                              <span>Clientes Ativos</span>
                              <div className="relative group">
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  width="16" 
                                  height="16" 
                                  viewBox="0 0 24 24" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                  className="text-gray-400 cursor-help"
                                >
                                  <circle cx="12" cy="12" r="10"/>
                                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                                  <path d="M12 17h.01"/>
                                </svg>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                  2+ pedidos, último há menos de 15 dias
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                </div>
                              </div>
                            </div>
                          ), 
                          value: estatisticasClientes.clientesAtivos, 
                          icon: <UserCheckIcon /> 
                        },
                      ]}
                    />
                  </div>

                  {/* Título e Navegação de Clientes */}
                  
                  <div className="flex gap-4 mt-3">
                    <button
                      className={`h-[40px] px-6 rounded-md font-medium text-[14px] border border-gray-300 ${
                        subPaginaClientes === 'todos'
                          ? 'bg-[#542583] text-white'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                      onClick={() => setSubPaginaClientes('todos')}
                    >
                      Todos
                    </button>
                    <button
                      className={`h-[40px] px-6 rounded-md font-medium text-[14px] border border-gray-300 ${
                        subPaginaClientes === 'potencial'
                          ? 'bg-[#542583] text-white'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                      onClick={() => setSubPaginaClientes('potencial')}
                    >
                      Clientes em potencial
                    </button>
                    <button
                      className={`h-[40px] px-6 rounded-md font-medium text-[14px] border border-gray-300 ${
                        subPaginaClientes === 'inativos'
                          ? 'bg-[#542583] text-white'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                      onClick={() => setSubPaginaClientes('inativos')}
                    >
                      Clientes Inativos
                    </button>
                    <button
                      className={`h-[40px] px-6 rounded-md font-medium text-[14px] border border-gray-300 ${
                        subPaginaClientes === 'ativos'
                          ? 'bg-[#542583] text-white'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                      onClick={() => setSubPaginaClientes('ativos')}
                    >
                      Clientes Ativos
                    </button>
                  </div>

                  {/* Tabela de Clientes */}
                  <div className="mt-6">
                    {loadingHistorico ? (
                      <ClientsTableSkeleton rows={5} />
                    ) : (
                      <>
                        <DataTable
                          columns={[
                            { 
                              header: 'Nome', 
                              field: 'nome',
                              align: 'left'
                            },
                            { 
                              header: 'WhatsApp', 
                              field: 'whatsapp',
                              align: 'center'
                            },
                            { 
                              header: 'Último Pedido', 
                              field: 'ultimoPedido',
                              align: 'center',
                              render: (item) => (
                                <span>{item.ultimoPedido || 'Nunca pediu'}</span>
                              )
                            },
                            { 
                              header: 'Total de Pedidos', 
                              field: 'totalPedidos',
                              align: 'center'
                            },
                            { 
                              header: 'Valor Total', 
                              field: 'valorTotal',
                              align: 'center',
                              render: (item) => (
                                <span>R$ {item.valorTotal.toFixed(2).replace('.', ',')}</span>
                              )
                            },
                            { 
                              header: 'Status', 
                              field: 'status',
                              align: 'center',
                              render: (item) => (
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px'
                                }}>
                                  <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: 
                                      item.status === 'Ativo' ? '#10B981' : 
                                      item.status === 'Inativo' ? '#EF4444' : 
                                      '#FCD34D' // amarelo para potencial
                                  }} />
                                  <span>{item.status}</span>
                                </div>
                              )
                            },
                            {
                              header: 'Ações',
                              field: 'actions',
                              align: 'center',
                              render: (item) => (
                                <div style={{ 
                                  display: 'flex', 
                                  justifyContent: 'center',
                                  gap: '12px'
                                }}>
                                  {/* Botão Visualizar */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      console.log('Visualizar cliente:', item.id);
                                    }}
                                    style={{
                                      backgroundColor: 'transparent',
                                      border: 'none',
                                      padding: '4px',
                                      cursor: 'pointer',
                                      color: '#6b7280'
                                    }}
                                    title="Visualizar cliente"
                                  >
                                    <svg 
                                      xmlns="http://www.w3.org/2000/svg" 
                                      height="20px" 
                                      viewBox="0 -960 960 960" 
                                      width="20px" 
                                      fill="currentColor"
                                    >
                                      <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Z"/>
                                    </svg>
                                  </button>

                                  {/* Botão WhatsApp */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const phone = item.whatsapp.replace(/\D/g, '');
                                      window.open(`https://wa.me/${phone}`, '_blank');
                                    }}
                                    style={{
                                      backgroundColor: 'transparent',
                                      border: 'none',
                                      padding: '4px',
                                      cursor: 'pointer',
                                      color: '#25D366'
                                    }}
                                    title="Enviar WhatsApp"
                                  >
                                    <svg 
                                      xmlns="http://www.w3.org/2000/svg" 
                                      height="20px" 
                                      viewBox="0 0 24 24" 
                                      width="20px" 
                                      fill="currentColor"
                                    >
                                      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7 8.5 7 9.71C7 10.93 7.89 12.1 8 12.27C8.14 12.44 9.76 14.94 12.25 16C12.84 16.27 13.3 16.42 13.66 16.53C14.25 16.72 14.79 16.69 15.22 16.63C15.7 16.56 16.68 16.03 16.89 15.45C17.1 14.87 17.1 14.38 17.04 14.27C16.97 14.17 16.81 14.11 16.56 14C16.31 13.86 15.09 13.26 14.87 13.18C14.64 13.1 14.5 13.06 14.31 13.3C14.15 13.55 13.67 14.11 13.53 14.27C13.38 14.44 13.24 14.46 13 14.34C12.74 14.21 11.94 13.95 11 13.11C10.26 12.45 9.77 11.64 9.62 11.39C9.5 11.15 9.61 11 9.73 10.89C9.84 10.78 10 10.6 10.1 10.45C10.23 10.31 10.27 10.2 10.35 10.04C10.43 9.87 10.39 9.73 10.33 9.61C10.27 9.5 9.77 8.26 9.56 7.77C9.36 7.29 9.16 7.35 9 7.34C8.86 7.34 8.7 7.33 8.53 7.33Z"/>
                                    </svg>
                                  </button>
                                </div>
                              )
                            }
                          ]}
                          data={clientesFiltrados.slice(0, clientesExibidos)}
                          onRowClick={(item) => console.log('Clicou no cliente:', item)}
                        />
                        
                        {/* Loading de paginação */}
                        {loadingPaginaClientes && (
                          <DataTableRowsSkeleton rows={8} columns={7} />
                        )}
                        
                        {/* Botão Carregar Mais */}
                        {clientesExibidos < clientesFiltrados.length && !loadingPaginaClientes && (
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            marginTop: '24px' 
                          }}>
                            <button
                              onClick={carregarMaisClientes}
                              style={{
                                background: '#542583',
                                color: 'white',
                                border: '1px solid #542583',
                                padding: '12px 24px',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}
                              onMouseEnter={(e) => {
                                (e.target as HTMLElement).style.backgroundColor = '#7209bd'
                              }}
                              onMouseLeave={(e) => {
                                (e.target as HTMLElement).style.backgroundColor = '#542583'
                              }}
                                                          >
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  height="16px" 
                                  viewBox="0 -960 960 960" 
                                  width="16px" 
                                  fill="currentColor"
                                >
                                  <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z"/>
                                </svg>
                                Carregar Mais Clientes
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {paginaAtiva === 'produtos' && (
                <div id="produtos">
                  <h2 className="text-xl font-semibold mb-4">Relatório de Produtos</h2>
                  <DateRangePicker 
                    initialDateRange={dateRange}
                    onDateRangeChange={setDateRange}
                    showTodayButton={true}
                  />
                  <div className="mt-6">
                    <ReportSummary
                      title=""
                      data={[
                        { 
                          label: 'Faturamento', 
                          value: `R$ ${estatisticasProdutos.faturamento.toFixed(2).replace('.', ',')}`, 
                          icon: <DollarSignIcon /> 
                        },
                        { 
                          label: 'Ticket médio', 
                          value: `R$ ${estatisticasProdutos.ticketMedio.toFixed(2).replace('.', ',')}`, 
                          icon: <ReceiptIcon /> 
                        },
                        { 
                          label: 'Total de produtos', 
                          value: estatisticasProdutos.totalProdutos, 
                          icon: <PackageIcon /> 
                        },
                      ]}
                    />

                    
                    {/* Tabela de Produtos */}
                    <div className="mt-6">
                      {loadingHistorico ? (
                        <ProductsTableSkeleton rows={5} />
                      ) : (
                        <>
                          <DataTable
                            columns={[
                              { 
                                header: 'Produto', 
                                field: 'produto',
                                align: 'left'
                              },
                              { 
                                header: 'Categoria', 
                                field: 'categoria',
                                align: 'center'
                              },
                              { 
                                header: 'Qtd. Vendida', 
                                field: 'quantidadeVendida',
                                align: 'center'
                              },
                              { 
                                header: 'Valor Unit.', 
                                field: 'valorUnitario',
                                align: 'center'
                              },
                              { 
                                header: 'Faturamento', 
                                field: 'faturamentoTotal',
                                align: 'center'
                              },
                              { 
                                header: 'Última Venda', 
                                field: 'ultimaVenda',
                                align: 'center'
                              },
                              { 
                                header: 'Status', 
                                field: 'status',
                                align: 'center',
                                render: (item) => (
                                  <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px'
                                  }}>
                                    <div style={{
                                      width: '8px',
                                      height: '8px',
                                      borderRadius: '50%',
                                      backgroundColor: item.status === 'Disponível' ? '#10B981' : '#EF4444'
                                    }} />
                                    <span>{item.status}</span>
                                  </div>
                                )
                              },
                              {
                                header: 'Ações',
                                field: 'actions',
                                align: 'center',
                                render: (item) => (
                                  <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'center',
                                    gap: '12px'
                                  }}>
                                    {/* Botão Visualizar */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        console.log('Visualizar detalhes:', item.id);
                                      }}
                                      style={{
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        padding: '4px',
                                        cursor: 'pointer',
                                        color: '#6b7280'
                                      }}
                                      title="Visualizar detalhes"
                                    >
                                      <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        height="20px" 
                                        viewBox="0 -960 960 960" 
                                        width="20px" 
                                        fill="currentColor"
                                      >
                                        <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Z"/>
                                      </svg>
                                    </button>

                                    {/* Botão Editar */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        console.log('Editar produto:', item.id);
                                      }}
                                      style={{
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        padding: '4px',
                                        cursor: 'pointer',
                                        color: '#6b7280'
                                      }}
                                      title="Editar produto"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                                        <path d="M360-600v-80h360v80H360Zm0 120v-80h360v80H360ZM560-80v-123l221-220q9-9 20-13t22-4q12 0 23 4.5t20 13.5l37 37q8 9 12.5 20t4.5 22q0 11-4 22.5T903-300L683-80H560Zm263-224 37-39-37-37-38 38 38 38ZM240-80q-50 0-85-35t-35-85v-120h120v-560h600v361q-20-2-40.5 1.5T760-505v-295H320v480h240l-80 80v160H240Z"/>
                                      </svg>
                                    </button>
                                  </div>
                                )
                              }
                            ]}
                            data={dadosProdutos.slice(0, produtosExibidos)}
                            onRowClick={(item) => console.log('Clicou no produto:', item)}
                          />
                          
                          {/* Loading de paginação */}
                          {loadingPaginaProdutos && (
                            <DataTableRowsSkeleton rows={8} columns={8} />
                          )}
                          
                          {/* Botão Carregar Mais */}
                          {produtosExibidos < dadosProdutos.length && !loadingPaginaProdutos && (
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'center', 
                              marginTop: '24px' 
                            }}>
                              <button
                                onClick={carregarMaisProdutos}
                                style={{
                                  background: '#542583',
                                  color: 'white',
                                  border: '1px solid #542583',
                                  padding: '12px 24px',
                                  borderRadius: '6px',
                                  fontSize: '14px',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px'
                                }}
                                onMouseEnter={(e) => {
                                  (e.target as HTMLElement).style.backgroundColor = '#7209bd'
                                }}
                                onMouseLeave={(e) => {
                                  (e.target as HTMLElement).style.backgroundColor = '#542583'
                                }}
                              >
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  height="16px" 
                                  viewBox="0 -960 960 960" 
                                  width="16px" 
                                  fill="currentColor"
                                >
                                  <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z"/>
                                </svg>
                                Carregar Mais Produtos
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}


                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
