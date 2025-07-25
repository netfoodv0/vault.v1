'use client';

import { useState, useEffect, useRef } from 'react';
import { BannerRolante } from './BannerRolante';

interface BannerData {
  id: number;
  corInicio: string;
  corFim: string;
  imagemUrl?: string;
}

const banners: BannerData[] = [
  {
    id: 1,
    corInicio: "#542583",
    corFim: "#820ad1",
    imagemUrl: "https://storage.shopfood.io/public/companies/poe726g0/cms_banners/642865beeb2b312875976619452fdb9a.jpg"
  },
  {
    id: 2,
    corInicio: "#7c3aed",
    corFim: "#a855f7",
    imagemUrl: "https://storage.shopfood.io/public/companies/poe726g0/cms_banners/642865beeb2b312875976619452fdb9a.jpg"
  },
  {
    id: 3,
    corInicio: "#581c87",
    corFim: "#7c2d12",
    imagemUrl: "https://www.bobs.com.br/media/filer_public_thumbnails/filer_public/15/f0/15f06065-7b04-47df-b7ac-f4072a008740/banner-dupla-1110x350.png__1200x630_q85_crop_subsampling-2_upscale.jpg"
  }
];

export function GaleriaBanners() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll a cada 7 segundos
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Aplicar scroll automático
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const bannerWidth = 320 + 16; // largura do banner + gap
      container.scrollTo({
        left: currentIndex * bannerWidth,
        behavior: 'smooth'
      });
    }
  }, [currentIndex]);

  return (
    <div className="relative">
      {/* Container dos banners com scroll horizontal */}
      <div 
        ref={containerRef}
        className="overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="flex gap-4 px-4" style={{ minWidth: 'max-content' }}>
          {banners.map((banner) => (
            <div 
              key={banner.id}
              className="flex-shrink-0 w-80"
            >
              <BannerRolante 
                corInicio={banner.corInicio}
                corFim={banner.corFim}
                imagemUrl={banner.imagemUrl}
              />
            </div>
          ))}
          {/* Espaço extra no final para scroll */}
          <div className="w-2 flex-shrink-0" />
        </div>
      </div>
      
      {/* Indicadores de página (bolinhas) */}
      <div className="flex justify-center gap-2 mt-3">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-[#542583] scale-110' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Ir para banner ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
} 