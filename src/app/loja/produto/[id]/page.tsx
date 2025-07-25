'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

// Tipo para o produto
interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: string;
  categoria: string;
  imagem: string;
}

export default function ProdutoDetalhesPage() {
  const params = useParams();
  const [queroColher, setQueroColher] = useState(false);
  const [currentSection, setCurrentSection] = useState('Produto');
  
  // Refs para as seções
  const produtoRef = useRef<HTMLDivElement>(null);
  const adicionais1Ref = useRef<HTMLDivElement>(null);
  const adicionais2Ref = useRef<HTMLDivElement>(null);
  const categoria3Ref = useRef<HTMLDivElement>(null);
  
  // Função para detectar quando a barra de scroll passa por cima do texto do título
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const headerHeight = 65;
      
      // Função para verificar se um elemento está sendo coberto pela barra de scroll
      const isElementCoveredByScroll = (element: HTMLElement) => {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + scrollY;
        return scrollY + headerHeight >= elementTop;
      };
      
      // Verificar cada título em ordem de prioridade (de baixo para cima)
      if (categoria3Ref.current && isElementCoveredByScroll(categoria3Ref.current)) {
        setCurrentSection('Categoria3');
      } else if (adicionais2Ref.current && isElementCoveredByScroll(adicionais2Ref.current)) {
        setCurrentSection('Adicionais2');
      } else if (adicionais1Ref.current && isElementCoveredByScroll(adicionais1Ref.current)) {
        setCurrentSection('Adicionais1');
      } else if (produtoRef.current && isElementCoveredByScroll(produtoRef.current)) {
        setCurrentSection('Produto');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Dados mockados dos produtos (mesmo da página principal)
  const produtos = [
    {
      id: 1,
      nome: "Combo imperdível 2 X-tudo por 59,90",
      descricao: "Combo imperdível com 2 X-tudo deliciosos! Cada lanche vem com hambúrguer, queijo, alface, tomate, cebola e molho especial. Acompanha batata frita crocante e refrigerante gelado. Perfeito para compartilhar ou para quem tem muita fome!",
      preco: "R$ 39,90",
      categoria: "Destaques",
      imagem: "https://storage.shopfood.io/public/companies/poe726g0/products/medium/5d90753b00b3038121091b63a9229736.png"
    },
    {
      id: 2,
      nome: "X-Bacon Especial por 45,90",
      descricao: "X-Bacon especial com hambúrguer artesanal, bacon crocante, queijo derretido, alface fresca, tomate e molho especial da casa. Acompanha batata frita e refrigerante. Uma explosão de sabores!",
      preco: "R$ 45,90",
      categoria: "Destaques",
      imagem: "https://storage.shopfood.io/public/companies/poe726g0/products/medium/5d90753b00b3038121091b63a9229736.png"
    },
    {
      id: 3,
      nome: "Mega Lanche Duplo por 52,90",
      descricao: "Mega lanche com dois hambúrgueres suculentos, queijo duplo, alface, tomate, cebola caramelizada e molho especial. Acompanha batata frita grande e refrigerante. Para quem tem muita fome!",
      preco: "R$ 52,90",
      categoria: "Destaques",
      imagem: "https://storage.shopfood.io/public/companies/poe726g0/products/medium/5d90753b00b3038121091b63a9229736.png"
    },
    {
      id: 4,
      nome: "X-Frango Grelhado por 38,90",
      descricao: "X-Frango grelhado com peito de frango temperado, queijo, alface, tomate, cebola e molho de ervas. Acompanha batata frita e refrigerante. Opção mais leve e saborosa!",
      preco: "R$ 38,90",
      categoria: "Destaques",
      imagem: "https://storage.shopfood.io/public/companies/poe726g0/products/medium/5d90753b00b3038121091b63a9229736.png"
    },
    {
      id: 5,
      nome: "Super Combo Família por 89,90",
      descricao: "Super combo família com 4 lanches variados, 4 batatas fritas, 4 refrigerantes e sobremesa. Inclui X-tudo, X-bacon, X-frango e X-salada. Perfeito para toda a família!",
      preco: "R$ 89,90",
      categoria: "Destaques",
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
      nome: "Refrigerante Coca-Cola 350ml",
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
      descricao: "Batata frita crocante porção grande, temperada com sal e ervas. Perfeita para compartilhar ou acompanhar qualquer lanche!",
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

  // Encontrar o produto diretamente
  const produtoId = Number(params.id);
  const produto = produtos.find(p => p.id === produtoId) || null;





  if (!produto) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Produto não encontrado</h1>
          <p className="text-gray-600 mb-4">O produto que você está procurando não existe.</p>
          <button 
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-[#542583] text-white rounded-lg hover:bg-[#4a1d6b] transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={{ marginTop: '200px' }}>
      {/* Header com botão voltar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50" style={{ height: '65px' }}>
        <div className="page-content-container-fixed h-full flex items-center justify-between">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h1 className="text-gray-800 font-medium" style={{ fontSize: '12px' }}>
            {currentSection === 'Produto' ? produto.nome : currentSection}
          </h1>
          
          <div className="w-5"></div>
        </div>
      </div>

      {/* Conteúdo da página - VAZIO para você adicionar componentes */}
      <div style={{ paddingTop: '65px' }} className="page-content-container">
        {/* 
          AQUI VOCÊ VAI ADICIONAR OS COMPONENTES UM POR UM:
          
          1. Imagem do produto
          2. Nome do produto
          3. Descrição completa
          4. Preço
          5. Opções de personalização (se houver)
          6. Botão de adicionar ao carrinho
          7. Informações nutricionais (se houver)
          8. Avaliações (se houver)
          9. Produtos relacionados
          10. etc...
        */}
        
        {/* Espaço para foto do produto */}
        <div 
          className="w-full bg-gray-100 flex items-center justify-center"
          style={{ height: '325px' }}
        >
          <img
            src={produto.imagem}
            alt={produto.nome}
            className="w-full h-full object-cover"
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
            {produto.nome}
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
            {produto.descricao}
          </p>
        </div>
        
        {/* Valor do produto */}
        <div className="px-4" style={{ paddingTop: '10px' }}>
          {produto.categoria === "Destaques" ? (
            <div className="flex items-center gap-2">
              <p 
                className="text-green-600"
                style={{ fontSize: '14px' }}
              >
                R$ 15,90
              </p>
              <p 
                className="text-gray-500 line-through"
                style={{ fontSize: '14px' }}
              >
                {produto.preco}
              </p>
            </div>
          ) : (
            <p 
              className="text-gray-800"
              style={{ 
                fontSize: '14px'
              }}
            >
              {produto.preco}
            </p>
          )}
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
              
              {/* Adicional 3 */}
              <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSR5yyBQvH1HFT9PkMOvSVHdBt5jd9bqznmCw&s"
                      alt="Batata Frita Grande"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium" style={{ fontSize: '14px' }}>
                      Batata Frita Grande
                    </p>
                    <p className="text-gray-500" style={{ fontSize: '12px' }}>
                      +R$ 8,90
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
              
              {/* Adicional 4 */}
              <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSR5yyBQvH1HFT9PkMOvSVHdBt5jd9bqznmCw&s"
                      alt="Refrigerante 350ml"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium" style={{ fontSize: '14px' }}>
                      Refrigerante 350ml
                    </p>
                    <p className="text-gray-500" style={{ fontSize: '12px' }}>
                      +R$ 4,90
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
              
              {/* Adicional 2 */}
              <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src="https://static.wixstatic.com/media/11062b_56249970bf6447a0ac1596fd40e03e2a~mv2.jpg/v1/fill/w_480,h_480,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/11062b_56249970bf6447a0ac1596fd40e03e2a~mv2.jpg"
                      alt="Cebola Caramelizada"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium" style={{ fontSize: '14px' }}>
                      Cebola Caramelizada
                    </p>
                    <p className="text-gray-500" style={{ fontSize: '12px' }}>
                      +R$ 3,00
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
              
              {/* Adicional 3 */}
              <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src="https://static.wixstatic.com/media/11062b_56249970bf6447a0ac1596fd40e03e2a~mv2.jpg/v1/fill/w_480,h_480,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/11062b_56249970bf6447a0ac1596fd40e03e2a~mv2.jpg"
                      alt="Picles Artesanal"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium" style={{ fontSize: '14px' }}>
                      Picles Artesanal
                    </p>
                    <p className="text-gray-500" style={{ fontSize: '12px' }}>
                      +R$ 1,50
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
              
              {/* Adicional 4 */}
              <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src="https://static.wixstatic.com/media/11062b_56249970bf6447a0ac1596fd40e03e2a~mv2.jpg/v1/fill/w_480,h_480,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/11062b_56249970bf6447a0ac1596fd40e03e2a~mv2.jpg"
                      alt="Molho Picante"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium" style={{ fontSize: '14px' }}>
                      Molho Picante
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
              
              {/* Adicional 5 */}
              <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src="https://static.wixstatic.com/media/11062b_56249970bf6447a0ac1596fd40e03e2a~mv2.jpg/v1/fill/w_480,h_480,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/11062b_56249970bf6447a0ac1596fd40e03e2a~mv2.jpg"
                      alt="Alface Crocante"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium" style={{ fontSize: '14px' }}>
                      Alface Crocante
                    </p>
                    <p className="text-gray-500" style={{ fontSize: '12px' }}>
                      +R$ 1,00
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
                  <button 
                    onClick={() => setQueroColher(!queroColher)}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                      queroColher 
                        ? 'border-[#542583]' 
                        : 'border-gray-300 hover:border-[#542583]'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-[#542583] transition-opacity ${
                      queroColher ? 'opacity-100' : 'opacity-0'
                    }`}></div>
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
              Adicionar <span style={{ marginLeft: '30px' }}>{produto.preco}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 