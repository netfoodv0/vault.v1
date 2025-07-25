export function LojaSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Banner Skeleton com imagem de fallback */}
      <div className="page-content-container-no-border banner-top-margin">
        <div className="relative h-[140px] bg-gray-200 overflow-hidden rounded-t-2xl">
        <img 
          src="/fotos/a-3d-render-of-a-vibrant-food-banner-des_XD4dXSsAQmmVpn11ANDc3g_23x7eD2GRKmJHnPbFJrcmg.jpeg" 
          alt="Banner de carregamento"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute bottom-4 left-4 flex items-center gap-4">
          {/* Logo Skeleton */}
          <div className="w-[70px] h-[70px] bg-gray-300 rounded-full"></div>
          {/* Nome da Loja Skeleton */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-32"></div>
            <div className="h-3 bg-gray-300 rounded w-24"></div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal com limitação de largura */}
      <div className="page-content-container">
        {/* Informações da Loja */}
        <div className="px-4 mt-4 flex items-center justify-between">
        <div className="h-4 bg-gray-300 rounded w-24"></div>
        <div className="h-4 bg-gray-300 rounded w-16"></div>
      </div>

      {/* Galeria de Banners */}
      <div className="mt-4 px-4">
        <div className="flex gap-4 overflow-x-auto skeleton-carousel">
          <div className="h-32 w-[320px] bg-gray-200 rounded-lg flex-shrink-0"></div>
          <div className="h-32 w-[320px] bg-gray-200 rounded-lg flex-shrink-0"></div>
        </div>
      </div>

      {/* Seção Destaques */}
      <div className="mt-8 px-4">
        <div className="h-6 bg-gray-300 rounded w-24 mb-4"></div>
        
        {/* Carrossel de Produtos - Dimensões realistas */}
        <div className="flex gap-4 overflow-x-auto pb-4 skeleton-carousel">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex-shrink-0 w-[131px]">
              <div className="h-32 bg-gray-200 rounded-lg mb-2"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

        {/* Lista de Produtos - Estrutura exata dos produtos reais */}
        <div className="product-list mt-6">
        {[...Array(3)].map((_, categoryIndex) => (
          <div key={categoryIndex} className="product-category">
            {/* Título da Categoria */}
            <h2 className="product-category__title">
              <div className="h-6 bg-gray-300 rounded w-32"></div>
            </h2>
            
            {/* Items da Categoria */}
            <div className="product-category__items">
              {[...Array(3)].map((_, productIndex) => (
                <div key={productIndex} className="product-card">
                  <div className="product-card__content">
                    <div className="product-card__info">
                      {/* Título do Produto */}
                      <div className="product-card__title">
                        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      </div>
                      {/* Descrição do Produto */}
                      <div className="product-card__description">
                        <div className="space-y-1">
                          <div className="h-3 bg-gray-300 rounded w-full"></div>
                          <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                          <div className="h-3 bg-gray-300 rounded w-4/6"></div>
                        </div>
                      </div>
                      {/* Preço do Produto */}
                      <div className="product-card__price">
                        <div className="h-4 bg-gray-300 rounded w-16 mt-2"></div>
                      </div>
                    </div>
                    
                    {/* Imagem do Produto */}
                    <div className="product-card__image">
                      <div className="product-card__image-element bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  
                  {/* Divisor (exceto no último item) */}
                  {productIndex < 2 && (
                    <div className="product-card__divider" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Linha horizontal no final da lista */}
      <div className="border-t border-gray-200 mt-6"></div>

        </div>
      </div>

      {/* Footer Navigation Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="page-content-container-fixed flex justify-around">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex flex-col items-center space-y-1">
              <div className="w-6 h-6 bg-gray-300 rounded"></div>
              <div className="h-3 bg-gray-300 rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 