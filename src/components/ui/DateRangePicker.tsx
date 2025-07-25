import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DateRangePickerProps {
  initialDateRange?: [Date | null, Date | null];
  onDateRangeChange?: (dateRange: [Date | null, Date | null]) => void;
  selectedDateRange?: [Date | null, Date | null];
  showTodayButton?: boolean;
}

export default function DateRangePicker({ 
  initialDateRange, 
  onDateRangeChange, 
  selectedDateRange, 
  showTodayButton = false 
}: DateRangePickerProps) {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>(
    initialDateRange || [
      new Date(new Date().setDate(new Date().getDate() - 7)), // 7 dias atrás
      new Date() // hoje
    ]
  );
  
  // Atualizar dateRange quando selectedDateRange mudar
  useEffect(() => {
    if (selectedDateRange) {
      setDateRange(selectedDateRange);
    }
  }, [selectedDateRange]);
  
  const [startDate, endDate] = dateRange;

  const handleDateChange = (update: [Date | null, Date | null]) => {
    setDateRange(update);
    if (onDateRangeChange) {
      onDateRangeChange(update);
    }
  };

  // Função para definir data de hoje
  const definirDataHoje = () => {
    const hoje = new Date()
    const newDateRange: [Date | null, Date | null] = [hoje, hoje]
    setDateRange(newDateRange)
    
    if (onDateRangeChange) {
      onDateRangeChange(newDateRange)
    }
  };

  // Função para definir últimos 7 dias
  const definirUltimos7Dias = () => {
    const hoje = new Date()
    const seteDiasAtras = new Date(hoje)
    seteDiasAtras.setDate(hoje.getDate() - 7)
    const newDateRange: [Date | null, Date | null] = [seteDiasAtras, hoje]
    setDateRange(newDateRange)
    
    if (onDateRangeChange) {
      onDateRangeChange(newDateRange)
    }
  };

  // Função para definir últimos 15 dias
  const definirUltimos15Dias = () => {
    const hoje = new Date()
    const quinzeDiasAtras = new Date(hoje)
    quinzeDiasAtras.setDate(hoje.getDate() - 15)
    const newDateRange: [Date | null, Date | null] = [quinzeDiasAtras, hoje]
    setDateRange(newDateRange)
    
    if (onDateRangeChange) {
      onDateRangeChange(newDateRange)
    }
  };

  // Função para definir últimos 30 dias
  const definirUltimos30Dias = () => {
    const hoje = new Date()
    const trintaDiasAtras = new Date(hoje)
    trintaDiasAtras.setDate(hoje.getDate() - 30)
    const newDateRange: [Date | null, Date | null] = [trintaDiasAtras, hoje]
    setDateRange(newDateRange)
    
    if (onDateRangeChange) {
      onDateRangeChange(newDateRange)
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        <DatePicker
          selectsRange={true}
          startDate={startDate}
          endDate={endDate}
          onChange={handleDateChange}
          isClearable={true}
          customInput={
            <div
              style={{
                width: '280px',
                height: '40px',
                padding: '0 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '14px',
                color: '#374151',
                cursor: 'pointer',
              }}
            >
              <span>
                {startDate ? startDate.toLocaleDateString() : 'Data inicial'} - {endDate ? endDate.toLocaleDateString() : 'Data final'}
              </span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
          }
        />

        {/* Botões de atalho */}
        {showTodayButton && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={definirDataHoje}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-md text-sm font-medium transition-colors duration-200"
              style={{ height: '40px', whiteSpace: 'nowrap' }}
            >
              Data de hoje
            </button>
            <button
              onClick={definirUltimos7Dias}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-md text-sm font-medium transition-colors duration-200"
              style={{ height: '40px', whiteSpace: 'nowrap' }}
            >
              Últimos 7 dias
            </button>
            <button
              onClick={definirUltimos15Dias}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-md text-sm font-medium transition-colors duration-200"
              style={{ height: '40px', whiteSpace: 'nowrap' }}
            >
              Últimos 15 dias
            </button>
            <button
              onClick={definirUltimos30Dias}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-md text-sm font-medium transition-colors duration-200"
              style={{ height: '40px', whiteSpace: 'nowrap' }}
            >
              Últimos 30 dias
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 