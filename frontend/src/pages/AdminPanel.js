import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  Shield, Store, Crown, Sparkles, Star, Check, X, Clock, Calendar, Search, 
  Ban, MessageSquare, Award, Zap, Flame, Gem, Trophy, Target, Rocket, 
  Users, ChevronRight, Send, Eye, AlertTriangle, Lock, Unlock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import AnimatedBackground from '../components/AnimatedBackground';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const ADMIN_PASSWORD = 'AlEjA127';

// Sistema de Badges en Español - Estilo Gaming
const BADGES = [
  { id: 'novato', name: 'Novato', icon: Star, color: 'from-gray-500 to-gray-600', glow: 'shadow-gray-500/50', description: 'Nuevo en la plataforma' },
  { id: 'en_ascenso', name: 'En Ascenso', icon: Zap, color: 'from-blue-500 to-blue-600', glow: 'shadow-blue-500/50', description: 'Creciendo rápidamente' },
  { id: 'en_llamas', name: 'En Llamas', icon: Flame, color: 'from-orange-500 to-red-500', glow: 'shadow-orange-500/50', description: 'Muy activo' },
  { id: 'elite', name: 'Élite', icon: Gem, color: 'from-purple-500 to-pink-500', glow: 'shadow-purple-500/50', description: 'Vendedor destacado' },
  { id: 'campeon', name: 'Campeón', icon: Trophy, color: 'from-yellow-400 to-amber-500', glow: 'shadow-yellow-500/50', description: 'Top vendedor' },
  { id: 'legendario', name: 'Legendario', icon: Crown, color: 'from-amber-400 via-yellow-500 to-amber-600', glow: 'shadow-amber-500/50', description: 'Leyenda viviente' },
  { id: 'verificado', name: 'Verificado', icon: Check, color: 'from-emerald-500 to-green-600', glow: 'shadow-emerald-500/50', description: 'Verificado oficialmente' },
  { id: 'socio', name: 'Socio Oficial', icon: Target, color: 'from-cyan-500 to-blue-500', glow: 'shadow-cyan-500/50', description: 'Socio de La Pulpería' },
];

// Componente de Badge con efectos gaming
const BadgeDisplay = ({ badgeId, size = 'md', showName = true, animated = true }) => {
  const badge = BADGES.find(b => b.id === badgeId);
  if (!badge) return null;

  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  };

  const Icon = badge.icon;

  return (
    <div className="flex items-center gap-2">
      <div className={`relative ${animated ? 'group' : ''}`}>
        <div className={`absolute inset-0 bg-gradient-to-r ${badge.color} rounded-xl blur-lg opacity-50 ${animated ? 'group-hover:opacity-80' : ''} transition-opacity`}></div>
        <div className={`relative ${sizes[size]} bg-gradient-to-br ${badge.color} rounded-xl flex items-center justify-center shadow-lg ${badge.glow} ${animated ? 'group-hover:scale-110' : ''} transition-transform`}>
          <Icon className={`${iconSizes[size]} text-white drop-shadow-lg`} />
        </div>
        {animated && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping opacity-75"></div>
        )}
      </div>
      
      {showName && (
        <div>
          <p className={`font-bold text-white ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>{badge.name}</p>
          {size !== 'sm' && <p className="text-xs text-stone-400">{badge.description}</p>}
        </div>
      )}
    </div>
  );
};

const AdminPanel = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [pulperias, setPulperias] = useState([]);
  const [ads, setAds] = useState([]);
  const [logs, setLogs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('destacado');
  const [selectedDuration, setSelectedDuration] = useState(7);
  const [activeTab, setActiveTab] = useState('pulperias');
  
  // Password protection
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(true);
  
  // Dialogs
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showBadgeDialog, setShowBadgeDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [selectedPulperia, setSelectedPulperia] = useState(null);
  
  // Forms
  const [messageText, setMessageText] = useState('');
  const [selectedBadge, setSelectedBadge] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendDays, setSuspendDays] = useState(7);

  const handlePasswordSubmit = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setShowPasswordDialog(false);
      toast.success('¡Acceso autorizado!');
    } else {
      toast.error('Contraseña incorrecta');
      setPasswordInput('');
    }
  };

  const fetchData = async () => {
    try {
      const [userRes, pulperiasRes, adsRes, logsRes, messagesRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/auth/me`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/admin/pulperias`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/admin/ads`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/ads/assignment-log`),
        axios.get(`${BACKEND_URL}/api/admin/messages`, { withCredentials: true }).catch(() => ({ data: [] }))
      ]);
      
      setUser(userRes.data);
      setPulperias(pulperiasRes.data);
      setAds(adsRes.data);
      setLogs(logsRes.data);
      setMessages(messagesRes.data);
      
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

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

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

  const handleSuspend = async () => {
    if (!selectedPulperia) return;
    try {
      await axios.post(
        `${BACKEND_URL}/api/admin/pulperias/${selectedPulperia.pulperia_id}/suspend`,
        null,
        { params: { reason: suspendReason, days: suspendDays }, withCredentials: true }
      );
      toast.success(`Pulpería suspendida por ${suspendDays} días`);
      setShowSuspendDialog(false);
      setSuspendReason('');
      setSuspendDays(7);
      setSelectedPulperia(null);
      fetchData();
    } catch (error) {
      toast.error('Error al suspender');
    }
  };

  const handleUnsuspend = async (pulperiaId) => {
    try {
      await axios.post(`${BACKEND_URL}/api/admin/pulperias/${pulperiaId}/unsuspend`, {}, { withCredentials: true });
      toast.success('Pulpería reactivada');
      fetchData();
    } catch (error) {
      toast.error('Error al reactivar');
    }
  };

  const handleSetBadge = async () => {
    if (!selectedPulperia) return;
    try {
      await axios.post(
        `${BACKEND_URL}/api/admin/pulperias/${selectedPulperia.pulperia_id}/badge`,
        null,
        { params: { badge: selectedBadge }, withCredentials: true }
      );
      toast.success('Badge actualizado');
      setShowBadgeDialog(false);
      setSelectedBadge('');
      setSelectedPulperia(null);
      fetchData();
    } catch (error) {
      toast.error('Error al asignar badge');
    }
  };

  const handleSendMessage = async () => {
    if (!selectedPulperia || !messageText.trim()) return;
    try {
      await axios.post(
        `${BACKEND_URL}/api/admin/pulperias/${selectedPulperia.pulperia_id}/message`,
        null,
        { params: { message: messageText }, withCredentials: true }
      );
      toast.success('Mensaje enviado');
      setShowMessageDialog(false);
      setMessageText('');
      setSelectedPulperia(null);
      fetchData();
    } catch (error) {
      toast.error('Error al enviar mensaje');
    }
  };

  const getPlanIcon = (plan) => {
    switch (plan) {
      case 'premium': return <Crown className="w-5 h-5 text-yellow-500" />;
      case 'destacado': return <Sparkles className="w-5 h-5 text-orange-500" />;
      default: return <Star className="w-5 h-5 text-red-500" />;
    }
  };

  const getPlanPrice = (plan) => {
    switch (plan) {
      case 'premium': return 'L. 600';
      case 'destacado': return 'L. 400';
      default: return 'L. 200';
    }
  };

  const filteredPulperias = pulperias.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActiveAd = (pulperiaId) => {
    return ads.find(ad => ad.pulperia_id === pulperiaId && ad.status === 'active');
  };

  // Password Dialog
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-950 via-red-950 to-stone-950">
        <AnimatedBackground />
        <Dialog open={showPasswordDialog} onOpenChange={() => {}}>
          <DialogContent className="bg-stone-900 border-stone-700 max-w-sm" hideClose>
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2 justify-center">
                <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30 mb-2">
                  <Lock className="w-7 h-7 text-white" />
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-white">Panel de Administración</h2>
              <p className="text-stone-400 text-sm mt-1">Ingresa la contraseña para continuar</p>
            </div>
            <div className="space-y-4">
              <Input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                placeholder="Contraseña"
                className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500 text-center text-lg"
                autoFocus
              />
              <Button 
                onClick={handlePasswordSubmit} 
                className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg shadow-red-900/30"
              >
                <Unlock className="w-4 h-4 mr-2" />
                Acceder
              </Button>
              <Button 
                onClick={() => navigate('/')} 
                variant="ghost"
                className="w-full text-stone-400 hover:text-white"
              >
                Volver al inicio
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-950 via-red-950 to-stone-950">
        <AnimatedBackground />
        <div className="text-center relative z-10">
          <div className="w-20 h-20 border-4 border-red-400/30 rounded-full animate-spin border-t-red-500 mx-auto"></div>
          <p className="mt-4 text-white/70 font-medium">Cargando panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 pb-24">
      <AnimatedBackground variant="minimal" />
      
      <Header 
        user={user} 
        title="Admin Panel" 
        subtitle="Centro de Control"
      />

      {/* Admin Badge Header */}
      <div className="relative z-10 px-4 py-4">
        <div className="bg-gradient-to-r from-red-600/20 to-amber-600/20 backdrop-blur-xl rounded-2xl border border-red-500/30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Administrador</h2>
                <p className="text-sm text-red-400">{user?.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="text-center bg-stone-800/50 rounded-xl px-4 py-2 border border-stone-700">
                <p className="text-2xl font-black text-white">{pulperias.length}</p>
                <p className="text-xs text-stone-400">Pulperías</p>
              </div>
              <div className="text-center bg-stone-800/50 rounded-xl px-4 py-2 border border-stone-700">
                <p className="text-2xl font-black text-green-400">{ads.filter(a => a.status === 'active').length}</p>
                <p className="text-xs text-stone-400">Activos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="relative z-10 px-4 mb-4">
        <div className="flex bg-stone-800/50 backdrop-blur-sm rounded-xl p-1 border border-stone-700/50 overflow-x-auto">
          {[
            { id: 'pulperias', label: 'Pulperías', icon: Store },
            { id: 'badges', label: 'Badges', icon: Award },
            { id: 'messages', label: 'Mensajes', icon: MessageSquare },
            { id: 'logs', label: 'Historial', icon: Clock }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg' 
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-4">
        {/* Pulperias Tab */}
        {activeTab === 'pulperias' && (
          <div className="space-y-4">
            {/* Plan Selection - Updated prices */}
            <div className="bg-stone-800/50 backdrop-blur-sm rounded-2xl p-4 border border-stone-700/50">
              <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-red-400" />
                Configurar Plan
              </h3>
              
              <div className="grid grid-cols-3 gap-2 mb-3">
                {['basico', 'destacado', 'premium'].map(plan => (
                  <button
                    key={plan}
                    onClick={() => setSelectedPlan(plan)}
                    className={`py-3 px-3 rounded-xl font-bold text-sm flex flex-col items-center gap-2 transition-all ${
                      selectedPlan === plan
                        ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/30'
                        : 'bg-stone-700/50 text-stone-300 hover:bg-stone-700 border border-stone-600'
                    }`}
                  >
                    {getPlanIcon(plan)}
                    <span className="capitalize">{plan}</span>
                    <span className="text-xs opacity-75">{getPlanPrice(plan)}</span>
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {[7, 15, 30].map(days => (
                  <button
                    key={days}
                    onClick={() => setSelectedDuration(days)}
                    className={`py-2 px-3 rounded-xl font-bold text-sm transition-all ${
                      selectedDuration === days
                        ? 'bg-gradient-to-r from-red-600 to-red-500 text-white'
                        : 'bg-stone-700/50 text-stone-300 hover:bg-stone-700 border border-stone-600'
                    }`}
                  >
                    {days} días
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar pulpería..."
                className="w-full bg-stone-800/50 backdrop-blur-sm border border-stone-700/50 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-stone-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Pulperias List */}
            <div className="space-y-3">
              {filteredPulperias.map(pulperia => {
                const activeAd = getActiveAd(pulperia.pulperia_id);
                const isSuspended = pulperia.is_suspended;
                
                return (
                  <div 
                    key={pulperia.pulperia_id} 
                    className={`bg-stone-800/50 backdrop-blur-sm rounded-2xl border overflow-hidden transition-all hover:border-red-500/50 ${
                      isSuspended ? 'border-red-500/50 opacity-75' : 'border-stone-700/50'
                    }`}
                  >
                    {/* Header */}
                    <div className="p-4">
                      <div className="flex items-center gap-3">
                        {pulperia.logo_url ? (
                          <img src={pulperia.logo_url} alt={pulperia.name} className="w-14 h-14 rounded-xl object-cover border-2 border-stone-600" />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center">
                            <Store className="w-7 h-7 text-white" />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white truncate">{pulperia.name}</h3>
                            {pulperia.badge && <BadgeDisplay badgeId={pulperia.badge} size="sm" showName={false} />}
                            {isSuspended && (
                              <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full text-xs font-bold border border-red-500/50">
                                SUSPENDIDO
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-400 truncate">{pulperia.address}</p>
                          {pulperia.suspend_until && isSuspended && (
                            <p className="text-xs text-orange-400">
                              Hasta: {new Date(pulperia.suspend_until).toLocaleDateString('es-HN')}
                            </p>
                          )}
                          {activeAd && (
                            <div className="flex items-center gap-1 mt-1">
                              {getPlanIcon(activeAd.plan)}
                              <span className="text-xs text-green-400 font-bold">
                                {activeAd.plan} - hasta {new Date(activeAd.end_date).toLocaleDateString('es-HN')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="bg-stone-900/50 px-4 py-3 flex flex-wrap gap-2">
                      {/* Ad Toggle */}
                      {activeAd ? (
                        <button
                          onClick={() => handleDeactivateAd(activeAd.ad_id)}
                          className="flex-1 bg-red-500/20 text-red-400 py-2 px-3 rounded-xl text-sm font-bold border border-red-500/50 hover:bg-red-500/30 transition-all flex items-center justify-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          Desactivar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivateAd(pulperia.pulperia_id)}
                          className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white py-2 px-3 rounded-xl text-sm font-bold hover:from-green-500 hover:to-green-400 transition-all shadow-lg shadow-green-900/30 flex items-center justify-center gap-1"
                        >
                          <Zap className="w-4 h-4" />
                          Activar
                        </button>
                      )}
                      
                      {/* Badge */}
                      <button
                        onClick={() => { setSelectedPulperia(pulperia); setSelectedBadge(pulperia.badge || ''); setShowBadgeDialog(true); }}
                        className="bg-purple-500/20 text-purple-400 py-2 px-3 rounded-xl text-sm font-bold border border-purple-500/50 hover:bg-purple-500/30 transition-all"
                        title="Asignar Badge"
                      >
                        <Award className="w-4 h-4" />
                      </button>
                      
                      {/* Message */}
                      <button
                        onClick={() => { setSelectedPulperia(pulperia); setShowMessageDialog(true); }}
                        className="bg-blue-500/20 text-blue-400 py-2 px-3 rounded-xl text-sm font-bold border border-blue-500/50 hover:bg-blue-500/30 transition-all"
                        title="Enviar Mensaje"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      
                      {/* Suspend/Unsuspend */}
                      {isSuspended ? (
                        <button
                          onClick={() => handleUnsuspend(pulperia.pulperia_id)}
                          className="bg-green-500/20 text-green-400 py-2 px-3 rounded-xl text-sm font-bold border border-green-500/50 hover:bg-green-500/30 transition-all"
                          title="Desbanear"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => { setSelectedPulperia(pulperia); setShowSuspendDialog(true); }}
                          className="bg-orange-500/20 text-orange-400 py-2 px-3 rounded-xl text-sm font-bold border border-orange-500/50 hover:bg-orange-500/30 transition-all"
                          title="Banear Temporalmente"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div className="space-y-4">
            <div className="bg-stone-800/50 backdrop-blur-sm rounded-2xl p-6 border border-stone-700/50">
              <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-400" />
                Sistema de Badges
              </h3>
              <p className="text-stone-400 text-sm mb-6">
                Asigna badges únicos estilo gaming a las pulperías destacadas
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {BADGES.map(badge => (
                  <div key={badge.id} className="bg-stone-900/50 rounded-xl p-4 border border-stone-700/50 hover:border-stone-600 transition-all">
                    <BadgeDisplay badgeId={badge.id} size="lg" showName={true} />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Pulperias with badges */}
            <div className="bg-stone-800/50 backdrop-blur-sm rounded-2xl p-4 border border-stone-700/50">
              <h3 className="font-bold text-white mb-4">Pulperías con Badge</h3>
              <div className="space-y-3">
                {pulperias.filter(p => p.badge).map(pulperia => (
                  <div key={pulperia.pulperia_id} className="flex items-center justify-between bg-stone-900/50 rounded-xl p-3 border border-stone-700/50">
                    <div className="flex items-center gap-3">
                      {pulperia.logo_url ? (
                        <img src={pulperia.logo_url} alt={pulperia.name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
                          <Store className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <span className="font-bold text-white">{pulperia.name}</span>
                    </div>
                    <BadgeDisplay badgeId={pulperia.badge} size="sm" showName={true} />
                  </div>
                ))}
                {pulperias.filter(p => p.badge).length === 0 && (
                  <p className="text-center text-stone-500 py-8">No hay pulperías con badges aún</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            <div className="bg-stone-800/50 backdrop-blur-sm rounded-2xl p-4 border border-stone-700/50">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                Mensajes Enviados
              </h3>
              
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 mx-auto text-stone-600 mb-3" />
                  <p className="text-stone-500">No hay mensajes enviados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.slice(0, 20).map(msg => (
                    <div key={msg.message_id} className="bg-stone-900/50 rounded-xl p-4 border border-stone-700/50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-white">{msg.pulperia_name}</p>
                          <p className="text-xs text-stone-500">
                            {new Date(msg.created_at).toLocaleString('es-HN')}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${msg.read ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {msg.read ? 'Leído' : 'No leído'}
                        </span>
                      </div>
                      <p className="text-stone-300 text-sm">{msg.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="bg-stone-800/50 backdrop-blur-sm rounded-2xl p-4 border border-stone-700/50">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-stone-400" />
              Historial de Acciones
            </h3>
            
            {logs.length === 0 ? (
              <p className="text-center text-stone-500 py-8">No hay registros aún</p>
            ) : (
              <div className="space-y-2">
                {logs.slice(0, 20).map(log => (
                  <div key={log.log_id} className="bg-stone-900/50 rounded-xl p-3 border border-stone-700/50 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      log.action === 'activated' ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {log.action === 'activated' ? (
                        <Check className="w-5 h-5 text-green-400" />
                      ) : (
                        <X className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{log.pulperia_name}</p>
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
        )}
      </div>

      {/* Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="bg-stone-900 border-stone-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              Enviar Mensaje a {selectedPulperia?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white">Mensaje</Label>
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500"
                rows={4}
              />
            </div>
            <Button onClick={handleSendMessage} className="w-full bg-blue-600 hover:bg-blue-500">
              <Send className="w-4 h-4 mr-2" />
              Enviar Mensaje
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Badge Dialog */}
      <Dialog open={showBadgeDialog} onOpenChange={setShowBadgeDialog}>
        <DialogContent className="bg-stone-900 border-stone-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              Asignar Badge a {selectedPulperia?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedBadge('')}
                className={`p-3 rounded-xl border transition-all ${
                  !selectedBadge ? 'border-red-500 bg-red-500/10' : 'border-stone-700 bg-stone-800 hover:border-stone-600'
                }`}
              >
                <X className="w-6 h-6 mx-auto text-stone-400 mb-1" />
                <p className="text-xs text-stone-400">Sin badge</p>
              </button>
              {BADGES.map(badge => (
                <button
                  key={badge.id}
                  onClick={() => setSelectedBadge(badge.id)}
                  className={`p-3 rounded-xl border transition-all ${
                    selectedBadge === badge.id ? 'border-purple-500 bg-purple-500/10' : 'border-stone-700 bg-stone-800 hover:border-stone-600'
                  }`}
                >
                  <BadgeDisplay badgeId={badge.id} size="sm" showName={true} animated={false} />
                </button>
              ))}
            </div>
            <Button onClick={handleSetBadge} className="w-full bg-purple-600 hover:bg-purple-500">
              <Award className="w-4 h-4 mr-2" />
              Guardar Badge
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog - Updated for temporary ban */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent className="bg-stone-900 border-stone-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              Banear Temporalmente: {selectedPulperia?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3">
              <p className="text-orange-400 text-sm">
                Esta acción ocultará la pulpería del mapa y búsquedas durante el tiempo especificado. El dueño será notificado.
              </p>
            </div>
            
            <div>
              <Label className="text-white">Duración del baneo</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[1, 3, 7, 30].map(days => (
                  <button
                    key={days}
                    onClick={() => setSuspendDays(days)}
                    className={`py-2 px-3 rounded-xl font-bold text-sm transition-all ${
                      suspendDays === days
                        ? 'bg-orange-600 text-white'
                        : 'bg-stone-700/50 text-stone-300 hover:bg-stone-700 border border-stone-600'
                    }`}
                  >
                    {days} {days === 1 ? 'día' : 'días'}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-white">Razón del baneo</Label>
              <Textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Explica la razón..."
                className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500"
                rows={3}
              />
            </div>
            <Button onClick={handleSuspend} className="w-full bg-orange-600 hover:bg-orange-500">
              <Ban className="w-4 h-4 mr-2" />
              Confirmar Baneo por {suspendDays} días
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav user={user} />
    </div>
  );
};

export default AdminPanel;
