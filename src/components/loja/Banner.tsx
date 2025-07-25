interface BannerProps {
  imageUrl?: string
  title?: string
}

export function Banner({ imageUrl = "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0d/5b/a4/f1/bobs.jpg?w=900&h=500&s=1", title }: BannerProps) {
  return (
    <div className="w-full h-[140px] bg-gray-300 overflow-hidden relative rounded-t-2xl">
      {/* Aqui vai a foto do banner */}
      <div className="w-full h-full flex items-center justify-center">
        <img 
          src={imageUrl}
          alt={title ? `Banner da ${title}` : "Banner da loja"}
          className="w-full h-full object-cover"
          style={{
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))'
          }}
        />
      </div>
      
      {/* Máscara escura por cima da imagem */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-30"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.6) 100%)'
        }}
      />
    </div>
  );
} 