interface BannerRolanteProps {
  corInicio?: string;
  corFim?: string;
  imagemUrl?: string;
}

export function BannerRolante({ 
  corInicio = "#542583",
  corFim = "#820ad1",
  imagemUrl
}: BannerRolanteProps) {
  return (
    <div 
      className="w-full h-[130px] overflow-hidden relative rounded-2xl"
      style={{
        background: imagemUrl 
          ? `url(${imagemUrl})`
          : `linear-gradient(to right, ${corInicio}, ${corFim})`,
        backgroundSize: imagemUrl ? 'cover' : 'auto',
        backgroundPosition: imagemUrl ? 'center' : 'auto',
        backgroundRepeat: imagemUrl ? 'no-repeat' : 'auto'
      }}
    />
  );
} 