import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Megaphone, Star, Crown, Sparkles, CheckCircle, Clock, CreditCard } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Advertising = () => {
  const [user, setUser] = useState(null);
  const [plans, setPlans] = useState({});
  const [myAds, setMyAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    payment_method: 'transferencia',
    payment_reference: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, plansRes, adsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/auth/me`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/ads/plans`),
        axios.get(`${BACKEND_URL}/api/ads/my-ads`, { withCredentials: true }).catch(() => ({ data: [] }))
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
      
      toast.success('¡Solicitud de anuncio enviada! Te contactaremos para confirmar el pago.');
      setShowPaymentDialog(false);
      setSelectedPlan(null);
      setPaymentForm({ payment_method: 'transferencia', payment_reference: '' });
      await fetchData();
    } catch (error) {
      console.error('Error creating ad:', error);
      const msg = error.response?.data?.detail;
      toast.error(typeof msg === 'string' ? msg : 'Error al crear anuncio');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivateAd = async (adId) => {
    try {
      await axios.put(`${BACKEND_URL}/api/ads/${adId}/activate`, {}, { withCredentials: true });
      toast.success('¡Anuncio activado!');
      await fetchData();
    } catch (error) {
      console.error('Error activating ad:', error);
      toast.error('Error al activar anuncio');
    }
  };

  const getPlanIcon = (planKey) => {
    switch (planKey) {
      case 'basico':
        return <Star className="w-8 h-8" />;
      case 'destacado':
        return <Sparkles className="w-8 h-8" />;
      case 'premium':
        return <Crown className="w-8 h-8" />;
      default:
        return <Megaphone className="w-8 h-8" />;
    }
  };

  const getPlanColor = (planKey) => {
    switch (planKey) {
      case 'basico':
        return 'from-blue-500 to-blue-600';
      case 'destacado':
        return 'from-purple-500 to-purple-600';
      case 'premium':
        return 'from-yellow-500 to-orange-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> Pendiente</span>;
      case 'active':
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Activo</span>;
      case 'expired':
        return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-bold">Expirado</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-stone-600 font-semibold">Cargando...</p>
        </div>
      </div>
    );
  }

  if (user?.user_type !== 'pulperia') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center px-6">
          <Megaphone className="w-16 h-16 mx-auto text-stone-300 mb-4" />
          <p className="text-xl text-stone-600 mb-4">Solo dueños de pulperías pueden crear anuncios</p>
          <p className="text-stone-500">Registra tu pulpería para promocionarla</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header 
        user={user} 
        title="Publicidad" 
        subtitle="Destaca tu pulpería"
      />

      <div className="px-6 py-6">
        {/* Info Banner */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-start gap-4">
            <Megaphone className="w-10 h-10 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-black mb-2">¡Haz crecer tu negocio!</h2>
              <p className="text-white/90 text-sm">
                Promociona tu pulpería para aparecer primero en las búsquedas y atraer más clientes.
              </p>
            </div>
          </div>
        </div>

        {/* My Active Ads */}
        {myAds.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-black text-stone-800 mb-4">Mis Anuncios</h3>
            <div className="space-y-3">
              {myAds.map((ad) => (
                <div key={ad.ad_id} className="bg-white rounded-xl shadow-md p-4 border-l-4 border-primary">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-stone-800">{ad.pulperia_name}</p>
                      <p className="text-sm text-stone-600">Plan: {plans[ad.plan]?.name || ad.plan}</p>
                      <p className="text-sm text-stone-500">L {ad.amount} - {ad.duration_days} días</p>
                      {ad.end_date && (
                        <p className="text-xs text-stone-400 mt-1">
                          Vence: {new Date(ad.end_date).toLocaleDateString('es-HN')}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(ad.status)}
                      {ad.status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleActivateAd(ad.ad_id)}
                          className="bg-green-500 hover:bg-green-600 text-white text-xs"
                        >
                          Activar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Plans */}
        <h3 className="text-xl font-black text-stone-800 mb-4">Planes Disponibles</h3>
        <div className="space-y-4">
          {Object.entries(plans).map(([key, plan]) => (
            <div 
              key={key}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className={`bg-gradient-to-r ${getPlanColor(key)} text-white p-4`}>
                <div className="flex items-center gap-3">
                  {getPlanIcon(key)}
                  <div>
                    <h4 className="text-xl font-black">{plan.name}</h4>
                    <p className="text-white/80 text-sm">{plan.duration} días</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-3xl font-black">L{plan.price}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-stone-700">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => handleSelectPlan(key)}
                  className={`w-full bg-gradient-to-r ${getPlanColor(key)} text-white font-bold`}
                >
                  Seleccionar Plan
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Info */}
        <div className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-200">
          <h3 className="text-lg font-black text-blue-800 mb-3 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Métodos de Pago
          </h3>
          <div className="space-y-3 text-sm text-blue-700">
            <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
              <p className="font-bold text-lg">🏦 Transferencia Bancaria</p>
              <p className="mt-2"><strong>Banco:</strong> BAC Honduras</p>
              <p><strong>Cuenta:</strong> 754385291</p>
              <p><strong>A nombre de:</strong> La Pulpería HN</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-l-4 border-blue-400">
              <p className="font-bold text-lg">💳 PayPal</p>
              <p className="mt-2">
                <a 
                  href="https://paypal.me/alejandronolasco979?locale.x=es_XC&country.x=HN" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  paypal.me/alejandronolasco979
                </a>
              </p>
            </div>
          </div>
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>⏱️ Proceso de activación:</strong>
            </p>
            <ul className="text-xs text-yellow-700 mt-2 space-y-1">
              <li>• Tu anuncio será activado en <strong>máximo 48 horas</strong> después de confirmar el pago</li>
              <li>• Los anuncios se activan en <strong>orden de pago</strong> (primero en pagar, primero en activarse)</li>
              <li>• Recibirás confirmación por email cuando tu anuncio esté activo</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Anuncio</DialogTitle>
          </DialogHeader>
          
          {selectedPlan && plans[selectedPlan] && (
            <div className="space-y-4">
              <div className={`bg-gradient-to-r ${getPlanColor(selectedPlan)} text-white p-4 rounded-xl`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getPlanIcon(selectedPlan)}
                    <span className="font-bold text-lg">{plans[selectedPlan].name}</span>
                  </div>
                  <span className="text-2xl font-black">L{plans[selectedPlan].price}</span>
                </div>
                <p className="text-white/80 text-sm mt-1">{plans[selectedPlan].duration} días de promoción</p>
              </div>

              <div>
                <Label>Método de Pago</Label>
                <select
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                  className="w-full mt-1 border border-stone-300 rounded-lg p-3"
                >
                  <option value="bac">🏦 Transferencia BAC (Cuenta: 754385291)</option>
                  <option value="paypal">💳 PayPal (nolascale694@gmail.com)</option>
                </select>
              </div>

              <div>
                <Label>Número de Referencia (opcional)</Label>
                <Input
                  placeholder="Ej: Número de transacción"
                  value={paymentForm.payment_reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_reference: e.target.value })}
                />
                <p className="text-xs text-stone-500 mt-1">
                  Si ya realizaste el pago, ingresa el número de referencia
                </p>
              </div>

              <Button 
                onClick={handleSubmitAd}
                disabled={submitting}
                className="w-full bg-primary text-white font-bold"
              >
                {submitting ? 'Enviando...' : 'Solicitar Anuncio'}
              </Button>

              <p className="text-xs text-stone-500 text-center">
                Recibirás confirmación por correo cuando tu anuncio sea activado
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav user={user} />
    </div>
  );
};

export default Advertising;
