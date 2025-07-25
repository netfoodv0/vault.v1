import React from 'react';
import '../styles/mesa-card-variables.css';

// Tipos para o componente MesaCard
export interface MesaCardProps {
  mesaNumero: number;
  tipo: 'Delivery' | 'Balcão' | 'Retirada';
  cliente: string;
  valor: string;
  tempo: string;
  status: 'A cobrar' | 'Pago' | 'Em preparo' | 'Pronto' | 'Entregue';
  onEdit?: () => void;
  onPrint?: () => void;
  onTransfer?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  isOccupied?: boolean;
  className?: string;
}

export const MesaCard: React.FC<MesaCardProps> = ({
  mesaNumero,
  tipo,
  cliente,
  valor,
  tempo,
  status,
  onEdit,
  onPrint,
  onTransfer,
  onAccept,
  onReject,
  isOccupied = true,
  className = ''
}) => {
  // Determinar cor de fundo baseada no status
  const getBackgroundColor = () => {
    if (!isOccupied) return 'var(--mesa-card-state-empty)';
    
    switch (status) {
      case 'Pago':
        return 'var(--mesa-card-status-paid)';
      case 'Em preparo':
        return 'var(--mesa-card-state-reserved)';
      case 'Pronto':
        return '#059669';
      case 'Entregue':
        return '#6b7280';
      default:
        return 'var(--mesa-card-primary)';
    }
  };

  // Determinar cor do texto baseada no status
  const getTextColor = () => {
    if (!isOccupied) return 'var(--mesa-card-text-primary)';
    return 'var(--mesa-card-text-primary)';
  };

  // Determinar se deve mostrar botões de ação
  const shouldShowActionButtons = status === 'A cobrar' && isOccupied;

  return (
    <div 
      className={`mesa-card ${className}`}
      style={{
        backgroundColor: getBackgroundColor(),
        color: getTextColor(),
      }}
    >
      {/* Header do Card */}
      <div className="mesa-card-header">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--mesa-card-gap-medium)'
        }}>
          <svg 
            width="var(--mesa-card-icon-size-small)" 
            height="var(--mesa-card-icon-size-small)" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            style={{ color: 'currentColor' }}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
            />
          </svg>
          <span style={{
            fontSize: 'var(--mesa-card-font-size-base)',
            fontWeight: 'var(--mesa-card-font-weight-medium)'
          }}>
            {tipo} {mesaNumero}
          </span>
        </div>
        
        <span style={{
          fontSize: 'var(--mesa-card-font-size-xs)',
          color: 'var(--mesa-card-text-secondary)',
          marginTop: 'var(--mesa-card-gap-small)'
        }}>
          {tempo}
        </span>
        
        {/* Ícones de ação */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: 'var(--mesa-card-padding-horizontal)',
          display: 'flex',
          gap: 'var(--mesa-card-gap-medium)'
        }}>
          {onEdit && (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              height="24px" 
              viewBox="0 -960 960 960" 
              width="24px" 
              fill="currentColor"
              style={{ 
                color: 'currentColor', 
                cursor: 'pointer',
                transition: 'opacity var(--mesa-card-transition-fast)'
              }}
              onClick={onEdit}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = 'var(--mesa-card-opacity-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              <path d="M360-600v-80h360v80H360Zm0 120v-80h360v80H360ZM560-80v-123l221-220q9-9 20-13t22-4q12 0 23 4.5t20 13.5l37 37q8 9 12.5 20t4.5 22q0 11-4 22.5T903-300L683-80H560Zm263-224 37-39-37-37-38 38 38 38ZM240-80q-50 0-85-35t-35-85v-120h120v-560h600v361q-20-2-40.5 1.5T760-505v-295H320v480h240l-80 80v160H240Z"/>
            </svg>
          )}
          
          {onPrint && (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              height="24px" 
              viewBox="0 -960 960 960" 
              width="24px" 
              fill="currentColor"
              style={{ 
                color: 'currentColor', 
                cursor: 'pointer',
                transition: 'opacity var(--mesa-card-transition-fast)'
              }}
              onClick={onPrint}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = 'var(--mesa-card-opacity-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              <path d="M720-680H240v-160h480v160Zm0 220q17 0 28.5-11.5T760-500q0-17-11.5-28.5T720-540q-17 0-28.5 11.5T680-500q0 17 11.5 28.5T720-460Zm-80 260v-160H320v160h320Zm80 80H240v-160H80v-240q0-51 35-85.5t85-34.5h560q51 0 85.5 34.5T880-520v240H720v160Z"/>
            </svg>
          )}
          
          {onTransfer && (
            <svg 
              width="var(--mesa-card-icon-size)" 
              height="var(--mesa-card-icon-size)" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              style={{ 
                color: 'currentColor', 
                cursor: 'pointer',
                transition: 'opacity var(--mesa-card-transition-fast)'
              }}
              onClick={onTransfer}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = 'var(--mesa-card-opacity-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" 
              />
            </svg>
          )}
        </div>
      </div>
      
      {/* Divisor */}
      <div className="mesa-card-divider" />
      
      {/* Conteúdo do Card */}
      <div className="mesa-card-content">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          width: '100%'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%'
          }}>
            <span style={{
              fontSize: 'var(--mesa-card-font-size-base)',
              color: 'currentColor',
              fontWeight: 'var(--mesa-card-font-weight-medium)',
              marginLeft: '1px',
              marginRight: '1px'
            }}>
              Pedido via PDV
            </span>
            <span style={{
              fontSize: 'var(--mesa-card-font-size-base)',
              color: 'currentColor',
              fontWeight: 'var(--mesa-card-font-weight-medium)'
            }}>
              {cliente}
            </span>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            width: '100%'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--mesa-card-gap-small)'
            }}>
              <span style={{
                fontSize: 'var(--mesa-card-font-size-base)',
                color: 'currentColor',
                fontWeight: 'var(--mesa-card-font-weight-medium)',
                marginLeft: '1px',
                marginRight: '1px'
              }}>
                {valor}
              </span>
              
              <div className="mesa-card-badge">
                <span style={{
                  fontSize: 'var(--mesa-card-badge-font-size)',
                  color: 'var(--mesa-card-text-primary)',
                  fontWeight: 'var(--mesa-card-font-weight-medium)'
                }}>
                  {status}
                </span>
              </div>
            </div>
            
            {/* Botões de ação */}
            {shouldShowActionButtons && (
              <div style={{
                display: 'flex',
                gap: 'var(--mesa-card-gap-medium)'
              }}>
                {onReject && (
                  <button 
                    className="mesa-card-button"
                    onClick={onReject}
                  >
                    Recusar
                  </button>
                )}
                
                {onAccept && (
                  <button 
                    className="mesa-card-button mesa-card-button--success"
                    onClick={onAccept}
                  >
                    Aceitar
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MesaCard; 