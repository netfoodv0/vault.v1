import { NextRequest, NextResponse } from 'next/server'

const OPENROUTER_API_KEY = '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'

// Função para calcular distância em linha reta (fórmula de Haversine)
function calcularDistanciaLinhaReta(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Função para cálculo rápido com OpenRouter
async function calcularRotaRapida(origem: string, destino: string, distanciaLinhaReta: number) {
  try {
    const prompt = `
Calcule rapidamente a distância real em km entre dois pontos no Brasil:

Origem: ${origem}
Destino: ${destino}
Distância em linha reta: ${distanciaLinhaReta.toFixed(2)} km

Responda APENAS com um JSON válido:
{
  "distanciaReal": número_em_km,
  "tempoMinutos": número_inteiro
}
`

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Vault Delivery System'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 100
      })
    })

    const data = await response.json()
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const content = data.choices[0].message.content
      
      // Tentar extrair JSON da resposta
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const rotaInfo = JSON.parse(jsonMatch[0])
        return {
          success: true,
          distancia: rotaInfo.distanciaReal,
          tempo: rotaInfo.tempoMinutos
        }
      }
    }
    
    return { success: false }
  } catch (error) {
    console.error('Erro ao consultar OpenRouter:', error)
    return { success: false }
  }
}

// Função para simular rota real baseada na distância em linha reta (fallback)
function simularRotaReal(distanciaLinhaReta: number): { distancia: number; tempo: number } {
  const fatorMultiplicacao = distanciaLinhaReta < 5 ? 1.3 : distanciaLinhaReta < 15 ? 1.5 : 1.8
  const distanciaReal = distanciaLinhaReta * fatorMultiplicacao
  const tempoMinutos = Math.ceil(distanciaReal * 2.5)
  
  return {
    distancia: distanciaReal,
    tempo: tempoMinutos
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const origin = searchParams.get('origin')
    const destination = searchParams.get('destination')

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Parâmetros origin e destination são obrigatórios' },
        { status: 400 }
      )
    }

    // Extrair coordenadas
    const [originLat, originLng] = origin.split(',').map(Number)
    const [destLat, destLng] = destination.split(',').map(Number)

    if (isNaN(originLat) || isNaN(originLng) || isNaN(destLat) || isNaN(destLng)) {
      return NextResponse.json(
        { error: 'Formato de coordenadas inválido. Use: lat,lng' },
        { status: 400 }
      )
    }

    // Calcular distância em linha reta
    const distanciaLinhaReta = calcularDistanciaLinhaReta(originLat, originLng, destLat, destLng)

    // Tentar usar OpenRouter para cálculo rápido
    try {
      const origemTexto = `${originLat.toFixed(6)}, ${originLng.toFixed(6)}`
      const destinoTexto = `${destLat.toFixed(6)}, ${destLng.toFixed(6)}`
      
      const openRouterResult = await calcularRotaRapida(origemTexto, destinoTexto, distanciaLinhaReta)
      
      if (openRouterResult.success) {
        const resultado = {
          success: true,
          distancia: openRouterResult.distancia,
          tempo: openRouterResult.tempo,
          distanciaTexto: `${openRouterResult.distancia.toFixed(1)} km`,
          tempoTexto: `${openRouterResult.tempo} min`,
          fonte: 'OpenRouter AI'
        }
        
        return NextResponse.json(resultado)
      } else {
        throw new Error('OpenRouter falhou')
      }
    } catch (openRouterError) {
      // Usar simulação como fallback
      const simulacao = simularRotaReal(distanciaLinhaReta)
      
      const resultado = {
        success: true,
        distancia: simulacao.distancia,
        tempo: simulacao.tempo,
        distanciaTexto: `${simulacao.distancia.toFixed(1)} km`,
        tempoTexto: `${simulacao.tempo} min`,
        fonte: 'Simulação'
      }
      
      return NextResponse.json(resultado)
    }
  } catch (error: any) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
} 