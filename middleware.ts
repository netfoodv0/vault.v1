import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Verificar se é uma rota protegida (pedidos, cardapio)
  if (request.nextUrl.pathname.startsWith('/pedidos') || 
      request.nextUrl.pathname.startsWith('/cardapio')) {
    // Em produção, você verificaria o token aqui
    // Por enquanto, permitimos acesso (será controlado pelo AuthProvider no cliente)
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/pedidos/:path*', '/cardapio/:path*']
} 