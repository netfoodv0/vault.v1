'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import toast from 'react-hot-toast'

interface DeliveryMapProps {
  entregas?: any[]
  lojaLatLng?: [number, number]
  endereco?: string
  className?: string
  onBuscarEndereco?: (endereco: string) => void
  raiosEntrega?: Array<{
    id: number
    distancia: number
    tempoMaximo: number
    preco: string
  }>
  tipoCalculoAtivo?: 'distancia_linha' | 'distancia_rota' | 'bairro'
}

interface Coordinates {
  lat: number
  lng: number
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyDB2qpmQBzxjk335lKsLwACOVZ4EGGQOoo'

export default function DeliveryMap({ 
  lojaLatLng = [-46.6333, -23.5505],
  endereco = '',
  className = '',
  onBuscarEndereco,
  raiosEntrega = [],
  tipoCalculoAtivo
}: DeliveryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const geocoderRef = useRef<google.maps.Geocoder | null>(null)
  const circlesRef = useRef<google.maps.Circle[]>([])
  const [enderecoCoords, setEnderecoCoords] = useState<Coordinates | null>(null)
  const [geocoding, setGeocoding] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)





  // Função para criar pontos de círculo
  const criarPontosCirculo = (centro: Coordinates, raioMetros: number, numPontos: number = 64) => {
    const pontos = []
    for (let i = 0; i < numPontos; i++) {
      const angulo = (i * 2 * Math.PI) / numPontos
      const lat = centro.lat + (raioMetros / 111320) * Math.cos(angulo)
      const lng = centro.lng + (raioMetros / (111320 * Math.cos(centro.lat * Math.PI / 180))) * Math.sin(angulo)
      pontos.push({ lat, lng })
    }
    return pontos
  }

  // Função para criar polígonos de anel no mapa (áreas separadas que não se sobrepõem)
  const createDeliveryCircles = useCallback(() => {
    if (!mapInstance.current || !enderecoCoords || raiosEntrega.length === 0) {
      return
    }

    // Remover elementos anteriores
    circlesRef.current.forEach(element => {
      element.setMap(null)
    })
    circlesRef.current = []

    // Ordenar raios por distância crescente para criar anéis
    const raiosOrdenados = raiosEntrega.sort((a, b) => a.distancia - b.distancia)
    
    raiosOrdenados.forEach((raio, index) => {
      // Usar a mesma cor roxa base (#542583) mas com opacidades diferentes
      // Primeiro raio (mais interno) = mais escuro, depois diminui 15% a cada raio
      const opacidadeBase = 0.45 - (index * 0.15) // Começa com 45% e diminui 15% a cada raio
      const opacidadeFinal = Math.max(0.05, opacidadeBase) // Mínimo de 5% de opacidade
      
      const cor = {
        stroke: '#542583',
        fill: '#542583',
        opacity: opacidadeFinal
      }
      
      // Distância anterior (para criar anel ao invés de círculo)
      const distanciaAnterior = index === 0 ? 0 : raiosOrdenados[index - 1].distancia
      const raioInternoMetros = distanciaAnterior * 1000
      const raioExternoMetros = raio.distancia * 1000
      
      let anel
      
      // Verificar se é modo de rota para aplicar estilo pontilhado
      const isModoRota = tipoCalculoAtivo === 'distancia_rota'
      
      if (index === 0) {
        // Primeiro anel - círculo simples do centro até o primeiro raio
        anel = new google.maps.Circle({
          strokeColor: cor.stroke,
          strokeOpacity: isModoRota ? 0.3 : 1.0, // Linha mais transparente no modo rota
          strokeWeight: isModoRota ? 1 : 2, // Linha mais fina no modo rota
          fillColor: isModoRota ? 'transparent' : cor.fill, // Sem preenchimento no modo rota
          fillOpacity: isModoRota ? 0 : cor.opacity, // Opacidade 0 no modo rota
          map: mapInstance.current,
          center: { lat: enderecoCoords.lat, lng: enderecoCoords.lng },
          radius: raioExternoMetros,
          clickable: true,
          zIndex: 1000 + index
        })
      } else {
        // Anéis seguintes - polígono que cria um "donut" entre dois raios
        const pontosExterno = criarPontosCirculo(enderecoCoords, raioExternoMetros)
        const pontosInterno = criarPontosCirculo(enderecoCoords, raioInternoMetros).reverse() // Reverter para criar buraco
        
        // Combinar pontos para criar anel
        const caminhos = [
          pontosExterno, // Círculo externo
          pontosInterno  // Círculo interno (buraco)
        ]
        
        anel = new google.maps.Polygon({
          paths: caminhos,
          strokeColor: cor.stroke,
          strokeOpacity: isModoRota ? 0.3 : 1.0, // Linha mais transparente no modo rota
          strokeWeight: isModoRota ? 1 : 2, // Linha mais fina no modo rota
          fillColor: isModoRota ? 'transparent' : cor.fill, // Sem preenchimento no modo rota
          fillOpacity: isModoRota ? 0 : cor.opacity, // Opacidade 0 no modo rota
          map: mapInstance.current,
          clickable: true,
          zIndex: 1000 + index
        })
      }
      
      // Se for modo rota, criar linha pontilhada mais visível
      if (isModoRota) {
        // Calcular densidade de pontilhado baseada no tamanho do raio
        // Raio maior = mais pontos = mais denso
        const densidadeBase = 48 // Pontos base
        const densidadeAdicional = Math.floor(raio.distancia / 2) // +1 ponto a cada 2km
        const numPontos = Math.min(densidadeBase + densidadeAdicional, 120) // Máximo 120 pontos
        
        const pontosPontilhados = []
        
        for (let i = 0; i < numPontos; i++) {
          const angulo = (i / numPontos) * 2 * Math.PI
          const lat = enderecoCoords.lat + (raio.distancia / 111.32) * Math.cos(angulo)
          const lng = enderecoCoords.lng + (raio.distancia / (111.32 * Math.cos(enderecoCoords.lat * Math.PI / 180))) * Math.sin(angulo)
          pontosPontilhados.push({ lat, lng })
        }
        
        // Calcular espaçamento baseado no tamanho do raio
        // Raio maior = espaçamento menor = mais denso
        const espacamentoBase = 3 // A cada 3 pontos (menos denso)
        const espacamentoReduzido = Math.max(1, Math.floor(espacamentoBase - (raio.distancia / 5))) // Reduz espaçamento conforme raio aumenta
        const espacamentoFinal = Math.min(espacamentoReduzido, 2) // Mínimo a cada 2 pontos
        
        // Criar marcadores pontilhados
        pontosPontilhados.forEach((ponto, pontoIndex) => {
          // Criar efeito pontilhado progressivo
          if (pontoIndex % espacamentoFinal === 0) {
            const marcadorPontilhado = new google.maps.Marker({
              position: ponto,
              map: mapInstance.current,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 2.5, // Pontos médios para não ficar muito pesado
                fillColor: cor.stroke,
                fillOpacity: 1.0, // Opacidade total
                strokeColor: cor.stroke,
                strokeOpacity: 1.0,
                strokeWeight: 1
              },
              clickable: false,
              zIndex: 1001 + index
            })
            circlesRef.current.push(marcadorPontilhado as any)
          }
        })
      }
      
      circlesRef.current.push(anel as any)

      // Adicionar tooltip que segue o mouse
      const infoWindow = new google.maps.InfoWindow({
        disableAutoPan: true,
        pixelOffset: new google.maps.Size(15, -20),
        headerDisabled: true
      })
      
      // Criar conteúdo do tooltip uma vez
      const distanciaInicial = index === 0 ? 0 : raiosOrdenados[index - 1].distancia
      const distanciaFinal = raio.distancia
      
      const content = `
        <div style="padding: 12px; font-family: system-ui, sans-serif; min-width: 180px; pointer-events: none; border-left: 4px solid ${cor.stroke};">
          <div style="color: ${cor.stroke}; font-weight: 600; font-size: 14px; margin-bottom: 8px;">
            🎯 Área de Entrega ${index + 1}
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 13px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #6b7280;">Raio:</span>
              <span style="font-weight: 600; color: #374151;">
                ${distanciaInicial}km - ${distanciaFinal}km
              </span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #6b7280;">Preço:</span>
              <span style="font-weight: 600; color: ${cor.stroke};">R$ ${raio.preco}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #6b7280;">Tempo:</span>
              <span style="font-weight: 600; color: #374151;">${raio.tempoMaximo}-${raio.tempoMaximo + 10} min</span>
            </div>
          </div>
        </div>
      `
      
      infoWindow.setContent(content)

      // Adicionar listeners para o anel atual
      anel.addListener('mouseover', (event: google.maps.MapMouseEvent | google.maps.PolyMouseEvent) => {
        if (event.latLng) {
          infoWindow.setPosition(event.latLng)
          infoWindow.open(mapInstance.current)
        }
      })

      anel.addListener('mousemove', (event: google.maps.MapMouseEvent | google.maps.PolyMouseEvent) => {
        if (event.latLng) {
          infoWindow.setPosition(event.latLng)
        }
      })

      anel.addListener('mouseout', () => {
        infoWindow.close()
      })
    })
    
  }, [enderecoCoords, raiosEntrega, tipoCalculoAtivo])

  // Função para geocodificar endereço usando Google Maps Geocoding
  const geocodeEndereco = useCallback(async (address: string) => {
    if (!address.trim() || !geocoderRef.current) {
      setEnderecoCoords(null)
      return
    }

    setGeocoding(true)
    
    try {
      const request: google.maps.GeocoderRequest = {
        address: address,
        region: 'BR', // Priorizar resultados no Brasil
        componentRestrictions: {
          country: 'BR'
        }
      }

      geocoderRef.current.geocode(request, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location
          const coords = {
            lat: location.lat(),
            lng: location.lng()
          }
          
          setEnderecoCoords(coords)
          toast.success('Endereço localizado no mapa!')
        } else {
          setEnderecoCoords(null)
          
          if (status === 'ZERO_RESULTS') {
            toast.error('Endereço não encontrado. Tente ser mais específico.')
          } else if (status === 'OVER_QUERY_LIMIT') {
            toast.error('Muitas consultas. Tente novamente em alguns segundos.')
          } else {
            toast.error('Erro ao localizar endereço no mapa')
          }
        }
        setGeocoding(false)
      })
    } catch (error) {
      setEnderecoCoords(null)
      toast.error('Erro ao localizar endereço no mapa')
      setGeocoding(false)
    }
  }, [])

  // Inicializar Google Maps
  useEffect(() => {
    if (mapInstance.current || !mapRef.current) {
      return
    }

    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places', 'geometry']
    })

    loader.load().then(() => {
      if (!mapRef.current) return

      try {
        // Criar mapa
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: lojaLatLng[1], lng: lojaLatLng[0] }, // Google usa lat, lng
          zoom: 12,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: false,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_CENTER
          },
          fullscreenControlOptions: {
            position: google.maps.ControlPosition.LEFT_TOP
          },
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        })

        // Criar geocoder
        const geocoder = new google.maps.Geocoder()

        mapInstance.current = map
        geocoderRef.current = geocoder
        setMapLoaded(true)
        
      } catch (error) {
        toast.error('Erro ao carregar o mapa')
      }
    }).catch((error) => {
      toast.error('Erro ao carregar Google Maps')
    })

    return () => {
      if (mapInstance.current) {
        // Limpar círculos
        circlesRef.current.forEach(circle => {
          circle.setMap(null)
        })
        circlesRef.current = []
        
        // Limpar marcador
        if (markerRef.current) {
          markerRef.current.setMap(null)
          markerRef.current = null
        }
        
        mapInstance.current = null
        geocoderRef.current = null
        setMapLoaded(false)
      }
    }
  }, [lojaLatLng])

  // Função para buscar endereço (chamada pelo botão)
  const buscarEndereco = useCallback(() => {
    if (endereco.trim() && mapLoaded) {
      geocodeEndereco(endereco)
    } else if (!endereco.trim()) {
      toast.error('Digite um endereço para localizar no mapa')
    }
  }, [endereco, mapLoaded, geocodeEndereco])

  // Expor função para o componente pai
  useEffect(() => {
    if (onBuscarEndereco) {
      onBuscarEndereco(endereco)
    }
  }, [onBuscarEndereco, endereco])

  // Gerenciar marcador no mapa
  useEffect(() => {
    if (!mapInstance.current || !mapLoaded || !enderecoCoords) {
      // Remover marcador se não há coordenadas
      if (markerRef.current) {
        markerRef.current.setMap(null)
        markerRef.current = null
      }
      return
    }

    try {
      // Remover marcador anterior
      if (markerRef.current) {
        markerRef.current.setMap(null)
      }

      // Criar novo marcador roxo personalizado igual à foto
      const marker = new google.maps.Marker({
        position: { lat: enderecoCoords.lat, lng: enderecoCoords.lng },
        map: mapInstance.current,
        title: 'Endereço localizado',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="48" height="58" viewBox="0 0 48 58" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 0C10.745 0 0 10.745 0 24c0 8 6.5 15.5 12 20.5L24 58l12-13.5C42 39.5 48 32 48 24 48 10.745 37.255 0 24 0z" 
                    fill="#542583" 
                    stroke="#ffffff" 
                    stroke-width="2"/>
              <circle cx="24" cy="24" r="8" fill="#ffffff"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(48, 58),
          anchor: new google.maps.Point(24, 58)
        },
        animation: google.maps.Animation.DROP
      })

      // Adicionar info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; font-family: system-ui, sans-serif; max-width: 250px;">
            <strong style="color: #542583; font-size: 14px;">📍 Endereço Localizado</strong>
            <div style="margin-top: 6px; font-size: 12px; color: #6b7280; line-height: 1.4;">
              ${endereco}
            </div>
          </div>
        `
      })

      // Mostrar info window ao clicar no marcador
      marker.addListener('click', () => {
        infoWindow.open(mapInstance.current, marker)
      })

      markerRef.current = marker

      // Animar para a nova localização
      mapInstance.current.panTo({ lat: enderecoCoords.lat, lng: enderecoCoords.lng })
      mapInstance.current.setZoom(16)

      // Mostrar info window automaticamente por 3 segundos
      setTimeout(() => {
        infoWindow.open(mapInstance.current, marker)
        setTimeout(() => {
          infoWindow.close()
        }, 3000)
      }, 500)

    } catch (error) {
      // Erro silencioso ao adicionar marcador
    }
  }, [enderecoCoords, mapLoaded, endereco])

  // Geocodificar automaticamente quando o endereço mudar e o mapa estiver carregado
  useEffect(() => {
    // Se o mapa estiver carregado, há um endereço válido e ainda não temos coordenadas
    if (mapLoaded && endereco.trim() && !enderecoCoords) {
      geocodeEndereco(endereco)
    }
  }, [mapLoaded, endereco, enderecoCoords, geocodeEndereco])

  // Criar círculos de raio quando endereço for localizado ou raios mudarem
  useEffect(() => {
    if (mapLoaded && enderecoCoords) {
      createDeliveryCircles()
    }
  }, [enderecoCoords, raiosEntrega, mapLoaded, createDeliveryCircles, tipoCalculoAtivo])

  return (
    <div className={className} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          minHeight: '400px',
          borderRadius: '8px',
          backgroundColor: '#f3f4f6'
        }} 
      />
      
      {/* Indicador de carregamento */}
      {(geocoding || !mapLoaded) && (
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontSize: '14px',
          color: '#374151',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 1000,
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid #e5e7eb',
            borderTop: '2px solid #542583',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <span style={{ fontWeight: '500' }}>
            {geocoding ? 'Localizando endereço...' : 'Carregando Google Maps...'}
          </span>
        </div>
      )}





      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
} 