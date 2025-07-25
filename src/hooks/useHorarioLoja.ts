'use client'

import { useState, useEffect } from 'react'
import { DiaFuncionamento } from '@/hooks/useAdministrarLoja'

export function useHorarioLoja(horariosFuncionamento: DiaFuncionamento[], fusoHorario: string = 'America/Sao_Paulo') {
  const [estaAberta, setEstaAberta] = useState(false)
  const [proximoHorario, setProximoHorario] = useState<string>('')

  useEffect(() => {
    // Verificar se os horários são válidos
    if (!horariosFuncionamento || horariosFuncionamento.length === 0) {
      setEstaAberta(false)
      setProximoHorario('')
      return
    }

    const verificarHorario = () => {
      const agora = new Date()
      
      // Converter para o fuso horário da loja
      const dataLocal = new Date(agora.toLocaleString('en-US', { timeZone: fusoHorario }))
      
      // Obter dia da semana (0 = Domingo, 1 = Segunda, etc.)
      const diaSemana = dataLocal.getDay()
      const horaAtual = dataLocal.getHours()
      const minutoAtual = dataLocal.getMinutes()
      const tempoAtual = horaAtual * 60 + minutoAtual // Converter para minutos
      
      // Mapear dias da semana para os nomes usados no Firebase
      const diasSemana = [
        'Domingo',
        'Segunda-feira', 
        'Terça-feira', 
        'Quarta-feira', 
        'Quinta-feira', 
        'Sexta-feira', 
        'Sábado'
      ]
      
      const diaAtual = diasSemana[diaSemana]
      
      // Encontrar configuração do dia atual
      const diaConfig = horariosFuncionamento.find(dia => dia.dia === diaAtual)
      
      if (!diaConfig || diaConfig.fechado) {
        setEstaAberta(false)
        setProximoHorario('')
        return
      }
      
      // Verificar se está dentro de algum horário
      let dentroDoHorario = false
      let proximoHorarioEncontrado = ''
      
      for (const horario of diaConfig.horarios) {
        const [horaAbertura, minutoAbertura] = horario.abertura.split(':').map(Number)
        const [horaFechamento, minutoFechamento] = horario.fechamento.split(':').map(Number)
        
        const tempoAbertura = horaAbertura * 60 + minutoAbertura
        const tempoFechamento = horaFechamento * 60 + minutoFechamento
        
        // Se o horário passa da meia-noite
        if (tempoFechamento < tempoAbertura) {
          if (tempoAtual >= tempoAbertura || tempoAtual <= tempoFechamento) {
            dentroDoHorario = true
            break
          }
        } else {
          if (tempoAtual >= tempoAbertura && tempoAtual <= tempoFechamento) {
            dentroDoHorario = true
            break
          }
        }
        
        // Se não está aberta, calcular próximo horário
        if (!dentroDoHorario && tempoAtual < tempoAbertura) {
          const proximaHora = Math.floor(tempoAbertura / 60)
          const proximoMinuto = tempoAbertura % 60
          proximoHorarioEncontrado = `${proximaHora.toString().padStart(2, '0')}:${proximoMinuto.toString().padStart(2, '0')}`
        }
      }
      
      setEstaAberta(dentroDoHorario)
      setProximoHorario(proximoHorarioEncontrado)
    }
    
    // Verificar imediatamente
    verificarHorario()
    
    // Verificar a cada minuto
    const interval = setInterval(verificarHorario, 60000)
    
    return () => clearInterval(interval)
  }, [horariosFuncionamento, fusoHorario])

  return { estaAberta, proximoHorario }
} 