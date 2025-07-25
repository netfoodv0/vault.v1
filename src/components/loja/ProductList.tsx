'use client';

import React, { RefObject } from 'react';
import { ProductCard } from './ProductCard';

interface Product {
  id: number;
  nome: string;
  descricao: string;
  preco: string;
  categoria: string;
  imagem: string;
}

interface ProductListProps {
  products: Product[];
  onProductClick: (id: number) => void;
  refs?: {
    categoria1Ref?: RefObject<HTMLDivElement>;
    categoria2Ref?: RefObject<HTMLDivElement>;
    bebidasRef?: RefObject<HTMLDivElement>;
    sobremesasRef?: RefObject<HTMLDivElement>;
    acompanhamentosRef?: RefObject<HTMLDivElement>;
  };
}

export function ProductList({ products, onProductClick, refs }: ProductListProps) {
  // Agrupar produtos por categoria
  const productsByCategory = products.reduce((acc, product) => {
    if (!acc[product.categoria]) {
      acc[product.categoria] = [];
    }
    acc[product.categoria].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  // Função para mapear nome da categoria para ID da seção
  const getCategorySectionId = (categoryName: string) => {
    switch (categoryName) {
      case 'Categoria1':
        return 'categoria1-section';
      case 'Categoria2':
        return 'categoria2-section';
      case 'Bebidas':
        return 'bebidas-section';
      case 'Sobremesas':
        return 'sobremesas-section';
      case 'Acompanhamentos':
        return 'acompanhamentos-section';
      default:
        return `${categoryName.toLowerCase()}-section`;
    }
  };

  // Função para obter a ref correta para cada categoria
  const getCategoryRef = (categoryName: string) => {
    if (!refs) return undefined;
    
    switch (categoryName) {
      case 'Categoria1':
        return refs.categoria1Ref;
      case 'Categoria2':
        return refs.categoria2Ref;
      case 'Bebidas':
        return refs.bebidasRef;
      case 'Sobremesas':
        return refs.sobremesasRef;
      case 'Acompanhamentos':
        return refs.acompanhamentosRef;
      default:
        return undefined;
    }
  };

  return (
    <div className="product-list">
      {Object.entries(productsByCategory).map(([category, categoryProducts], categoryIndex) => (
        <div 
          key={category} 
          className="product-category"
          id={getCategorySectionId(category)}
          ref={getCategoryRef(category)}
        >
          <h2 className="product-category__title">
            {category}
          </h2>
          
          <div className="product-category__items">
            {categoryProducts.map((product, productIndex) => (
              <ProductCard
                key={product.id}
                id={product.id}
                nome={product.nome}
                descricao={product.descricao}
                preco={product.preco}
                imagem={product.imagem}
                onClick={onProductClick}
                showDivider={productIndex < categoryProducts.length - 1}
              />
            ))}
          </div>
        </div>
      ))}
      
      {/* Linha horizontal no final da lista */}
      <div className="border-t border-gray-200 mt-6"></div>
    </div>
  );
} 