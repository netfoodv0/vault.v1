import React, { useEffect, useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Função para fechar com animação
  const handleClose = () => {
    setIsClosing(true);
    setIsVisible(false);
    // Aguardar animação terminar antes de chamar onClose
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  // Controlar animação de entrada e saída
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);
    }
  }, [isOpen]);

  // Fechar modal com ESC e controlar scroll
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Prevenir scroll do body quando modal estiver aberto
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      // Restaurar scroll do body quando modal fechar
      document.body.style.overflow = 'unset';
      document.body.style.position = 'static';
      document.body.style.width = 'auto';
    };
  }, [isOpen]);

  // Só remover do DOM quando não estiver aberto E não estiver fechando
  if (!isOpen && !isClosing) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      {/* Overlay com backdrop blur */}
      <div 
        className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-all duration-300 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal com animação de baixo para cima */}
      <div 
        className={`relative w-full h-[70vh] bg-white rounded-t-[16px] shadow-2xl transform transition-all duration-300 ease-out ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle de arrastar */}
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-300 rounded-full" />
        
        {/* Header do modal */}
        {title && (
          <div className="pt-8 pb-4 px-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          </div>
        )}
        
        {/* Conteúdo do modal */}
        <div className="h-full overflow-y-auto">
          {children}
          {/* Margem de 140px no final (40px + 100px) */}
          <div className="h-[140px]"></div>
        </div>
      </div>
    </div>
  );
} 