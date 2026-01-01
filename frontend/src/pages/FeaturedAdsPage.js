import { useState, useEffect } from 'react';
import { api } from '../config/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  Megaphone, 
  Upload, 
  Image as ImageIcon, 
  Video, 
  ExternalLink, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Trash2,
  Play
} from 'lucide-react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import AnimatedBackground from '../components/AnimatedBackground';
import ImageUpload from '../components/ImageUpload';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';

const FeaturedAdsPage = () => {
  const [user, setUser] = useState(null);
  const [ads, setAds] = useState([]);
  const [mySlot, setMySlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  
  const [adForm, setAdForm] = useState({
    title: '',
    description: '',
    image_url: '',
    video_url: '',
    link_url: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all ads
      const adsRes = await api.get('/api/featured-ads');
      setAds(adsRes.data);
      
      // Try to get user and their slot
      try {
        const userRes = await api.get('/api/auth/me');
        setUser(userRes.data);
        
        if (userRes.data.user_type === 'pulperia') {
          const slotRes = await api.get('/api/featured-ads/my-slot');
          setMySlot(slotRes.data);
        }
      } catch (e) {
        // Not logged in, that's ok
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAd = async () => {
    if (!adForm.image_url && !adForm.video_url) {
      toast.error('Debes subir al menos una imagen o video');
      return;
    }
    
    setUploading(true);
    try {
      const params = new URLSearchParams();
      if (adForm.title) params.append('title', adForm.title);
      if (adForm.description) params.append('description', adForm.description);
      if (adForm.image_url) params.append('image_url', adForm.image_url);
      if (adForm.video_url) params.append('video_url', adForm.video_url);
      if (adForm.link_url) params.append('link_url', adForm.link_url);
      
      const res = await api.post(`/api/featured-ads/upload?${params.toString()}`);
      toast.success('¡Anuncio publicado exitosamente!');
      setShowUploadDialog(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al publicar anuncio');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAd = async (adId) => {
    if (!confirm('¿Seguro que quieres eliminar este anuncio?')) return;
    
    try {
      await api.delete(`/api/featured-ads/${adId}`);
      toast.success('Anuncio eliminado');
      fetchData();
    } catch (error) {
      toast.error('Error al eliminar anuncio');
    }
  };

  const handleAdClick = (ad) => {
    if (ad.link_url) {
      if (ad.link_url.startsWith('/')) {
        navigate(ad.link_url);
      } else {
        window.open(ad.link_url, '_blank');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 pb-24">
      <AnimatedBackground variant="minimal" />
      
      <Header user={user} title="Anuncios" subtitle="Destacados de la comunidad" />
      
      <div className="relative z-10 px-4 py-6 max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/20 p-3 rounded-xl">
              <Megaphone className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Anuncios Destacados</h1>
              <p className="text-stone-400 text-sm">Publicidad de pulperías locales</p>
            </div>
          </div>
        </div>
        
        {/* My Slot Status - Solo para dueños de pulperías */}
        {user?.user_type === 'pulperia' && mySlot && (
          <div className={`rounded-xl p-4 mb-6 border ${
            mySlot.has_slot 
              ? mySlot.can_upload 
                ? 'bg-green-900/20 border-green-500/30' 
                : 'bg-amber-900/20 border-amber-500/30'
              : 'bg-stone-800/50 border-stone-700'
          }`}>
            <div className="flex items-start gap-3">
              {mySlot.has_slot ? (
                mySlot.can_upload ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-green-400 font-medium">¡Tienes un slot disponible!</p>
                      <p className="text-stone-400 text-sm mt-1">
                        Puedes subir tu anuncio destacado. Todos en la app lo verán.
                      </p>
                      <Button
                        onClick={() => setShowUploadDialog(true)}
                        className="mt-3 bg-green-600 hover:bg-green-500 text-white"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Subir Mi Anuncio
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5 text-amber-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-amber-400 font-medium">Tu anuncio está activo</p>
                      <p className="text-stone-400 text-sm mt-1">
                        Expira el {new Date(mySlot.slot?.expires_at).toLocaleDateString()}
                      </p>
                      {mySlot.ad && (
                        <div className="mt-3 p-3 bg-stone-800/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {mySlot.ad.image_url && (
                              <img src={mySlot.ad.image_url} alt="" className="w-16 h-16 object-cover rounded" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium truncate">{mySlot.ad.title || 'Mi Anuncio'}</p>
                              <p className="text-stone-500 text-xs truncate">{mySlot.ad.description}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAd(mySlot.ad.ad_id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-stone-500 mt-0.5" />
                  <div>
                    <p className="text-stone-400 font-medium">No tienes un slot activo</p>
                    <p className="text-stone-500 text-sm mt-1">
                      Contacta al admin para habilitar tu anuncio (1000 Lps/mes)
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Ads Grid */}
        {ads.length === 0 ? (
          <div className="text-center py-16 bg-stone-900/30 rounded-2xl border border-stone-800">
            <Megaphone className="w-16 h-16 mx-auto text-stone-700 mb-4" />
            <p className="text-stone-400 text-lg">No hay anuncios destacados</p>
            <p className="text-stone-600 text-sm mt-1">Las pulperías pronto publicarán aquí</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ads.map((ad) => (
              <div 
                key={ad.ad_id}
                onClick={() => handleAdClick(ad)}
                className="bg-stone-900/50 rounded-2xl border border-stone-800 overflow-hidden hover:border-amber-500/50 transition-all cursor-pointer group"
              >
                {/* Media */}
                <div className="relative aspect-video bg-stone-800">
                  {ad.video_url ? (
                    <video 
                      src={ad.video_url}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                      onMouseEnter={(e) => e.target.play()}
                      onMouseLeave={(e) => e.target.pause()}
                    />
                  ) : ad.image_url ? (
                    <img 
                      src={ad.image_url}
                      alt={ad.title || ad.pulperia_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-stone-700" />
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-3 right-3">
                      <ExternalLink className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  
                  {/* Video indicator */}
                  {ad.video_url && (
                    <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5">
                      <Play className="w-3 h-3 text-white" fill="white" />
                    </div>
                  )}
                </div>
                
                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      {ad.title && (
                        <h3 className="text-white font-bold truncate">{ad.title}</h3>
                      )}
                      {ad.description && (
                        <p className="text-stone-400 text-sm line-clamp-2 mt-1">{ad.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-800">
                    <span className="text-amber-400 text-sm font-medium">{ad.pulperia_name}</span>
                    <span className="text-stone-600 text-xs">
                      Expira: {new Date(ad.expires_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Info Box */}
        <div className="mt-8 bg-amber-900/10 border border-amber-500/20 rounded-xl p-4">
          <h3 className="text-amber-400 font-medium mb-2">¿Quieres anunciarte aquí?</h3>
          <p className="text-stone-400 text-sm">
            Por solo <span className="text-amber-400 font-bold">1000 Lps/mes</span>, tu anuncio será visible para todos los usuarios de La Pulpería. 
            Contacta al administrador para activar tu espacio publicitario.
          </p>
        </div>
      </div>
      
      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="bg-stone-900 border-stone-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-amber-400">
              Subir Anuncio Destacado
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-stone-300">Título (opcional)</Label>
              <Input
                value={adForm.title}
                onChange={(e) => setAdForm({...adForm, title: e.target.value})}
                placeholder="Título de tu anuncio"
                className="bg-stone-800 border-stone-700 text-white mt-1"
                maxLength={60}
              />
            </div>
            
            <div>
              <Label className="text-stone-300">Descripción (opcional)</Label>
              <Textarea
                value={adForm.description}
                onChange={(e) => setAdForm({...adForm, description: e.target.value})}
                placeholder="Describe tu oferta o promoción..."
                className="bg-stone-800 border-stone-700 text-white mt-1"
                rows={3}
                maxLength={200}
              />
            </div>
            
            <div>
              <Label className="text-stone-300">Imagen del Anuncio</Label>
              <div className="mt-1">
                <ImageUpload
                  onUpload={(url) => setAdForm({...adForm, image_url: url})}
                  currentImage={adForm.image_url}
                  aspect="video"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-stone-300">URL de Video (opcional)</Label>
              <Input
                value={adForm.video_url}
                onChange={(e) => setAdForm({...adForm, video_url: e.target.value})}
                placeholder="https://... (link directo al video)"
                className="bg-stone-800 border-stone-700 text-white mt-1"
              />
              <p className="text-stone-500 text-xs mt-1">Si subes video, se reproducirá automáticamente (sin sonido)</p>
            </div>
            
            <div>
              <Label className="text-stone-300">URL de destino (opcional)</Label>
              <Input
                value={adForm.link_url}
                onChange={(e) => setAdForm({...adForm, link_url: e.target.value})}
                placeholder="A dónde llevará el click (por defecto: tu pulpería)"
                className="bg-stone-800 border-stone-700 text-white mt-1"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowUploadDialog(false)}
                className="flex-1 border-stone-700 text-stone-300"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUploadAd}
                disabled={uploading || (!adForm.image_url && !adForm.video_url)}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-black"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Publicar Anuncio
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <BottomNav activeTab="anuncios" />
    </div>
  );
};

export default FeaturedAdsPage;
