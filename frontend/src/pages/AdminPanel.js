import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Shield, Store, Crown, Sparkles, Star, Check, X, Clock, Calendar, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminPanel = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [pulperias, setPulperias] = useState([]);
  const [ads, setAds] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('destacado');
  const [selectedDuration, setSelectedDuration] = useState(7);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, pulperiasRes, adsRes, logsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/auth/me`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/admin/pulperias`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/admin/ads`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/ads/assignment-log`)
      ]);
      
      setUser(userRes.data);
      setPulperias(pulperiasRes.data);
      setAds(adsRes.data);
      setLogs(logsRes.data);
      
      // Check if user is admin
      if (!userRes.data.is_admin) {
        toast.error('Acceso denegado');
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 403) {
        toast.error('Solo el administrador puede acceder');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleActivateAd = async (pulperiaId) => {
    try {
      await axios.post(`${BACKEND_URL}/api/admin/ads/activate`, {
        pulperia_id: pulperiaId,
        plan: selectedPlan,
        duration_days: selectedDuration
      }, { withCredentials: true });
      
      toast.success('¡Anuncio activado!');
      fetchData();
    } catch (error) {
      console.error('Error activating ad:', error);
      toast.error(error.response?.data?.detail || 'Error al activar anuncio');
    }
  };

  const handleDeactivateAd = async (adId) => {
    try {
      await axios.post(`${BACKEND_URL}/api/admin/ads/${adId}/deactivate`, {}, { withCredentials: true });
      toast.success('Anuncio desactivado');
      fetchData();
    } catch (error) {
      console.error('Error deactivating ad:', error);
      toast.error('Error al desactivar anuncio');
    }
  };

  const getPlanIcon = (plan) => {
    switch (plan) {
      case 'premium': return <Crown className="w-5 h-5 text-yellow-500" />;
      case 'destacado': return <Sparkles className="w-5 h-5 text-orange-500" />;
      default: return <Star className="w-5 h-5 text-red-500" />;
    }
  };

  const filteredPulperias = pulperias.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get active ad for a pulperia
  const getActiveAd = (pulperiaId) => {
    return ads.find(ad => ad.pulperia_id === pulperiaId && ad.status === 'active');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-orange-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-200 rounded-full animate-spin border-t-red-600 mx-auto"></div>
          <p className="mt-4 text-red-600 font-medium">Cargando panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50 pb-24">
      <Header 
        user={user} 
        title="Panel de Admin" 
        subtitle="Control de Anuncios"
      />

      {/* Admin Badge */}
      <div className="px-4 py-3 bg-gradient-to-r from-red-600 to-orange-500">
        <div className="flex items-center justify-center gap-2 text-white">
          <Shield className="w-5 h-5" />
          <span className="font-bold">Administrador</span>
        </div>
      </div>

      {/* Plan Selection */}
      <div className="px-4 py-4 bg-white border-b border-red-100">
        <div className="mb-3">
          <label className="block text-sm font-bold text-stone-700 mb-2">Plan a asignar:</label>
          <div className="flex gap-2">
            {['basico', 'destacado', 'premium'].map(plan => (
              <button
                key={plan}
                onClick={() => setSelectedPlan(plan)}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1 transition-all ${
                  selectedPlan === plan
                    ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {getPlanIcon(plan)}
                {plan.charAt(0).toUpperCase() + plan.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-bold text-stone-700 mb-2">Duración:</label>
          <div className="flex gap-2">
            {[7, 15, 30].map(days => (
              <button
                key={days}
                onClick={() => setSelectedDuration(days)}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-sm transition-all ${
                  selectedDuration === days
                    ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {days} días
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar pulpería..."
            className="w-full bg-white border border-red-200 rounded-xl py-3 pl-10 pr-4 text-stone-800 placeholder:text-stone-400 focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Pulperias List */}
      <div className="px-4 py-2">
        <h2 className="text-lg font-bold text-stone-800 mb-3">Pulperías ({filteredPulperias.length})</h2>
        
        <div className="space-y-3">
          {filteredPulperias.map(pulperia => {
            const activeAd = getActiveAd(pulperia.pulperia_id);
            
            return (
              <div key={pulperia.pulperia_id} className="bg-white rounded-2xl shadow-md border border-red-100 p-4">
                <div className="flex items-center gap-3 mb-3">
                  {pulperia.logo_url ? (
                    <img src={pulperia.logo_url} alt={pulperia.name} className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                      <Store className="w-6 h-6 text-red-500" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-stone-800 truncate">{pulperia.name}</h3>
                    <p className="text-xs text-stone-500 truncate">{pulperia.address}</p>
                  </div>
                  
                  {activeAd && (
                    <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                      <Check className="w-3 h-3" />
                      {activeAd.plan}
                    </div>
                  )}
                </div>
                
                {activeAd ? (
                  <div className="flex items-center justify-between bg-green-50 rounded-xl p-3">
                    <div className="text-sm">
                      <p className="text-green-700 font-medium">Activo hasta:</p>
                      <p className="text-green-600 text-xs">
                        {new Date(activeAd.end_date).toLocaleDateString('es-HN')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeactivateAd(activeAd.ad_id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-600 transition-all"
                    >
                      Desactivar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleActivateAd(pulperia.pulperia_id)}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white py-3 rounded-xl font-bold hover:from-red-700 hover:to-orange-600 transition-all flex items-center justify-center gap-2"
                  >
                    {getPlanIcon(selectedPlan)}
                    Activar {selectedPlan} ({selectedDuration} días)
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Logs */}
      <div className="px-4 py-4 mt-4">
        <h2 className="text-lg font-bold text-stone-800 mb-3">Registro de Asignaciones</h2>
        
        {logs.length === 0 ? (
          <p className="text-center text-stone-500 py-8">No hay registros aún</p>
        ) : (
          <div className="space-y-2">
            {logs.slice(0, 10).map(log => (
              <div key={log.log_id} className="bg-white rounded-xl p-3 border border-red-100 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  log.action === 'activated' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {log.action === 'activated' ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <X className="w-5 h-5 text-red-600" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-800 truncate">{log.pulperia_name}</p>
                  <p className="text-xs text-stone-500">
                    {log.action === 'activated' ? 'Activado' : 'Desactivado'} - {log.plan}
                  </p>
                </div>
                
                <div className="text-right text-xs text-stone-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(log.created_at).toLocaleDateString('es-HN')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(log.created_at).toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav user={user} />
    </div>
  );
};

export default AdminPanel;
