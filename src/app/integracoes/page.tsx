'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function IntegracoesPage() {
  const { loading } = useAuth()
  const [fbPixelAtivo, setFbPixelAtivo] = useState(false)
  const [ifoodAtivo, setIfoodAtivo] = useState(false)

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#ececec' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: '#ececec' }}>
        <div className="flex-1" style={{ padding: '32px' }}>
          <div className="bg-white rounded-lg p-6" style={{ height: '700px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '32px' }}>
              Integrações
            </h1>
            
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
              Analytics e Marketing
            </h3>
            <div className="border border-gray-200 rounded-lg flex flex-col items-start" style={{ width: '471px', height: '200px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%', marginTop: '0px' }}>
                <img 
                  src="/facebook-pixel.png" 
                  alt="Facebook Pixel" 
                  style={{ 
                    width: '120px', 
                    height: '50px', 
                    marginRight: '16px',
                    objectFit: 'cover',
                    borderRadius: '4px'
                  }}
                />
                <span style={{ color: '#542583', fontSize: '18px', fontWeight: '500', alignSelf: 'flex-start', marginTop: '0px' }}>
                  Facebook Pixel
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '16px', marginLeft: '0' }}>
                <button
                  onClick={() => setFbPixelAtivo((v) => !v)}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    background: fbPixelAtivo ? '#542583' : '#d1d5db',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    marginRight: '12px',
                  }}
                  aria-pressed={fbPixelAtivo}
                >
                  <span
                    style={{
                      display: 'block',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: '#fff',
                      transform: fbPixelAtivo ? 'translateX(20px)' : 'translateX(4px)',
                      transition: 'transform 0.2s',
                    }}
                  />
                </button>
                <span style={{ color: '#374151', fontSize: '15px', fontWeight: 500 }}>
                  Ativar integração Facebook Pixel
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginTop: '32px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6b7280" style={{ marginRight: '8px' }}>
                  <path d="m384-336 56-58-86-86 86-86-56-58-144 144 144 144Zm192 0 144-144-144-144-56 58 86 86-86 86 56 58ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h168q13-36 43.5-58t68.5-22q38 0 68.5 22t43.5 58h168q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm280-590q13 0 21.5-8.5T510-820q0-13-8.5-21.5T480-850q-13 0-21.5 8.5T450-820q0 13 8.5 21.5T480-790ZM200-200v-560 560Z"/>
                </svg>
                <input 
                  type="text" 
                  placeholder="Digite o ID do Pixel"
                  disabled={!fbPixelAtivo}
                  style={{ 
                    flex: 1,
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    color: fbPixelAtivo ? '#374151' : '#9ca3af',
                    backgroundColor: fbPixelAtivo ? '#fff' : '#f3f4f6',
                    cursor: fbPixelAtivo ? 'text' : 'not-allowed'
                  }}
                />
              </div>
            </div>
            
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px', marginTop: '24px' }}>
              Marketplace
            </h3>
            <div className="border border-gray-200 rounded-lg flex flex-col items-start" style={{ width: '471px', height: '200px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%', marginTop: '0px' }}>
                <img 
                  src="/ifood.png" 
                  alt="iFood" 
                  style={{ 
                    width: '120px', 
                    height: '50px', 
                    marginRight: '16px',
                    objectFit: 'cover',
                    borderRadius: '4px'
                  }}
                />
                <span style={{ color: '#542583', fontSize: '18px', fontWeight: '500', alignSelf: 'flex-start', marginTop: '0px' }}>
                  iFood
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '16px', marginLeft: '0' }}>
                <button
                  onClick={() => setIfoodAtivo((v) => !v)}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    background: ifoodAtivo ? '#542583' : '#d1d5db',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    marginRight: '12px',
                  }}
                  aria-pressed={ifoodAtivo}
                >
                  <span
                    style={{
                      display: 'block',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: '#fff',
                      transform: ifoodAtivo ? 'translateX(20px)' : 'translateX(4px)',
                      transition: 'transform 0.2s',
                    }}
                  />
                </button>
                <span style={{ color: '#374151', fontSize: '15px', fontWeight: 500 }}>
                  Ativar integração com iFood
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginTop: '32px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6b7280" style={{ marginRight: '8px' }}>
                  <path d="m384-336 56-58-86-86 86-86-56-58-144 144 144 144Zm192 0 144-144-144-144-56 58 86 86-86 86 56 58ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h168q13-36 43.5-58t68.5-22q38 0 68.5 22t43.5 58h168q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm280-590q13 0 21.5-8.5T510-820q0-13-8.5-21.5T480-850q-13 0-21.5 8.5T450-820q0 13 8.5 21.5T480-790ZM200-200v-560 560Z"/>
                </svg>
                <input 
                  type="text" 
                  placeholder="Digite o ID da loja principal"
                  disabled={!ifoodAtivo}
                  style={{ 
                    flex: 1,
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    color: ifoodAtivo ? '#374151' : '#9ca3af',
                    backgroundColor: ifoodAtivo ? '#fff' : '#f3f4f6',
                    cursor: ifoodAtivo ? 'text' : 'not-allowed'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
