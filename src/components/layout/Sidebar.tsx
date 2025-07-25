
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useAdministrarLoja } from '@/hooks/useAdministrarLoja'
import { useState, useEffect } from 'react'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  description: string
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/pedidos',
    label: 'Pedidos',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="white">
        <path d="M240-80q-50 0-85-35t-35-85v-120h120v-560l60 60 60-60 60 60 60-60 60 60 60-60 60 60 60-60 60 60 60-60v680q0 50-35 85t-85 35H240Zm480-80q17 0 28.5-11.5T760-200v-560H320v440h360v120q0 17 11.5 28.5T720-160ZM360-600v-80h240v80H360Zm0 120v-80h240v80H360Zm320-120q-17 0-28.5-11.5T640-640q0-17 11.5-28.5T680-680q17 0 28.5 11.5T720-640q0 17-11.5 28.5T680-600Zm0 120q-17 0-28.5-11.5T640-520q0-17 11.5-28.5T680-560q17 0 28.5 11.5T720-520q0 17-11.5 28.5T680-480ZM240-160h360v-80H200v40q0 17 11.5 28.5T240-160Zm-40 0v-80 80Z"/>
      </svg>
    ),
    description: 'Gerenciar pedidos'
  },

  {
    href: '/relatorios',
    label: 'Relatórios',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="white">
        <path d="M640-160v-280h160v280H640Zm-240 0v-640h160v640H400Zm-240 0v-440h160v440H160Z"/>
      </svg>
    ),
    description: 'Visualizar relatórios'
  },
  {
    href: '/cardapio',
    label: 'Cardápio',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="white">
        <path d="M240-80q-33 0-56.5-23.5T160-160v-80h-40v-80h40v-120h-40v-80h40v-120h-40v-80h40v-80q0-33 23.5-56.5T240-880h480q33 0 56.5 23.5T800-800v640q0 33-23.5 56.5T720-80H240Zm0-80h480v-640H240v80h40v80h-40v120h40v80h-40v120h40v80h-40v80Zm0 0v-640 640Zm140-120h60v-160q26-7 43-28.5t17-48.5v-163h-40v151h-30v-151h-40v151h-30v-151h-40v163q0 27 17 48.5t43 28.5v160Zm220 0h60v-400q-50 0-85 35t-35 85v120h60v160Z"/>
      </svg>
    ),
    description: 'Gerenciar produtos'
  },
  {
    href: '/administrar',
    label: 'Administrar',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="white">
        <path d="M600-120h240v-33q-25-23-56-35t-64-12q-33 0-64 12t-56 35v33Zm120-120q25 0 42.5-17.5T780-300q0-25-17.5-42.5T720-360q-25 0-42.5 17.5T660-300q0 25 17.5 42.5T720-240ZM480-480Zm2-140q-58 0-99 41t-41 99q0 48 27 84t71 50q0-23 .5-44t8.5-38q-14-8-20.5-22t-6.5-30q0-25 17.5-42.5T482-540q15 0 28.5 7.5T533-512q11-5 23-7t24-2h36q-13-43-49.5-71T482-620ZM370-80l-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-85 65H696q-1-5-2-10.5t-3-10.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q24 25 54 42t65 22v184h-70Zm210 40q-25 0-42.5-17.5T520-100v-280q0-25 17.5-42.5T580-440h280q25 0 42.5 17.5T920-380v280q0 25-17.5 42.5T860-40H580Z"/>
      </svg>
    ),
    description: 'Configurações da loja'
  },
  {
    href: '/cupons',
    label: 'Cupons',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="white">
        <path d="m368-320 112-84 110 84-42-136 112-88H524l-44-136-44 136H300l110 88-42 136ZM160-160q-33 0-56.5-23.5T80-240v-135q0-11 7-19t18-10q24-8 39.5-29t15.5-47q0-26-15.5-47T105-556q-11-2-18-10t-7-19v-135q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v135q0 11-7 19t-18 10q-24 8-39.5 29T800-480q0 26 15.5 47t39.5 29q11 2 18 10t7 19v135q0 33-23.5 56.5T800-160H160Zm0-80h640v-102q-37-22-58.5-58.5T720-480q0-43 21.5-79.5T800-618v-102H160v102q37 22 58.5 58.5T240-480q0 43-21.5 79.5T160-342v102Zm320-240Z"/>
      </svg>
    ),
    description: 'Gerenciar cupons'
  },
  {
    href: '/integracoes',
    label: 'Integrações',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="white">
        <path d="m384-336 56-58-86-86 86-86-56-58-144 144 144 144Zm192 0 144-144-144-144-56 58 86 86-86 86 56 58ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h168q13-36 43.5-58t68.5-22q38 0 68.5 22t43.5 58h168q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm280-590q13 0 21.5-8.5T510-820q0-13-8.5-21.5T480-850q-13 0-21.5 8.5T450-820q0 13 8.5 21.5T480-790ZM200-200v-560 560Z"/>
      </svg>
    ),
    description: 'Gerenciar integrações'
  },
  {
    href: '/atendimento',
    label: 'Atendimento',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7 8.5 7 9.71C7 10.93 7.89 12.1 8 12.27C8.14 12.44 9.76 14.94 12.25 16C12.84 16.27 13.3 16.42 13.66 16.53C14.25 16.72 14.79 16.69 15.22 16.63C15.7 16.56 16.68 16.03 16.89 15.45C17.1 14.87 17.1 14.38 17.04 14.27C16.97 14.17 16.81 14.11 16.56 14C16.31 13.86 15.09 13.26 14.87 13.18C14.64 13.1 14.5 13.06 14.31 13.3C14.15 13.55 13.67 14.11 13.53 14.27C13.38 14.44 13.24 14.46 13 14.34C12.74 14.21 11.94 13.95 11 13.11C10.26 12.45 9.77 11.64 9.62 11.39C9.5 11.15 9.61 11 9.73 10.89C9.84 10.78 10 10.6 10.1 10.45C10.23 10.31 10.27 10.2 10.35 10.04C10.43 9.87 10.39 9.73 10.33 9.61C10.27 9.5 9.77 8.26 9.56 7.77C9.36 7.29 9.16 7.35 9 7.34C8.86 7.34 8.7 7.33 8.53 7.33Z"/>
      </svg>
    ),
    description: 'Configurar atendimento'
  },
  {
    href: '/historico-pedidos',
    label: 'Histórico de Pedidos',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="white">
        <path d="m691-150 139-138-42-42-97 95-39-39-42 43 81 81ZM240-600h480v-80H240v80ZM720-40q-83 0-141.5-58.5T520-240q0-83 58.5-141.5T720-440q83 0 141.5 58.5T920-240q0 83-58.5 141.5T720-40ZM120-80v-680q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v267q-19-9-39-15t-41-9v-243H200v562h243q5 31 15.5 59T486-86l-6 6-60-60-60 60-60-60-60 60-60-60-60 60Zm120-200h203q3-21 9-41t15-39H240v80Zm0-160h284q38-37 88.5-58.5T720-520H240v80Zm-40 242v-562 562Z"/>
      </svg>
    ),
    description: 'Visualizar histórico de pedidos'
  },


]

export function Sidebar() {
  const pathname = usePathname()
  const { signOut, user, loading, canAccessUsers } = useAuth()
  const { configuracao, verificarSeLojaAberta } = useAdministrarLoja()
  const [relatoriosOpen, setRelatoriosOpen] = useState(pathname === '/relatorios')
  const [administrarOpen, setAdministrarOpen] = useState(pathname === '/administrar')
  const [currentHash, setCurrentHash] = useState(typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '')
  const [lojaAberta, setLojaAberta] = useState(false)
  useEffect(() => {
    const onHashChange = () => {
      setCurrentHash(window.location.hash.replace('#', ''));
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Atualizar status da loja a cada minuto
  useEffect(() => {
    const atualizarStatusLoja = () => {
      setLojaAberta(verificarSeLojaAberta())
    }

    // Atualizar imediatamente
    atualizarStatusLoja()

    // Atualizar a cada minuto
    const interval = setInterval(atualizarStatusLoja, 60000)

    return () => clearInterval(interval)
  }, [verificarSeLojaAberta])

  // Não mostrar em páginas de auth quando não logado
  const isAuthPage = pathname === '/login' || pathname === '/register'
  const shouldShowNav = user && !isAuthPage

  if (!shouldShowNav) {
    return null
  }

  return (
    <aside className="fixed left-0 top-0 h-full shadow-lg border-r border-gray-200 z-40" style={{ width: '255px', backgroundColor: '#7c34ac' }}>
      <div className="flex flex-col h-full">
        {/* Cabeçalho Fixo */}
        <div className="flex-shrink-0 p-1.5 border-b border-white/20">
          <div className="flex items-center">
            <div>
              <h2 className="font-semibold text-white italic" style={{ fontSize: '35px' }}>Vault</h2>
              <p className="text-sm text-white/70 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Indicador de Status da Loja */}
        {configuracao?.horariosFuncionamento && (
          <div className="flex-shrink-0 p-3">
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: lojaAberta ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                border: `1px solid ${lojaAberta ? '#22c55e' : '#ef4444'}`,
                color: 'white',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              <div 
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: lojaAberta ? '#22c55e' : '#ef4444',
                  animation: lojaAberta ? 'pulse 2s infinite' : 'none'
                }}
              />
              <span>{lojaAberta ? 'Loja Aberta' : 'Loja Fechada'}</span>
            </div>
          </div>
        )}

        {/* Botão Link do Cardápio */}
        {configuracao?.linkPersonalizado && configuracao.linkPersonalizado.trim() !== '' ? (
          <div className="flex-shrink-0 p-3 border-b border-white/20">
            <button
              onClick={() => {
                const link = configuracao.linkPersonalizado.trim()
                if (link) {
                  window.open(`/loja/${link}`, '_blank')
                }
              }}
              style={{
                backgroundColor: '#fdb827',
                color: '#542583',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                height: '36px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f4c430'
                e.target.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#fdb827'
                e.target.style.transform = 'translateY(0)'
              }}
              title="Visualizar cardápio público"
            >
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15,3 21,3 21,9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Ver Cardápio
            </button>
          </div>
        ) : configuracao && (
          <div className="flex-shrink-0 p-3 border-b border-white/20">
            <Link 
              href="/administrar#dados-loja"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(156, 163, 175, 0.2)',
                border: '1px solid #9ca3af',
                color: 'white',
                fontSize: '12px',
                fontWeight: '500',
                opacity: 0.8,
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = '1'
                e.target.style.backgroundColor = 'rgba(156, 163, 175, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = '0.8'
                e.target.style.backgroundColor = 'rgba(156, 163, 175, 0.2)'
              }}
              title="Ir para configurações da loja"
            >
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
              </svg>
              Configure o link do cardápio
            </Link>
          </div>
        )}

        {/* Área de Navegação com Scroll */}
        <nav className="flex-1 overflow-y-auto
          [&::-webkit-scrollbar]:w-1
          [&::-webkit-scrollbar-track]:rounded-full
          [&::-webkit-scrollbar-track]:bg-gray-100
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-gray-300
          dark:[&::-webkit-scrollbar-track]:bg-neutral-700
          dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            const isRelatorios = item.href === '/relatorios'
            const isAdministrar = item.href === '/administrar'
            
            if (isRelatorios) {
              return (
                <div key={item.href}>
                  <button
                    onClick={() => setRelatoriosOpen((open) => !open)}
                    className={`
                      flex items-center justify-between rounded-lg transition-all duration-200 group
                      hover:bg-white/10
                    `}
                    title={item.description}
                    style={{ cursor: 'pointer', margin: '0px', height: '48px', color: 'white', padding: '0px 16px', width: '100%' }}
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-xl" style={{ color: 'white', opacity: '1' }}>{item.icon}</span>
                      <span className="font-medium text-sm" style={{ color: 'white' }}>{item.label}</span>
                    </div>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${relatoriosOpen ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{ marginLeft: '16px' }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <div
                    className={`flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
                      relatoriosOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                    style={{ willChange: 'max-height, opacity, transform', marginTop: '0px', paddingTop: '0px' }}
                  >
                      <a
                        key="geral"
                        href="/relatorios#geral"
                        className={`tracking-wide cursor-pointer hover:bg-white/10 rounded-lg transition-all duration-200`}
                        style={{
                          textDecoration: 'none',
                          margin: '0px',
                          padding: '0px',
                          lineHeight: '1',
                          height: '48px',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '56px',
                          color: (pathname === '/relatorios' && currentHash === 'geral') ? '#fdb827' : '#fff',
                          fontWeight: 600,
                          opacity: 1,
                          textShadow: '0 1px 2px rgba(0,0,0,0.08)',
                          width: '100%',
                          fontSize: '14px'
                        }}
                      >Geral</a>
                      <a
                        key="clientes"
                        href="/relatorios#clientes"
                        className={`tracking-wide cursor-pointer hover:bg-white/10 rounded-lg transition-all duration-200`}
                        style={{
                          textDecoration: 'none',
                          margin: '0px',
                          padding: '0px',
                          lineHeight: '1',
                          height: '48px',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '56px',
                          color: (pathname === '/relatorios' && currentHash === 'clientes') ? '#fdb827' : '#fff',
                          fontWeight: 600,
                          opacity: 1,
                          textShadow: '0 1px 2px rgba(0,0,0,0.08)',
                          width: '100%',
                          fontSize: '14px'
                        }}
                      >Clientes</a>
                      <a
                        key="produtos"
                        href="/relatorios#produtos"
                        className={`tracking-wide cursor-pointer hover:bg-white/10 rounded-lg transition-all duration-200`}
                        style={{
                          textDecoration: 'none',
                          margin: '0px',
                          padding: '0px',
                          lineHeight: '1',
                          height: '48px',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '56px',
                          color: (pathname === '/relatorios' && currentHash === 'produtos') ? '#fdb827' : '#fff',
                          fontWeight: 600,
                          opacity: 1,
                          textShadow: '0 1px 2px rgba(0,0,0,0.08)',
                          width: '100%',
                          fontSize: '14px'
                        }}
                      >Produtos</a>
                    </div>
                </div>
              )
            } else if (isAdministrar) {
              return (
                <div key={item.href}>
                  <button
                    onClick={() => setAdministrarOpen((open) => !open)}
                    className={`
                      flex items-center justify-between rounded-lg transition-all duration-200 group
                      hover:bg-white/10
                    `}
                    title={item.description}
                    style={{ cursor: 'pointer', margin: '0px', height: '48px', color: 'white', padding: '0px 16px', width: '100%' }}
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-xl" style={{ color: 'white', opacity: '1' }}>{item.icon}</span>
                      <span className="font-medium text-sm" style={{ color: 'white' }}>{item.label}</span>
                    </div>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${administrarOpen ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{ marginLeft: '16px' }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <div
                    className={`flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
                      administrarOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                    style={{ willChange: 'max-height, opacity, transform', marginTop: '0px', paddingTop: '0px' }}
                  >
                      <a
                        key="dados-loja"
                        href="/administrar#dados-loja"
                        className={`tracking-wide cursor-pointer hover:bg-white/10 rounded-lg transition-all duration-200`}
                        style={{
                          textDecoration: 'none',
                          margin: '0px',
                          padding: '0px',
                          lineHeight: '1',
                          height: '48px',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '56px',
                          color: (pathname === '/administrar' && currentHash === 'dados-loja') ? '#fdb827' : '#fff',
                          fontWeight: 600,
                          opacity: 1,
                          textShadow: '0 1px 2px rgba(0,0,0,0.08)',
                          width: '100%',
                          fontSize: '14px'
                        }}
                      >Dados da loja</a>
                      <a
                        key="horarios"
                        href="/administrar#horarios"
                        className={`tracking-wide cursor-pointer hover:bg-white/10 rounded-lg transition-all duration-200`}
                        style={{
                          textDecoration: 'none',
                          margin: '0px',
                          padding: '0px',
                          lineHeight: '1',
                          height: '48px',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '56px',
                          color: (pathname === '/administrar' && currentHash === 'horarios') ? '#fdb827' : '#fff',
                          fontWeight: 600,
                          opacity: 1,
                          textShadow: '0 1px 2px rgba(0,0,0,0.08)',
                          width: '100%',
                          fontSize: '14px'
                        }}
                      >Horários</a>
                      <a
                        key="entrega"
                        href="/administrar#entrega"
                        className={`tracking-wide cursor-pointer hover:bg-white/10 rounded-lg transition-all duration-200`}
                        style={{
                          textDecoration: 'none',
                          margin: '0px',
                          padding: '0px',
                          lineHeight: '1',
                          height: '48px',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '56px',
                          color: (pathname === '/administrar' && currentHash === 'entrega') ? '#fdb827' : '#fff',
                          fontWeight: 600,
                          opacity: 1,
                          textShadow: '0 1px 2px rgba(0,0,0,0.08)',
                          width: '100%',
                          fontSize: '14px'
                        }}
                      >Entrega</a>
                      <a
                        key="pagamento"
                        href="/administrar#pagamento"
                        className={`tracking-wide cursor-pointer hover:bg-white/10 rounded-lg transition-all duration-200`}
                        style={{
                          textDecoration: 'none',
                          margin: '0px',
                          padding: '0px',
                          lineHeight: '1',
                          height: '48px',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '56px',
                          color: (pathname === '/administrar' && currentHash === 'pagamento') ? '#fdb827' : '#fff',
                          fontWeight: 600,
                          opacity: 1,
                          textShadow: '0 1px 2px rgba(0,0,0,0.08)',
                          width: '100%',
                          fontSize: '14px'
                        }}
                      >Pagamento</a>
                      <a
                        key="motoboys"
                        href="/administrar#motoboys"
                        className={`tracking-wide cursor-pointer hover:bg-white/10 rounded-lg transition-all duration-200`}
                        style={{
                          textDecoration: 'none',
                          margin: '0px',
                          padding: '0px',
                          lineHeight: '1',
                          height: '48px',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '56px',
                          color: (pathname === '/administrar' && currentHash === 'motoboys') ? '#fdb827' : '#fff',
                          fontWeight: 600,
                          opacity: 1,
                          textShadow: '0 1px 2px rgba(0,0,0,0.08)',
                          width: '100%',
                          fontSize: '14px'
                        }}
                      >Motoboys</a>
                      <a
                        key="impressao"
                        href="/administrar#impressao"
                        className={`tracking-wide cursor-pointer hover:bg-white/10 rounded-lg transition-all duration-200`}
                        style={{
                          textDecoration: 'none',
                          margin: '0px',
                          padding: '0px',
                          lineHeight: '1',
                          height: '48px',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '56px',
                          color: (pathname === '/administrar' && currentHash === 'impressao') ? '#fdb827' : '#fff',
                          fontWeight: 600,
                          opacity: 1,
                          textShadow: '0 1px 2px rgba(0,0,0,0.08)',
                          width: '100%',
                          fontSize: '14px'
                        }}
                      >Impressão</a>
                      {canAccessUsers() && (
                        <a
                          key="usuarios"
                          href="/administrar#usuarios"
                          className={`tracking-wide cursor-pointer hover:bg-white/10 rounded-lg transition-all duration-200`}
                          style={{
                            textDecoration: 'none',
                            margin: '0px',
                            padding: '0px',
                            lineHeight: '1',
                            height: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            paddingLeft: '56px',
                            color: (pathname === '/administrar' && currentHash === 'usuarios') ? '#fdb827' : '#fff',
                            fontWeight: 600,
                            opacity: 1,
                            textShadow: '0 1px 2px rgba(0,0,0,0.08)',
                            width: '100%',
                            fontSize: '14px'
                          }}
                        >Usuários</a>
                      )}
                    </div>
                </div>
              )
            } else {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center space-x-4 rounded-lg transition-all duration-200 group
                    hover:bg-white/10
                  `}
                  title={item.description}
                  style={{ margin: '0px', height: '48px', color: isActive ? '#fdb827' : 'white', padding: '0px 16px', width: '100%' }}
                >
                  <div style={{ color: isActive ? '#fdb827' : 'white', opacity: '1' }}>{item.icon}</div>
                  <span className="font-medium text-sm" style={{ color: isActive ? '#fdb827' : 'white', fontWeight: isActive ? 'bold' : 'medium' }}>{item.label}</span>
                </Link>
              )
            }
          })}
        </nav>

        {/* Rodapé Fixo */}
        <div className="flex-shrink-0 p-4 border-t border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-8 h-8 text-white" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                <path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/>
              </svg>
              <div>
                <p className="text-sm font-medium text-white" style={{ fontSize: '14px' }}>{user?.name || 'Usuário'}</p>
                <p className="text-xs text-white/70 capitalize" style={{ fontSize: '14px' }}>{user?.role}</p>
                <p className="text-white" style={{ fontSize: '12px' }}>
                  {user?.role === 'dono' || !user?.role ? 'Acesso: Dono' : 
                   user?.role === 'gerente' ? 'Acesso: Gerente' : 
                   user?.role === 'operador' ? 'Acesso: Operador' : 
                   'Acesso: Dono'}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center justify-center p-2 text-white hover:bg-white/10 rounded-lg transition-all duration-200 group"
              title="Sair"
            >
              <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
