import ArtDecoBadge, { BADGES_ARTDECO, BadgeInline } from '../components/ArtDecoBadge';
import AnimatedBackground from '../components/AnimatedBackground';

const BadgeDemo = () => {
  return (
    <div className="min-h-screen bg-stone-950 relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amber-400 mb-2">🏆 Logros de Pulpería</h1>
          <p className="text-stone-400">Medallas doradas por tus logros como vendedor</p>
        </div>
        
        {/* Medallas en tamaño XL */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold text-amber-300 mb-6 text-center">Vista Detallada</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {BADGES_ARTDECO.map(badge => (
              <div key={badge.id} className="flex flex-col items-center p-4 bg-stone-900/50 rounded-2xl border border-amber-900/30 hover:border-amber-500/50 transition-all hover:bg-stone-900/70">
                <ArtDecoBadge badgeId={badge.id} size="xl" showName={false} />
                <div className="mt-4 text-center">
                  <p className="text-amber-200 font-bold text-sm">{badge.name}</p>
                  <p className="text-stone-500 text-xs mt-1">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Medallas con nombre */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold text-amber-300 mb-6 text-center">Con Descripción</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BADGES_ARTDECO.map(badge => (
              <div key={badge.id} className="p-4 bg-gradient-to-br from-stone-900/80 to-stone-800/50 rounded-xl border border-amber-900/20">
                <ArtDecoBadge badgeId={badge.id} size="lg" showName={true} />
              </div>
            ))}
          </div>
        </div>
        
        {/* Badges Inline */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold text-amber-300 mb-6 text-center">Versión Compacta</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {BADGES_ARTDECO.map(badge => (
              <BadgeInline key={badge.id} badgeId={badge.id} />
            ))}
          </div>
        </div>
        
        {/* Showcase especial - Legendarios */}
        <div className="bg-gradient-to-br from-amber-900/20 to-stone-900/50 rounded-2xl border border-amber-500/30 p-8">
          <h2 className="text-2xl font-bold text-amber-400 mb-2 text-center">⭐ Logros Legendarios</h2>
          <p className="text-stone-400 text-center mb-8">Los más altos honores para tu pulpería</p>
          <div className="flex justify-center gap-12 flex-wrap">
            {BADGES_ARTDECO.filter(b => b.tier === 'legendary').map(badge => (
              <div key={badge.id} className="flex flex-col items-center">
                <ArtDecoBadge badgeId={badge.id} size="xl" showName={false} />
                <p className="text-amber-300 font-bold mt-4">{badge.name}</p>
                <p className="text-stone-500 text-sm">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeDemo;
