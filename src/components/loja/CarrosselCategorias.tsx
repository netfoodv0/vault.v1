'use client';

import React, { useState, useEffect, useRef } from 'react';

// Categorias fixas (fallback caso não haja dados do Firebase)
const categoriasFallback = [
  'Categoria1',
  'Categoria2',
  'Bebidas',
  'Sobremesas',
  'Acompanhamentos'
];

interface CarrosselCategoriasProps {
  activeCategory?: number;
  onSearchChange?: (searchTerm: string) => void;
  onShowCategories?: (show: boolean) => void;
  categoriasFirebase?: string[]; // Nova prop para categorias do Firebase
}

export function CarrosselCategorias({ 
  activeCategory = 0, 
  onSearchChange, 
  onShowCategories,
  categoriasFirebase
}: CarrosselCategoriasProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isManualScroll, setIsManualScroll] = useState(false);
  const [isHoveringFirstCategory, setIsHoveringFirstCategory] = useState(false);
  const carrosselRef = useRef<HTMLDivElement>(null);

  // Usar categorias do Firebase se disponíveis, senão usar fallback
  const categorias = categoriasFirebase && categoriasFirebase.length > 0 
    ? categoriasFirebase 
    : categoriasFallback;

  // Atualizar o índice selecionado quando activeCategory mudar
  useEffect(() => {
    if (!isManualScroll) {
      setSelectedIndex(activeCategory);
      // Centralizar a categoria ativa apenas se a barra estiver visível
      setTimeout(() => {
        // Verificar se a barra de categorias está visível
        const carrosselElement = carrosselRef.current;
        if (carrosselElement) {
          const rect = carrosselElement.getBoundingClientRect();
          const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
          
          if (isVisible) {
            centerActiveCategory(activeCategory);
          }
        }
      }, 150);
    }
  }, [activeCategory, isManualScroll]);

  // Notificar mudanças na pesquisa
  useEffect(() => {
    if (onSearchChange) {
      onSearchChange(searchTerm);
    }
  }, [searchTerm, onSearchChange]);

  // Notificar mudanças na visibilidade da barra de categorias
  useEffect(() => {
    if (onShowCategories) {
      onShowCategories(isHoveringFirstCategory);
    }
  }, [isHoveringFirstCategory, onShowCategories]);

  const centerActiveCategory = (index: number) => {
    if (carrosselRef.current) {
      const carrossel = carrosselRef.current;
      const buttons = carrossel.querySelectorAll('button');
      
      if (buttons[index]) {
        const button = buttons[index] as HTMLElement;
        const carrosselRect = carrossel.getBoundingClientRect();
        const buttonRect = button.getBoundingClientRect();
        
        // Calcular a posição para centralizar
        const carrosselCenter = carrosselRect.width / 2;
        const buttonCenter = buttonRect.left - carrosselRect.left + buttonRect.width / 2;
        const currentOffset = Math.abs(buttonCenter - carrosselCenter);
        
        // Só centralizar se a categoria não estiver já centralizada (com tolerância de 20px)
        if (currentOffset > 20) {
          const scrollOffset = buttonCenter - carrosselCenter;
          
          // Calcular a nova posição de scroll
          const newScrollLeft = carrossel.scrollLeft + scrollOffset;
          
          // Verificar limites para não scrollar além do conteúdo
          const maxScrollLeft = carrossel.scrollWidth - carrossel.clientWidth;
          const finalScrollLeft = Math.max(0, Math.min(newScrollLeft, maxScrollLeft));
          
          // Scroll suave para centralizar
          carrossel.scrollTo({
            left: finalScrollLeft,
            behavior: 'smooth'
          });
        }
      }
    }
  };

  const handleSearchClick = () => {
    setIsSearchMode(true);
  };

  const handleBackClick = () => {
    setIsSearchMode(false);
    setSearchTerm('');
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleCategoriaClick = (categoria: string, index: number) => {
    setSelectedIndex(index);
    setIsManualScroll(true);
    
    // Centralizar a categoria clicada imediatamente
    centerActiveCategory(index);
    
    // Scroll para a seção correspondente
    let targetId = '';
    
    // Se estamos usando categorias do Firebase, criar ID dinâmico
    if (categoriasFirebase && categoriasFirebase.length > 0) {
      targetId = `${categoria.toLowerCase().replace(/\s+/g, '-')}-section`;
    } else {
      // Fallback para categorias fixas
      switch (categoria) {
        case 'Categoria1':
          targetId = 'categoria1-section';
          break;
        case 'Categoria2':
          targetId = 'categoria2-section';
          break;
        case 'Bebidas':
          targetId = 'bebidas-section';
          break;
        case 'Sobremesas':
          targetId = 'sobremesas-section';
          break;
        case 'Acompanhamentos':
          targetId = 'acompanhamentos-section';
          break;
        default:
          return;
      }
    }
    
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      // Scroll suave para a seção com offset para a barra fixa
      const offset = 80; // altura da barra fixa + padding
      const targetPosition = targetElement.offsetTop - offset;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });

      // Resetar o flag de scroll manual após um tempo
      setTimeout(() => {
        setIsManualScroll(false);
      }, 1000);
    }
  };

  // Handlers para o hover da primeira categoria
  const handleFirstCategoryMouseEnter = () => {
    setIsHoveringFirstCategory(true);
  };

  const handleFirstCategoryMouseLeave = () => {
    setIsHoveringFirstCategory(false);
  };

  return (
    <div className="relative">
      <div 
        ref={carrosselRef}
        data-carrossel
        className="bg-gray-200 h-10 rounded-full p-1 relative overflow-x-auto scrollbar-hide flex-shrink-0" 
        style={{ borderRadius: '100px' }}
      >
        {isSearchMode ? (
          // Modo de pesquisa
          <div className="flex items-center h-8 px-4 gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar na loja"
              className="flex-1 bg-transparent text-[13px] font-medium text-gray-700 placeholder-gray-500 outline-none border-none ring-0 focus:ring-0 focus:border-none"
              style={{ 
                border: 'none',
                outline: 'none',
                boxShadow: 'none'
              }}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  handleBackClick();
                }
              }}
            />
            {searchTerm ? (
              <button
                onClick={handleClearSearch}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  height="24" 
                  viewBox="0 -960 960 960" 
                  width="24" 
                  fill="#1f1f1f"
                >
                  <path d="m336-280-56-56 144-144-144-143 56-56 144 144 143-144 56 56-144 143 144 144-56 56-143-144-144 144Z"/>
                </svg>
              </button>
            ) : (
              <button
                onClick={handleBackClick}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  height="24" 
                  viewBox="0 -960 960 960" 
                  width="24" 
                  fill="#1f1f1f"
                >
                  <path d="m336-280-56-56 144-144-144-143 56-56 144 144 143-144 56 56-144 143 144 144-56 56-143-144-144 144Z"/>
                </svg>
              </button>
            )}
          </div>
        ) : (
          // Modo normal - carrossel
          <div className="flex items-center h-8 gap-3 px-2 pr-12 min-w-max flex-shrink-0">
            {categorias.map((categoria, index) => (
              <button
                key={index}
                onClick={() => handleCategoriaClick(categoria, index)}
                onMouseEnter={index === 0 ? handleFirstCategoryMouseEnter : undefined}
                onMouseLeave={index === 0 ? handleFirstCategoryMouseLeave : undefined}
                className={`px-4 py-1.5 text-[13px] font-medium transition-all duration-500 ease-in-out rounded-full whitespace-nowrap transform hover:scale-105 max-w-[180px] truncate ${
                  selectedIndex === index 
                    ? 'bg-white text-[#542583] shadow-lg scale-105' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                title={categoria} // Tooltip para mostrar o nome completo
              >
                {categoria}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Bolinha com lupa - fixa na direita */}
      {!isSearchMode && (
        <div 
          onClick={handleSearchClick}
          className="absolute top-1 right-1 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors duration-200 z-20"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            height="16" 
            viewBox="0 -960 960 960" 
            width="16" 
            fill="#1f1f1f"
          >
            <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/>
          </svg>
        </div>
      )}
    </div>
  );
} 