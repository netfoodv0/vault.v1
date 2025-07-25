import React from 'react'

export default function FinanceTableSkeleton({ rows = 5 }: { rows?: number }) {
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
          gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr',
          gap: '16px',
          alignItems: 'center',
          height: '46px'
        }}
      >
        {['Data/Hora', 'Nº Pedido', 'Método', 'Valor Bruto', 'Taxa', 'Valor Líquido', 'Status', 'Ações'].map((header, i) => (
          <div
            key={i}
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#374151',
              textAlign: 'center'
            }}
          >
            {header}
          </div>
        ))}
      </div>
      {/* Linhas do skeleton */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          style={{
            padding: '12px 24px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr',
            gap: '16px',
            alignItems: 'center',
            borderBottom: rowIndex < rows - 1 ? '1px solid #e5e7eb' : 'none',
            backgroundColor: 'white'
          }}
        >
          {/* Data/Hora */}
          <div>
            <div className="animate-pulse bg-gray-200 rounded" style={{ height: '14px', width: '60%', marginBottom: 4 }} />
            <div className="animate-pulse bg-gray-100 rounded" style={{ height: '12px', width: '40%' }} />
          </div>
          {/* Nº Pedido */}
          <div>
            <div className="animate-pulse bg-gray-200 rounded" style={{ height: '14px', width: '50%' }} />
          </div>
          {/* Método */}
          <div>
            <div className="animate-pulse bg-gray-200 rounded" style={{ height: '14px', width: '60%' }} />
          </div>
          {/* Valor Bruto */}
          <div>
            <div className="animate-pulse bg-gray-200 rounded" style={{ height: '14px', width: '50%' }} />
          </div>
          {/* Taxa */}
          <div>
            <div className="animate-pulse bg-gray-200 rounded" style={{ height: '14px', width: '40%' }} />
          </div>
          {/* Valor Líquido */}
          <div>
            <div className="animate-pulse bg-gray-200 rounded" style={{ height: '14px', width: '50%' }} />
          </div>
          {/* Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <div className="animate-pulse bg-gray-300 rounded-full" style={{ width: 12, height: 12 }} />
            <div className="animate-pulse bg-gray-200 rounded" style={{ height: '14px', width: '40%' }} />
          </div>
          {/* Ações */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <div className="animate-pulse bg-gray-200 rounded" style={{ width: 20, height: 20 }} />
            <div className="animate-pulse bg-gray-200 rounded" style={{ width: 20, height: 20 }} />
          </div>
        </div>
      ))}
    </div>
  )
} 