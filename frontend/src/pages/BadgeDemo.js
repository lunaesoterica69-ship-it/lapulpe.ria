import ArtDecoBadge, { BADGES_ARTDECO, BadgeShowcase } from '../components/ArtDecoBadge';
import AnimatedBackground from '../components/AnimatedBackground';

const BadgeDemo = () => {
  return (
    <div className="min-h-screen bg-stone-950 relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Sistema de Medallas</h1>
          <p className="text-stone-400">Medallas estilo romano con corona de laurel</p>
        </div>
        
        {/* Medallas en tamaño XL */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold text-amber-400 mb-6 text-center">Tamaño XL - Vista Detallada</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {BADGES_ARTDECO.map(badge => (
              <div key={badge.id} className="flex flex-col items-center p-4 bg-stone-900/50 rounded-2xl border border-stone-800">
                <ArtDecoBadge badgeId={badge.id} size="xl" showName={false} />
                <div className="mt-4 text-center">
                  <p className="text-white font-bold">{badge.name}</p>
                  <p className="text-stone-500 text-xs">{badge.description}</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-stone-800 rounded text-xs text-stone-400 capitalize">
                    {badge.tier}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Medallas en tamaño LG */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold text-amber-400 mb-6 text-center">Tamaño LG - Con Nombre</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {BADGES_ARTDECO.map(badge => (
              <div key={badge.id} className="p-4 bg-stone-900/30 rounded-xl border border-stone-800/50">
                <ArtDecoBadge badgeId={badge.id} size="lg" showName={true} />
              </div>
            ))}
          </div>
        </div>
        
        {/* Medallas en tamaño MD */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold text-amber-400 mb-6 text-center">Tamaño MD - Uso Normal</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {BADGES_ARTDECO.map(badge => (
              <div key={badge.id} className="p-3 bg-stone-900/30 rounded-lg">
                <ArtDecoBadge badgeId={badge.id} size="md" showName={true} />
              </div>
            ))}
          </div>
        </div>
        
        {/* Medallas en tamaño SM */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold text-amber-400 mb-6 text-center">Tamaño SM - Compacto</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {BADGES_ARTDECO.map(badge => (
              <ArtDecoBadge key={badge.id} badgeId={badge.id} size="sm" showName={false} />
            ))}
          </div>
        </div>
        
        {/* Comparativa de tiers */}
        <div className="bg-stone-900/50 rounded-2xl border border-stone-800 p-6">
          <h2 className="text-xl font-semibold text-amber-400 mb-6 text-center">Jerarquía de Tiers</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {['bronze', 'silver', 'gold', 'legendary', 'special'].map(tier => (
              <div key={tier} className="text-center p-4 rounded-xl bg-stone-800/30">
                <h3 className="text-white font-bold capitalize mb-4">{tier}</h3>
                <div className="flex justify-center">
                  <ArtDecoBadge 
                    badgeId={BADGES_ARTDECO.find(b => b.tier === tier)?.id} 
                    size="lg" 
                    showName={false} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeDemo;
