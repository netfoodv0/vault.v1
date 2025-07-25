'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

// Dados mockados de produtos para demonstração
const produtos = [
  { id: 1, nome: 'Pizza Margherita', preco: 'R$ 25,90', imagem: 'https://storage.shopfood.io/public/companies/poe726g0/products/medium/cd637881cccb8c0004da6f17a9b54f5f.jpg' },
  { id: 2, nome: 'Hambúrguer Clássico', preco: 'R$ 18,50', imagem: 'https://storage.shopfood.io/public/companies/poe726g0/products/medium/cd637881cccb8c0004da6f17a9b54f5f.jpg' },
  { id: 3, nome: 'Refrigerante Cola', preco: 'R$ 6,90', imagem: 'https://storage.shopfood.io/public/companies/poe726g0/products/medium/cd637881cccb8c0004da6f17a9b54f5f.jpg' },
  { id: 4, nome: 'Batata Frita', preco: 'R$ 12,00', imagem: 'https://storage.shopfood.io/public/companies/poe726g0/products/medium/cd637881cccb8c0004da6f17a9b54f5f.jpg' },
  { id: 5, nome: 'Sorvete de Chocolate', preco: 'R$ 8,50', imagem: 'https://storage.shopfood.io/public/companies/poe726g0/products/medium/cd637881cccb8c0004da6f17a9b54f5f.jpg' },
  { id: 6, nome: 'Salada Caesar', preco: 'R$ 15,90', imagem: 'https://storage.shopfood.io/public/companies/poe726g0/products/medium/cd637881cccb8c0004da6f17a9b54f5f.jpg' },
  { id: 7, nome: 'Milk Shake', preco: 'R$ 10,90', imagem: 'https://storage.shopfood.io/public/companies/poe726g0/products/medium/cd637881cccb8c0004da6f17a9b54f5f.jpg' },
  { id: 8, nome: 'Combo Especial', preco: 'R$ 32,90', imagem: 'https://storage.shopfood.io/public/companies/poe726g0/products/medium/cd637881cccb8c0004da6f17a9b54f5f.jpg' },
  { id: 9, nome: 'X-Bacon', preco: 'R$ 22,50', imagem: 'https://storage.shopfood.io/public/companies/poe726g0/products/medium/cd637881cccb8c0004da6f17a9b54f5f.jpg' },
  { id: 10, nome: 'Pizza 4 Queijos', preco: 'R$ 28,90', imagem: 'https://storage.shopfood.io/public/companies/poe726g0/products/medium/cd637881cccb8c0004da6f17a9b54f5f.jpg' },
  { id: 11, nome: 'Cachorro Quente', preco: 'R$ 14,50', imagem: 'https://storage.shopfood.io/public/companies/poe726g0/products/medium/cd637881cccb8c0004da6f17a9b54f5f.jpg' },
  { id: 12, nome: 'Suco Natural', preco: 'R$ 7,90', imagem: 'https://storage.shopfood.io/public/companies/poe726g0/products/medium/cd637881cccb8c0004da6f17a9b54f5f.jpg' },
];

export function CarrosselProdutos() {
  const router = useRouter();

  const handleProdutoClick = (produtoId: number) => {
    router.push(`/loja/produto/${produtoId}`);
  };

  return (
    <div className="relative">
      {/* Container do carrossel com scroll horizontal */}
      <div className="overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing relative">
        <div className="flex gap-4 pb-4 px-4" style={{ minWidth: 'max-content' }}>
          {produtos.map((produto) => (
            <div
              key={produto.id}
              className="flex-shrink-0 bg-white overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
              style={{ width: '131px', minHeight: '200px', padding: '12px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
              onClick={() => handleProdutoClick(produto.id)}
            >
              {/* Imagem do produto */}
              <div className="w-full h-18 bg-gray-100 flex items-center justify-center" style={{ borderRadius: '8px' }}>
                <img
                  src={produto.imagem}
                  alt={produto.nome}
                  className="w-full h-full object-cover"
                  style={{ borderRadius: '8px' }}
                />
              </div>
              
              {/* Informações do produto */}
              <div className="p-0 flex-1 flex flex-col justify-between" style={{ minHeight: '80px' }}>
                <h3 className="font-bold text-gray-800 mb-0.5" style={{ paddingTop: '8px', fontSize: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: '225px' }}>
                  {produto.nome}
                </h3>
                <div style={{ marginTop: '-10px' }}>
                  <p className="text-sm text-gray-500 mb-0 mt-2 line-through">
                    {produto.preco}
                  </p>
                  <div className="flex justify-between items-center mb-0">
                    <p className="text-sm" style={{ color: '#50a773' }}>
                      R$ 15,90
                    </p>
                    <p className="text-sm px-1 py-0.5 rounded" style={{ color: '#50a773', backgroundColor: '#Deffed' }}>
                      -24%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {/* Espaço extra no final para scroll */}
          <div className="w-6 flex-shrink-0" />
        </div>
      </div>
      
    </div>
  );
} 