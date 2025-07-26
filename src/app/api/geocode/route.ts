import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_MAPS_API_KEY = 'AIzaSyDB2qpmQBzxjk335lKsLwACOVZ4EGGQOoo'

// Coordenadas aproximadas para cidades brasileiras (fallback)
const coordenadasCidades = {
  'são paulo': { lat: -23.5505, lng: -46.6333 },
  'rio de janeiro': { lat: -22.9068, lng: -43.1729 },
  'belo horizonte': { lat: -19.9167, lng: -43.9345 },
  'brasília': { lat: -15.7942, lng: -47.8822 },
  'salvador': { lat: -12.9714, lng: -38.5011 },
  'fortaleza': { lat: -3.7319, lng: -38.5267 },
  'curitiba': { lat: -25.4289, lng: -49.2671 },
  'recife': { lat: -8.0476, lng: -34.8770 },
  'porto alegre': { lat: -30.0346, lng: -51.2177 },
  'manaus': { lat: -3.1190, lng: -60.0217 }
}

// Função para encontrar coordenadas aproximadas por cidade
function encontrarCoordenadasAproximadas(endereco: string): { lat: number; lng: number } | null {
  const enderecoLower = endereco.toLowerCase()
  
  for (const [cidade, coords] of Object.entries(coordenadasCidades)) {
    if (enderecoLower.includes(cidade)) {
      return coords
    }
  }
  
  // Se não encontrar cidade específica, retornar São Paulo como padrão
  return coordenadasCidades['são paulo']
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    const region = searchParams.get('region') || 'br'

    console.log('API Geocode - Endereço recebido:', address)

    if (!address) {
      console.log('API Geocode - Endereço não fornecido')
      return NextResponse.json(
        { error: 'Parâmetro address é obrigatório' },
        { status: 400 }
      )
    }

    // Tentar usar a API do Google Maps
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}&region=${region}`
      
      console.log('API Geocode - Tentando Google Maps API...')

      const response = await fetch(url)
      const data = await response.json()

      console.log('API Geocode - Resposta do Google Maps:', {
        status: data.status,
        error_message: data.error_message,
        results_count: data.results?.length || 0
      })

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0]
        const location = result.geometry.location
        
        const resultado = {
          success: true,
          lat: location.lat,
          lng: location.lng,
          enderecoFormatado: result.formatted_address,
          tipos: result.types,
          placeId: result.place_id,
          usandoApiReal: true
        }
        
        console.log('API Geocode - Resultado da API real:', resultado)
        return NextResponse.json(resultado)
      } else {
        console.log('API Geocode - API do Google Maps falhou, usando coordenadas aproximadas')
        throw new Error('API não disponível')
      }
    } catch (apiError) {
      console.log('API Geocode - Erro na API do Google Maps, usando coordenadas aproximadas:', (apiError as Error).message)
      
      // Usar coordenadas aproximadas
      const coordsAproximadas = encontrarCoordenadasAproximadas(address)
      
      if (coordsAproximadas) {
        const resultado = {
          success: true,
          lat: coordsAproximadas.lat,
          lng: coordsAproximadas.lng,
          enderecoFormatado: `${address} (coordenadas aproximadas)`,
          tipos: ['approximate'],
          placeId: null,
          usandoApiReal: false,
          observacao: 'Coordenadas aproximadas - API do Google Maps não disponível'
        }
        
        console.log('API Geocode - Resultado aproximado:', resultado)
        return NextResponse.json(resultado)
      } else {
        return NextResponse.json(
          { error: 'Não foi possível geocodificar o endereço' },
          { status: 400 }
        )
      }
    }
  } catch (error) {
    console.error('API Geocode - Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: (error as Error).message },
      { status: 500 }
    )
  }
} 