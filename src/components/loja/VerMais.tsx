'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DiaFuncionamento } from '@/hooks/useAdministrarLoja';

interface VerMaisProps {
  descricaoLoja?: string
  horariosFuncionamento?: DiaFuncionamento[]
  aceitarDinheiro?: boolean
  aceitarPix?: boolean
  aceitarCredito?: boolean
  aceitarDebito?: boolean
  bandeirasMastercard?: { credito: boolean; debito: boolean }
  bandeirasVisa?: { credito: boolean; debito: boolean }
  bandeirasAmericanExpress?: { credito: boolean; debito: boolean }
  bandeirasElo?: { credito: boolean; debito: boolean }
  bandeirasHipercard?: { credito: boolean; debito: boolean }
  bandeirasPersonalizadas?: Array<{ id: number; nome: string; credito: boolean; debito: boolean }>
}

export function VerMais({ 
  descricaoLoja, 
  horariosFuncionamento,
  aceitarDinheiro = true,
  aceitarPix = false,
  aceitarCredito = true,
  aceitarDebito = true,
  bandeirasMastercard = { credito: true, debito: true },
  bandeirasVisa = { credito: true, debito: true },
  bandeirasAmericanExpress = { credito: true, debito: true },
  bandeirasElo = { credito: true, debito: true },
  bandeirasHipercard = { credito: true, debito: true },
  bandeirasPersonalizadas = []
}: VerMaisProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Função para formatar horários de forma legível
  const formatarHorarios = () => {
    if (!horariosFuncionamento || horariosFuncionamento.length === 0) {
      return [
        { dia: 'Segunda-feira', horario: '11h às 23h' },
        { dia: 'Terça-feira', horario: '11h às 23h' },
        { dia: 'Quarta-feira', horario: '11h às 23h' },
        { dia: 'Quinta-feira', horario: '11h às 23h' },
        { dia: 'Sexta-feira', horario: '11h às 23h' },
        { dia: 'Sábado', horario: '11h às 00h' },
        { dia: 'Domingo', horario: '12h às 22h' }
      ];
    }

    // Mostrar cada dia individualmente
    const resultado = horariosFuncionamento.map(dia => {
      if (dia.fechado) {
        return { dia: dia.dia, horario: 'Fechado' };
      }

      const horariosFormatados = dia.horarios.map(h => {
        const abertura = h.abertura.replace(':', 'h');
        const fechamento = h.fechamento.replace(':', 'h');
        return `${abertura} às ${fechamento}`;
      });

      return { 
        dia: dia.dia, 
        horario: horariosFormatados.join(', ')
      };
    });

    return resultado;
  };

  // Função para formatar formas de pagamento
  const formatarFormasPagamento = () => {
    const formas = [];

    // Dinheiro
    if (aceitarDinheiro) {
      formas.push('Dinheiro');
    }

    // PIX
    if (aceitarPix) {
      formas.push('PIX');
    }

    // Cartões de crédito
    if (aceitarCredito) {
      const bandeirasCredito = [];
      
      if (bandeirasMastercard?.credito) bandeirasCredito.push('Mastercard');
      if (bandeirasVisa?.credito) bandeirasCredito.push('Visa');
      if (bandeirasAmericanExpress?.credito) bandeirasCredito.push('American Express');
      if (bandeirasElo?.credito) bandeirasCredito.push('Elo');
      if (bandeirasHipercard?.credito) bandeirasCredito.push('Hipercard');
      
      // Bandeiras personalizadas de crédito
      bandeirasPersonalizadas.forEach(bandeira => {
        if (bandeira.credito) bandeirasCredito.push(bandeira.nome);
      });

      if (bandeirasCredito.length > 0) {
        formas.push(`Cartão de crédito (${bandeirasCredito.join(', ')})`);
      }
    }

    // Cartões de débito
    if (aceitarDebito) {
      const bandeirasDebito = [];
      
      if (bandeirasMastercard?.debito) bandeirasDebito.push('Mastercard');
      if (bandeirasVisa?.debito) bandeirasDebito.push('Visa');
      if (bandeirasAmericanExpress?.debito) bandeirasDebito.push('American Express');
      if (bandeirasElo?.debito) bandeirasDebito.push('Elo');
      if (bandeirasHipercard?.debito) bandeirasDebito.push('Hipercard');
      
      // Bandeiras personalizadas de débito
      bandeirasPersonalizadas.forEach(bandeira => {
        if (bandeira.debito) bandeirasDebito.push(bandeira.nome);
      });

      if (bandeirasDebito.length > 0) {
        formas.push(`Cartão de débito (${bandeirasDebito.join(', ')})`);
      }
    }

    // Se não houver formas configuradas, retorna formas padrão
    if (formas.length === 0) {
      return [
        'Cartão de crédito e débito',
        'PIX',
        'Dinheiro',
        'Vale refeição'
      ];
    }

    return formas;
  };

  return (
    <>
      <button 
        onClick={handleOpenModal}
        className="text-[11px] text-purple-600 font-medium hover:text-purple-700 transition-colors cursor-pointer"
      >
        Ver mais
      </button>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title="Informações Adicionais"
      >
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Sobre Nossa Loja
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {descricaoLoja || 'Bem-vindo à nossa loja! Oferecemos uma ampla variedade de produtos deliciosos, desde lanches tradicionais até opções mais sofisticadas. Nossa missão é proporcionar uma experiência gastronômica única e satisfatória.'}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Horário de Funcionamento
              </h3>
              <div className="text-gray-600 text-sm space-y-1">
                {formatarHorarios().map((item, index) => (
                  <p key={index} className="text-gray-600">
                    <span className="font-semibold text-gray-700">{item.dia}</span>
                    <span> - {item.horario}</span>
                  </p>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Formas de Pagamento
              </h3>
              <div className="text-gray-600 text-sm space-y-1">
                {formatarFormasPagamento().map((forma, index) => (
                  <p key={index}>• {forma}</p>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Entrega e Retirada
              </h3>
              <div className="text-gray-600 text-sm space-y-1">
                <p>• Entrega em até 40 minutos</p>
                <p>• Retirada no local</p>
                <p>• Pedido mínimo: R$ 15,00</p>
                <p>• Taxa de entrega: R$ 3,00</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Contato
              </h3>
              <div className="text-gray-600 text-sm space-y-1">
                <p><strong>Telefone:</strong> (11) 99999-9999</p>
                <p><strong>WhatsApp:</strong> (11) 99999-9999</p>
                <p><strong>Email:</strong> contato@loja.com</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
} 