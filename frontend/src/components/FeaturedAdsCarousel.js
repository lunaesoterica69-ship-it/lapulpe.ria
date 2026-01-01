import { useState, useEffect } from 'react';
import { api } from '../config/api';
import { Megaphone, ExternalLink, Play, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';

// Carousel de Anuncios Destacados
const FeaturedAdsCarousel = ({ onAdClick }) => {
  const [ads, setAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await api.get('/api/featured-ads');
        setAds(res.data);
      } catch (error) {
        console.error('Error fetching featured ads:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  // Auto-rotate ads
  useEffect(() => {
    if (ads.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % ads.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [ads.length]);

  const nextAd = () => {
    setCurrentIndex(prev => (prev + 1) % ads.length);
  };

  const prevAd = () => {
    setCurrentIndex(prev => (prev - 1 + ads.length) % ads.length);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-amber-900/30 to-stone-900/50 rounded-2xl p-6 border border-amber-500/30 animate-pulse">
        <div className="h-48 bg-stone-800 rounded-xl"></div>
      </div>
    );
  }

  if (ads.length === 0) {
    return null; // No mostrar nada si no hay anuncios
  }

  const currentAd = ads[currentIndex];

  return (
    <div className="bg-gradient-to-r from-amber-900/20 to-stone-900/50 rounded-2xl border border-amber-500/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-amber-900/30 border-b border-amber-500/20">
        <Megaphone className="w-4 h-4 text-amber-400" />
        <span className="text-amber-400 text-sm font-medium">Anuncios Destacados</span>
        {ads.length > 1 && (
          <span className="text-amber-600 text-xs ml-auto">{currentIndex + 1}/{ads.length}</span>
        )}
      </div>
      
      {/* Ad Content */}
      <div className="relative">
        <a 
          href={currentAd.link_url || '#'} 
          onClick={(e) => {
            if (onAdClick) {
              e.preventDefault();
              onAdClick(currentAd);
            }
          }}
          className="block"
        >
          {/* Media Container */}
          <div className="relative aspect-video bg-stone-900">
            {currentAd.video_url ? (
              <video 
                src={currentAd.video_url}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : currentAd.image_url ? (
              <img 
                src={currentAd.image_url}
                alt={currentAd.title || currentAd.pulperia_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-16 h-16 text-stone-700" />
              </div>
            )}
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            
            {/* Ad Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              {currentAd.title && (
                <h3 className="text-white font-bold text-lg mb-1">{currentAd.title}</h3>
              )}
              {currentAd.description && (
                <p className="text-stone-300 text-sm line-clamp-2">{currentAd.description}</p>
              )}
              <div className="flex items-center justify-between mt-2">
                <span className="text-amber-400 text-sm">{currentAd.pulperia_name}</span>
                <ExternalLink className="w-4 h-4 text-white/70" />
              </div>
            </div>
            
            {/* Video indicator */}
            {currentAd.video_url && (
              <div className="absolute top-3 right-3 bg-black/50 rounded-full p-2">
                <Play className="w-4 h-4 text-white" fill="white" />
              </div>
            )}
          </div>
        </a>
        
        {/* Navigation Arrows */}
        {ads.length > 1 && (
          <>
            <button
              onClick={prevAd}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextAd}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
      
      {/* Dots indicator */}
      {ads.length > 1 && (
        <div className="flex justify-center gap-1.5 py-2 bg-stone-900/50">
          {ads.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === currentIndex ? 'bg-amber-400' : 'bg-stone-600 hover:bg-stone-500'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedAdsCarousel;
