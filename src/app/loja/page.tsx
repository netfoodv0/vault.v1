'use client';

import { Banner } from "@/components/loja/Banner";
import { GaleriaBanners } from "@/components/loja/GaleriaBanners";
import { Logo } from "@/components/loja/Logo";
import { NomeLoja } from "@/components/loja/NomeLoja";
import { VerMais } from "@/components/loja/VerMais";
import { PedidoMinimo } from "@/components/loja/PedidoMinimo";
import { CarrosselCategorias } from "@/components/loja/CarrosselCategorias";
import { CarrosselProdutos } from "@/components/loja/CarrosselProdutos";
import { ProductList } from "@/components/loja/ProductList";
import { FooterNavigation } from "@/components/loja/FooterNavigation";
import { PedidosPage } from "@/components/loja/PedidosPage";
import { SacolaPage } from "@/components/loja/SacolaPage";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

// Dados dos produtos para pesquisa
const produtos = [
  {
    id: 1,
    nome: "Combo imperdível 2 X-tudo por 59,90",
    descricao: "Combo imperdível com 2 X-tudo deliciosos! Cada lanche vem com hambúrguer, queijo, alface, tomate, cebola e molho especial. Acompanha batata frita crocante e refrigerante gelado. Perfeito para compartilhar ou para quem tem muita fome!",
    preco: "R$ 39,90",
    categoria: "Categoria1",
    imagem: "https://storage.shopfood.io/public/companies/poe726g0/products/medium/5d90753b00b3038121091b63a9229736.png"
  },
  {
    id: 2,
    nome: "X-Bacon Especial por 45,90",
    descricao: "X-Bacon especial com hambúrguer artesanal, bacon crocante, queijo derretido, alface fresca, tomate e molho especial da casa. Acompanha batata frita e refrigerante. Uma explosão de sabores!",
    preco: "R$ 45,90",
    categoria: "Categoria1",
    imagem: "https://storage.shopfood.io/public/companies/poe726g0/products/medium/5d90753b00b3038121091b63a9229736.png"
  },
  {
    id: 3,
    nome: "Mega Lanche Duplo por 52,90",
    descricao: "Mega lanche com dois hambúrgueres suculentos, queijo duplo, alface, tomate, cebola caramelizada e molho especial. Acompanha batata frita grande e refrigerante. Para quem tem muita fome!",
    preco: "R$ 52,90",
    categoria: "Categoria1",
    imagem: "https://storage.shopfood.io/public/companies/poe726g0/products/medium/5d90753b00b3038121091b63a9229736.png"
  },
  {
    id: 4,
    nome: "X-Frango Grelhado por 38,90",
    descricao: "X-Frango grelhado com peito de frango temperado, queijo, alface, tomate, cebola e molho de ervas. Acompanha batata frita e refrigerante. Opção mais leve e saborosa!",
    preco: "R$ 38,90",
    categoria: "Categoria1",
    imagem: "https://storage.shopfood.io/public/companies/poe726g0/products/medium/5d90753b00b3038121091b63a9229736.png"
  },
  {
    id: 5,
    nome: "Super Combo Família por 89,90",
    descricao: "Super combo família com 4 lanches variados, 4 batatas fritas, 4 refrigerantes e sobremesa. Inclui X-tudo, X-bacon, X-frango e X-salada. Perfeito para toda a família!",
    preco: "R$ 89,90",
    categoria: "Categoria1",
    imagem: "https://storage.shopfood.io/public/companies/poe726g0/products/medium/5d90753b00b3038121091b63a9229736.png"
  },
  {
    id: 6,
    nome: "Pizza Margherita por 42,90",
    descricao: "Pizza Margherita tradicional com molho de tomate fresco, mussarela de búfala, manjericão e azeite extra virgem. Massa artesanal assada em forno a lenha. Sabor autêntico italiano!",
    preco: "R$ 42,90",
    categoria: "Categoria2",
    imagem: "https://storage.shopfood.io/public/companies/poe726g0/products/medium/f5dfaaebf537fc40bf47053923e63e16.jpg"
  },
  {
    id: 7,
    nome: "Pizza Quatro Queijos por 48,90",
    descricao: "Pizza quatro queijos com mussarela, parmesão, provolone e gorgonzola. Massa fina e crocante, queijos derretidos e sabor intenso. Perfeita para quem ama queijo!",
    preco: "R$ 48,90",
    categoria: "Categoria2",
    imagem: "https://storage.shopfood.io/public/companies/poe726g0/products/medium/f5dfaaebf537fc40bf47053923e63e16.jpg"
  },
  {
    id: 8,
    nome: "Pizza Calabresa por 45,90",
    descricao: "Pizza calabresa com linguiça calabresa artesanal, cebola caramelizada, mussarela e molho de tomate. Massa tradicional e sabor marcante da calabresa!",
    preco: "R$ 45,90",
    categoria: "Categoria2",
    imagem: "https://storage.shopfood.io/public/companies/poe726g0/products/medium/f5dfaaebf537fc40bf47053923e63e16.jpg"
  },
  {
    id: 9,
    nome: "Pizza Frango Catupiry por 47,90",
    descricao: "Pizza frango com catupiry, peito de frango desfiado, catupiry cremoso, milho verde e mussarela. Massa artesanal e recheio cremoso e saboroso!",
    preco: "R$ 47,90",
    categoria: "Categoria2",
    imagem: "https://storage.shopfood.io/public/companies/poe726g0/products/medium/f5dfaaebf537fc40bf47053923e63e16.jpg"
  },
  {
    id: 10,
    nome: "Combo 2 Pizzas por 79,90",
    descricao: "Combo especial com 2 pizzas médias à sua escolha, refrigerante 2L e sobremesa. Escolha entre Margherita, Quatro Queijos, Calabresa ou Frango Catupiry!",
    preco: "R$ 79,90",
    categoria: "Categoria2",
    imagem: "https://storage.shopfood.io/public/companies/poe726g0/products/medium/f5dfaaebf537fc40bf47053923e63e16.jpg"
  },
  {
    id: 11,
    nome: "Coca-Cola 350ml",
    descricao: "Coca-Cola gelada 350ml, o refrigerante mais vendido do mundo. Sabor único e refrescante, perfeito para acompanhar qualquer refeição!",
    preco: "R$ 6,90",
    categoria: "Bebidas",
    imagem: "https://storage.shopfood.io/public/companies/poe726g0/products/medium/5d90753b00b3038121091b63a9229736.png"
  },
  {
    id: 12,
    nome: "Suco Natural Laranja 500ml",
    descricao: "Suco natural de laranja 500ml, feito na hora com laranjas frescas. Rico em vitamina C e sem conservantes. Opção saudável e deliciosa!",
    preco: "R$ 8,90",
    categoria: "Bebidas",
    imagem: "https://storage.shopfood.io/public/companies/poe726g0/products/medium/5d90753b00b3038121091b63a9229736.png"
  },
  {
    id: 13,
    nome: "Água com Gás 500ml",
    descricao: "Água com gás natural 500ml, refrescante e sem calorias. Perfeita para quem busca uma opção leve e hidratante!",
    preco: "R$ 4,90",
    categoria: "Bebidas",
    imagem: "https://storage.shopfood.io/public/companies/poe726g0/products/medium/5d90753b00b3038121091b63a9229736.png"
  },
  {
    id: 14,
    nome: "Milkshake Chocolate 400ml",
    descricao: "Milkshake de chocolate 400ml, cremoso e delicioso. Feito com sorvete de chocolate e leite integral. Sobremesa líquida perfeita!",
    preco: "R$ 12,90",
    categoria: "Bebidas",
    imagem: "https://storage.shopfood.io/public/companies/poe726g0/products/medium/5d90753b00b3038121091b63a9229736.png"
  },
  {
    id: 15,
    nome: "Brownie com Sorvete",
    descricao: "Brownie caseiro quentinho com sorvete de creme, calda de chocolate e granulado. Combinação perfeita de quente e frio!",
    preco: "R$ 15,90",
    categoria: "Sobremesas",
    imagem: "https://storage.shopfood.io/public/companies/poe726g0/products/medium/f5dfaaebf537fc40bf47053923e63e16.jpg"
  },
  {
    id: 16,
    nome: "Pudim de Leite Condensado",
    descricao: "Pudim de leite condensado caseiro com calda de caramelo. Cremoso, suave e irresistível. Sobremesa tradicional brasileira!",
    preco: "R$ 9,90",
    categoria: "Sobremesas",
    imagem: "https://storage.shopfood.io/public/companies/poe726g0/products/medium/f5dfaaebf537fc40bf47053923e63e16.jpg"
  },
  {
    id: 17,
    nome: "Brigadeiro Gourmet",
    descricao: "Brigadeiro gourmet artesanal com chocolate belga e granulado especial. Doce tradicional brasileiro com toque sofisticado!",
    preco: "R$ 7,90",
    categoria: "Sobremesas",
    imagem: "https://storage.shopfood.io/public/companies/poe726g0/products/medium/f5dfaaebf537fc40bf47053923e63e16.jpg"
  },
  {
    id: 18,
    nome: "Sorvete Casquinha",
    descricao: "Sorvete artesanal em casquinha crocante. Sabores: chocolate, baunilha, morango ou creme. Perfeito para refrescar!",
    preco: "R$ 6,90",
    categoria: "Sobremesas",
    imagem: "https://storage.shopfood.io/public/companies/poe726g0/products/medium/f5dfaaebf537fc40bf47053923e63e16.jpg"
  },
  {
    id: 19,
    nome: "Batata Frita Grande",
    descricao: "Batata frita crocante e dourada, temperada com sal especial. Porção generosa para compartilhar ou comer sozinho!",
    preco: "R$ 18,90",
    categoria: "Acompanhamentos",
    imagem: "https://storage.shopfood.io/public/companies/poe726g0/products/medium/5d90753b00b3038121091b63a9229736.png"
  },
  {
    id: 20,
    nome: "Onion Rings",
    descricao: "Anéis de cebola empanados e fritos, crocantes por fora e macios por dentro. Acompanha molho especial da casa!",
    preco: "R$ 14,90",
    categoria: "Acompanhamentos",
    imagem: "https://storage.shopfood.io/public/companies/poe726g0/products/medium/5d90753b00b3038121091b63a9229736.png"
  },
  {
    id: 21,
    nome: "Nuggets de Frango",
    descricao: "Nuggets de frango crocantes, feitos com peito de frango desfiado e temperos especiais. Acompanha molho barbecue!",
    preco: "R$ 16,90",
    categoria: "Acompanhamentos",
    imagem: "https://storage.shopfood.io/public/companies/poe726g0/products/medium/5d90753b00b3038121091b63a9229736.png"
  },
  {
    id: 22,
    nome: "Salada Caesar",
    descricao: "Salada Caesar com alface romana, croutons, parmesão e molho caesar. Opção leve e refrescante para acompanhar!",
    preco: "R$ 12,90",
    categoria: "Acompanhamentos",
    imagem: "https://storage.shopfood.io/public/companies/poe726g0/products/medium/5d90753b00b3038121091b63a9229736.png"
  }
];

export default function LojaPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'inicio' | 'pedidos' | 'sacola'>('inicio');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCategories, setShowCategories] = useState(false); // Começa oculta
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [currentCategorySection, setCurrentCategorySection] = useState('Destaques');
  
  // Refs para as seções de categoria
  const categoria1Ref = useRef<HTMLDivElement>(null);
  const categoria2Ref = useRef<HTMLDivElement>(null);
  const bebidasRef = useRef<HTMLDivElement>(null);
  const sobremesasRef = useRef<HTMLDivElement>(null);
  const acompanhamentosRef = useRef<HTMLDivElement>(null);
  const destaquesRef = useRef<HTMLDivElement>(null);
  
  // Função unificada para detectar scroll e controlar a barra de categorias
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const headerHeight = 60; // Altura da barra de categorias fixa (reduzida)
      
      // Verificar se o texto "Destaques" está sendo coberto pelo scroll
      if (destaquesRef.current) {
        const rect = destaquesRef.current.getBoundingClientRect();
        
        // Se o texto "Destaques" está sendo coberto pelo topo da tela, mostrar a barra de categorias
        if (rect.top <= 0) {
          setShowCategories(true);
        } else {
          setShowCategories(false);
        }
      }
      
      // Só verificar as seções de categoria se a barra estiver visível
      if (showCategories) {
        // Função para verificar se um elemento está sendo coberto pela barra de scroll
        const isElementCoveredByScroll = (element: HTMLElement) => {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + scrollY;
          return scrollY + headerHeight >= elementTop;
        };
        
        // Verificar cada seção de categoria em ordem de prioridade (de baixo para cima)
        if (acompanhamentosRef.current && isElementCoveredByScroll(acompanhamentosRef.current)) {
          setCurrentCategorySection('Acompanhamentos');
          setActiveCategoryIndex(4); // Índice da categoria Acompanhamentos
        } else if (sobremesasRef.current && isElementCoveredByScroll(sobremesasRef.current)) {
          setCurrentCategorySection('Sobremesas');
          setActiveCategoryIndex(3); // Índice da categoria Sobremesas
        } else if (bebidasRef.current && isElementCoveredByScroll(bebidasRef.current)) {
          setCurrentCategorySection('Bebidas');
          setActiveCategoryIndex(2); // Índice da categoria Bebidas
        } else if (categoria2Ref.current && isElementCoveredByScroll(categoria2Ref.current)) {
          setCurrentCategorySection('Categoria2');
          setActiveCategoryIndex(1); // Índice da categoria Categoria2
        } else if (categoria1Ref.current && isElementCoveredByScroll(categoria1Ref.current)) {
          setCurrentCategorySection('Categoria1');
          setActiveCategoryIndex(0); // Índice da categoria Categoria1
        } else if (destaquesRef.current && isElementCoveredByScroll(destaquesRef.current)) {
          setCurrentCategorySection('Destaques');
          setActiveCategoryIndex(0); // Volta para a primeira categoria
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showCategories]);

  const handleSectionChange = (newSection: 'inicio' | 'pedidos' | 'sacola') => {
    setActiveSection(newSection);
  };

  const handleFirstCategoryHover = (show: boolean) => {
    // Função vazia - não usada
  };

  const handleProdutoClick = (produtoId: number) => {
    router.push(`/loja/produto/${produtoId}`);
  };

  // Filtrar produtos baseado no termo de busca
  const filteredProducts = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderContent = () => {
    const content = (() => {
      switch (activeSection) {
        case 'pedidos':
          return <PedidosPage />;
        case 'sacola':
          return <SacolaPage />;
        case 'inicio':
        default:
          return (
            <>
              {/* Banner com Logo e Nome da Loja */}
              <div className="page-content-container-no-border banner-top-margin">
                <div className="relative">
                  <Banner />
                  <div className="absolute bottom-4 left-4 flex items-center gap-4">
                    <Logo />
                    <NomeLoja />
                  </div>
                </div>
              </div>
      
              {/* Barra de Categorias Fixa - só aparece quando necessário */}
              <div className={`fixed top-0 left-0 right-0 z-[9999] bg-white/95 backdrop-blur-md border-b border-gray-200/50 transition-all duration-300 ease-in-out transform ${
                showCategories ? 'translate-y-0' : '-translate-y-full'
              }`}>
                <div className="page-content-container-fixed py-2">
                  <CarrosselCategorias 
                    activeCategory={activeCategoryIndex}
                    onSearchChange={(term) => setSearchTerm(term)}
                    onShowCategories={handleFirstCategoryHover}
                  />
                </div>
              </div>
              
              {/* Conteúdo Principal */}
              <div className="transition-all duration-300 ease-in-out page-content-container"> {/* Sem espaçamento condicional */}
                <div className="px-4 mt-4 flex items-center justify-between">
                  <PedidoMinimo />
                  <VerMais />
                </div>
                
                {/* Galeria de Banners Rolantes */}
                <div className="mt-4">
                  <GaleriaBanners />
                </div>
                
                {/* Conteúdo baseado na pesquisa */}
                {searchTerm ? (
                  // Mostrar resultados da pesquisa
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
                  // Mostrar conteúdo normal quando não há pesquisa
                  <>
                    {/* Texto Destaques */}
                    <div className="mt-[30px] px-4 section-title" ref={destaquesRef}>
                      <p className="text-left text-[22px] font-bold text-gray-800">
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
                    products={produtos}
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
          );
      }
    })();

    return (
      <div className="transition-all duration-200 ease-in-out">
        {content}
      </div>
    );
  };

  return (
    <div>
      {renderContent()}
      
      {/* Rodapé Fixo de Navegação */}
      <FooterNavigation 
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />
    </div>
  );
} 