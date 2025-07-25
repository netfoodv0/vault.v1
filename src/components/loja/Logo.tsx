interface LogoProps {
  imageUrl?: string
}

export function Logo({ imageUrl = "https://logospng.org/wp-content/uploads/bobs.png" }: LogoProps) {
  return (
    <div className="w-[70px] h-[70px] bg-white rounded-full flex items-center justify-center overflow-hidden">
      <img 
        src={imageUrl}
        alt="Logo da loja"
        className="w-full h-full object-contain p-2"
      />
    </div>
  );
} 