import { useId } from 'react';
import { ShoppingBag, Package, Star, Eye, Heart, TrendingUp, Users, Flame, Layers, BadgeCheck, Trophy, Crown } from 'lucide-react';

// Sistema de Meritocracia - Medallas Doradas
export const BADGES_ARTDECO = [
  // Nivel 1 - Principiante
  { id: 'primera_venta', name: 'Primera Venta', icon: ShoppingBag, tier: 'gold', description: '¡Completaste tu primera venta!', points: 10 },
  { id: 'catalogo_inicial', name: 'Catálogo Inicial', icon: Package, tier: 'gold', description: '5 productos en tu tienda', points: 10 },
  
  // Nivel 2 - En Progreso
  { id: 'diez_ventas', name: '10 Ventas', icon: Star, tier: 'gold', description: '10 ventas completadas', points: 25 },
  { id: 'catalogo_completo', name: 'Catálogo Completo', icon: Package, tier: 'gold', description: '15+ productos registrados', points: 25 },
  { id: 'primeras_visitas', name: 'Ganando Visibilidad', icon: Eye, tier: 'gold', description: '50 visitas a tu perfil', points: 20 },
  
  // Nivel 3 - Establecido
  { id: 'cliente_feliz', name: 'Clientes Felices', icon: Heart, tier: 'gold', description: '10 reseñas positivas', points: 40 },
  { id: 'cincuenta_ventas', name: 'Vendedor Activo', icon: TrendingUp, tier: 'gold', description: '50 ventas completadas', points: 50 },
  { id: 'popular', name: 'Pulpería Popular', icon: Users, tier: 'gold', description: '200+ visitas', points: 40 },
  
  // Nivel 4 - Experto
  { id: 'cien_ventas', name: 'Vendedor Estrella', icon: Star, tier: 'gold', description: '100 ventas completadas', points: 75 },
  { id: 'super_catalogo', name: 'Super Catálogo', icon: Layers, tier: 'gold', description: '30+ productos', points: 50 },
  { id: 'muy_popular', name: 'Muy Popular', icon: Flame, tier: 'gold', description: '500+ visitas', points: 60 },
  
  // Nivel 5 - Legendarios
  { id: 'verificado', name: 'Verificado', icon: BadgeCheck, tier: 'legendary', description: 'Verificado por admin', points: 100 },
  { id: 'top_vendedor', name: 'Top Vendedor', icon: Trophy, tier: 'legendary', description: '250+ ventas', points: 150 },
  { id: 'leyenda', name: 'Leyenda Local', icon: Crown, tier: 'legendary', description: '1000+ visitas y 50+ reseñas', points: 200 },
];

// Colores dorados
const TIER_COLORS = {
  gold: {
    primary: '#D4AF37', secondary: '#AA8A2E', accent: '#F5E6A3',
    dark: '#7A6420', glow: '#FFD700', highlight: '#FFF8DC'
  },
  legendary: {
    primary: '#E8C547', secondary: '#B8962E', accent: '#FFF4B8',
    dark: '#6B5A1A', glow: '#FFD700', highlight: '#FFFACD'
  }
};

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
        {isLegendary && animated && (
          <>
            <div className="absolute inset-[-10px] rounded-full blur-xl animate-pulse opacity-40" style={{ backgroundColor: colors.glow }} />
            <div className="absolute inset-[-5px] rounded-full blur-md animate-pulse opacity-60" style={{ backgroundColor: colors.glow, animationDelay: '0.5s' }} />
          </>
        )}
        
        <svg viewBox="0 0 120 120" className={`${sizeConfig.container} relative ${animated ? 'transition-transform duration-500 group-hover:scale-110' : ''}`}
          style={{ filter: isLegendary ? `drop-shadow(0 0 12px ${colors.glow})` : 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' }}>
          <defs>
            <linearGradient id={`${uniqueId}-metal`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF8DC" />
              <stop offset="15%" stopColor="#F5E6A3" />
              <stop offset="35%" stopColor="#D4AF37" />
              <stop offset="50%" stopColor="#B8962E" />
              <stop offset="65%" stopColor="#D4AF37" />
              <stop offset="85%" stopColor="#F5E6A3" />
              <stop offset="100%" stopColor="#FFF8DC" />
            </linearGradient>
            <linearGradient id={`${uniqueId}-rim`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5E6A3" />
              <stop offset="40%" stopColor="#8B7021" />
              <stop offset="60%" stopColor="#6B5A1A" />
              <stop offset="100%" stopColor="#AA8A2E" />
            </linearGradient>
            <radialGradient id={`${uniqueId}-depth`} cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFACD" stopOpacity="0.7" />
              <stop offset="40%" stopColor="#D4AF37" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#5C4A15" stopOpacity="0.5" />
            </radialGradient>
            <linearGradient id={`${uniqueId}-leaf`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5E6A3" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#8B7021" />
            </linearGradient>
            <linearGradient id={`${uniqueId}-shine`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
              <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          <ellipse cx="62" cy="68" rx="44" ry="10" fill="rgba(0,0,0,0.25)" />
          
          {/* Cintas */}
          <g>
            <path d="M42 6 L32 24 L38 24 L42 14 L46 24 L52 24 L42 6" fill="#C41E3A" stroke="#8B0000" strokeWidth="0.5"/>
            <path d="M78 6 L88 24 L82 24 L78 14 L74 24 L68 24 L78 6" fill="#C41E3A" stroke="#8B0000" strokeWidth="0.5"/>
          </g>
          
          <circle cx="60" cy="60" r="52" fill={`url(#${uniqueId}-rim)`}/>
          <circle cx="60" cy="60" r="48" fill={`url(#${uniqueId}-metal)`}/>
          <circle cx="60" cy="60" r="48" fill={`url(#${uniqueId}-depth)`}/>
          <circle cx="60" cy="60" r="43" fill="none" stroke="#AA8A2E" strokeWidth="2.5"/>
          
          {/* Puntos decorativos */}
          {[...Array(24)].map((_, i) => {
            const angle = (i * 15) * Math.PI / 180;
            return <circle key={i} cx={60 + 41 * Math.cos(angle)} cy={60 + 41 * Math.sin(angle)} r="1.2" fill="#F5E6A3" opacity="0.9"/>;
          })}
          
          {/* Corona de laurel izquierda */}
          <g>
            <path d="M26 62 Q22 48 28 32 Q30 26 35 22" fill="none" stroke="#8B7021" strokeWidth="2.5" strokeLinecap="round"/>
            {[{ cx: 28, cy: 54, rx: 5, ry: 12, r: -20 }, { cx: 24, cy: 46, rx: 4.5, ry: 11, r: -30 }, { cx: 23, cy: 38, rx: 4, ry: 10, r: -42 },
              { cx: 25, cy: 30, rx: 3.5, ry: 9, r: -55 }, { cx: 31, cy: 60, rx: 4.5, ry: 10, r: -10 }].map((l, i) => (
              <ellipse key={`l-${i}`} cx={l.cx} cy={l.cy} rx={l.rx} ry={l.ry} fill={`url(#${uniqueId}-leaf)`} transform={`rotate(${l.r} ${l.cx} ${l.cy})`} stroke="#8B7021" strokeWidth="0.3"/>
            ))}
            <circle cx="21" cy="50" r="2.5" fill="#F5E6A3" stroke="#AA8A2E" strokeWidth="0.5"/>
            <circle cx="20" cy="42" r="2" fill="#F5E6A3" stroke="#AA8A2E" strokeWidth="0.5"/>
          </g>
          
          {/* Corona de laurel derecha */}
          <g>
            <path d="M94 62 Q98 48 92 32 Q90 26 85 22" fill="none" stroke="#8B7021" strokeWidth="2.5" strokeLinecap="round"/>
            {[{ cx: 92, cy: 54, rx: 5, ry: 12, r: 20 }, { cx: 96, cy: 46, rx: 4.5, ry: 11, r: 30 }, { cx: 97, cy: 38, rx: 4, ry: 10, r: 42 },
              { cx: 95, cy: 30, rx: 3.5, ry: 9, r: 55 }, { cx: 89, cy: 60, rx: 4.5, ry: 10, r: 10 }].map((l, i) => (
              <ellipse key={`r-${i}`} cx={l.cx} cy={l.cy} rx={l.rx} ry={l.ry} fill={`url(#${uniqueId}-leaf)`} transform={`rotate(${l.r} ${l.cx} ${l.cy})`} stroke="#8B7021" strokeWidth="0.3"/>
            ))}
            <circle cx="99" cy="50" r="2.5" fill="#F5E6A3" stroke="#AA8A2E" strokeWidth="0.5"/>
            <circle cx="100" cy="42" r="2" fill="#F5E6A3" stroke="#AA8A2E" strokeWidth="0.5"/>
          </g>
          
          {/* Hojas inferiores */}
          <g>
            <ellipse cx="42" cy="74" rx="6" ry="12" fill={`url(#${uniqueId}-leaf)`} transform="rotate(35 42 74)"/>
            <ellipse cx="78" cy="74" rx="6" ry="12" fill={`url(#${uniqueId}-leaf)`} transform="rotate(-35 78 74)"/>
            <circle cx="60" cy="85" r="5" fill="#AA8A2E" stroke="#8B7021" strokeWidth="1"/>
            <circle cx="60" cy="85" r="3" fill="#D4AF37"/>
          </g>
          
          <circle cx="60" cy="54" r="22" fill="#8B7021" opacity="0.35"/>
          <circle cx="60" cy="54" r="20" fill="none" stroke="#F5E6A3" strokeWidth="1.5" opacity="0.7"/>
          
          {/* Estrellas */}
          <polygon points="60,10 62.5,17 70,17 64,22 66.5,30 60,25 53.5,30 56,22 50,17 57.5,17" fill="#F5E6A3" stroke="#AA8A2E" strokeWidth="0.5"/>
          
          <text x="60" y="98" textAnchor="middle" fill="#F5E6A3" fontSize="5.5" fontFamily="serif" fontWeight="bold" letterSpacing="1">PULPERÍA</text>
          <ellipse cx="45" cy="32" rx="22" ry="14" fill={`url(#${uniqueId}-shine)`}/>
          
          {isLegendary && animated && (
            <circle cx="60" cy="60" r="50" fill="none" stroke="#FFFACD" strokeWidth="2" opacity="0.4" className="animate-ping" style={{ animationDuration: '2s' }}/>
          )}
        </svg>
        
        <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: '10%' }}>
          <Icon className={`${sizeConfig.icon} drop-shadow-lg`} style={{ color: isLegendary ? '#FFFACD' : '#F5E6A3', filter: 'drop-shadow(0 2px 3px rgba(107, 90, 26, 0.8))' }} strokeWidth={2.5}/>
        </div>

        {isLegendary && animated && (
          <>
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-200 rounded-full animate-ping opacity-80" />
            <div className="absolute bottom-3 left-0 w-2 h-2 bg-amber-300 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
          </>
        )}
      </div>
      
      {showName && (
        <div className="min-w-0">
          <p className={`font-bold truncate ${sizeConfig.text}`} style={{ color: isLegendary ? '#FFD700' : '#F5E6A3', textShadow: isLegendary ? '0 0 10px #FFD700' : 'none' }}>
            {badge.name}
          </p>
          {size !== 'sm' && <p className="text-xs text-stone-400 truncate">{badge.description}</p>}
          {badge.points && size !== 'sm' && <p className="text-xs text-amber-600">+{badge.points} pts</p>}
        </div>
      )}
    </div>
  );
};

export const BadgeInline = ({ badgeId }) => {
  const badge = BADGES_ARTDECO.find(b => b.id === badgeId);
  if (!badge) return null;
  const Icon = badge.icon;
  const isLegendary = badge.tier === 'legendary';

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full border ${isLegendary ? 'animate-pulse' : ''}`}
      style={{ background: 'linear-gradient(135deg, #D4AF37, #8B7021)', borderColor: '#F5E6A3', color: '#FFFACD', boxShadow: '0 2px 10px rgba(212, 175, 55, 0.4)' }}>
      <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
      <span className="tracking-wide">{badge.name}</span>
    </div>
  );
};

export default ArtDecoBadge;
