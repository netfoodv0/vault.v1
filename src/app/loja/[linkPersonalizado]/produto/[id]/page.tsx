'use client'

import { useParams, useRouter } from 'next/navigation'
import { useLojaCache } from '@/contexts/LojaCacheContext'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { ErrorPage } from '@/components/ui'

export default function ProdutoPage() {
  const params = useParams()
  const linkPersonalizado = params.linkPersonalizado as string
  const produtoId = params.id as string
  const router = useRouter()
  
  // Hook para cache da loja
  const { getLojaData, preloadLojaData, saveScrollPosition, retryLoad } = useLojaCache()
  const { loja, produtos, loading: loadingDados, error: errorDados, retryCount } = getLojaData(linkPersonalizado)
  const [quantidade, setQuantidade] = useState(1)
  const [currentSection, setCurrentSection] = useState('Produto')
  const [isRetrying, setIsRetrying] = useState(false)
  
  // Refs para as seções
  const produtoRef = useRef<HTMLDivElement>(null)
  const adicionais1Ref = useRef<HTMLDivElement>(null)
  const adicionais2Ref = useRef<HTMLDivElement>(null)
  const categoria3Ref = useRef<HTMLDivElement>(null)
  
  // Otimização: Encontrar o produto usando useMemo para evitar recálculos
  const produto = useMemo(() => {
    if (!produtos || produtos.length === 0) return null
    return produtos.find((p: any) => p.id === produtoId) || null
  }, [produtos, produtoId])

  // Otimização: Função de scroll usando useCallback para evitar recriações
  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY
    const headerHeight = 65
    
    // Função para verificar se um elemento está sendo coberto pela barra de scroll
    const isElementCoveredByScroll = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect()
      const elementTop = rect.top + scrollY
      return scrollY + headerHeight >= elementTop
    }
    
    // Verificar cada título em ordem de prioridade (de baixo para cima)
    if (categoria3Ref.current && isElementCoveredByScroll(categoria3Ref.current)) {
      setCurrentSection('Categoria3')
    } else if (adicionais2Ref.current && isElementCoveredByScroll(adicionais2Ref.current)) {
      setCurrentSection('Adicionais2')
    } else if (adicionais1Ref.current && isElementCoveredByScroll(adicionais1Ref.current)) {
      setCurrentSection('Adicionais1')
    } else if (produtoRef.current && isElementCoveredByScroll(produtoRef.current)) {
      setCurrentSection('Produto')
    }
  }, [])

  // Pré-carregar dados da loja automaticamente
  useEffect(() => {
    if (linkPersonalizado) {
      preloadLojaData(linkPersonalizado)
    }
  }, [linkPersonalizado, preloadLojaData])

  // Retry automático em caso de erro
  useEffect(() => {
    if (errorDados && retryCount < 3 && !isRetrying) {
      const timer = setTimeout(async () => {
        setIsRetrying(true)
        try {
          await retryLoad(linkPersonalizado)
        } finally {
          setIsRetrying(false)
        }
      }, 2000 * (retryCount + 1)) // Delay progressivo: 2s, 4s, 6s

      return () => clearTimeout(timer)
    }
  }, [errorDados, retryCount, isRetrying, linkPersonalizado, retryLoad])

  // Otimização: Throttle do scroll para melhor performance
  useEffect(() => {
    let ticking = false
    
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', throttledScroll, { passive: true })
    return () => window.removeEventListener('scroll', throttledScroll)
  }, [handleScroll])

  // Otimização: Handlers usando useCallback para evitar recriações
  const handleVoltar = useCallback(() => {
    router.push(`/loja/${linkPersonalizado}`)
  }, [router, linkPersonalizado])

  const handleAdicionarAoCarrinho = useCallback(() => {
    // Lógica para adicionar ao carrinho
    console.log(`Adicionando ${quantidade}x ${produto?.name} ao carrinho`)
    // Salvar posição de scroll antes de navegar
    saveScrollPosition(linkPersonalizado, 0) // Volta para o topo ao adicionar produto
    router.push(`/loja/${linkPersonalizado}`)
  }, [router, linkPersonalizado, quantidade, produto?.name, saveScrollPosition])

  const handleRetry = useCallback(async () => {
    setIsRetrying(true)
    try {
      await retryLoad(linkPersonalizado)
    } finally {
      setIsRetrying(false)
    }
  }, [linkPersonalizado, retryLoad])

  // Se há erro na loja ou produtos, mostrar erro
  if (errorDados && !loadingDados) {
    return (
      <ErrorPage
        title={errorDados === 'Loja não encontrada' ? 'Loja não encontrada' : 'Erro ao carregar produtos'}
        message={
          errorDados === 'Loja não encontrada' 
            ? 'A loja que você está procurando não existe ou foi removida. Verifique se o link está correto.'
            : 'Não foi possível carregar os produtos da loja. Verifique sua conexão com a internet.'
        }
        showRetry={retryCount < 3}
        retryCount={retryCount}
        onRetry={handleRetry}
        isRetrying={isRetrying}
        primaryAction={{
          label: 'Voltar à loja',
          onClick: handleVoltar,
          variant: 'secondary'
        }}
      />
    )
  }

  // Otimização: Mostrar skeleton enquanto carrega (mais rápido que tela vazia)
  if (loadingDados || isRetrying) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header skeleton */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50" style={{ height: '65px' }}>
          <div className="px-4 h-full flex items-center justify-between">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-5"></div>
          </div>
        </div>

        {/* Conteúdo skeleton */}
        <div style={{ paddingTop: '65px' }}>
          {/* Imagem skeleton */}
          <div className="w-full bg-gray-200 animate-pulse" style={{ height: '325px' }}></div>
          
          {/* Texto skeleton */}
          <div className="px-4" style={{ paddingTop: '10px' }}>
            <div className="w-3/4 h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="w-full h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
            <div className="w-2/3 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          {/* Preço skeleton */}
          <div className="px-4" style={{ paddingTop: '10px' }}>
            <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  // Verificar se loja e produto existem antes de renderizar
  if (!loja || !produto) {
    return (
      <ErrorPage
        title={!produto ? 'Produto não encontrado' : 'Loja não encontrada'}
        message={
          !produto 
            ? 'O produto que você está procurando não existe ou foi removido da loja.'
            : 'A loja que você está procurando não existe ou foi removida.'
        }
        primaryAction={{
          label: 'Voltar à loja',
          onClick: handleVoltar
        }}
        secondaryAction={{
          label: 'Voltar ao início',
          onClick: () => router.push('/')
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-white" style={{ marginTop: '200px' }}>
      {/* Header com botão voltar - MESMO DESIGN DA PÁGINA /loja/produto/2 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50" style={{ height: '65px' }}>
        <div className="page-content-container-fixed h-full flex items-center justify-between">
          <button 
            onClick={handleVoltar}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h1 className="text-gray-800 font-medium" style={{ fontSize: '12px' }}>
            {currentSection === 'Produto' ? produto.name : currentSection}
          </h1>
          
          <div className="w-5"></div>
        </div>
      </div>

      {/* Conteúdo da página - MESMO LAYOUT DA PÁGINA /loja/produto/2 */}
      <div style={{ paddingTop: '65px' }} className="page-content-container">
        {/* Espaço para foto do produto - Otimizado com lazy loading */}
        <div 
          className="w-full bg-gray-100 flex items-center justify-center"
          style={{ height: '325px' }}
        >
          <img
            src={produto.imageUrl || '/product-placeholder.jpg'}
            alt={produto.name}
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
            onLoad={(e) => {
              // Otimização: Remove placeholder quando imagem carrega
              const target = e.target as HTMLImageElement
              target.style.opacity = '1'
            }}
            style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
          />
        </div>
        
        {/* Nome do produto */}
        <div className="px-4" style={{ paddingTop: '10px' }}>
          <h1 
            ref={produtoRef}
            className="text-gray-800 font-bold"
            style={{ 
              fontSize: '18px',
              wordWrap: 'break-word'
            }}
          >
            {produto.name}
          </h1>
        </div>
        
        {/* Descrição do produto */}
        <div className="px-4" style={{ paddingTop: '10px' }}>
          <p 
            className="text-gray-600"
            style={{ 
              fontSize: '14px',
              wordWrap: 'break-word',
              lineHeight: '1.4'
            }}
          >
            {produto.description}
          </p>
        </div>
        
        {/* Valor do produto */}
        <div className="px-4" style={{ paddingTop: '10px' }}>
          <div className="flex items-center gap-2">
            <p 
              className="text-gray-800"
              style={{ fontSize: '14px' }}
            >
              {produto.price}
            </p>
          </div>
        </div>

        {/* Informações adicionais se disponíveis */}
        {(produto.portionSize || produto.servesUpTo) && (
          <div className="px-4" style={{ paddingTop: '10px' }}>
            <div>
              {produto.portionSize && (
                <p className="text-gray-500" style={{ fontSize: '12px' }}>
                  Porção: {produto.portionSize} {produto.portionUnit}
                </p>
              )}
              {produto.servesUpTo && (
                <p className="text-gray-500" style={{ fontSize: '12px' }}>
                  Serve até: {produto.servesUpTo} pessoas
                </p>
              )}
            </div>
          </div>
        )}

        {/* Categoria */}
        <div className="px-4" style={{ paddingTop: '10px' }}>
          <div>
            <p className="text-gray-500" style={{ fontSize: '12px' }}>
              Categoria: {produto.category}
            </p>
          </div>
        </div>

        {/* Seção de Adicionais */}
        <div className="px-4" style={{ paddingTop: '20px' }}>
          <div>
            {/* Título da seção */}
            <h3 
              ref={adicionais1Ref}
              className="text-gray-800 font-bold mb-1" 
              style={{ fontSize: '16px' }}
            >
              Adicionais1
            </h3>
            <p className="text-gray-500 mb-4" style={{ fontSize: '11px' }}>
              Escolha até 5 opções
            </p>
            
            {/* Lista de adicionais */}
            <div className="space-y-3">
              {/* Adicional 1 */}
              <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSR5yyBQvH1HFT9PkMOvSVHdBt5jd9bqznmCw&s"
                      alt="Bacon Extra"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium" style={{ fontSize: '14px' }}>
                      Bacon Extra
                    </p>
                    <p className="text-gray-500" style={{ fontSize: '12px' }}>
                      +R$ 3,50
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="text-gray-800 font-medium" style={{ fontSize: '14px', minWidth: '20px', textAlign: 'center' }}>
                    0
                  </span>
                  <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Adicional 2 */}
              <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSR5yyBQvH1HFT9PkMOvSVHdBt5jd9bqznmCw&s"
                      alt="Queijo Extra"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium" style={{ fontSize: '14px' }}>
                      Queijo Extra
                    </p>
                    <p className="text-gray-500" style={{ fontSize: '12px' }}>
                      +R$ 2,50
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="text-gray-800 font-medium" style={{ fontSize: '14px', minWidth: '20px', textAlign: 'center' }}>
                    0
                  </span>
                  <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Adicionais2 */}
        <div className="px-4" style={{ paddingTop: '20px' }}>
          <div>
            {/* Título da seção */}
            <h3 
              ref={adicionais2Ref}
              className="text-gray-800 font-bold mb-1" 
              style={{ fontSize: '16px' }}
            >
              Adicionais2
            </h3>
            <p className="text-gray-500 mb-4" style={{ fontSize: '11px' }}>
              Escolha até 5 opções <span className="font-bold float-right">OBRIGATÓRIO</span>
            </p>
            
            {/* Lista de adicionais */}
            <div className="space-y-3">
              {/* Adicional 1 */}
              <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src="https://static.wixstatic.com/media/11062b_56249970bf6447a0ac1596fd40e03e2a~mv2.jpg/v1/fill/w_480,h_480,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/11062b_56249970bf6447a0ac1596fd40e03e2a~mv2.jpg"
                      alt="Molho Especial"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium" style={{ fontSize: '14px' }}>
                      Molho Especial
                    </p>
                    <p className="text-gray-500" style={{ fontSize: '12px' }}>
                      +R$ 2,00
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="text-gray-800 font-medium" style={{ fontSize: '14px', minWidth: '20px', textAlign: 'center' }}>
                    0
                  </span>
                  <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Categoria3 */}
        <div className="px-4" style={{ paddingTop: '20px' }}>
          <div>
            {/* Título da seção */}
            <h3 
              ref={categoria3Ref}
              className="text-gray-800 font-bold mb-1" 
              style={{ fontSize: '16px' }}
            >
              Categoria3
            </h3>
            <p className="text-gray-500 mb-4" style={{ fontSize: '11px' }}>
              Escolha até uma opção
            </p>
            
            {/* Lista de produtos */}
            <div className="space-y-3">
              {/* Produto 1 */}
              <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src="https://dw0jruhdg6fis.cloudfront.net/producao/28726705/G/colher_pt.png"
                      alt="Sim, quero colher"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium" style={{ fontSize: '14px' }}>
                      Sim, quero colher
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                    <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Caixa de Observação */}
        <div className="px-4" style={{ paddingTop: '20px', marginBottom: '200px' }}>
          <div>
            <h4 className="text-gray-800 font-bold mb-2" style={{ fontSize: '14px' }}>
              Observação
            </h4>
            <textarea 
              placeholder="EX: tirar cebola, alface, maionese etc."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-[#542583] transition-colors"
              style={{ 
                fontSize: '14px',
                minHeight: '80px',
                fontFamily: 'inherit'
              }}
            ></textarea>
          </div>
        </div>

        {/* Rodapé transparente */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-gray-200/50" style={{ height: '65px' }}>
          <div className="page-content-container-fixed h-full flex items-center justify-between">
            {/* Botões de quantidade à esquerda */}
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="text-gray-800 font-medium" style={{ fontSize: '14px', minWidth: '20px', textAlign: 'center' }}>
                1
              </span>
              <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            
            {/* Botão roxo com valor */}
            <button className="px-8 py-2 bg-[#542583] text-white rounded" style={{ borderRadius: '4px', minWidth: '180px' }}>
              Adicionar <span style={{ marginLeft: '30px' }}>{produto.price}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 