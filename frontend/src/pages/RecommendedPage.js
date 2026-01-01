import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import AnimatedBackground from '../components/AnimatedBackground';
import { 
  Crown, Star, MapPin, Clock, Phone, ChevronRight, 
  Sparkles, Award, Store, TrendingUp, Verified
} from 'lucide-react';

const RecommendedPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
  }, []);

  useEffect(() => {
    fetchRecommended();
  }, []);

  const fetchRecommended = async () => {
    try {
      const response = await api.get('/api/ads/recommended');
      setRecommended(response.data);
    } catch (error) {
      console.error('Error fetching recommended:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950">
      <AnimatedBackground />
      <Header user={user} title="Recomendadas" subtitle="Las mejores pulperías" />

      <main className="px-4 pt-4 pb-24 relative z-10">
        {/* Hero Banner */}
        <div className="bg-gradient-to-br from-amber-600/20 via-amber-700/10 to-transparent rounded-2xl p-6 mb-6 border border-amber-500/20 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl" />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-amber-100">Pulperías Recomendadas</h2>
                <p className="text-amber-500/70 text-sm">Selección premium verificada</p>
              </div>
            </div>
            <p className="text-stone-300 text-sm leading-relaxed">
              Descubre las pulperías más destacadas de tu zona. Negocios verificados con excelente servicio y productos de calidad.
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-stone-900/50 rounded-xl p-3 text-center border border-stone-800">
            <Verified className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{recommended.length}</p>
            <p className="text-xs text-stone-500">Verificadas</p>
          </div>
          <div className="bg-stone-900/50 rounded-xl p-3 text-center border border-stone-800">
            <TrendingUp className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">5.0</p>
            <p className="text-xs text-stone-500">Promedio</p>
          </div>
          <div className="bg-stone-900/50 rounded-xl p-3 text-center border border-stone-800">
            <Award className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">Premium</p>
            <p className="text-xs text-stone-500">Calidad</p>
          </div>
        </div>

        {/* Recommended List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : recommended.length === 0 ? (
          <div className="bg-stone-900/50 rounded-2xl p-8 text-center border border-stone-800">
            <div className="w-16 h-16 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-stone-600" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Sin recomendaciones aún</h3>
            <p className="text-stone-400 text-sm mb-4">
              Pronto tendremos pulperías destacadas en tu zona
            </p>
            <button
              onClick={() => navigate('/map')}
              className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-xl font-medium transition-colors"
            >
              Explorar Mapa
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {recommended.map((pulperia, index) => (
              <button
                key={pulperia.pulperia_id}
                onClick={() => navigate(`/pulperia/${pulperia.pulperia_id}`)}
                className="w-full bg-stone-900/80 rounded-2xl overflow-hidden border border-amber-500/20 hover:border-amber-500/40 transition-all group"
                data-testid={`recommended-pulperia-${index}`}
              >
                {/* Image or Placeholder */}
                <div className="relative h-32 bg-gradient-to-br from-stone-800 to-stone-900">
                  {pulperia.image_url ? (
                    <img 
                      src={pulperia.image_url} 
                      alt={pulperia.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Store className="w-12 h-12 text-stone-700" />
                    </div>
                  )}
                  
                  {/* Premium Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    <Crown className="w-3.5 h-3.5" />
                    <span>RECOMENDADA</span>
                  </div>

                  {/* Rating */}
                  {pulperia.rating > 0 && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-white text-xs font-bold">{pulperia.rating.toFixed(1)}</span>
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white truncate group-hover:text-amber-400 transition-colors">
                        {pulperia.name}
                      </h3>
                      <div className="flex items-center gap-1 text-stone-400 text-sm">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{pulperia.address}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-stone-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>

                  {/* Description */}
                  {pulperia.description && (
                    <p className="text-stone-500 text-sm line-clamp-2 mb-3">
                      {pulperia.description}
                    </p>
                  )}

                  {/* Tags */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-xs">
                      <Verified className="w-3 h-3" />
                      Verificada
                    </span>
                    {pulperia.hours && (
                      <span className="inline-flex items-center gap-1 bg-stone-800 text-stone-400 px-2 py-0.5 rounded-full text-xs">
                        <Clock className="w-3 h-3" />
                        {pulperia.hours}
                      </span>
                    )}
                    {pulperia.phone && (
                      <span className="inline-flex items-center gap-1 bg-stone-800 text-stone-400 px-2 py-0.5 rounded-full text-xs">
                        <Phone className="w-3 h-3" />
                        Contacto
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* CTA for Pulperia Owners */}
        {user?.user_type === 'pulperia' && (
          <div className="mt-8 bg-gradient-to-br from-amber-900/30 to-stone-900/50 rounded-2xl p-6 border border-amber-500/20">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <h3 className="text-lg font-bold text-white">¿Quieres aparecer aquí?</h3>
            </div>
            <p className="text-stone-400 text-sm mb-4">
              Obtén máxima visibilidad con el plan Recomendado. Aparece en esta sección exclusiva por solo L. 1,000/mes.
            </p>
            <button
              onClick={() => navigate('/advertising')}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-900 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <Crown className="w-5 h-5" />
              <span>Contratar Plan Recomendado</span>
            </button>
          </div>
        )}
      </main>

      <BottomNav user={user} cartCount={cartCount} />
    </div>
  );
};

export default RecommendedPage;
