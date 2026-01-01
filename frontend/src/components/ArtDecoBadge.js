import { useId } from 'react';
import { Star, ShoppingBag, Users, TrendingUp, Crown, Trophy, BadgeCheck, Award, Heart, Sparkles, Package, Clock } from 'lucide-react';

// Sistema de Medallas Doradas para Pulperías
// Logros específicos para tiendas locales
export const BADGES_ARTDECO = [
  { 
    id: 'primera_venta', 
    name: 'Primera Venta', 
    icon: ShoppingBag, 
    tier: 'gold',
    description: '¡Completaste tu primera venta!'
  },
  { 
    id: 'cliente_feliz', 
    name: '10 Clientes Felices', 
    icon: Heart, 
    tier: 'gold',
    description: '10 clientes satisfechos'
  },
  { 
    id: 'catalogo_completo', 
    name: 'Catálogo Completo', 
    icon: Package, 
    tier: 'gold',
    description: '20+ productos registrados'
  },
  { 
    id: 'respuesta_rapida', 
    name: 'Respuesta Rápida', 
    icon: Clock, 
    tier: 'gold',
    description: 'Respondes en menos de 1 hora'
  },
  { 
    id: 'vendedor_estrella', 
    name: 'Vendedor Estrella', 
    icon: Star, 
    tier: 'gold',
    description: '50+ ventas completadas'
  },
  { 
    id: 'popular', 
    name: 'Pulpería Popular', 
    icon: Users, 
    tier: 'gold',
    description: '100+ visitas a tu perfil'
  },
  { 
    id: 'en_ascenso', 
    name: 'En Ascenso', 
    icon: TrendingUp, 
    tier: 'gold',
    description: 'Crecimiento constante'
  },
  { 
    id: 'verificado', 
    name: 'Verificado', 
    icon: BadgeCheck, 
    tier: 'gold',
    description: 'Negocio verificado oficialmente'
  },
  { 
    id: 'top_vendedor', 
    name: 'Top Vendedor', 
    icon: Trophy, 
    tier: 'legendary',
    description: 'Top 10 del mes'
  },
  { 
    id: 'leyenda', 
    name: 'Leyenda Local', 
    icon: Crown, 
    tier: 'legendary',
    description: 'Referente de tu comunidad'
  },
];

// Colores dorados para todas las medallas
const TIER_COLORS = {
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
  }
};

// Medalla Dorada Premium con Corona de Laurel
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
  const colors = TIER_COLORS[badge.tier] || TIER_COLORS.gold;
  const sizeConfig = sizes[size] || sizes.md;
  const uniqueId = `medal-${badgeId}-${reactId.replace(/:/g, '')}`;
  const isLegendary = badge.tier === 'legendary';

  return (
    <div className="flex items-center gap-3">
      <div className={`relative ${animated ? 'group' : ''}`}>
        {/* Resplandor especial para Legendarios */}
        {isLegendary && animated && (
          <>
            <div 
              className="absolute inset-[-10px] rounded-full blur-xl animate-pulse opacity-40"
              style={{ backgroundColor: colors.glow }}
            />
            <div 
              className="absolute inset-[-5px] rounded-full blur-md animate-pulse opacity-60"
              style={{ backgroundColor: colors.glow, animationDelay: '0.5s' }}
            />
          </>
        )}
        
        {/* SVG Medalla Dorada con Corona de Laurel */}
        <svg 
          viewBox="0 0 120 120" 
          className={`${sizeConfig.container} relative ${animated ? 'transition-transform duration-500 group-hover:scale-110' : ''}`}
          style={{ filter: isLegendary ? `drop-shadow(0 0 12px ${colors.glow})` : 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' }}
        >
          <defs>
            {/* Gradiente principal dorado metálico */}
            <linearGradient id={`${uniqueId}-metal`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF8DC" />
              <stop offset="15%" stopColor="#F5E6A3" />
              <stop offset="35%" stopColor="#D4AF37" />
              <stop offset="50%" stopColor="#B8962E" />
              <stop offset="65%" stopColor="#D4AF37" />
              <stop offset="85%" stopColor="#F5E6A3" />
              <stop offset="100%" stopColor="#FFF8DC" />
            </linearGradient>
            
            {/* Gradiente para el borde exterior más oscuro */}
            <linearGradient id={`${uniqueId}-rim`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5E6A3" />
              <stop offset="40%" stopColor="#8B7021" />
              <stop offset="60%" stopColor="#6B5A1A" />
              <stop offset="100%" stopColor="#AA8A2E" />
            </linearGradient>
            
            {/* Gradiente radial para profundidad 3D */}
            <radialGradient id={`${uniqueId}-depth`} cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFACD" stopOpacity="0.7" />
              <stop offset="40%" stopColor="#D4AF37" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#5C4A15" stopOpacity="0.5" />
            </radialGradient>
            
            {/* Gradiente para hojas de laurel */}
            <linearGradient id={`${uniqueId}-leaf`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5E6A3" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#8B7021" />
            </linearGradient>
            
            {/* Brillo superior intenso */}
            <linearGradient id={`${uniqueId}-shine`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
              <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            
            {/* Sombra inferior */}
            <linearGradient id={`${uniqueId}-shadow`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0" />
              <stop offset="60%" stopColor="#000000" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
            </linearGradient>
            
            {/* Filtro de relieve para las hojas */}
            <filter id={`${uniqueId}-emboss`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="0.8" result="blur"/>
              <feSpecularLighting in="blur" surfaceScale="4" specularConstant="0.8" specularExponent="25" lightingColor="#FFFACD" result="specular">
                <fePointLight x="-3000" y="-8000" z="15000"/>
              </feSpecularLighting>
              <feComposite in="specular" in2="SourceAlpha" operator="in" result="specular"/>
              <feComposite in="SourceGraphic" in2="specular" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
            </filter>
            
            {/* Patrón de textura sutil */}
            <pattern id={`${uniqueId}-texture`} patternUnits="userSpaceOnUse" width="3" height="3">
              <circle cx="1.5" cy="1.5" r="0.3" fill="#8B7021" opacity="0.15"/>
            </pattern>
          </defs>
          
          {/* Sombra proyectada de la medalla */}
          <ellipse cx="62" cy="68" rx="44" ry="10" fill="rgba(0,0,0,0.25)" />
          
          {/* Cinta decorativa superior */}
          <g>
            <path 
              d="M42 6 L32 24 L38 24 L42 14 L46 24 L52 24 L42 6" 
              fill="#C41E3A"
              stroke="#8B0000"
              strokeWidth="0.5"
            />
            <path 
              d="M78 6 L88 24 L82 24 L78 14 L74 24 L68 24 L78 6" 
              fill="#C41E3A"
              stroke="#8B0000"
              strokeWidth="0.5"
            />
            {/* Brillo en las cintas */}
            <path d="M42 8 L36 20" stroke="#FF6B6B" strokeWidth="1" opacity="0.5"/>
            <path d="M78 8 L84 20" stroke="#FF6B6B" strokeWidth="1" opacity="0.5"/>
          </g>
          
          {/* Anillo exterior grueso con bisel */}
          <circle 
            cx="60" 
            cy="60" 
            r="52" 
            fill={`url(#${uniqueId}-rim)`}
          />
          
          {/* Línea decorativa exterior */}
          <circle 
            cx="60" 
            cy="60" 
            r="50" 
            fill="none"
            stroke="#5C4A15"
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
          
          {/* Efecto de profundidad 3D */}
          <circle 
            cx="60" 
            cy="60" 
            r="48" 
            fill={`url(#${uniqueId}-depth)`}
          />
          
          {/* Borde interior decorativo */}
          <circle 
            cx="60" 
            cy="60" 
            r="43" 
            fill="none"
            stroke="#AA8A2E"
            strokeWidth="2.5"
          />
          <circle 
            cx="60" 
            cy="60" 
            r="40" 
            fill="none"
            stroke="#F5E6A3"
            strokeWidth="0.5"
            opacity="0.6"
          />
          
          {/* Patrón de puntos romanos alrededor */}
          {[...Array(32)].map((_, i) => {
            const angle = (i * 11.25) * Math.PI / 180;
            const x = 60 + 41.5 * Math.cos(angle);
            const y = 60 + 41.5 * Math.sin(angle);
            return (
              <circle 
                key={i}
                cx={x} 
                cy={y} 
                r="1.2" 
                fill="#F5E6A3"
                opacity="0.9"
              />
            );
          })}
          
          {/* Corona de Laurel Detallada - Lado Izquierdo */}
          <g filter={`url(#${uniqueId}-emboss)`}>
            {/* Rama principal izquierda */}
            <path 
              d="M26 62 Q22 48 28 32 Q30 26 35 22" 
              fill="none" 
              stroke="#8B7021" 
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            
            {/* Hojas izquierdas - detalladas con nervaduras */}
            {[
              { cx: 28, cy: 54, rx: 5, ry: 12, rotate: -20 },
              { cx: 24, cy: 46, rx: 4.5, ry: 11, rotate: -30 },
              { cx: 23, cy: 38, rx: 4, ry: 10, rotate: -42 },
              { cx: 25, cy: 30, rx: 3.5, ry: 9, rotate: -55 },
              { cx: 30, cy: 24, rx: 3, ry: 8, rotate: -68 },
              { cx: 31, cy: 60, rx: 4.5, ry: 10, rotate: -10 },
              { cx: 27, cy: 66, rx: 4, ry: 9, rotate: 0 },
            ].map((leaf, i) => (
              <g key={`left-${i}`}>
                <ellipse 
                  cx={leaf.cx} 
                  cy={leaf.cy} 
                  rx={leaf.rx} 
                  ry={leaf.ry} 
                  fill={`url(#${uniqueId}-leaf)`}
                  transform={`rotate(${leaf.rotate} ${leaf.cx} ${leaf.cy})`}
                  stroke="#8B7021"
                  strokeWidth="0.3"
                />
                {/* Nervadura central de la hoja */}
                <line 
                  x1={leaf.cx} 
                  y1={leaf.cy - leaf.ry * 0.7} 
                  x2={leaf.cx} 
                  y2={leaf.cy + leaf.ry * 0.7}
                  stroke="#AA8A2E"
                  strokeWidth="0.8"
                  opacity="0.7"
                  transform={`rotate(${leaf.rotate} ${leaf.cx} ${leaf.cy})`}
                />
              </g>
            ))}
            
            {/* Bayas/olivas doradas izquierda */}
            <circle cx="21" cy="50" r="2.5" fill="#F5E6A3" stroke="#AA8A2E" strokeWidth="0.5"/>
            <circle cx="20" cy="42" r="2" fill="#F5E6A3" stroke="#AA8A2E" strokeWidth="0.5"/>
            <circle cx="22" cy="34" r="2" fill="#F5E6A3" stroke="#AA8A2E" strokeWidth="0.5"/>
          </g>
          
          {/* Corona de Laurel Detallada - Lado Derecho */}
          <g filter={`url(#${uniqueId}-emboss)`}>
            {/* Rama principal derecha */}
            <path 
              d="M94 62 Q98 48 92 32 Q90 26 85 22" 
              fill="none" 
              stroke="#8B7021" 
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            
            {/* Hojas derechas - espejadas */}
            {[
              { cx: 92, cy: 54, rx: 5, ry: 12, rotate: 20 },
              { cx: 96, cy: 46, rx: 4.5, ry: 11, rotate: 30 },
              { cx: 97, cy: 38, rx: 4, ry: 10, rotate: 42 },
              { cx: 95, cy: 30, rx: 3.5, ry: 9, rotate: 55 },
              { cx: 90, cy: 24, rx: 3, ry: 8, rotate: 68 },
              { cx: 89, cy: 60, rx: 4.5, ry: 10, rotate: 10 },
              { cx: 93, cy: 66, rx: 4, ry: 9, rotate: 0 },
            ].map((leaf, i) => (
              <g key={`right-${i}`}>
                <ellipse 
                  cx={leaf.cx} 
                  cy={leaf.cy} 
                  rx={leaf.rx} 
                  ry={leaf.ry} 
                  fill={`url(#${uniqueId}-leaf)`}
                  transform={`rotate(${leaf.rotate} ${leaf.cx} ${leaf.cy})`}
                  stroke="#8B7021"
                  strokeWidth="0.3"
                />
                {/* Nervadura central */}
                <line 
                  x1={leaf.cx} 
                  y1={leaf.cy - leaf.ry * 0.7} 
                  x2={leaf.cx} 
                  y2={leaf.cy + leaf.ry * 0.7}
                  stroke="#AA8A2E"
                  strokeWidth="0.8"
                  opacity="0.7"
                  transform={`rotate(${leaf.rotate} ${leaf.cx} ${leaf.cy})`}
                />
              </g>
            ))}
            
            {/* Bayas/olivas doradas derecha */}
            <circle cx="99" cy="50" r="2.5" fill="#F5E6A3" stroke="#AA8A2E" strokeWidth="0.5"/>
            <circle cx="100" cy="42" r="2" fill="#F5E6A3" stroke="#AA8A2E" strokeWidth="0.5"/>
            <circle cx="98" cy="34" r="2" fill="#F5E6A3" stroke="#AA8A2E" strokeWidth="0.5"/>
          </g>
          
          {/* Hojas inferiores que se unen (lazo de laurel) */}
          <g filter={`url(#${uniqueId}-emboss)`}>
            <ellipse cx="42" cy="74" rx="6" ry="12" fill={`url(#${uniqueId}-leaf)`} transform="rotate(35 42 74)" stroke="#8B7021" strokeWidth="0.3"/>
            <ellipse cx="78" cy="74" rx="6" ry="12" fill={`url(#${uniqueId}-leaf)`} transform="rotate(-35 78 74)" stroke="#8B7021" strokeWidth="0.3"/>
            <ellipse cx="50" cy="80" rx="5" ry="10" fill={`url(#${uniqueId}-leaf)`} transform="rotate(18 50 80)" stroke="#8B7021" strokeWidth="0.3"/>
            <ellipse cx="70" cy="80" rx="5" ry="10" fill={`url(#${uniqueId}-leaf)`} transform="rotate(-18 70 80)" stroke="#8B7021" strokeWidth="0.3"/>
            
            {/* Nudo central elaborado */}
            <circle cx="60" cy="85" r="5" fill="#AA8A2E" stroke="#8B7021" strokeWidth="1"/>
            <circle cx="60" cy="85" r="3" fill="#D4AF37"/>
            <circle cx="59" cy="84" r="1" fill="#F5E6A3" opacity="0.8"/>
          </g>
          
          {/* Círculo central para el ícono */}
          <circle 
            cx="60" 
            cy="54" 
            r="22" 
            fill="#8B7021"
            opacity="0.35"
          />
          <circle 
            cx="60" 
            cy="54" 
            r="20" 
            fill="none"
            stroke="#F5E6A3"
            strokeWidth="1.5"
            opacity="0.7"
          />
          
          {/* Estrellas decorativas superiores */}
          <g>
            {/* Estrella central grande */}
            <polygon 
              points="60,10 62.5,17 70,17 64,22 66.5,30 60,25 53.5,30 56,22 50,17 57.5,17"
              fill="#F5E6A3"
              stroke="#AA8A2E"
              strokeWidth="0.5"
            />
            {/* Estrellas pequeñas laterales */}
            <polygon 
              points="38,18 39.5,22 43,22 40.5,24.5 41.5,28 38,25.5 34.5,28 35.5,24.5 33,22 36.5,22"
              fill="#F5E6A3"
              opacity="0.85"
            />
            <polygon 
              points="82,18 83.5,22 87,22 84.5,24.5 85.5,28 82,25.5 78.5,28 79.5,24.5 77,22 80.5,22"
              fill="#F5E6A3"
              opacity="0.85"
            />
          </g>
          
          {/* Texto grabado "PULPERÍA" */}
          <text 
            x="60" 
            y="98" 
            textAnchor="middle" 
            fill="#F5E6A3"
            fontSize="5.5"
            fontFamily="serif"
            fontWeight="bold"
            letterSpacing="1"
          >
            PULPERÍA
          </text>
          
          {/* Brillo superior principal */}
          <ellipse 
            cx="45" 
            cy="32" 
            rx="22" 
            ry="14" 
            fill={`url(#${uniqueId}-shine)`}
          />
          
          {/* Brillo secundario */}
          <ellipse 
            cx="75" 
            cy="42" 
            rx="8" 
            ry="5" 
            fill="#FFFFFF"
            opacity="0.15"
          />
          
          {/* Sombra inferior */}
          <ellipse 
            cx="60" 
            cy="88" 
            rx="28" 
            ry="8" 
            fill={`url(#${uniqueId}-shadow)`}
          />
          
          {/* Animación de brillo para legendario */}
          {isLegendary && animated && (
            <>
              <circle 
                cx="60" 
                cy="60" 
                r="50" 
                fill="none"
                stroke="#FFFACD"
                strokeWidth="2"
                opacity="0.4"
                className="animate-ping"
                style={{ animationDuration: '2s' }}
              />
              {/* Destellos adicionales */}
              <circle cx="30" cy="30" r="2" fill="#FFFACD" className="animate-pulse" opacity="0.8"/>
              <circle cx="90" cy="35" r="1.5" fill="#FFFACD" className="animate-pulse" style={{animationDelay: '0.3s'}} opacity="0.8"/>
              <circle cx="25" cy="60" r="1.5" fill="#FFFACD" className="animate-pulse" style={{animationDelay: '0.6s'}} opacity="0.8"/>
            </>
          )}
        </svg>
        
        {/* Ícono superpuesto */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: '10%' }}>
          <Icon 
            className={`${sizeConfig.icon} drop-shadow-lg`} 
            style={{ 
              color: isLegendary ? '#FFFACD' : '#F5E6A3',
              filter: 'drop-shadow(0 2px 3px rgba(107, 90, 26, 0.8))'
            }}
            strokeWidth={2.5}
          />
        </div>

        {/* Destellos para Legendario */}
        {isLegendary && animated && (
          <>
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-200 rounded-full animate-ping opacity-80" />
            <div className="absolute bottom-3 left-0 w-2 h-2 bg-amber-300 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
            <div className="absolute top-1/3 left-[-2px] w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
          </>
        )}
      </div>
      
      {showName && (
        <div className="min-w-0">
          <p 
            className={`font-bold truncate ${sizeConfig.text}`} 
            style={{ 
              color: isLegendary ? '#FFD700' : '#F5E6A3',
              textShadow: isLegendary ? '0 0 10px #FFD700' : 'none'
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

// Badge Inline para listas - Versión compacta dorada
export const BadgeInline = ({ badgeId }) => {
  const badge = BADGES_ARTDECO.find(b => b.id === badgeId);
  if (!badge) return null;

  const Icon = badge.icon;
  const isLegendary = badge.tier === 'legendary';

  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full border ${isLegendary ? 'animate-pulse' : ''}`}
      style={{ 
        background: 'linear-gradient(135deg, #D4AF37, #8B7021)',
        borderColor: '#F5E6A3',
        color: '#FFFACD',
        boxShadow: '0 2px 10px rgba(212, 175, 55, 0.4), inset 0 1px 0 rgba(255, 248, 220, 0.4)'
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
    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 p-6">
      {BADGES_ARTDECO.map(badge => (
        <div key={badge.id} className="flex flex-col items-center gap-2">
          <ArtDecoBadge badgeId={badge.id} size="lg" showName={false} />
          <span className="text-sm text-stone-300 font-medium text-center">{badge.name}</span>
        </div>
      ))}
    </div>
  );
};

export default ArtDecoBadge;
