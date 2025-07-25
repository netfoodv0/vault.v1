import React from 'react';

interface Column {
  header: string;
  field: string;
  align?: 'left' | 'center' | 'right';
  render?: (item: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (item: any) => void;
}

export const DataTable: React.FC<DataTableProps> = ({ columns, data, onRowClick }) => {
  return (
    <div 
      style={{
        backgroundColor: 'white',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    >
      {/* Cabeçalho da tabela */}
      <div 
        style={{
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #d1d5db',
          padding: '12px 24px',
          display: 'grid',
          gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
          gap: '16px',
          alignItems: 'center'
        }}
      >
        {columns.map((column, index) => (
          <div 
            key={index}
            style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#374151',
              textAlign: column.align || 'left'
            }}
          >
            {column.header}
          </div>
        ))}
      </div>

      {/* Linhas da tabela */}
      {data.map((item, rowIndex) => (
        <div 
          key={rowIndex}
          onClick={() => onRowClick?.(item)}
          style={{
            padding: '12px 24px',
            display: 'grid',
            gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
            gap: '16px',
            alignItems: 'center',
            borderBottom: rowIndex < data.length - 1 ? '1px solid #e5e7eb' : 'none',
            backgroundColor: 'white',
            cursor: onRowClick ? 'pointer' : 'default',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            if (onRowClick) {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
          }}
        >
          {columns.map((column, colIndex) => (
            <div
              key={colIndex}
              style={{ 
                fontSize: '14px',
                color: colIndex === 0 ? '#374151' : '#6b7280',
                fontWeight: colIndex === 0 ? '500' : 'normal',
                textAlign: column.align || 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: column.align === 'center' ? 'center' : 'flex-start'
              }}
            >
              {column.render ? column.render(item) : item[column.field]}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

// Componente Toggle que pode ser usado nas células
interface ToggleProps {
  value: boolean;
  onChange: () => void;
  size?: 'small' | 'normal';
}

export const Toggle: React.FC<ToggleProps> = ({ 
  value, 
  onChange,
  size = 'normal'
}) => {
  const dimensions = size === 'small' ? {
    width: '36px',
    height: '20px',
    handleSize: '14px',
    handleOffset: '3px',
    handleTranslate: '19px'
  } : {
    width: '44px',
    height: '24px',
    handleSize: '16px',
    handleOffset: '4px',
    handleTranslate: '24px'
  };

  return (
    <div 
      className={`toggle-switch cursor-pointer ${value ? 'active' : 'inactive'}`}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        borderRadius: '12px',
        backgroundColor: value ? '#542583' : '#d1d5db',
        position: 'relative',
        transition: 'all 0.3s ease-in-out'
      }}
    >
      <div 
        className="toggle-handle"
        style={{
          width: dimensions.handleSize,
          height: dimensions.handleSize,
          borderRadius: '50%',
          backgroundColor: 'white',
          position: 'absolute',
          top: dimensions.handleOffset,
          transform: value ? `translateX(${dimensions.handleTranslate})` : `translateX(${dimensions.handleOffset})`,
          transition: 'all 0.3s ease-in-out'
        }}
      ></div>
    </div>
  );
}; 