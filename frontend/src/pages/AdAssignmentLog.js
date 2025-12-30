import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, Check, X, Crown, Sparkles, Star, Store, Eye } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdAssignmentLog = () => {
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, logsRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/auth/me`, { withCredentials: true }).catch(() => ({ data: null })),
          axios.get(`${BACKEND_URL}/api/ads/assignment-log`)
        ]);
        
        setUser(userRes.data);
        setLogs(logsRes.data);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getPlanIcon = (plan) => {
    switch (plan) {
      case 'premium': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'destacado': return <Sparkles className="w-4 h-4 text-orange-500" />;
      default: return <Star className="w-4 h-4 text-red-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-orange-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-200 rounded-full animate-spin border-t-red-600 mx-auto"></div>
          <p className="mt-4 text-red-600 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50 pb-24">
      <Header 
        user={user} 
        title="Registro de Anuncios" 
        subtitle="Ve cómo se asignan los perks"
      />

      {/* Info Banner */}
      <div className="px-4 py-4 bg-gradient-to-r from-red-600 to-orange-500">
        <div className="flex items-center gap-3 text-white">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold">Transparencia Total</p>
            <p className="text-sm text-white/80">Ve cuándo el dueño asigna los anuncios</p>
          </div>
        </div>
      </div>

      {/* Logs */}
      <div className="px-4 py-6">
        {logs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-red-400" />
            </div>
            <p className="text-stone-600 text-lg font-semibold">No hay registros aún</p>
            <p className="text-stone-400 text-sm">Los anuncios asignados aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map(log => (
              <div key={log.log_id} className="bg-white rounded-2xl shadow-md border border-red-100 p-4">
                <div className="flex items-start gap-3">
                  {/* Action Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    log.action === 'activated' 
                      ? 'bg-gradient-to-br from-green-400 to-green-500' 
                      : 'bg-gradient-to-br from-red-400 to-red-500'
                  }`}>
                    {log.action === 'activated' ? (
                      <Check className="w-6 h-6 text-white" />
                    ) : (
                      <X className="w-6 h-6 text-white" />
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Store className="w-4 h-4 text-red-500" />
                      <span className="font-bold text-stone-800 truncate">{log.pulperia_name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      {getPlanIcon(log.plan)}
                      <span className="text-sm font-medium text-stone-600">
                        Plan {log.plan.charAt(0).toUpperCase() + log.plan.slice(1)}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        log.action === 'activated'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {log.action === 'activated' ? 'Activado' : 'Desactivado'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-stone-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(log.created_at).toLocaleDateString('es-HN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(log.created_at).toLocaleTimeString('es-HN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {user && <BottomNav user={user} />}
    </div>
  );
};

export default AdAssignmentLog;
