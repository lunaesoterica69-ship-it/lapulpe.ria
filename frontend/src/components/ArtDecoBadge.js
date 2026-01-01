import { useId } from 'react';
import { Star, Zap, Flame, Crown, Trophy, Target, Check, Gem } from 'lucide-react';

// Sistema de Medallas Estilo Romano/Clásico Premium
export const BADGES_ROMAN = [
  { 
    id: 'novato', 
    name: 'Novato', 
    icon: Star, 
    tier: 'bronze',
    colors: { primary: '#92400E', secondary: '#78350F', accent: '#D97706', glow: '#F59E0B' },
    description: 'Nuevo en la plataforma'
  },
  { 
    id: 'en_ascenso', 
    name: 'En Ascenso', 
    icon: Zap, 
    tier: 'bronze',
    colors: { primary: '#1E40AF', secondary: '#1E3A8A', accent: '#3B82F6', glow: '#60A5FA' },
    description: 'Creciendo rápidamente'
  },
  { 
    id: 'en_llamas', 
    name: 'En Llamas', 
    icon: Flame, 
    tier: 'silver',
    colors: { primary: '#C2410C', secondary: '#9A3412', accent: '#F97316', glow: '#FB923C' },
    description: 'Muy activo'
  },
  { 
    id: 'elite', 
    name: 'Élite', 
    tier: 'silver',
    icon: Gem, 
    colors: { primary: '#7C3AED', secondary: '#6D28D9', accent: '#A78BFA', glow: '#C4B5FD' },
    description: 'Vendedor destacado'
  },
  { 
    id: 'campeon', 
    name: 'Campeón', 
    tier: 'gold',
    icon: Trophy, 
    colors: { primary: '#B45309', secondary: '#92400E', accent: '#F59E0B', glow: '#FCD34D' },
    description: 'Top vendedor'
  },
  { 
    id: 'legendario', 
    name: 'Legendario', 
    tier: 'legendary',
    icon: Crown, 
    colors: { primary: '#B8860B', secondary: '#8B6914', accent: '#D4A843', glow: '#F7E7A0' },
    description: 'Leyenda viviente'
  },
  { 
    id: 'verificado', 
    name: 'Verificado', 
    tier: 'special',
    icon: Check, 
    colors: { primary: '#059669', secondary: '#047857', accent: '#10B981', glow: '#34D399' },
    description: 'Verificado oficialmente'
  },
  { 
    id: 'socio', 
    name: 'Socio Oficial', 
    tier: 'special',
    icon: Target, 
    colors: { primary: '#0891B2', secondary: '#0E7490', accent: '#06B6D4', glow: '#22D3EE' },
    description: 'Socio de La Pulpería'
  },
];

// Medalla Estilo Romano con Laureles
const RomanBadge = ({ badgeId, size = 'md', showName = true, animated = true }) => {
  const reactId = useId();
  const badge = BADGES_ROMAN.find(b => b.id === badgeId);
  
  if (!badge) return null;

  const sizes = {
    sm: { container: 'w-10 h-10', icon: 'w-4 h-4', text: 'text-xs' },
    md: { container: 'w-14 h-14', icon: 'w-6 h-6', text: 'text-sm' },
    lg: { container: 'w-20 h-20', icon: 'w-8 h-8', text: 'text-base' },
    xl: { container: 'w-28 h-28', icon: 'w-10 h-10', text: 'text-lg' }
  };

  const Icon = badge.icon;
  const { primary, secondary, accent, glow } = badge.colors;
  const sizeConfig = sizes[size] || sizes.md;
  const uniqueId = `roman-${badgeId}-${reactId.replace(/:/g, '')}`;
  const isLegendary = badge.tier === 'legendary';
  const isGold = badge.tier === 'gold' || isLegendary;

  return (
    <div className="flex items-center gap-3">
      <div className={`relative ${animated ? 'group' : ''}`}>
        {/* Glow Effect for Legendary */}
        {isLegendary && animated && (
          <div 
            className="absolute inset-0 rounded-full blur-md animate-pulse opacity-60"
            style={{ backgroundColor: glow }}
          />
        )}
        
        {/* SVG Roman Medal */}
        <svg 
          viewBox="0 0 100 100" 
          className={`${sizeConfig.container} relative ${animated ? 'transition-transform duration-300 group-hover:scale-110' : ''}`}
        >
          <defs>
            {/* Medal Gradient */}
            <linearGradient id={`${uniqueId}-medal`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={accent} />
              <stop offset="50%" stopColor={primary} />
              <stop offset="100%" stopColor={secondary} />
            </linearGradient>
            {/* Gold Gradient for Laurels */}
            <linearGradient id={`${uniqueId}-gold`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isGold ? "#F7E7A0" : accent} />
              <stop offset="50%" stopColor={isGold ? "#D4A843" : primary} />
              <stop offset="100%" stopColor={isGold ? "#B8860B" : secondary} />
            </linearGradient>
            {/* Glow Filter */}
            <filter id={`${uniqueId}-glow`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="glow"/>
              <feMerge>
                <feMergeNode in="glow"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            {/* Inner Shadow */}
            <filter id={`${uniqueId}-inner`}>
              <feOffset dx="0" dy="2"/>
              <feGaussianBlur stdDeviation="1"/>
              <feComposite operator="out" in="SourceGraphic"/>
              <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.3 0"/>
              <feBlend mode="multiply" in2="SourceGraphic"/>
            </filter>
          </defs>
          
          {/* Left Laurel Branch */}
          <g transform="translate(8, 50)" fill={`url(#${uniqueId}-gold)`} opacity="0.9">
            <ellipse cx="8" cy="-25" rx="4" ry="8" transform="rotate(-30)"/>
            <ellipse cx="5" cy="-18" rx="3.5" ry="7" transform="rotate(-20)"/>
            <ellipse cx="3" cy="-10" rx="3" ry="6" transform="rotate(-10)"/>
            <ellipse cx="2" cy="-2" rx="2.5" ry="5" transform="rotate(0)"/>
            <ellipse cx="3" cy="6" rx="3" ry="6" transform="rotate(10)"/>
            <ellipse cx="5" cy="14" rx="3.5" ry="7" transform="rotate(20)"/>
            <ellipse cx="8" cy="21" rx="4" ry="8" transform="rotate(30)"/>
            {/* Stem */}
            <path d="M10 -28 Q 5 0 10 28" stroke={isGold ? "#B8860B" : secondary} strokeWidth="2" fill="none"/>
          </g>
          
          {/* Right Laurel Branch */}
          <g transform="translate(92, 50) scale(-1, 1)" fill={`url(#${uniqueId}-gold)`} opacity="0.9">
            <ellipse cx="8" cy="-25" rx="4" ry="8" transform="rotate(-30)"/>
            <ellipse cx="5" cy="-18" rx="3.5" ry="7" transform="rotate(-20)"/>
            <ellipse cx="3" cy="-10" rx="3" ry="6" transform="rotate(-10)"/>
            <ellipse cx="2" cy="-2" rx="2.5" ry="5" transform="rotate(0)"/>
            <ellipse cx="3" cy="6" rx="3" ry="6" transform="rotate(10)"/>
            <ellipse cx="5" cy="14" rx="3.5" ry="7" transform="rotate(20)"/>
            <ellipse cx="8" cy="21" rx="4" ry="8" transform="rotate(30)"/>
            {/* Stem */}
            <path d="M10 -28 Q 5 0 10 28" stroke={isGold ? "#B8860B" : secondary} strokeWidth="2" fill="none"/>
          </g>
          
          {/* Medal Outer Ring */}
          <circle 
            cx="50" 
            cy="50" 
            r="30" 
            fill="none" 
            stroke={`url(#${uniqueId}-gold)`}
            strokeWidth="3"
            filter={isLegendary ? `url(#${uniqueId}-glow)` : ''}
          />
          
          {/* Medal Inner Circle */}
          <circle 
            cx="50" 
            cy="50" 
            r="26" 
            fill={`url(#${uniqueId}-medal)`}
            filter={`url(#${uniqueId}-inner)`}
          />
          
          {/* Inner Decorative Ring */}
          <circle 
            cx="50" 
            cy="50" 
            r="22" 
            fill="none" 
            stroke={accent}
            strokeWidth="1"
            opacity="0.5"
          />
          
          {/* Star Accent at Top (for Gold/Legendary) */}
          {isGold && (
            <polygon 
              points="50,12 52,18 58,18 53,22 55,28 50,24 45,28 47,22 42,18 48,18"
              fill={`url(#${uniqueId}-gold)`}
              filter={`url(#${uniqueId}-glow)`}
            />
          )}
          
          {/* Bottom Ribbon */}
          <path 
            d="M35 80 L40 90 L50 85 L60 90 L65 80"
            fill={`url(#${uniqueId}-medal)`}
            stroke={accent}
            strokeWidth="1"
          />
        </svg>
        
        {/* Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon 
            className={`${sizeConfig.icon} drop-shadow-lg`} 
            style={{ color: isLegendary ? '#FEF3C7' : '#FFFFFF' }}
          />
        </div>

        {/* Animated Sparkles for Legendary */}
        {isLegendary && animated && (
          <>
            <div className="absolute top-0 right-1 w-1.5 h-1.5 bg-amber-300 rounded-full animate-ping" />
            <div className="absolute bottom-2 left-0 w-1 h-1 bg-amber-400 rounded-full animate-ping animation-delay-200" />
          </>
        )}
      </div>
      
      {showName && (
        <div className="min-w-0">
          <p 
            className={`font-bold truncate ${sizeConfig.text}`} 
            style={{ color: isLegendary ? glow : accent }}
          >
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
export const RomanBadgeInline = ({ badgeId }) => {
  const badge = BADGES_ROMAN.find(b => b.id === badgeId);
  if (!badge) return null;

  const Icon = badge.icon;
  const { primary, accent } = badge.colors;
  const isGold = badge.tier === 'gold' || badge.tier === 'legendary';

  return (
    <div 
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full"
      style={{ 
        background: `linear-gradient(135deg, ${primary}, ${badge.colors.secondary})`,
        color: isGold ? '#FEF3C7' : '#FFFFFF',
        boxShadow: `0 2px 8px ${primary}40`
      }}
    >
      <Icon className="w-3 h-3" />
      <span>{badge.name}</span>
    </div>
  );
};

export default RomanBadge;
