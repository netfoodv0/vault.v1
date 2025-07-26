'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'

export default function AtendimentoPage() {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const [paginaAtiva, setPaginaAtiva] = useState('whatsapp')
  const [continuarConectado, setContinuarConectado] = useState(true)
  
  // Detectar hash inicial e mudanças
  useEffect(() => {
    if (pathname !== '/atendimento') return;
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setPaginaAtiva(hash);
    }
  }, [pathname]);

  useEffect(() => {
    if (pathname !== '/atendimento') return;
    const onHashChange = () => {
      setPaginaAtiva(window.location.hash.replace('#', ''));
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ 
        backgroundColor: '#ececec'
      }}>
        
        {/* Main Content */}
        <div className="flex-1" style={{ padding: '32px' }}>
          <div className="flex flex-col">
            {/* Caixa branca com botões */}
            <div 
              className="bg-white"
              style={{ 
                borderRadius: '8px 8px 0 0',
                padding: '16px',
                width: 'fit-content'
              }}
            >
              {/* Linha de botões cinzas */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setPaginaAtiva('whatsapp');
                    window.location.hash = '#whatsapp';
                  }}
                  style={{
                    background: paginaAtiva === 'whatsapp' ? '#542583' : 'transparent',
                    color: paginaAtiva === 'whatsapp' ? 'white' : '#374151',
                    border: paginaAtiva === 'whatsapp' ? '1px solid #542583' : '1px solid #d1d5db',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    height: '40px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (paginaAtiva !== 'whatsapp') {
                      const target = e.target as HTMLElement
                      if (target) target.style.backgroundColor = '#f9fafb'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (paginaAtiva !== 'whatsapp') {
                      const target = e.target as HTMLElement
                      if (target) target.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  WhatsApp
                </button>
                
                <button
                  onClick={() => {
                    setPaginaAtiva('configuracao');
                    window.location.hash = '#configuracao';
                  }}
                  style={{
                    background: paginaAtiva === 'configuracao' ? '#542583' : 'transparent',
                    color: paginaAtiva === 'configuracao' ? 'white' : '#374151',
                    border: paginaAtiva === 'configuracao' ? '1px solid #542583' : '1px solid #d1d5db',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    height: '40px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (paginaAtiva !== 'configuracao') {
                      const target = e.target as HTMLElement
                      if (target) target.style.backgroundColor = '#f9fafb'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (paginaAtiva !== 'configuracao') {
                      const target = e.target as HTMLElement
                      if (target) target.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  Configuração
                </button>
              </div>
            </div>

            {/* Segunda caixa branca embaixo dos botões */}
            <div 
              className="bg-white"
              style={{ 
                borderRadius: '0 8px 8px 8px',
                padding: '32px',
                width: '100%',
                marginBottom: '40px'
              }}
            >
              {/* Renderização condicional baseada na página ativa */}
              {paginaAtiva === 'whatsapp' && (
                <div>
                  {/* Cabeçalho */}
                  <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ 
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#374151',
                      marginBottom: '8px',
                      lineHeight: '1.2'
                    }}>
                      WhatsApp Web
                    </h2>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      fontSize: '14px',
                      color: '#6b7280'
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>Suas mensagens pessoais são protegidas com a criptografia de ponta a ponta em todos os seus dispositivos.</span>
                    </div>
                  </div>

                  {/* Container principal da conexão */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '48px',
                    alignItems: 'flex-start',
                    maxWidth: '800px'
                  }}>
                    {/* Lado esquerdo - Instruções */}
                    <div style={{ flex: '1' }}>
                      <h3 style={{ 
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '24px'
                      }}>
                        Etapas para acessar
                      </h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Passo 1 */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: '#542583',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: '600',
                            flexShrink: 0,
                            marginTop: '2px'
                          }}>
                            1
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151' }}>
                            <span>Abra o</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                            </svg>
                            <span>no seu celular.</span>
                          </div>
                        </div>

                        {/* Passo 2 */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: '#542583',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: '600',
                            flexShrink: 0,
                            marginTop: '2px'
                          }}>
                            2
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151' }}>
                            <span>Toque em</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                            <span>Mais opções no Android ou em</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Configurações no iPhone.</span>
                          </div>
                        </div>

                        {/* Passo 3 */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: '#542583',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: '600',
                            flexShrink: 0,
                            marginTop: '2px'
                          }}>
                            3
                          </div>
                          <div style={{ fontSize: '14px', color: '#374151' }}>
                            Toque em <strong>Dispositivos conectados</strong> e, em seguida, em <strong>Conectar dispositivo</strong>.
                          </div>
                        </div>

                        {/* Passo 4 */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: '#542583',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: '600',
                            flexShrink: 0,
                            marginTop: '2px'
                          }}>
                            4
                          </div>
                          <div style={{ fontSize: '14px', color: '#374151' }}>
                            Escaneie o QR code para confirmar
                          </div>
                        </div>
                      </div>

                                             {/* Link para conectar por código */}
                       <div style={{ marginTop: '24px' }}>
                         <button style={{
                           display: 'flex',
                           alignItems: 'center',
                           gap: '8px',
                           color: '#542583',
                           fontSize: '14px',
                           fontWeight: '500',
                           background: 'none',
                           border: 'none',
                           cursor: 'pointer',
                           textDecoration: 'underline'
                         }}>
                           <span>Conectar por código</span>
                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                           </svg>
                         </button>
                       </div>
                    </div>

                                         {/* Lado direito - QR Code */}
                     <div style={{ 
                       display: 'flex', 
                       flexDirection: 'column', 
                       alignItems: 'center',
                       gap: '16px'
                     }}>
                       {/* QR Code placeholder */}
                       <div style={{
                         width: '200px',
                         height: '200px',
                         border: '2px solid #d1d5db',
                         borderRadius: '8px',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         backgroundColor: '#f9fafb',
                         position: 'relative'
                       }}>
                         {/* Logo do WhatsApp no centro */}
                         <div style={{
                           position: 'absolute',
                           top: '50%',
                           left: '50%',
                           transform: 'translate(-50%, -50%)',
                           width: '40px',
                           height: '40px',
                           backgroundColor: '#25D366',
                           borderRadius: '50%',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center'
                         }}>
                           <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                             <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                           </svg>
                         </div>
                         
                         {/* Padrão de QR Code simulado */}
                         <div style={{
                           position: 'absolute',
                           top: '8px',
                           left: '8px',
                           right: '8px',
                           bottom: '8px',
                           backgroundImage: `
                             linear-gradient(90deg, #000 1px, transparent 1px),
                             linear-gradient(0deg, #000 1px, transparent 1px)
                           `,
                           backgroundSize: '12px 12px',
                           opacity: 0.1
                         }} />
                       </div>

                                             {/* Checkbox "Continuar conectado" */}
                       <div style={{ 
                         display: 'flex', 
                         alignItems: 'center', 
                         gap: '8px',
                         fontSize: '14px',
                         color: '#374151',
                         position: 'relative'
                       }}>
                         <button
                           onClick={() => setContinuarConectado(!continuarConectado)}
                           style={{
                             display: 'flex',
                             alignItems: 'center',
                             justifyContent: 'center',
                             width: '16px',
                             height: '16px',
                             borderRadius: '3px',
                             border: `2px solid ${continuarConectado ? '#25D366' : '#d1d5db'}`,
                             backgroundColor: continuarConectado ? '#25D366' : 'transparent',
                             cursor: 'pointer',
                             padding: 0,
                             transition: 'all 0.2s'
                           }}
                         >
                           {continuarConectado && (
                             <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                               <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                             </svg>
                           )}
                         </button>
                         <span>Continuar conectado</span>
                         <div style={{ position: 'relative' }}>
                           <svg 
                             width="16" 
                             height="16" 
                             viewBox="0 0 24 24" 
                             fill="none" 
                             stroke="currentColor" 
                             style={{ 
                               color: '#6b7280',
                               cursor: 'pointer'
                             }}
                             onMouseEnter={(e) => {
                               const target = e.target as HTMLElement
                               const tooltip = target.nextSibling as HTMLElement
                               if (tooltip) tooltip.style.display = 'block'
                             }}
                             onMouseLeave={(e) => {
                               const target = e.target as HTMLElement
                               const tooltip = target.nextSibling as HTMLElement
                               if (tooltip) tooltip.style.display = 'none'
                             }}
                           >
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                           
                           {/* Tooltip */}
                           <div style={{
                             position: 'absolute',
                             top: '100%',
                             left: '50%',
                             transform: 'translateX(-50%)',
                             marginTop: '8px',
                             backgroundColor: 'white',
                             border: '1px solid #d1d5db',
                             borderRadius: '6px',
                             padding: '12px',
                             fontSize: '13px',
                             color: '#374151',
                             lineHeight: '1.4',
                             width: '280px',
                             boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                             zIndex: 10,
                             display: 'none'
                           }}>
                             Quando selecionada, sua conta continua conectada no WhatsApp Web mesmo depois de fechar o navegador.
                             
                             {/* Seta do tooltip */}
                             <div style={{
                               position: 'absolute',
                               top: '-6px',
                               left: '50%',
                               transform: 'translateX(-50%)',
                               width: '0',
                               height: '0',
                               borderLeft: '6px solid transparent',
                               borderRight: '6px solid transparent',
                               borderBottom: '6px solid white'
                             }} />
                             <div style={{
                               position: 'absolute',
                               top: '-7px',
                               left: '50%',
                               transform: 'translateX(-50%)',
                               width: '0',
                               height: '0',
                               borderLeft: '6px solid transparent',
                               borderRight: '6px solid transparent',
                               borderBottom: '6px solid #d1d5db'
                             }} />
                           </div>
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {paginaAtiva === 'configuracao' && (
                <div className="flex justify-between">
                  {/* Lado esquerdo - Títulos e subtítulos */}
                  <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ 
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#374151',
                      marginBottom: '8px',
                      lineHeight: '1.2'
                    }}>
                      Configurações Gerais
                    </h2>
                    <p style={{ 
                      fontSize: '14px',
                      color: '#6b7280',
                      lineHeight: '1.5',
                      marginBottom: '24px'
                    }}>
                      Configure as opções gerais de atendimento.
                    </p>
                  </div>

                  {/* Lado direito - Botão Salvar */}
                  <div className="flex flex-col items-end gap-6">
                    <button
                      style={{
                        backgroundColor: '#542583',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        height: '40px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLElement).style.backgroundColor = '#7209bd'
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLElement).style.backgroundColor = '#542583'
                      }}
                    >
                      Salvar configuração
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 
