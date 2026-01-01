import { useState, useId } from 'react';
import { Star, Zap, Flame, Crown, Trophy, Target, Check, Gem } from 'lucide-react';

// Sistema de Badges Art Deco Premium
export const BADGES_ART_DECO = [
  { 
    id: 'novato', 
    name: 'Novato', 
    icon: Star, 
    colors: { primary: '#6B7280', secondary: '#4B5563', accent: '#9CA3AF' },
    description: 'Nuevo en la plataforma'
  },
  { 
    id: 'en_ascenso', 
    name: 'En Ascenso', 
    icon: Zap, 
    colors: { primary: '#3B82F6', secondary: '#1D4ED8', accent: '#60A5FA' },
    description: 'Creciendo rápidamente'
  },
  { 
    id: 'en_llamas', 
    name: 'En Llamas', 
    icon: Flame, 
    colors: { primary: '#F97316', secondary: '#EA580C', accent: '#FB923C' },
    description: 'Muy activo'
  },
  { 
    id: 'elite', 
    name: 'Élite', 
    icon: Gem, 
    colors: { primary: '#A855F7', secondary: '#7C3AED', accent: '#C084FC' },
    description: 'Vendedor destacado'
  },
  { 
    id: 'campeon', 
    name: 'Campeón', 
    icon: Trophy, 
    colors: { primary: '#F59E0B', secondary: '#D97706', accent: '#FBBF24' },
    description: 'Top vendedor'
  },
  { 
    id: 'legendario', 
    name: 'Legendario', 
    icon: Crown, 
    colors: { primary: '#D4A843', secondary: '#B8860B', accent: '#F7E7A0' },
    description: 'Leyenda viviente',
    premium: true
  },
  { 
    id: 'verificado', 
    name: 'Verificado', 
    icon: Check, 
    colors: { primary: '#10B981', secondary: '#059669', accent: '#34D399' },
    description: 'Verificado oficialmente'
  },
  { 
    id: 'socio', 
    name: 'Socio Oficial', 
    icon: Target, 
    colors: { primary: '#06B6D4', secondary: '#0891B2', accent: '#22D3EE' },
    description: 'Socio de La Pulpería'
  },
];

// Art Deco Badge SVG Component
const ArtDecoBadge = ({ badgeId, size = 'md', showName = true, animated = true }) => {
  const badge = BADGES_ART_DECO.find(b => b.id === badgeId);
  if (!badge) return null;

  const sizes = {
    sm: { container: 'w-8 h-8', icon: 'w-3 h-3', text: 'text-xs' },
    md: { container: 'w-12 h-12', icon: 'w-5 h-5', text: 'text-sm' },
    lg: { container: 'w-16 h-16', icon: 'w-7 h-7', text: 'text-base' },
    xl: { container: 'w-20 h-20', icon: 'w-9 h-9', text: 'text-lg' }
  };

  const Icon = badge.icon;
  const { primary, secondary, accent } = badge.colors;
  const sizeConfig = sizes[size] || sizes.md;

  const reactId = useId();
  const uniqueId = `badge-${badgeId}-${reactId.replace(/:/g, '')}`;

  return (
    <div className="flex items-center gap-3">
      <div className={`relative ${animated ? 'group' : ''}`}>
        {/* SVG Art Deco Badge */}
        <svg 
          viewBox="0 0 100 100" 
          className={`${sizeConfig.container} ${animated ? 'transition-transform duration-300 group-hover:scale-110' : ''}`}
        >
          <defs>
            {/* Badge Gradient */}
            <linearGradient id={`${uniqueId}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={accent} />
              <stop offset="50%" stopColor={primary} />
              <stop offset="100%" stopColor={secondary} />
            </linearGradient>
            {/* Gold Border Gradient for Premium */}
            <linearGradient id={`${uniqueId}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F7E7A0" />
              <stop offset="25%" stopColor="#D4A843" />
              <stop offset="50%" stopColor="#B8860B" />
              <stop offset="75%" stopColor="#D4A843" />
              <stop offset="100%" stopColor="#F7E7A0" />
            </linearGradient>
            {/* Glow Filter */}
            <filter id={`${uniqueId}-glow`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="glow"/>
              <feMerge>
                <feMergeNode in="glow"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Outer Art Deco Octagon Frame */}
          <polygon 
            points="50,5 80,15 95,45 80,75 50,85 20,75 5,45 20,15" 
            fill="none" 
            stroke={badge.premium ? `url(#${uniqueId}-gold)` : primary}
            strokeWidth="2"
            className={animated ? 'transition-all duration-300' : ''}
          />
          
          {/* Inner Filled Shape */}
          <polygon 
            points="50,12 75,20 87,45 75,70 50,78 25,70 13,45 25,20" 
            fill={`url(#${uniqueId}-grad)`}
            stroke={badge.premium ? `url(#${uniqueId}-gold)` : accent}
            strokeWidth="1"
          />
          
          {/* Art Deco Inner Lines */}
          <line x1="50" y1="15" x2="50" y2="25" stroke={accent} strokeWidth="1.5" opacity="0.5"/>
          <line x1="50" y1="65" x2="50" y2="75" stroke={accent} strokeWidth="1.5" opacity="0.5"/>
          <line x1="18" y1="45" x2="28" y2="45" stroke={accent} strokeWidth="1.5" opacity="0.5"/>
          <line x1="72" y1="45" x2="82" y2="45" stroke={accent} strokeWidth="1.5" opacity="0.5"/>
          
          {/* Diamond Accent at Top */}
          <polygon 
            points="50,8 53,12 50,16 47,12" 
            fill={badge.premium ? `url(#${uniqueId}-gold)` : accent}
            filter={badge.premium ? `url(#${uniqueId}-glow)` : ''}
          />
          
          {/* Icon Circle Background */}
          <circle 
            cx="50" 
            cy="45" 
            r="18" 
            fill={secondary}
            opacity="0.5"
          />
        </svg>
        
        {/* Lucide Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ marginTop: '-5%' }}>
          <Icon 
            className={`${sizeConfig.icon} drop-shadow-lg`} 
            style={{ color: accent }}
          />
        </div>

        {/* Premium Shimmer Effect */}
        {badge.premium && animated && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/30 to-transparent animate-shimmer rounded-full overflow-hidden" />
        )}

        {/* Animated Ping for Legendary */}
        {badge.premium && animated && (
          <div 
            className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full animate-ping"
            style={{ backgroundColor: accent }}
          />
        )}
      </div>
      
      {showName && (
        <div className="min-w-0">
          <p className={`font-bold font-serif truncate ${sizeConfig.text}`} style={{ color: accent }}>
            {badge.name}
          </p>
          {size !== 'sm' && (
            <p className="text-xs text-stone-400 truncate">{badge.description}</p>
          )}
        </div>
      )}
    </div>
  );
};

// Simple inline badge for cards/lists
export const ArtDecoBadgeInline = ({ badgeId }) => {
  const badge = BADGES_ART_DECO.find(b => b.id === badgeId);
  if (!badge) return null;

  const Icon = badge.icon;
  const { primary, accent } = badge.colors;

  return (
    <div 
      className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-bold font-serif tracking-wide"
      style={{ 
        background: `linear-gradient(135deg, ${primary}, ${badge.colors.secondary})`,
        color: '#FEF3C7',
        clipPath: 'polygon(8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%, 0% 50%)'
      }}
    >
      <Icon className="w-3 h-3" />
      <span>{badge.name}</span>
    </div>
  );
};

// Ad Plan Badge Art Deco
export const AdPlanBadge = ({ plan }) => {
  const planStyles = {
    premium: {
      bg: 'linear-gradient(135deg, #F7E7A0, #D4A843, #B8860B)',
      text: '#1C1917',
      label: 'PREMIUM'
    },
    destacado: {
      bg: 'linear-gradient(135deg, #60A5FA, #3B82F6, #1D4ED8)',
      text: '#FFFFFF',
      label: 'DESTACADO'
    },
    basico: {
      bg: 'linear-gradient(135deg, #A78BFA, #8B5CF6, #7C3AED)',
      text: '#FFFFFF',
      label: 'BÁSICO'
    }
  };

  const style = planStyles[plan] || planStyles.basico;

  return (
    <span 
      className="inline-flex items-center px-3 py-1 text-[10px] font-bold tracking-widest"
      style={{ 
        background: style.bg,
        color: style.text,
        clipPath: 'polygon(10% 0%, 90% 0%, 100% 50%, 90% 100%, 10% 100%, 0% 50%)'
      }}
    >
      {style.label}
    </span>
  );
};

export default ArtDecoBadge;
