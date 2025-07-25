interface NomeLojaProps {
  nome?: string
  estaAberta?: boolean
  proximoHorario?: string
}

export function NomeLoja({ nome = "Loja Teste", estaAberta = true, proximoHorario }: NomeLojaProps) {
  const getStatusText = () => {
    if (estaAberta) {
      return "Loja aberta"
    } else if (proximoHorario) {
      return `Abre às ${proximoHorario}`
    } else {
      return "Loja fechada"
    }
  }

  const getStatusColor = () => {
    if (estaAberta) {
      return "#10b981" // Verde
    } else {
      return "#ef4444" // Vermelho
    }
  }

  return (
    <div className="flex flex-col">
      <h1 className="text-xl font-bold text-white">
        {nome}
      </h1>
      <span 
        className="text-white font-medium min-h-[14px] flex items-center" 
        style={{ 
          fontSize: '11px',
          color: getStatusColor()
        }}
      >
        {getStatusText()}
      </span>
    </div>
  );
} 