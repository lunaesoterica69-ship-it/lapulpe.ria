import { useId } from 'react';
import { Star, Zap, Flame, Crown, Trophy, Target, BadgeCheck, Gem, Award, Shield, Rocket, Heart } from 'lucide-react';

// Sistema de Medallas Estilo Romano Premium
// Inspirado en medallas clásicas romanas con coronas de laurel detalladas
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

// Colores por tier - Más ricos y metálicos
const TIER_COLORS = {
  bronze: {
    primary: '#CD7F32',
    secondary: '#8B5A2B', 
    accent: '#E8C496',
    dark: '#5C3D1E',
    glow: '#CD7F32',
    highlight: '#F4D9A8'
  },
  silver: {
    primary: '#B8C5D0',
    secondary: '#7A8B99',
    accent: '#E8EDF2',
    dark: '#4A5661',
    glow: '#C0C0C0',
    highlight: '#FFFFFF'
  },
  gold: {
    primary: '#D4AF37',
    secondary: '#AA8A2E',
    accent: '#F5E6A3',
    dark: '#7A6420',
    glow: '#FFD700',
    highlight: '#FFF8DC'
  },
  legendary: {
    primary: '#E8C547',
    secondary: '#B8962E',
    accent: '#FFF4B8',
    dark: '#6B5A1A',
    glow: '#FFD700',
    highlight: '#FFFACD'
  },
  special: {
    primary: '#10B981',
    secondary: '#059669',
    accent: '#6EE7B7',
    dark: '#064E3B',
    glow: '#10B981',
    highlight: '#D1FAE5'
  }
};

// Medalla Romana Premium con detalles elaborados
const ArtDecoBadge = ({ badgeId, size = 'md', showName = true, animated = true }) => {
  const reactId = useId();
  const badge = BADGES_ARTDECO.find(b => b.id === badgeId);
  
  if (!badge) return null;

  const sizes = {
    sm: { container: 'w-12 h-12', icon: 'w-4 h-4', text: 'text-xs' },
    md: { container: 'w-16 h-16', icon: 'w-5 h-5', text: 'text-sm' },
    lg: { container: 'w-24 h-24', icon: 'w-8 h-8', text: 'text-base' },
    xl: { container: 'w-32 h-32', icon: 'w-10 h-10', text: 'text-lg' }
  };

  const Icon = badge.icon;
  const colors = TIER_COLORS[badge.tier];
  const sizeConfig = sizes[size] || sizes.md;
  const uniqueId = `medal-${badgeId}-${reactId.replace(/:/g, '')}`;
  const isLegendary = badge.tier === 'legendary';
  const isGold = badge.tier === 'gold' || isLegendary;

  return (
    <div className="flex items-center gap-3">
      <div className={`relative ${animated ? 'group' : ''}`}>
        {/* Resplandor para Legendario */}
        {isLegendary && animated && (
          <>
            <div 
              className="absolute inset-[-8px] rounded-full blur-xl animate-pulse opacity-30"
              style={{ backgroundColor: colors.glow }}
            />
            <div 
              className="absolute inset-[-4px] rounded-full blur-md animate-pulse opacity-50"
              style={{ backgroundColor: colors.glow, animationDelay: '0.5s' }}
            />
          </>
        )}
        
        {/* SVG Medalla Romana Detallada */}
        <svg 
          viewBox="0 0 120 120" 
          className={`${sizeConfig.container} relative ${animated ? 'transition-transform duration-500 group-hover:scale-110' : ''}`}
          style={{ filter: isLegendary ? `drop-shadow(0 0 8px ${colors.glow})` : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
        >
          <defs>
            {/* Gradiente principal metálico */}
            <linearGradient id={`${uniqueId}-metal`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.highlight} />
              <stop offset="15%" stopColor={colors.accent} />
              <stop offset="40%" stopColor={colors.primary} />
              <stop offset="60%" stopColor={colors.secondary} />
              <stop offset="85%" stopColor={colors.primary} />
              <stop offset="100%" stopColor={colors.accent} />
            </linearGradient>
            
            {/* Gradiente para el borde exterior */}
            <linearGradient id={`${uniqueId}-rim`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.accent} />
              <stop offset="50%" stopColor={colors.dark} />
              <stop offset="100%" stopColor={colors.secondary} />
            </linearGradient>
            
            {/* Gradiente radial para profundidad */}
            <radialGradient id={`${uniqueId}-depth`} cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor={colors.highlight} stopOpacity="0.6" />
              <stop offset="50%" stopColor={colors.primary} stopOpacity="0.3" />
              <stop offset="100%" stopColor={colors.dark} stopOpacity="0.4" />
            </radialGradient>
            
            {/* Gradiente para hojas de laurel */}
            <linearGradient id={`${uniqueId}-leaf`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.accent} />
              <stop offset="50%" stopColor={colors.primary} />
              <stop offset="100%" stopColor={colors.secondary} />
            </linearGradient>
            
            {/* Brillo superior */}
            <linearGradient id={`${uniqueId}-shine`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
              <stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            
            {/* Sombra inferior */}
            <linearGradient id={`${uniqueId}-shadow`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0" />
              <stop offset="70%" stopColor="#000000" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
            </linearGradient>
            
            {/* Filtro de relieve */}
            <filter id={`${uniqueId}-emboss`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur"/>
              <feOffset in="blur" dx="1" dy="1" result="offsetBlur"/>
              <feSpecularLighting in="blur" surfaceScale="5" specularConstant="0.75" specularExponent="20" lightingColor={colors.highlight} result="specular">
                <fePointLight x="-5000" y="-10000" z="20000"/>
              </feSpecularLighting>
              <feComposite in="specular" in2="SourceAlpha" operator="in" result="specular"/>
              <feComposite in="SourceGraphic" in2="specular" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
            </filter>
            
            {/* Patrón de textura */}
            <pattern id={`${uniqueId}-texture`} patternUnits="userSpaceOnUse" width="4" height="4">
              <circle cx="2" cy="2" r="0.5" fill={colors.dark} opacity="0.1"/>
            </pattern>
          </defs>
          
          {/* Sombra de la medalla */}
          <ellipse cx="62" cy="65" rx="42" ry="8" fill="rgba(0,0,0,0.2)" />
          
          {/* Cinta decorativa (para tiers especiales) */}
          {(isGold || badge.tier === 'special') && (
            <g>
              <path 
                d="M45 8 L35 25 L40 25 L45 15 L50 25 L55 25 L45 8" 
                fill={badge.tier === 'special' ? '#059669' : '#AA2222'}
                opacity="0.9"
              />
              <path 
                d="M75 8 L85 25 L80 25 L75 15 L70 25 L65 25 L75 8" 
                fill={badge.tier === 'special' ? '#059669' : '#AA2222'}
                opacity="0.9"
              />
            </g>
          )}
          
          {/* Borde exterior grueso con bisel */}
          <circle 
            cx="60" 
            cy="60" 
            r="52" 
            fill={`url(#${uniqueId}-rim)`}
          />
          
          {/* Anillo decorativo exterior */}
          <circle 
            cx="60" 
            cy="60" 
            r="50" 
            fill="none"
            stroke={colors.dark}
            strokeWidth="1"
          />
          
          {/* Cuerpo principal de la medalla */}
          <circle 
            cx="60" 
            cy="60" 
            r="48" 
            fill={`url(#${uniqueId}-metal)`}
          />
          
          {/* Textura sutil */}
          <circle 
            cx="60" 
            cy="60" 
            r="48" 
            fill={`url(#${uniqueId}-texture)`}
          />
          
          {/* Efecto de profundidad */}
          <circle 
            cx="60" 
            cy="60" 
            r="48" 
            fill={`url(#${uniqueId}-depth)`}
          />
          
          {/* Borde interno con muescas decorativas */}
          <circle 
            cx="60" 
            cy="60" 
            r="44" 
            fill="none"
            stroke={colors.secondary}
            strokeWidth="2"
          />
          
          {/* Patrón de puntos alrededor del borde (estilo romano) */}
          {[...Array(24)].map((_, i) => {
            const angle = (i * 15) * Math.PI / 180;
            const x = 60 + 42 * Math.cos(angle);
            const y = 60 + 42 * Math.sin(angle);
            return (
              <circle 
                key={i}
                cx={x} 
                cy={y} 
                r="1.5" 
                fill={colors.accent}
                opacity="0.8"
              />
            );
          })}
          
          {/* Corona de Laurel Detallada - Lado Izquierdo */}
          <g filter={`url(#${uniqueId}-emboss)`}>
            {/* Rama principal izquierda */}
            <path 
              d="M28 60 Q25 45 35 30" 
              fill="none" 
              stroke={colors.secondary} 
              strokeWidth="2"
              strokeLinecap="round"
            />
            
            {/* Hojas izquierdas - más detalladas */}
            {[
              { cx: 30, cy: 52, rx: 4, ry: 10, rotate: -25 },
              { cx: 27, cy: 45, rx: 3.5, ry: 9, rotate: -35 },
              { cx: 26, cy: 38, rx: 3, ry: 8, rotate: -45 },
              { cx: 28, cy: 32, rx: 3, ry: 7, rotate: -55 },
              { cx: 32, cy: 27, rx: 2.5, ry: 6, rotate: -65 },
              { cx: 33, cy: 58, rx: 4, ry: 9, rotate: -15 },
              { cx: 30, cy: 64, rx: 3.5, ry: 8, rotate: -5 },
            ].map((leaf, i) => (
              <g key={`left-${i}`}>
                <ellipse 
                  cx={leaf.cx} 
                  cy={leaf.cy} 
                  rx={leaf.rx} 
                  ry={leaf.ry} 
                  fill={`url(#${uniqueId}-leaf)`}
                  transform={`rotate(${leaf.rotate} ${leaf.cx} ${leaf.cy})`}
                />
                {/* Nervadura de la hoja */}
                <line 
                  x1={leaf.cx - leaf.rx * 0.5} 
                  y1={leaf.cy} 
                  x2={leaf.cx + leaf.rx * 0.5} 
                  y2={leaf.cy}
                  stroke={colors.dark}
                  strokeWidth="0.5"
                  opacity="0.5"
                  transform={`rotate(${leaf.rotate} ${leaf.cx} ${leaf.cy})`}
                />
              </g>
            ))}
            
            {/* Bayas/frutas decorativas izquierda */}
            <circle cx="25" cy="50" r="2" fill={colors.accent} />
            <circle cx="24" cy="42" r="1.5" fill={colors.accent} />
            <circle cx="27" cy="35" r="1.5" fill={colors.accent} />
          </g>
          
          {/* Corona de Laurel Detallada - Lado Derecho */}
          <g filter={`url(#${uniqueId}-emboss)`}>
            {/* Rama principal derecha */}
            <path 
              d="M92 60 Q95 45 85 30" 
              fill="none" 
              stroke={colors.secondary} 
              strokeWidth="2"
              strokeLinecap="round"
            />
            
            {/* Hojas derechas - espejadas */}
            {[
              { cx: 90, cy: 52, rx: 4, ry: 10, rotate: 25 },
              { cx: 93, cy: 45, rx: 3.5, ry: 9, rotate: 35 },
              { cx: 94, cy: 38, rx: 3, ry: 8, rotate: 45 },
              { cx: 92, cy: 32, rx: 3, ry: 7, rotate: 55 },
              { cx: 88, cy: 27, rx: 2.5, ry: 6, rotate: 65 },
              { cx: 87, cy: 58, rx: 4, ry: 9, rotate: 15 },
              { cx: 90, cy: 64, rx: 3.5, ry: 8, rotate: 5 },
            ].map((leaf, i) => (
              <g key={`right-${i}`}>
                <ellipse 
                  cx={leaf.cx} 
                  cy={leaf.cy} 
                  rx={leaf.rx} 
                  ry={leaf.ry} 
                  fill={`url(#${uniqueId}-leaf)`}
                  transform={`rotate(${leaf.rotate} ${leaf.cx} ${leaf.cy})`}
                />
                {/* Nervadura de la hoja */}
                <line 
                  x1={leaf.cx - leaf.rx * 0.5} 
                  y1={leaf.cy} 
                  x2={leaf.cx + leaf.rx * 0.5} 
                  y2={leaf.cy}
                  stroke={colors.dark}
                  strokeWidth="0.5"
                  opacity="0.5"
                  transform={`rotate(${leaf.rotate} ${leaf.cx} ${leaf.cy})`}
                />
              </g>
            ))}
            
            {/* Bayas/frutas decorativas derecha */}
            <circle cx="95" cy="50" r="2" fill={colors.accent} />
            <circle cx="96" cy="42" r="1.5" fill={colors.accent} />
            <circle cx="93" cy="35" r="1.5" fill={colors.accent} />
          </g>
          
          {/* Hojas inferiores que se unen (lazo de laurel) */}
          <g filter={`url(#${uniqueId}-emboss)`}>
            <ellipse cx="45" cy="72" rx="5" ry="10" fill={`url(#${uniqueId}-leaf)`} transform="rotate(30 45 72)" />
            <ellipse cx="75" cy="72" rx="5" ry="10" fill={`url(#${uniqueId}-leaf)`} transform="rotate(-30 75 72)" />
            <ellipse cx="52" cy="78" rx="4" ry="8" fill={`url(#${uniqueId}-leaf)`} transform="rotate(15 52 78)" />
            <ellipse cx="68" cy="78" rx="4" ry="8" fill={`url(#${uniqueId}-leaf)`} transform="rotate(-15 68 78)" />
            {/* Nudo central del lazo */}
            <circle cx="60" cy="82" r="4" fill={colors.secondary} />
            <circle cx="60" cy="82" r="2.5" fill={colors.accent} />
          </g>
          
          {/* Círculo central para el ícono */}
          <circle 
            cx="60" 
            cy="55" 
            r="20" 
            fill={colors.dark}
            opacity="0.3"
          />
          <circle 
            cx="60" 
            cy="55" 
            r="18" 
            fill="none"
            stroke={colors.accent}
            strokeWidth="1.5"
            opacity="0.6"
          />
          
          {/* Decoraciones superiores (estrellas para oro/legendario) */}
          {isGold && (
            <g>
              {/* Estrella central superior */}
              <polygon 
                points="60,12 62,18 68,18 63,22 65,28 60,24 55,28 57,22 52,18 58,18"
                fill={colors.accent}
                filter={`url(#${uniqueId}-emboss)`}
              />
              {/* Estrellas laterales pequeñas */}
              <polygon 
                points="40,20 41,23 44,23 42,25 43,28 40,26 37,28 38,25 36,23 39,23"
                fill={colors.accent}
                opacity="0.8"
              />
              <polygon 
                points="80,20 81,23 84,23 82,25 83,28 80,26 77,28 78,25 76,23 79,23"
                fill={colors.accent}
                opacity="0.8"
              />
            </g>
          )}
          
          {/* Texto grabado en la base (para algunos tiers) */}
          {(badge.tier === 'gold' || badge.tier === 'legendary') && (
            <text 
              x="60" 
              y="95" 
              textAnchor="middle" 
              fill={colors.accent}
              fontSize="6"
              fontFamily="serif"
              fontWeight="bold"
              opacity="0.8"
            >
              PREMIUM
            </text>
          )}
          
          {/* Brillo superior */}
          <ellipse 
            cx="48" 
            cy="35" 
            rx="20" 
            ry="12" 
            fill={`url(#${uniqueId}-shine)`}
          />
          
          {/* Sombra inferior */}
          <ellipse 
            cx="60" 
            cy="85" 
            rx="25" 
            ry="10" 
            fill={`url(#${uniqueId}-shadow)`}
          />
          
          {/* Animación de brillo para legendario */}
          {isLegendary && animated && (
            <circle 
              cx="60" 
              cy="60" 
              r="48" 
              fill="none"
              stroke={colors.highlight}
              strokeWidth="2"
              opacity="0.5"
              className="animate-ping"
              style={{ animationDuration: '2s' }}
            />
          )}
        </svg>
        
        {/* Ícono superpuesto */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: '8%' }}>
          <Icon 
            className={`${sizeConfig.icon} drop-shadow-lg`} 
            style={{ 
              color: isLegendary ? colors.highlight : colors.accent,
              filter: `drop-shadow(0 1px 2px ${colors.dark})`
            }}
            strokeWidth={2.5}
          />
        </div>

        {/* Destellos para Legendario */}
        {isLegendary && animated && (
          <>
            <div className="absolute top-0 right-1 w-2 h-2 bg-amber-200 rounded-full animate-ping opacity-75" />
            <div className="absolute bottom-2 left-0 w-1.5 h-1.5 bg-amber-300 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
            <div className="absolute top-1/4 left-0 w-1 h-1 bg-amber-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
          </>
        )}
      </div>
      
      {showName && (
        <div className="min-w-0">
          <p 
            className={`font-bold truncate ${sizeConfig.text}`} 
            style={{ 
              color: isLegendary ? colors.glow : colors.accent,
              textShadow: isLegendary ? `0 0 8px ${colors.glow}` : 'none'
            }}
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

// Badge Inline para listas - Versión compacta pero elegante
export const BadgeInline = ({ badgeId }) => {
  const badge = BADGES_ARTDECO.find(b => b.id === badgeId);
  if (!badge) return null;

  const Icon = badge.icon;
  const colors = TIER_COLORS[badge.tier];
  const isLegendary = badge.tier === 'legendary';

  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full border ${isLegendary ? 'animate-pulse' : ''}`}
      style={{ 
        background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
        borderColor: colors.accent,
        color: '#FFFFFF',
        boxShadow: `0 2px 8px ${colors.primary}40, inset 0 1px 0 ${colors.highlight}40`
      }}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
      <span className="tracking-wide">{badge.name}</span>
    </div>
  );
};

// Componente de showcase para mostrar todas las medallas
export const BadgeShowcase = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6">
      {BADGES_ARTDECO.map(badge => (
        <div key={badge.id} className="flex flex-col items-center gap-2">
          <ArtDecoBadge badgeId={badge.id} size="lg" showName={false} />
          <span className="text-sm text-stone-300 font-medium">{badge.name}</span>
        </div>
      ))}
    </div>
  );
};

export default ArtDecoBadge;
