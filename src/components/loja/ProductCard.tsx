'use client';

import React from 'react';

interface ProductCardProps {
  id: number;
  nome: string;
  descricao: string;
  preco: string;
  imagem: string;
  onClick: (id: number) => void;
  showDivider?: boolean;
}

export function ProductCard({ 
  id, 
  nome, 
  descricao, 
  preco, 
  imagem, 
  onClick, 
  showDivider = false 
}: ProductCardProps) {
  return (
    <div className="product-card">
      <div 
        className="product-card__content"
        onClick={() => onClick(id)}
      >
        <div className="product-card__info">
          <h3 className="product-card__title">
            {nome}
          </h3>
          <p className="product-card__description">
            {descricao}
          </p>
          <p className="product-card__price">
            {preco}
          </p>
        </div>
        
        <div className="product-card__image">
          <img 
            src={imagem}
            alt={nome}
            className="product-card__image-element"
          />
        </div>
      </div>
      
      {showDivider && (
        <div className="product-card__divider" />
      )}
    </div>
  );
} 