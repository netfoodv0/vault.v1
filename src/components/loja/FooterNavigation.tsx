'use client';

import React from 'react';

interface FooterNavigationProps {
  activeSection: 'inicio' | 'pedidos' | 'sacola';
  onSectionChange: (section: 'inicio' | 'pedidos' | 'sacola') => void;
}

export const FooterNavigation: React.FC<FooterNavigationProps> = ({ 
  activeSection, 
  onSectionChange 
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-[59px] bg-white/80 backdrop-blur-md border-t border-gray-200/50 z-50">
      <div className="page-content-container-fixed flex items-center justify-around h-full">
        {/* Seção Início */}
        <div 
          className="flex flex-col items-center cursor-pointer transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
          onClick={() => onSectionChange('inicio')}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            height="24px" 
            viewBox="0 -960 960 960" 
            width="24px" 
            fill={activeSection === 'inicio' ? '#542583' : '#747e91'} 
            className="mb-1 transition-all duration-200 ease-in-out"
          >
            <path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z"/>
          </svg>
          <div 
            className={`text-xs transition-all duration-300 ease-in-out overflow-hidden ${
              activeSection === 'inicio' 
                ? 'max-h-6 opacity-100' 
                : 'max-h-0 opacity-0'
            }`}
            style={{ color: '#542583' }}
          >
            Início
          </div>
        </div>
        
        {/* Seção Pedidos */}
        <div 
          className="flex flex-col items-center cursor-pointer transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
          onClick={() => onSectionChange('pedidos')}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            height="24px" 
            viewBox="0 -960 960 960" 
            width="24px" 
            fill={activeSection === 'pedidos' ? '#542583' : '#747e91'} 
            className="mb-1 transition-all duration-200 ease-in-out"
          >
            <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h168q13-36 43.5-58t68.5-22q38 0 68.5 22t43.5 58h168q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm80-80h280v-80H280v80Zm0-160h400v-80H280v80Zm0-160h400v-80H280v80Zm200-190q13 0 21.5-8.5T510-820q0-13-8.5-21.5T480-850q-13 0-21.5 8.5T450-820q0 13 8.5 21.5T480-790ZM200-200v-560 560Z"/>
          </svg>
          <div 
            className={`text-xs transition-all duration-300 ease-in-out overflow-hidden ${
              activeSection === 'pedidos' 
                ? 'max-h-6 opacity-100' 
                : 'max-h-0 opacity-0'
            }`}
            style={{ color: '#542583' }}
          >
            Pedidos
          </div>
        </div>
        
        {/* Seção Sacola */}
        <div 
          className="flex flex-col items-center cursor-pointer transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
          onClick={() => onSectionChange('sacola')}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            height="24px" 
            viewBox="0 -960 960 960" 
            width="24px" 
            fill={activeSection === 'sacola' ? '#542583' : '#747e91'} 
            className="mb-1 transition-all duration-200 ease-in-out"
          >
            <path d="M240-80q-33 0-56.5-23.5T160-160v-480q0-33 23.5-56.5T240-720h80q0-66 47-113t113-47q66 0 113 47t47 113h80q33 0 56.5 23.5T800-640v480q0 33-23.5 56.5T720-80H240Zm0-80h480v-480h-80v80q0 17-11.5 28.5T600-520q-17 0-28.5-11.5T560-560v-80H400v80q0 17-11.5 28.5T360-520q-17 0-28.5-11.5T320-560v-80h-80v480Zm160-560h160q0-33-23.5-56.5T480-800q-33 0-56.5 23.5T400-720ZM240-160v-480 480Z"/>
          </svg>
          <div 
            className={`text-xs transition-all duration-300 ease-in-out overflow-hidden ${
              activeSection === 'sacola' 
                ? 'max-h-6 opacity-100' 
                : 'max-h-0 opacity-0'
            }`}
            style={{ color: '#542583' }}
          >
            Sacola
          </div>
        </div>
      </div>
    </div>
  );
}; 