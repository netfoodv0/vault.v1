import React from 'react'

interface DataTableSkeletonProps {
  rows?: number
  columns?: number
}

export default function DataTableSkeleton({ rows = 8, columns = 4 }: DataTableSkeletonProps) {
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
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: '16px',
          alignItems: 'center',
          height: '46px'
        }}
      >
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index}>
            <div 
              className="animate-pulse bg-gray-300 rounded"
              style={{ 
                height: '14px',
                width: '70%'
              }}
            />
          </div>
        ))}
      </div>

      {/* Linhas da tabela */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={rowIndex}
          style={{
            padding: '12px 24px',
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: '16px',
            alignItems: 'center',
            borderBottom: rowIndex < rows - 1 ? '1px solid #e5e7eb' : 'none',
            backgroundColor: 'white'
          }}
        >
          {/* Coluna 1 - Pedido */}
          <div>
            <div 
              className="animate-pulse bg-gray-200 rounded"
              style={{ 
                height: '16px',
                width: '50%'
              }}
            />
          </div>

          {/* Coluna 2 - Cliente */}
          <div>
            <div 
              className="animate-pulse bg-gray-200 rounded"
              style={{ 
                height: '14px',
                width: '80%',
                marginBottom: '4px'
              }}
            />
            <div 
              className="animate-pulse bg-gray-100 rounded"
              style={{ 
                height: '12px',
                width: '60%'
              }}
            />
          </div>

          {/* Coluna 3 - Pagamento */}
          <div>
            <div 
              className="animate-pulse bg-gray-200 rounded"
              style={{ 
                height: '14px',
                width: '60%',
                marginBottom: '4px'
              }}
            />
            <div 
              className="animate-pulse bg-gray-100 rounded"
              style={{ 
                height: '12px',
                width: '70%'
              }}
            />
          </div>

          {/* Coluna 4 - Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div 
              className="animate-pulse bg-gray-200 rounded"
              style={{ 
                width: '16px',
                height: '16px'
              }}
            />
            <div 
              className="animate-pulse bg-gray-200 rounded"
              style={{ 
                height: '14px',
                width: '60%'
              }}
            />
          </div>

          {/* Coluna 5 - Ações */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <div 
              className="animate-pulse bg-gray-200 rounded"
              style={{ 
                width: '20px',
                height: '20px'
              }}
            />
            <div 
              className="animate-pulse bg-gray-200 rounded"
              style={{ 
                width: '20px',
                height: '20px'
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
} 