import { useState, useEffect } from 'react';
import { api, BACKEND_URL } from '../config/api';
import { toast } from 'sonner';
import { Megaphone, Star, Crown, Sparkles, CheckCircle, Clock, CreditCard, Zap, ArrowRight } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import AnimatedBackground from '../components/AnimatedBackground';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';


const Advertising = () => {
  const [user, setUser] = useState(null);
  const [plans, setPlans] = useState({});
  const [myAds, setMyAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    payment_method: 'bac',
    payment_reference: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, plansRes, adsRes] = await Promise.all([
        api.get(`/api/auth/me`, { withCredentials: true }),
        api.get(`/api/ads/plans`),
        api.get(`/api/ads/my-ads`, { withCredentials: true }).catch(() => ({ data: [] }))
      ]);
      
      setUser(userRes.data);
      setPlans(plansRes.data);
      setMyAds(adsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (planKey) => {
    setSelectedPlan(planKey);
    setShowPaymentDialog(true);
  };

  const handleSubmitAd = async () => {
    if (!selectedPlan) return;
    
    setSubmitting(true);
    try {
      await axios.post(
        `${BACKEND_URL}/api/ads/create`,
        {
          plan: selectedPlan,
          payment_method: paymentForm.payment_method,
          payment_reference: paymentForm.payment_reference
        },
        { withCredentials: true }
      );
      
      toast.success('¡Solicitud enviada! Te contactaremos para confirmar.');
      setShowPaymentDialog(false);
      setSelectedPlan(null);
      setPaymentForm({ payment_method: 'bac', payment_reference: '' });
      await fetchData();
    } catch (error) {
      const msg = error.response?.data?.detail;
      toast.error(typeof msg === 'string' ? msg : 'Error al crear anuncio');
    } finally {
      setSubmitting(false);
    }
  };

  const getPlanConfig = (planKey) => {
    const configs = {
      basico: {
        icon: Star,
        gradient: 'from-emerald-500 to-teal-600',
        glow: 'shadow-emerald-500/20',
        border: 'border-emerald-500/30',
        badge: 'bg-emerald-500/20 text-emerald-400'
      },
      destacado: {
        icon: Sparkles,
        gradient: 'from-violet-500 to-purple-600',
        glow: 'shadow-violet-500/20',
        border: 'border-violet-500/30',
        badge: 'bg-violet-500/20 text-violet-400'
      },
      premium: {
        icon: Crown,
        gradient: 'from-amber-500 to-orange-600',
        glow: 'shadow-amber-500/20',
        border: 'border-amber-500/30',
        badge: 'bg-amber-500/20 text-amber-400'
      }
    };
    return configs[planKey] || configs.basico;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <AnimatedBackground />
        <div className="text-center relative z-10">
          <div className="w-16 h-16 border-4 border-red-400/30 rounded-full animate-spin border-t-red-500 mx-auto"></div>
          <p className="mt-4 text-stone-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (user?.user_type !== 'pulperia') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <AnimatedBackground />
        <div className="text-center px-6 relative z-10">
          <Megaphone className="w-16 h-16 mx-auto text-stone-700 mb-4" />
          <p className="text-xl text-stone-400 mb-2">Solo para pulperías</p>
          <p className="text-stone-600 text-sm">Registra tu pulpería para promocionarla</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 pb-24">
      <AnimatedBackground />
      
      <Header 
        user={user} 
        title="Publicidad" 
        subtitle="Destaca tu pulpería"
      />

      <div className="relative z-10 px-4 py-6">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600/20 to-purple-900/20 border border-violet-500/20 p-6 mb-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl"></div>
          <div className="relative flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">¡Impulsa tu negocio!</h2>
              <p className="text-stone-400 text-sm">
                Aparece primero en búsquedas y atrae más clientes a tu pulpería.
              </p>
            </div>
          </div>
        </div>

        {/* Active Ads */}
        {myAds.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-white mb-4">Mis Anuncios</h3>
            <div className="space-y-3">
              {myAds.map((ad) => {
                const config = getPlanConfig(ad.plan);
                return (
                  <div key={ad.ad_id} className={`bg-stone-900 rounded-xl border ${config.border} p-4`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-white">{ad.pulperia_name}</p>
                        <p className="text-sm text-stone-500">Plan {plans[ad.plan]?.name || ad.plan}</p>
                        {ad.end_date && (
                          <p className="text-xs text-stone-600 mt-1">
                            Vence: {new Date(ad.end_date).toLocaleDateString('es-HN')}
                          </p>
                        )}
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        ad.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        ad.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-stone-700 text-stone-400'
                      }`}>
                        {ad.status === 'active' ? 'Activo' : ad.status === 'pending' ? 'Pendiente' : 'Expirado'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Plans */}
        <h3 className="text-lg font-bold text-white mb-4">Planes Disponibles</h3>
        <div className="space-y-4">
          {Object.entries(plans).map(([key, plan]) => {
            const config = getPlanConfig(key);
            const Icon = config.icon;
            
            return (
              <div 
                key={key}
                className={`bg-stone-900/80 rounded-2xl border ${config.border} overflow-hidden transition-all hover:scale-[1.02]`}
              >
                {/* Header */}
                <div className={`bg-gradient-to-r ${config.gradient} p-5`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-white">{plan.name}</h4>
                        <p className="text-white/70 text-sm">{plan.duration} días</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-white">L{plan.price}</p>
                    </div>
                  </div>
                </div>
                
                {/* Features */}
                <div className="p-5">
                  <ul className="space-y-2.5 mb-5">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2.5 text-stone-300">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    onClick={() => handleSelectPlan(key)}
                    className={`w-full bg-gradient-to-r ${config.gradient} hover:opacity-90 text-white font-medium`}
                  >
                    Seleccionar <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment Methods */}
        <div className="mt-8 bg-stone-900/50 rounded-2xl border border-stone-800 p-5">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-stone-400" />
            Métodos de Pago
          </h3>
          
          <div className="space-y-3">
            <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700">
              <p className="font-medium text-white mb-2">🏦 Transferencia Bancaria</p>
              <div className="text-sm text-stone-400 space-y-1">
                <p><span className="text-stone-500">Banco:</span> BAC Honduras</p>
                <p><span className="text-stone-500">Cuenta:</span> 754385291</p>
                <p><span className="text-stone-500">Nombre:</span> La Pulpería HN</p>
              </div>
            </div>
            
            <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700">
              <p className="font-medium text-white mb-2">💳 PayPal</p>
              <a 
                href="https://paypal.me/alejandronolasco979" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                paypal.me/alejandronolasco979
              </a>
            </div>
          </div>

          <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <p className="text-xs text-amber-400">
              <strong>⏱️ Activación:</strong> Tu anuncio será activado en máximo 48 horas después de confirmar el pago.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md bg-stone-900 border-stone-800">
          <DialogHeader>
            <DialogTitle className="text-white">Confirmar Anuncio</DialogTitle>
          </DialogHeader>
          
          {selectedPlan && plans[selectedPlan] && (
            <div className="space-y-4">
              {(() => {
                const config = getPlanConfig(selectedPlan);
                const Icon = config.icon;
                return (
                  <div className={`bg-gradient-to-r ${config.gradient} text-white p-4 rounded-xl`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-6 h-6" />
                        <span className="font-bold">{plans[selectedPlan].name}</span>
                      </div>
                      <span className="text-2xl font-bold">L{plans[selectedPlan].price}</span>
                    </div>
                    <p className="text-white/70 text-sm mt-1">{plans[selectedPlan].duration} días</p>
                  </div>
                );
              })()}

              <div>
                <Label className="text-stone-300">Método de Pago</Label>
                <select
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                  className="w-full mt-2 bg-stone-800 border border-stone-700 rounded-xl p-3 text-white"
                >
                  <option value="bac">🏦 BAC (Cuenta: 754385291)</option>
                  <option value="paypal">💳 PayPal</option>
                </select>
              </div>

              <div>
                <Label className="text-stone-300">Referencia (opcional)</Label>
                <Input
                  placeholder="Número de transacción"
                  value={paymentForm.payment_reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_reference: e.target.value })}
                  className="mt-2 bg-stone-800 border-stone-700 text-white placeholder:text-stone-600"
                />
              </div>

              <Button 
                onClick={handleSubmitAd}
                disabled={submitting}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-medium"
              >
                {submitting ? 'Enviando...' : 'Solicitar Anuncio'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav user={user} />
    </div>
  );
};

export default Advertising;
