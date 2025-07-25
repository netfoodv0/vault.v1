'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useLojaCache } from '@/contexts/LojaCacheContext'
import { useHorarioLoja } from '@/hooks/useHorarioLoja'
import { Banner } from "@/components/loja/Banner"
import { GaleriaBanners } from "@/components/loja/GaleriaBanners"
import { Logo } from "@/components/loja/Logo"
import { NomeLoja } from "@/components/loja/NomeLoja"
import { VerMais } from "@/components/loja/VerMais"
import { PedidoMinimo } from "@/components/loja/PedidoMinimo"
import { CarrosselCategorias } from "@/components/loja/CarrosselCategorias"
import { CarrosselProdutos } from "@/components/loja/CarrosselProdutos"
import { ProductList } from "@/components/loja/ProductList"
import { FooterNavigation } from "@/components/loja/FooterNavigation"
import { PedidosPage } from "@/components/loja/PedidosPage"
import { SacolaPage } from "@/components/loja/SacolaPage"
import { LojaSkeleton, ErrorPage } from "@/components/ui"

export default function LojaDinamicaPage() {
  const params = useParams()
  const router = useRouter()
  const linkPersonalizado = params.linkPersonalizado as string
  
  // Hook para cache da loja
  const { getLojaData, preloadLojaData, saveScrollPosition, retryLoad } = useLojaCache()
  const { loja, categorias, produtos, loading: loadingDados, error: errorDados, scrollPosition, retryCount } = getLojaData(linkPersonalizado)
  
  const { estaAberta, proximoHorario } = useHorarioLoja(
    loja?.horariosFuncionamento || [], 
    loja?.fusoHorario || 'America/Sao_Paulo'
  )
  
  // Estados da página
  const [activeSection, setActiveSection] = useState<'inicio' | 'pedidos' | 'sacola'>('inicio')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCategories, setShowCategories] = useState(false)
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0)
  const [currentCategorySection, setCurrentCategorySection] = useState('Destaques')
  const [isRetrying, setIsRetrying] = useState(false)
  
  // Refs para as seções de categoria
  const categoria1Ref = useRef<HTMLDivElement>(null)
  const categoria2Ref = useRef<HTMLDivElement>(null)
  const bebidasRef = useRef<HTMLDivElement>(null)
  const sobremesasRef = useRef<HTMLDivElement>(null)
  const acompanhamentosRef = useRef<HTMLDivElement>(null)
  const destaquesRef = useRef<HTMLDivElement>(null)

  // Pré-carregar dados da loja automaticamente
  useEffect(() => {
    if (linkPersonalizado) {
      preloadLojaData(linkPersonalizado)
    }
  }, [linkPersonalizado]) // Removida dependência preloadLojaData

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
  }, [errorDados, retryCount, isRetrying, linkPersonalizado]) // Removida dependência retryLoad

  // Salvar posição de scroll quando sair da página
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveScrollPosition(linkPersonalizado, window.scrollY)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveScrollPosition(linkPersonalizado, window.scrollY)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [linkPersonalizado]) // Removida dependência saveScrollPosition

  // Restaurar posição de scroll quando voltar à página
  useEffect(() => {
    if (!loadingDados && scrollPosition > 0) {
      // Usar setTimeout para garantir que o DOM esteja renderizado
      setTimeout(() => {
        window.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        })
      }, 100)
    }
  }, [loadingDados, scrollPosition])

  // Mapeamento de produtos otimizado com useMemo
  const produtosMapeados = useMemo(() => {
    if (loadingDados || !produtos || produtos.length === 0) return []
    
    return produtos.map((produto, index) => ({
      id: index + 1,
      firebaseId: produto.id,
      nome: produto.name,
      descricao: produto.description,
      preco: produto.price,
      categoria: produto.category,
      imagem: produto.imageUrl || '/product-placeholder.jpg'
    }))
  }, [produtos, loadingDados])

  // Produtos filtrados otimizado com useMemo
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return produtosMapeados
    
    return produtosMapeados.filter(produto =>
      produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [produtosMapeados, searchTerm])

  // Função otimizada para detectar scroll
  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY
    const headerHeight = 60
    
    // Verificar se deve mostrar categorias
    if (destaquesRef.current) {
      const rect = destaquesRef.current.getBoundingClientRect()
      setShowCategories(rect.top <= 0)
    }
    
    if (!showCategories) return
    
    // Verificar qual categoria está ativa
    const isElementCoveredByScroll = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect()
      const elementTop = rect.top + scrollY
      return scrollY + headerHeight >= elementTop
    }
    
    const refs = [
      { ref: acompanhamentosRef, section: 'Acompanhamentos', index: 4 },
      { ref: sobremesasRef, section: 'Sobremesas', index: 3 },
      { ref: bebidasRef, section: 'Bebidas', index: 2 },
      { ref: categoria2Ref, section: 'Categoria2', index: 1 },
      { ref: categoria1Ref, section: 'Categoria1', index: 0 },
      { ref: destaquesRef, section: 'Destaques', index: 0 }
    ]
    
    for (const { ref, section, index } of refs) {
      if (ref.current && isElementCoveredByScroll(ref.current)) {
        setCurrentCategorySection(section)
        setActiveCategoryIndex(index)
        break
      }
    }
  }, [showCategories])

  // Event listener de scroll otimizado
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Handlers otimizados com useCallback
  const handleSectionChange = useCallback((newSection: 'inicio' | 'pedidos' | 'sacola') => {
    setActiveSection(newSection)
  }, [])

  const handleProdutoClick = useCallback((produtoId: number) => {
    const produtoEncontrado = produtosMapeados.find(p => p.id === produtoId)
    if (produtoEncontrado) {
      router.push(`/loja/${linkPersonalizado}/produto/${produtoEncontrado.firebaseId}`)
    }
  }, [produtosMapeados, linkPersonalizado, router])

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term)
  }, [])

  const handleRetry = useCallback(async () => {
    setIsRetrying(true)
    try {
      await retryLoad(linkPersonalizado)
    } finally {
      setIsRetrying(false)
    }
  }, [linkPersonalizado, retryLoad])

  // Estados de loading e erro
  const isLoading = loadingDados || isRetrying
  const hasError = errorDados && !loadingDados

  // Loading state com skeleton animado
  if (isLoading) {
    return <LojaSkeleton />
  }

  // Error state com retry
  if (hasError) {
    return (
      <ErrorPage
        title={errorDados === 'Loja não encontrada' ? 'Loja não encontrada' : 'Erro ao carregar loja'}
        message={
          errorDados === 'Loja não encontrada' 
            ? 'A loja que você está procurando não existe ou foi removida. Verifique se o link está correto.'
            : 'Não foi possível carregar os dados da loja. Verifique sua conexão com a internet.'
        }
        showRetry={retryCount < 3}
        retryCount={retryCount}
        onRetry={handleRetry}
        isRetrying={isRetrying}
        primaryAction={{
          label: 'Voltar ao início',
          onClick: () => router.push('/'),
          variant: 'secondary'
        }}
      />
    )
  }

  // Verificar se loja existe antes de renderizar o conteúdo
  if (!loja) {
    return <LojaSkeleton />
  }

  // Renderizar conteúdo baseado na seção ativa
  const renderContent = () => {
    switch (activeSection) {
      case 'pedidos':
        return <PedidosPage />
      case 'sacola':
        return <SacolaPage />
      case 'inicio':
      default:
        return (
          <>
            {/* Banner com Logo e Nome da Loja */}
              <div className="page-content-container-no-border banner-top-margin">
            <div className="relative">
              <Banner imageUrl={loja.bannerUrl} title={loja.nomeLoja} />
              <div className="absolute bottom-4 left-4 flex items-center gap-4">
                <Logo imageUrl={loja.logoUrl} />
                <NomeLoja 
                  nome={loja.nomeLoja} 
                  estaAberta={estaAberta}
                  proximoHorario={proximoHorario}
                />
                </div>
              </div>
            </div>
      
            {/* Barra de Categorias Fixa */}
            <div className={`fixed top-0 left-0 right-0 z-[9999] bg-white/95 backdrop-blur-md border-b border-gray-200/50 transition-all duration-300 ease-in-out transform ${
              showCategories ? 'translate-y-0' : '-translate-y-full'
            }`}>
                              <div className="page-content-container-fixed py-2">
                <CarrosselCategorias 
                  activeCategory={activeCategoryIndex}
                  onSearchChange={handleSearchChange}
                  onShowCategories={() => {}} // Função vazia conforme original
                  categoriasFirebase={(categorias || []).map(cat => cat.name)}
                />
              </div>
            </div>
              
            {/* Conteúdo Principal */}
            <div className="page-content-container">
              <div className="px-4 mt-4 flex items-center justify-between">
                <PedidoMinimo />
                <VerMais 
                  descricaoLoja={loja.descricaoLoja} 
                  horariosFuncionamento={loja.horariosFuncionamento}
                  aceitarDinheiro={loja.aceitarDinheiro}
                  aceitarPix={loja.aceitarPix}
                  aceitarCredito={loja.aceitarCredito}
                  aceitarDebito={loja.aceitarDebito}
                  bandeirasMastercard={loja.bandeirasMastercard}
                  bandeirasVisa={loja.bandeirasVisa}
                  bandeirasAmericanExpress={loja.bandeirasAmericanExpress}
                  bandeirasElo={loja.bandeirasElo}
                  bandeirasHipercard={loja.bandeirasHipercard}
                  bandeirasPersonalizadas={loja.bandeirasPersonalizadas}
                />
              </div>
                
              {/* Galeria de Banners Rolantes */}
              <div className="mt-4">
                <GaleriaBanners />
              </div>
                
              {/* Conteúdo baseado na pesquisa */}
              {searchTerm ? (
                <div className="mt-[30px] px-4 section-title">
                  <p className="text-left text-[22px] font-bold text-gray-800 mb-4">
                    Resultados da busca: "{searchTerm}"
                  </p>
                  {filteredProducts.length > 0 ? (
                    <ProductList 
                      products={filteredProducts}
                      onProductClick={handleProdutoClick}
                      refs={{
                        categoria1Ref,
                        categoria2Ref,
                        bebidasRef,
                        sobremesasRef,
                        acompanhamentosRef
                      }}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-lg">Nenhum produto encontrado para "{searchTerm}"</p>
                      <p className="text-gray-400 text-sm mt-2">Tente buscar por outro termo</p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Texto Destaques */}
                  <div className="mt-[30px] px-4 section-title" ref={destaquesRef}>
                    <p className="text-left text-[22px] font-bold text-gray-800 min-h-[28px] flex items-center">
                      Destaques
                    </p>
                  </div>
                    
                  {/* Carrossel de Produtos */}
                  <div className="mt-6">
                    <CarrosselProdutos />
                  </div>
                </>
              )}
      
              {!searchTerm && (
                <ProductList 
                  products={produtosMapeados}
                  onProductClick={handleProdutoClick}
                  refs={{
                    categoria1Ref,
                    categoria2Ref,
                    bebidasRef,
                    sobremesasRef,
                    acompanhamentosRef
                  }}
                />
              )}
            </div>
          </>
        )
    }
  }

  return (
    <div>
      <div>
        {renderContent()}
      </div>
      
      {/* Rodapé Fixo de Navegação */}
      <FooterNavigation 
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />
    </div>
  )
} 