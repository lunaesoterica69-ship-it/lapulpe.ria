import { useId } from 'react';
import { Star, Zap, Flame, Crown, Trophy, Target, BadgeCheck, Gem, Award, Shield, Rocket, Heart } from 'lucide-react';

// Sistema de Medallas Estilo Art Deco Premium
// Inspirado en medallas clásicas con figura alegórica
export const BADGES_ARTDECO = [
  { 
    id: 'novato', 
    name: 'Novato', 
    icon: Star, 
    tier: 'bronze',
    description: 'Nuevo en la plataforma'
  },
  { 
    id: 'en_ascenso', 
    name: 'En Ascenso', 
    icon: Rocket, 
    tier: 'bronze',
    description: 'Creciendo rápidamente'
  },
  { 
    id: 'en_llamas', 
    name: 'En Llamas', 
    icon: Flame, 
    tier: 'silver',
    description: 'Muy activo'
  },
  { 
    id: 'elite', 
    name: 'Élite', 
    tier: 'silver',
    icon: Gem, 
    description: 'Vendedor destacado'
  },
  { 
    id: 'campeon', 
    name: 'Campeón', 
    tier: 'gold',
    icon: Trophy, 
    description: 'Top vendedor'
  },
  { 
    id: 'legendario', 
    name: 'Legendario', 
    tier: 'legendary',
    icon: Crown, 
    description: 'Leyenda viviente'
  },
  { 
    id: 'verificado', 
    name: 'Verificado', 
    tier: 'special',
    icon: BadgeCheck, 
    description: 'Verificado oficialmente'
  },
  { 
    id: 'socio', 
    name: 'Socio Oficial', 
    tier: 'special',
    icon: Shield, 
    description: 'Socio de La Pulpería'
  },
];

// Colores por tier
const TIER_COLORS = {
  bronze: {
    primary: '#CD7F32',
    secondary: '#8B5A2B', 
    accent: '#DEB887',
    glow: '#CD7F32'
  },
  silver: {
    primary: '#C0C0C0',
    secondary: '#808080',
    accent: '#E8E8E8',
    glow: '#C0C0C0'
  },
  gold: {
    primary: '#DAA520',
    secondary: '#B8860B',
    accent: '#FFD700',
    glow: '#FFD700'
  },
  legendary: {
    primary: '#D4A843',
    secondary: '#8B6914',
    accent: '#F7E7A0',
    glow: '#FFD700'
  },
  special: {
    primary: '#10B981',
    secondary: '#059669',
    accent: '#34D399',
    glow: '#10B981'
  }
};

// Medalla Art Deco Premium - Estilo de la imagen
const ArtDecoBadge = ({ badgeId, size = 'md', showName = true, animated = true }) => {
  const reactId = useId();
  const badge = BADGES_ARTDECO.find(b => b.id === badgeId);
  
  if (!badge) return null;

  const sizes = {
    sm: { container: 'w-10 h-10', icon: 'w-4 h-4', text: 'text-xs' },
    md: { container: 'w-14 h-14', icon: 'w-5 h-5', text: 'text-sm' },
    lg: { container: 'w-20 h-20', icon: 'w-7 h-7', text: 'text-base' },
    xl: { container: 'w-28 h-28', icon: 'w-9 h-9', text: 'text-lg' }
  };

  const Icon = badge.icon;
  const colors = TIER_COLORS[badge.tier];
  const sizeConfig = sizes[size] || sizes.md;
  const uniqueId = `artdeco-${badgeId}-${reactId.replace(/:/g, '')}`;
  const isLegendary = badge.tier === 'legendary';
  const isGold = badge.tier === 'gold' || isLegendary;

  return (
    <div className="flex items-center gap-3">
      <div className={`relative ${animated ? 'group' : ''}`}>
        {/* Glow Effect for Legendary */}
        {isLegendary && animated && (
          <div 
            className="absolute inset-0 rounded-full blur-lg animate-pulse opacity-40"
            style={{ backgroundColor: colors.glow }}
          />
        )}
        
        {/* SVG Art Deco Medal */}
        <svg 
          viewBox="0 0 100 100" 
          className={`${sizeConfig.container} relative ${animated ? 'transition-transform duration-300 group-hover:scale-110' : ''}`}
        >
          <defs>
            {/* Main Medal Gradient - Brass/Bronze look */}
            <linearGradient id={`${uniqueId}-base`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.accent} />
              <stop offset="30%" stopColor={colors.primary} />
              <stop offset="70%" stopColor={colors.secondary} />
              <stop offset="100%" stopColor={colors.primary} />
            </linearGradient>
            
            {/* Highlight Gradient */}
            <linearGradient id={`${uniqueId}-highlight`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            
            {/* Shadow Gradient */}
            <linearGradient id={`${uniqueId}-shadow`} x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#000000" stopOpacity="0" />
            </linearGradient>
            
            {/* Inner glow filter */}
            <filter id={`${uniqueId}-glow`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.5" result="glow"/>
              <feMerge>
                <feMergeNode in="glow"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Outer Ring - Beveled Edge */}
          <circle 
            cx="50" 
            cy="50" 
            r="47" 
            fill={`url(#${uniqueId}-base)`}
            stroke={colors.secondary}
            strokeWidth="1"
          />
          
          {/* Inner Medal Face */}
          <circle 
            cx="50" 
            cy="50" 
            r="42" 
            fill={`url(#${uniqueId}-base)`}
          />
          
          {/* Art Deco Decorative Border */}
          <circle 
            cx="50" 
            cy="50" 
            r="40" 
            fill="none"
            stroke={colors.accent}
            strokeWidth="1.5"
            strokeDasharray="8 4"
            opacity="0.6"
          />
          
          {/* Inner Circle for Icon */}
          <circle 
            cx="50" 
            cy="50" 
            r="25" 
            fill={colors.secondary}
            opacity="0.4"
          />
          
          {/* Geometric Art Deco Lines - Top */}
          <line x1="50" y1="10" x2="50" y2="20" stroke={colors.accent} strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
          <line x1="30" y1="18" x2="35" y2="26" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
          <line x1="70" y1="18" x2="65" y2="26" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
          
          {/* Geometric Art Deco Lines - Bottom */}
          <line x1="50" y1="90" x2="50" y2="80" stroke={colors.accent} strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
          <line x1="30" y1="82" x2="35" y2="74" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
          <line x1="70" y1="82" x2="65" y2="74" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
          
          {/* Side Decorative Elements */}
          <line x1="10" y1="50" x2="20" y2="50" stroke={colors.accent} strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
          <line x1="90" y1="50" x2="80" y2="50" stroke={colors.accent} strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
          
          {/* Laurel Wreath - Left Side */}
          <g fill={colors.accent} opacity="0.7">
            <ellipse cx="22" cy="35" rx="3" ry="7" transform="rotate(-30 22 35)"/>
            <ellipse cx="18" cy="43" rx="2.5" ry="6" transform="rotate(-15 18 43)"/>
            <ellipse cx="17" cy="52" rx="2.5" ry="6" transform="rotate(0 17 52)"/>
            <ellipse cx="18" cy="61" rx="2.5" ry="6" transform="rotate(15 18 61)"/>
            <ellipse cx="22" cy="69" rx="3" ry="7" transform="rotate(30 22 69)"/>
          </g>
          
          {/* Laurel Wreath - Right Side */}
          <g fill={colors.accent} opacity="0.7">
            <ellipse cx="78" cy="35" rx="3" ry="7" transform="rotate(30 78 35)"/>
            <ellipse cx="82" cy="43" rx="2.5" ry="6" transform="rotate(15 82 43)"/>
            <ellipse cx="83" cy="52" rx="2.5" ry="6" transform="rotate(0 83 52)"/>
            <ellipse cx="82" cy="61" rx="2.5" ry="6" transform="rotate(-15 82 61)"/>
            <ellipse cx="78" cy="69" rx="3" ry="7" transform="rotate(-30 78 69)"/>
          </g>
          
          {/* Top Highlight */}
          <ellipse 
            cx="50" 
            cy="30" 
            rx="25" 
            ry="15" 
            fill={`url(#${uniqueId}-highlight)`}
          />
          
          {/* Bottom Shadow */}
          <ellipse 
            cx="50" 
            cy="70" 
            rx="25" 
            ry="15" 
            fill={`url(#${uniqueId}-shadow)`}
          />
          
          {/* Star decoration for Gold/Legendary tiers */}
          {isGold && (
            <polygon 
              points="50,6 52,12 58,12 53,16 55,22 50,18 45,22 47,16 42,12 48,12"
              fill={colors.accent}
              filter={`url(#${uniqueId}-glow)`}
            />
          )}
        </svg>
        
        {/* Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon 
            className={`${sizeConfig.icon} drop-shadow-md`} 
            style={{ color: isLegendary ? '#FEF3C7' : colors.accent }}
            strokeWidth={2.5}
          />
        </div>

        {/* Sparkles for Legendary */}
        {isLegendary && animated && (
          <>
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-300 rounded-full animate-ping opacity-75" />
            <div className="absolute bottom-1 -left-0.5 w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping" style={{ animationDelay: '0.3s' }} />
          </>
        )}
      </div>
      
      {showName && (
        <div className="min-w-0">
          <p 
            className={`font-bold truncate ${sizeConfig.text}`} 
            style={{ color: isLegendary ? colors.glow : colors.accent }}
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

// Badge Inline para listas
export const BadgeInline = ({ badgeId }) => {
  const badge = BADGES_ARTDECO.find(b => b.id === badgeId);
  if (!badge) return null;

  const Icon = badge.icon;
  const colors = TIER_COLORS[badge.tier];

  return (
    <div 
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full"
      style={{ 
        background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
        color: '#FFFFFF',
        boxShadow: `0 2px 8px ${colors.primary}40`
      }}
    >
      <Icon className="w-3 h-3" strokeWidth={2.5} />
      <span>{badge.name}</span>
    </div>
  );
};

export default ArtDecoBadge;
