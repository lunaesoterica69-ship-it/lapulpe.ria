import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Store as StoreIcon, Package, Plus, Edit, Trash2, Bell, Briefcase, Palette, Type, Megaphone, Image, MessageSquare, Shield, Clock } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import ImageUpload from '../components/ImageUpload';
import AnimatedBackground from '../components/AnimatedBackground';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import useWebSocket from '../hooks/useWebSocket';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Font options
const FONT_OPTIONS = [
  { value: 'default', label: 'Moderno (Por defecto)', preview: 'font-black' },
  { value: 'serif', label: 'Elegante', preview: 'font-serif font-bold' },
  { value: 'script', label: 'Cursiva', preview: 'font-serif italic' },
  { value: 'bold', label: 'Negrita', preview: 'font-extrabold tracking-tight' }
];

// Color options
const COLOR_OPTIONS = [
  { value: '#DC2626', label: 'Rojo Pulpo', preview: 'bg-red-600' },
  { value: '#2563EB', label: 'Azul', preview: 'bg-blue-600' },
  { value: '#16A34A', label: 'Verde', preview: 'bg-green-600' },
  { value: '#9333EA', label: 'Morado', preview: 'bg-purple-600' },
  { value: '#EA580C', label: 'Naranja', preview: 'bg-orange-600' },
  { value: '#0891B2', label: 'Turquesa', preview: 'bg-cyan-600' },
  { value: '#4F46E5', label: 'Índigo', preview: 'bg-indigo-600' },
  { value: '#DB2777', label: 'Rosa', preview: 'bg-pink-600' }
];

// Helper function to extract error message from API responses
const getErrorMessage = (error, defaultMsg = 'Error desconocido') => {
  const detail = error?.response?.data?.detail;
  if (!detail) return defaultMsg;
  
  if (typeof detail === 'string') return detail;
  
  if (Array.isArray(detail)) {
    return detail.map(err => err.msg || err.message || JSON.stringify(err)).join(', ');
  }
  
  if (typeof detail === 'object' && detail.msg) return detail.msg;
  
  return defaultMsg;
};

// Job categories
const JOB_CATEGORIES = ['Ventas', 'Construcción', 'Limpieza', 'Cocina', 'Seguridad', 'Otro'];

const PulperiaDashboard = () => {
  const [user, setUser] = useState(null);
  const [pulperias, setPulperias] = useState([]);
  const [selectedPulperia, setSelectedPulperia] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [adminMessages, setAdminMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPulperiaDialog, setShowPulperiaDialog] = useState(false);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [announcementForm, setAnnouncementForm] = useState({ content: '', image_url: '', tags: '' });
  const [activeNotificationTab, setActiveNotificationTab] = useState('orders');
  
  // WebSocket message handler - Silencioso, solo actualiza datos
  const handleWebSocketMessage = useCallback((data) => {
    if (data.type === 'order_update') {
      const { event, order, message } = data;
      
      // Play notification sound for new orders
      if (event === 'new_order') {
        try {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          oscillator.frequency.value = 880;
          oscillator.type = 'sine';
          gainNode.gain.value = 0.3;
          
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.3);
          
          setTimeout(() => {
            const osc2 = audioContext.createOscillator();
            osc2.connect(gainNode);
            osc2.frequency.value = 1100;
            osc2.type = 'sine';
            osc2.start();
            osc2.stop(audioContext.currentTime + 0.2);
          }, 200);
        } catch (e) {}
        
        // Show toast for new orders
        toast.success(message || '🔔 ¡Nueva orden recibida!', {
          duration: 5000,
          style: { background: '#B91C1C', color: 'white', fontWeight: 'bold' }
        });
      }
      
      // Update orders list in real-time
      setOrders(prevOrders => {
        const existingIndex = prevOrders.findIndex(o => o.order_id === order.order_id);
        
        if (event === 'new_order' && existingIndex === -1) {
          return [{ ...order, isNew: true }, ...prevOrders];
        } else if (existingIndex !== -1) {
          const updatedOrders = [...prevOrders];
          updatedOrders[existingIndex] = { ...updatedOrders[existingIndex], ...order, isNew: false };
          return updatedOrders;
        }
        
        return prevOrders;
      });
      
      // Update notification count
      if (event === 'new_order') {
        setNewOrdersCount(prev => prev + 1);
      }
    }
  }, []);

  // WebSocket connection (silencioso)
  useWebSocket(user?.user_id, handleWebSocketMessage);
  
  const [pulperiaForm, setPulperiaForm] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    hours: '',
    lat: '',
    lng: '',
    logo_url: '',
    banner_url: '',
    title_font: 'default',
    background_color: '#DC2626'
  });
  const [gettingLocation, setGettingLocation] = useState(false);
  const [editingPulperia, setEditingPulperia] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    category: '',
    pay_rate: '',
    pay_currency: 'HNL',
    location: '',
    contact: ''
  });
  
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    available: true,
    category: '',
    image_url: ''
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch pulperia data when selected pulperia changes
  useEffect(() => {
    if (selectedPulperia) {
      fetchPulperiaData(selectedPulperia.pulperia_id);
    }
  }, [selectedPulperia]);

  const fetchData = async () => {
    try {
      const [userRes, pulperiasRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/auth/me`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/pulperias`, { withCredentials: true })
      ]);
      
      setUser(userRes.data);
      
      const myPulperias = pulperiasRes.data.filter(p => p.owner_user_id === userRes.data.user_id);
      setPulperias(myPulperias);
      
      if (myPulperias.length > 0) {
        setSelectedPulperia(myPulperias[0]);
        await fetchPulperiaData(myPulperias[0].pulperia_id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const fetchPulperiaData = async (pulperiaId) => {
    try {
      const [productsRes, ordersRes, jobsRes, announcementsRes, adminMsgsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/pulperias/${pulperiaId}/products`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/orders`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/pulperias/${pulperiaId}/jobs`).catch(() => ({ data: [] })),
        axios.get(`${BACKEND_URL}/api/pulperias/${pulperiaId}/announcements`).catch(() => ({ data: [] })),
        axios.get(`${BACKEND_URL}/api/pulperias/${pulperiaId}/admin-messages`, { withCredentials: true }).catch(() => ({ data: [] }))
      ]);
      
      setProducts(productsRes.data);
      setJobs(jobsRes.data);
      setAnnouncements(announcementsRes.data);
      setAdminMessages(adminMsgsRes.data);
      const pulperiaOrders = ordersRes.data.filter(o => o.pulperia_id === pulperiaId);
      setOrders(pulperiaOrders);
      
      // Count new pending orders
      const newOrders = pulperiaOrders.filter(o => o.status === 'pending').length;
      setNewOrdersCount(newOrders);
    } catch (error) {
      console.error('Error fetching pulperia data:', error);
    }
  };

  const checkNewOrders = async (pulperiaId) => {
    try {
      const ordersRes = await axios.get(`${BACKEND_URL}/api/orders`, { withCredentials: true });
      const pulperiaOrders = ordersRes.data.filter(o => o.pulperia_id === pulperiaId);
      const newOrders = pulperiaOrders.filter(o => o.status === 'pending').length;
      
      if (newOrders > newOrdersCount) {
        toast.success(`🔔 ¡Tienes ${newOrders - newOrdersCount} nueva(s) orden(es)!`);
        setNewOrdersCount(newOrders);
        setOrders(pulperiaOrders);
      }
    } catch (error) {
      console.error('Error checking orders:', error);
    }
  };

  const handleCreatePulperia = async (e) => {
    e.preventDefault();
    
    if (!editingPulperia && (!pulperiaForm.lat || !pulperiaForm.lng)) {
      toast.error('Por favor obtén tu ubicación antes de crear la pulpería');
      return;
    }
    
    if (editingPulperia) {
      await updatePulperia();
    } else {
      await createPulperia(parseFloat(pulperiaForm.lat), parseFloat(pulperiaForm.lng));
    }
  };

  const updatePulperia = async () => {
    try {
      // Transform lat/lng into location object for backend
      const dataToSend = {
        name: pulperiaForm.name,
        description: pulperiaForm.description,
        address: pulperiaForm.address,
        phone: pulperiaForm.phone,
        email: pulperiaForm.email,
        website: pulperiaForm.website,
        hours: pulperiaForm.hours,
        logo_url: pulperiaForm.logo_url,
        banner_url: pulperiaForm.banner_url,
        title_font: pulperiaForm.title_font,
        background_color: pulperiaForm.background_color,
        location: {
          lat: parseFloat(pulperiaForm.lat),
          lng: parseFloat(pulperiaForm.lng)
        }
      };
      
      await axios.put(
        `${BACKEND_URL}/api/pulperias/${selectedPulperia.pulperia_id}`,
        dataToSend,
        { withCredentials: true }
      );
      
      toast.success('Pulpería actualizada exitosamente');
      setShowPulperiaDialog(false);
      setEditingPulperia(false);
      await fetchData();
    } catch (error) {
      console.error('Error updating pulperia:', error);
      toast.error(getErrorMessage(error, 'Error al actualizar pulpería'));
    }
  };

  const handleEditPulperia = () => {
    if (!selectedPulperia) return;
    
    setPulperiaForm({
      name: selectedPulperia.name,
      description: selectedPulperia.description || '',
      address: selectedPulperia.address,
      phone: selectedPulperia.phone || '',
      email: selectedPulperia.email || '',
      website: selectedPulperia.website || '',
      hours: selectedPulperia.hours || '',
      lat: selectedPulperia.location.lat.toString(),
      lng: selectedPulperia.location.lng.toString(),
      logo_url: selectedPulperia.logo_url || '',
      banner_url: selectedPulperia.banner_url || '',
      title_font: selectedPulperia.title_font || 'default',
      background_color: selectedPulperia.background_color || '#DC2626'
    });
    setEditingPulperia(true);
    setShowPulperiaDialog(true);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('El logo no debe superar 5MB');
      return;
    }

    setUploadingLogo(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPulperiaForm({ ...pulperiaForm, logo_url: reader.result });
        setUploadingLogo(false);
        toast.success('Logo cargado');
      };
      reader.onerror = () => {
        toast.error('Error al cargar logo');
        setUploadingLogo(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Error al procesar logo');
      setUploadingLogo(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Tu navegador no soporta geolocalización');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // Try to get address from coordinates using reverse geocoding
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          
          // Build a readable address
          let address = '';
          if (data.display_name) {
            address = data.display_name;
          } else if (data.address) {
            const addr = data.address;
            address = [addr.road, addr.house_number, addr.neighbourhood, addr.city, addr.state]
              .filter(Boolean)
              .join(', ');
          }
          
          setPulperiaForm({
            ...pulperiaForm,
            lat: lat.toString(),
            lng: lng.toString(),
            address: address || pulperiaForm.address
          });
          
          toast.success('✅ Ubicación y dirección actualizadas');
        } catch (error) {
          // If geocoding fails, just update coordinates
          setPulperiaForm({
            ...pulperiaForm,
            lat: lat.toString(),
            lng: lng.toString()
          });
          toast.success('Ubicación obtenida (dirección no disponible)');
        }
        
        setGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setGettingLocation(false);
        
        let errorMsg = 'No se pudo obtener tu ubicación. ';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += 'Por favor, habilita los permisos de ubicación en tu navegador.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg += 'Ubicación no disponible.';
            break;
          case error.TIMEOUT:
            errorMsg += 'Tiempo de espera agotado.';
            break;
          default:
            errorMsg += 'Intenta nuevamente.';
        }
        toast.error(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const createPulperia = async (lat, lng) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/pulperias`,
        {
          ...pulperiaForm,
          location: { lat, lng }
        },
        { withCredentials: true }
      );
      
      toast.success('Pulpería creada exitosamente');
      setShowPulperiaDialog(false);
      setEditingPulperia(false);
      setPulperiaForm({
        name: '',
        description: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        hours: '',
        lat: '',
        lng: '',
        logo_url: ''
      });
      await fetchData();
    } catch (error) {
      console.error('Error creating pulperia:', error);
      toast.error(getErrorMessage(error, 'Error al crear pulpería'));
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    
    if (!selectedPulperia) {
      toast.error('Selecciona una pulpería primero');
      return;
    }
    
    try {
      const url = editingProduct
        ? `${BACKEND_URL}/api/products/${editingProduct.product_id}`
        : `${BACKEND_URL}/api/products?pulperia_id=${selectedPulperia.pulperia_id}`;
      
      const method = editingProduct ? 'put' : 'post';
      
      await axios[method](
        url,
        {
          ...productForm,
          price: parseFloat(productForm.price),
          stock: 0,
          available: productForm.available
        },
        { withCredentials: true }
      );
      
      toast.success(editingProduct ? 'Producto actualizado' : 'Producto creado exitosamente');
      setShowProductDialog(false);
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        price: '',
        available: true,
        category: '',
        image_url: ''
      });
      await fetchPulperiaData(selectedPulperia.pulperia_id);
    } catch (error) {
      console.error('Error with product:', error);
      toast.error(getErrorMessage(error, 'Error al gestionar producto'));
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    
    try {
      await axios.delete(`${BACKEND_URL}/api/products/${productId}`, { withCredentials: true });
      toast.success('Producto eliminado');
      await fetchPulperiaData(selectedPulperia.pulperia_id);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar producto');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      available: product.available !== false,
      category: product.category || '',
      image_url: product.image_url || ''
    });
    setShowProductDialog(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductForm({ ...productForm, image_url: reader.result });
        setUploadingImage(false);
        toast.success('Imagen cargada');
      };
      reader.onerror = () => {
        toast.error('Error al cargar imagen');
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Error al procesar imagen');
      setUploadingImage(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(
        `${BACKEND_URL}/api/orders/${orderId}/status`,
        { status },
        { withCredentials: true }
      );
      toast.success('Estado actualizado');
      await fetchPulperiaData(selectedPulperia.pulperia_id);
      setShowOrderDialog(false);
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error(getErrorMessage(error, 'Error al actualizar orden'));
    }
  };

  const handleToggleAvailability = async (productId, currentAvailable) => {
    try {
      await axios.put(
        `${BACKEND_URL}/api/products/${productId}/availability`,
        {},
        { withCredentials: true }
      );
      toast.success(currentAvailable ? 'Producto marcado como no disponible' : 'Producto disponible nuevamente');
      await fetchPulperiaData(selectedPulperia.pulperia_id);
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast.error('Error al cambiar disponibilidad');
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post(
        `${BACKEND_URL}/api/jobs`,
        {
          ...jobForm,
          pay_rate: parseFloat(jobForm.pay_rate),
          pulperia_id: selectedPulperia.pulperia_id
        },
        { withCredentials: true }
      );
      
      toast.success('¡Oferta de empleo publicada!');
      setShowJobDialog(false);
      setJobForm({
        title: '',
        description: '',
        category: '',
        pay_rate: '',
        pay_currency: 'HNL',
        location: '',
        contact: ''
      });
      await fetchPulperiaData(selectedPulperia.pulperia_id);
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Error al publicar empleo');
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/jobs/${jobId}`, { withCredentials: true });
      toast.success('Empleo eliminado');
      await fetchPulperiaData(selectedPulperia.pulperia_id);
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Error al eliminar empleo');
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const tagsArray = announcementForm.tags ? announcementForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      await axios.post(
        `${BACKEND_URL}/api/pulperias/${selectedPulperia.pulperia_id}/announcements`,
        null,
        { 
          params: {
            content: announcementForm.content,
            image_url: announcementForm.image_url || null,
            tags: tagsArray
          },
          withCredentials: true 
        }
      );
      toast.success('Anuncio publicado');
      setShowAnnouncementDialog(false);
      await fetchPulperiaData(selectedPulperia.pulperia_id);
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error(getErrorMessage(error, 'Error al publicar anuncio'));
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/announcements/${announcementId}`, { withCredentials: true });
      toast.success('Anuncio eliminado');
      await fetchPulperiaData(selectedPulperia.pulperia_id);
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Error al eliminar anuncio');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-400',
      accepted: 'bg-blue-500',
      ready: 'bg-green-500',
      completed: 'bg-gray-500',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-400';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'PENDIENTE',
      accepted: 'ACEPTADA',
      ready: 'LISTA',
      completed: 'COMPLETADA',
      cancelled: 'CANCELADA'
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <AnimatedBackground />
        <div className="text-center relative z-10">
          <div className="w-16 h-16 border-4 border-red-400/30 rounded-full animate-spin border-t-red-500 mx-auto"></div>
          <p className="mt-4 text-stone-500">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user?.user_type !== 'pulperia') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-red-800 to-stone-900 px-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <StoreIcon className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Acceso Restringido</h2>
          <p className="text-white/60 mb-8">Este panel es exclusivo para dueños de pulpería. Si tienes una pulpería, configura tu cuenta como negocio.</p>
          <a 
            href="/map" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-3 px-6 rounded-xl hover:scale-105 transition-transform"
          >
            Ir al Mapa
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 pb-24">
      <AnimatedBackground variant="minimal" />
      
      {/* Header with Profile Dropdown */}
      <Header 
        user={user} 
        title="Dashboard Pulpería" 
        subtitle={selectedPulperia ? `${newOrdersCount} orden(es) pendiente(s)` : 'Panel de Control'}
      />
      
      {/* Banner Preview - Like customer sees it */}
      {selectedPulperia?.banner_url && (
        <div className="relative w-full h-40 overflow-hidden">
          <img 
            src={selectedPulperia.banner_url} 
            alt="Banner" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent"></div>
          <div className="absolute bottom-3 left-4 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
            <p className="text-xs text-white/70">Vista previa del banner</p>
          </div>
        </div>
      )}
      
      {/* Pulperia Info Section */}
      <div className={`relative z-10 px-4 pb-4 ${selectedPulperia?.banner_url ? '-mt-8' : 'pt-4'}`}>
        {pulperias.length === 0 ? (
          <Button
            data-testid="create-pulperia-button"
            onClick={() => setShowPulperiaDialog(true)}
            className="bg-red-600 hover:bg-red-500 text-white font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            Crear Mi Pulpería
          </Button>
        ) : (
          <div className="bg-stone-900 rounded-xl p-4 flex items-center gap-4 border border-stone-800">
            {selectedPulperia.logo_url && (
              <img
                src={selectedPulperia.logo_url}
                alt={selectedPulperia.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-red-500"
              />
            )}
            <div className="flex-1">
              <p className="text-xs text-stone-500 mb-0.5">Pulpería Activa</p>
              <p className="text-lg font-bold text-white">{selectedPulperia?.name}</p>
            </div>
            <Button
              onClick={handleEditPulperia}
              className="bg-stone-800 hover:bg-stone-700 text-white border border-stone-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>
        )}
      </div>

      {selectedPulperia && (
        <div className="px-6 py-6 space-y-6">
          {/* Products Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-black text-white">Productos</h2>
              <Button
                data-testid="add-product-button"
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    name: '',
                    description: '',
                    price: '',
                    available: true,
                    category: '',
                    image_url: ''
                  });
                  setShowProductDialog(true);
                }}
                className="bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400"
              >
                <Plus className="w-5 h-5 mr-2" />
                Agregar Producto
              </Button>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12 bg-stone-800/50 rounded-2xl border border-stone-700">
                <Package className="w-16 h-16 mx-auto text-stone-600 mb-4" />
                <p className="text-stone-400">Aún no tienes productos</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((product) => (
                  <div
                    key={product.product_id}
                    data-testid={`product-${product.product_id}`}
                    className="bg-stone-800/50 backdrop-blur-sm rounded-2xl border border-stone-700/50 overflow-hidden hover:border-red-500/50 transition-all"
                  >
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white">{product.name}</h3>
                          {product.description && (
                            <p className="text-sm text-stone-400 mt-1">{product.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-2 text-blue-400 hover:bg-stone-700 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.product_id)}
                            className="p-2 text-red-400 hover:bg-stone-700 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-2xl font-black text-red-400">L {product.price.toFixed(2)}</p>
                          {/* Availability Toggle Button */}
                          <button
                            onClick={() => handleToggleAvailability(product.product_id, product.available !== false)}
                            className={`mt-2 px-3 py-1.5 rounded-full text-sm font-bold transition-all flex items-center gap-1 ${
                              product.available !== false
                                ? 'bg-green-900/50 text-green-400 border border-green-700 hover:bg-green-900'
                                : 'bg-red-900/50 text-red-400 border border-red-700 hover:bg-red-900'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${product.available !== false ? 'bg-green-400' : 'bg-red-400'}`}></span>
                            {product.available !== false ? 'Disponible' : 'No disponible'}
                          </button>
                        </div>
                        {product.category && (
                          <span className="text-xs bg-red-900/50 text-red-400 px-3 py-1 rounded-full font-semibold border border-red-700">
                            {product.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Orders & Admin Messages Section */}
          <div>
            <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
              <Bell className="w-6 h-6 text-red-400" />
              Notificaciones
            </h2>
            
            {/* Tabs for Orders and Admin Messages */}
            <div className="flex bg-stone-800/50 rounded-xl p-1 mb-4 border border-stone-700/50">
              <button
                onClick={() => setActiveNotificationTab('orders')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  activeNotificationTab === 'orders'
                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Package className="w-4 h-4" />
                Órdenes
                {orders.filter(o => o.status === 'pending').length > 0 && (
                  <span className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full font-bold">
                    {orders.filter(o => o.status === 'pending').length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveNotificationTab('admin')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  activeNotificationTab === 'admin'
                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4" />
                Mensajes del Admin
                {adminMessages.filter(m => !m.read).length > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {adminMessages.filter(m => !m.read).length}
                  </span>
                )}
              </button>
            </div>
            
            {/* Orders Tab Content */}
            {activeNotificationTab === 'orders' && (
              <>
                {orders.length === 0 ? (
                  <div className="text-center py-12 bg-stone-800/50 rounded-2xl border border-stone-700">
                    <Package className="w-16 h-16 mx-auto text-stone-600 mb-4" />
                    <p className="text-stone-400">No hay órdenes aún</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {orders.slice(0, 12).map((order) => (
                      <div
                        key={order.order_id}
                        data-testid={`order-${order.order_id}`}
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderDialog(true);
                        }}
                        className="bg-stone-800/50 backdrop-blur-sm rounded-2xl border-2 border-red-600 p-6 cursor-pointer hover:border-red-400 transition-all transform hover:-translate-y-1"
                      >
                        {/* Ticket Style Header */}
                        <div className="bg-gradient-to-r from-red-700 to-red-600 text-white px-4 py-3 -mx-6 -mt-6 mb-4 rounded-t-xl">
                          <div className="flex justify-between items-center">
                            <span className="font-black text-lg">ORDEN #{order.order_id.slice(-6)}</span>
                            <div className={`${getStatusColor(order.status)} px-3 py-1 rounded-full text-xs font-black`}>
                              {getStatusText(order.status)}
                            </div>
                          </div>
                          {/* Customer Name */}
                          {order.customer_name && (
                            <div className="mt-2 flex items-center gap-2 text-white/90 text-sm">
                              <span className="bg-white/20 px-2 py-0.5 rounded-full">👤 {order.customer_name}</span>
                            </div>
                          )}
                        </div>

                        {/* Order Items */}
                        <div className="space-y-2 mb-4">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center border-b border-dashed border-stone-600 pb-2">
                              <div>
                                <span className="font-bold text-white">{item.quantity}x</span>
                                <span className="ml-2 text-stone-300">{item.product_name}</span>
                              </div>
                              <span className="font-bold text-red-400">L{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Total */}
                        <div className="bg-stone-700/50 rounded-lg p-3 mb-3 border border-stone-600">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-black text-white">TOTAL:</span>
                            <span className="text-2xl font-black text-red-400">L {order.total.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Time */}
                        <div className="text-center text-xs text-stone-500">
                          {new Date(order.created_at).toLocaleString('es-HN')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            
            {/* Admin Messages Tab Content */}
            {activeNotificationTab === 'admin' && (
              <>
                {adminMessages.length === 0 ? (
                  <div className="text-center py-12 bg-stone-800/50 rounded-2xl border border-stone-700">
                    <MessageSquare className="w-16 h-16 mx-auto text-stone-600 mb-4" />
                    <p className="text-stone-400">No hay mensajes del administrador</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {adminMessages.map((msg) => (
                      <div
                        key={msg.message_id}
                        className={`bg-stone-800/50 backdrop-blur-sm rounded-2xl border p-5 transition-all ${
                          msg.read ? 'border-stone-700/50' : 'border-blue-500/50 bg-blue-500/5'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            msg.message_type === 'suspension' ? 'bg-red-500/20' :
                            msg.message_type === 'reactivation' ? 'bg-green-500/20' :
                            'bg-blue-500/20'
                          }`}>
                            {msg.message_type === 'suspension' ? (
                              <Shield className="w-6 h-6 text-red-400" />
                            ) : msg.message_type === 'reactivation' ? (
                              <Shield className="w-6 h-6 text-green-400" />
                            ) : (
                              <MessageSquare className="w-6 h-6 text-blue-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-white flex items-center gap-2">
                                Administrador
                                {!msg.read && (
                                  <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">Nuevo</span>
                                )}
                              </span>
                              <span className="text-xs text-stone-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(msg.created_at).toLocaleString('es-HN')}
                              </span>
                            </div>
                            <p className="text-stone-300">{msg.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Jobs Section */}
          <div className="bg-stone-800/50 backdrop-blur-sm rounded-2xl border border-stone-700/50 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-400" />
                Ofertas de Empleo
              </h2>
              <Button
                onClick={() => setShowJobDialog(true)}
                size="sm"
                className="bg-blue-600 text-white hover:bg-blue-500"
              >
                <Plus className="w-4 h-4 mr-1" />
                Publicar
              </Button>
            </div>
            
            <p className="text-sm text-stone-400 mb-4">
              Publica ofertas de empleo que aparecerán en tu perfil y en la sección de empleos con tu logo oficial.
            </p>
            
            {jobs.length === 0 ? (
              <div className="text-center py-8 bg-stone-700/30 rounded-xl border border-stone-600">
                <Briefcase className="w-12 h-12 mx-auto text-stone-500 mb-3" />
                <p className="text-stone-400">No tienes ofertas de empleo activas</p>
                <Button
                  onClick={() => setShowJobDialog(true)}
                  className="mt-3 bg-blue-600 text-white hover:bg-blue-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Publicar Empleo
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map(job => (
                  <div key={job.job_id} className="bg-stone-700/30 rounded-xl p-4 flex justify-between items-start border border-stone-600">
                    <div className="flex-1">
                      <h3 className="font-bold text-white">{job.title}</h3>
                      <p className="text-sm text-stone-400 mt-1">{job.description.slice(0, 100)}...</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-blue-900/50 text-blue-400 px-2 py-1 rounded-full font-bold border border-blue-700">
                          {job.category}
                        </span>
                        <span className="text-xs bg-green-900/50 text-green-400 px-2 py-1 rounded-full font-bold border border-green-700">
                          {job.pay_rate} {job.pay_currency}/hr
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteJob(job.job_id)}
                      className="p-2 text-red-400 hover:bg-stone-600 rounded-lg transition-colors"
                      title="Eliminar empleo"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Announcements Section - Muro de Anuncios */}
          <div className="bg-stone-800/50 backdrop-blur-sm rounded-2xl border border-stone-700/50 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-orange-400" />
                Muro de Anuncios
              </h2>
              <Button
                onClick={() => {
                  setAnnouncementForm({ content: '', image_url: '', tags: '' });
                  setShowAnnouncementDialog(true);
                }}
                size="sm"
                className="bg-orange-600 text-white hover:bg-orange-500"
              >
                <Plus className="w-4 h-4 mr-1" />
                Publicar
              </Button>
            </div>
            
            <p className="text-sm text-stone-400 mb-4">
              Publica anuncios con fotos que aparecerán en tu perfil. Promociona ofertas, eventos o novedades.
            </p>
            
            {announcements.length === 0 ? (
              <div className="text-center py-8 bg-stone-700/30 rounded-xl border border-stone-600">
                <Megaphone className="w-12 h-12 mx-auto text-stone-500 mb-3" />
                <p className="text-stone-400">No tienes anuncios publicados</p>
                <Button
                  onClick={() => {
                    setAnnouncementForm({ content: '', image_url: '', tags: '' });
                    setShowAnnouncementDialog(true);
                  }}
                  className="mt-3 bg-orange-600 text-white hover:bg-orange-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Anuncio
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map(announcement => (
                  <div key={announcement.announcement_id} className="bg-stone-700/30 rounded-xl overflow-hidden border border-stone-600">
                    {announcement.image_url && (
                      <img src={announcement.image_url} alt="Anuncio" className="w-full h-40 object-cover" />
                    )}
                    <div className="p-4">
                      <p className="text-white">{announcement.content}</p>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-xs text-stone-500">
                          {new Date(announcement.created_at).toLocaleDateString('es-HN')}
                        </span>
                        <button
                          onClick={() => handleDeleteAnnouncement(announcement.announcement_id)}
                          className="p-2 text-red-400 hover:bg-stone-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-md">
          {selectedOrder && (
            <div>
              <div className="bg-gradient-to-br from-red-600 to-red-700 text-white px-6 py-4 -mx-6 -mt-6 mb-6 rounded-t-xl">
                <h2 className="text-2xl font-black mb-1">ORDEN #{selectedOrder.order_id.slice(-8)}</h2>
                {/* Customer Name */}
                {selectedOrder.customer_name && (
                  <p className="text-white/90 font-bold flex items-center gap-2 mb-2">
                    <span className="bg-white/20 px-3 py-1 rounded-full">👤 {selectedOrder.customer_name}</span>
                  </p>
                )}
                <p className="text-sm opacity-90">{new Date(selectedOrder.created_at).toLocaleString('es-HN')}</p>
                {/* Current Status Badge */}
                <div className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-black ${
                  selectedOrder.status === 'pending' ? 'bg-yellow-400 text-yellow-900' :
                  selectedOrder.status === 'accepted' ? 'bg-blue-400 text-blue-900' :
                  selectedOrder.status === 'ready' ? 'bg-green-400 text-green-900' :
                  selectedOrder.status === 'completed' ? 'bg-gray-400 text-gray-900' :
                  'bg-red-400 text-red-900'
                }`}>
                  Estado: {selectedOrder.status === 'pending' ? 'PENDIENTE' :
                           selectedOrder.status === 'accepted' ? 'ACEPTADA' :
                           selectedOrder.status === 'ready' ? 'LISTA PARA RECOGER' :
                           selectedOrder.status === 'completed' ? 'COMPLETADA' : 'CANCELADA'}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center bg-red-50 rounded-lg p-3">
                    <div>
                      <span className="inline-block bg-red-600 text-white font-black px-2 py-1 rounded text-sm mr-2">
                        {item.quantity}x
                      </span>
                      <span className="font-bold text-stone-800">{item.product_name}</span>
                    </div>
                    <span className="font-black text-red-600 text-lg">L{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-black text-stone-800">TOTAL A COBRAR:</span>
                  <span className="text-3xl font-black text-red-600">L {selectedOrder.total.toFixed(2)}</span>
                </div>
                <p className="text-center text-sm font-bold text-stone-600 mt-2">💵 PAGO EN EFECTIVO</p>
              </div>

              {/* Status Buttons - Step by step flow */}
              <div className="space-y-3">
                <p className="font-bold text-sm text-stone-600">Cambiar Estado:</p>
                
                {/* Step 1: Accept */}
                {selectedOrder.status === 'pending' && (
                  <Button
                    onClick={() => handleUpdateOrderStatus(selectedOrder.order_id, 'accepted')}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 text-lg"
                  >
                    ✓ ACEPTAR ORDEN
                  </Button>
                )}
                
                {/* Step 2: Ready */}
                {selectedOrder.status === 'accepted' && (
                  <Button
                    onClick={() => handleUpdateOrderStatus(selectedOrder.order_id, 'ready')}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 text-lg"
                  >
                    ✓ MARCAR COMO LISTA
                  </Button>
                )}
                
                {/* Step 3: Complete */}
                {selectedOrder.status === 'ready' && (
                  <Button
                    onClick={() => handleUpdateOrderStatus(selectedOrder.order_id, 'completed')}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 text-lg"
                  >
                    ✓ ORDEN ENTREGADA
                  </Button>
                )}
                
                {/* Completed state */}
                {selectedOrder.status === 'completed' && (
                  <div className="text-center py-4 bg-green-100 rounded-xl">
                    <p className="text-green-700 font-bold text-lg">✅ Orden completada</p>
                  </div>
                )}
                
                {/* Cancelled state */}
                {selectedOrder.status === 'cancelled' && (
                  <div className="text-center py-4 bg-red-100 rounded-xl">
                    <p className="text-red-700 font-bold text-lg">❌ Orden cancelada</p>
                  </div>
                )}
                
                {/* Cancel button - available except when completed */}
                {selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && (
                  <Button
                    onClick={() => handleUpdateOrderStatus(selectedOrder.order_id, 'cancelled')}
                    variant="outline"
                    className="w-full border-red-300 text-red-600 hover:bg-red-50 font-bold"
                  >
                    ✗ Cancelar Orden
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Pulperia Dialog - Panel de Personalización Renovado */}
      <Dialog open={showPulperiaDialog} onOpenChange={setShowPulperiaDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-stone-950 border-stone-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3 text-white">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <StoreIcon className="w-5 h-5 text-white" />
              </div>
              {editingPulperia ? 'Personalizar Mi Pulpería' : 'Crear Nueva Pulpería'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleCreatePulperia} className="space-y-5 mt-2">
            
            {/* Vista Previa en Vivo - Siempre visible arriba */}
            <div className="rounded-2xl overflow-hidden border border-stone-800 bg-stone-900">
              {/* Banner Preview */}
              <div 
                className="h-24 relative"
                style={{ 
                  backgroundColor: pulperiaForm.background_color || '#DC2626',
                  backgroundImage: pulperiaForm.banner_url ? `url(${pulperiaForm.banner_url})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-transparent" />
              </div>
              
              {/* Profile Section */}
              <div className="px-4 pb-4 -mt-10 relative">
                <div className="flex items-end gap-3">
                  {pulperiaForm.logo_url ? (
                    <img
                      src={pulperiaForm.logo_url}
                      alt="Logo"
                      className="w-16 h-16 rounded-xl object-cover border-4 border-stone-900 shadow-lg"
                    />
                  ) : (
                    <div 
                      className="w-16 h-16 rounded-xl border-4 border-stone-900 flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: pulperiaForm.background_color || '#DC2626' }}
                    >
                      <StoreIcon className="w-7 h-7 text-white/80" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 pb-1">
                    <h3 className={`text-lg text-white truncate ${FONT_OPTIONS.find(f => f.value === pulperiaForm.title_font)?.preview || 'font-black'}`}>
                      {pulperiaForm.name || 'Nombre de tu Pulpería'}
                    </h3>
                    <p className="text-xs text-stone-500 truncate">
                      {pulperiaForm.address || 'Tu dirección aparecerá aquí'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 1: Información Básica */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <StoreIcon className="w-3.5 h-3.5 text-red-400" />
                </div>
                Información Básica
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-stone-300 text-sm">Nombre del Negocio *</Label>
                  <Input
                    required
                    value={pulperiaForm.name}
                    onChange={(e) => setPulperiaForm({ ...pulperiaForm, name: e.target.value })}
                    placeholder="Ej: Pulpería Don José"
                    className="mt-1.5 bg-stone-900 border-stone-700 text-white placeholder:text-stone-600 focus:border-red-500 focus:ring-red-500/20"
                  />
                </div>
                <div>
                  <Label className="text-stone-300 text-sm">Descripción</Label>
                  <Textarea
                    value={pulperiaForm.description}
                    onChange={(e) => setPulperiaForm({ ...pulperiaForm, description: e.target.value })}
                    placeholder="Cuéntale a tus clientes qué te hace especial..."
                    rows={2}
                    className="mt-1.5 bg-stone-900 border-stone-700 text-white placeholder:text-stone-600 focus:border-red-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Sección 2: Imágenes */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Image className="w-3.5 h-3.5 text-blue-400" />
                </div>
                Imágenes
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-stone-300 text-sm mb-1.5 block">Logo</Label>
                  <ImageUpload
                    value={pulperiaForm.logo_url}
                    onChange={(url) => setPulperiaForm({ ...pulperiaForm, logo_url: url })}
                    aspectRatio="square"
                    placeholder="Subir logo"
                    maxSize={5}
                  />
                </div>
                <div>
                  <Label className="text-stone-300 text-sm mb-1.5 block">Banner</Label>
                  <ImageUpload
                    value={pulperiaForm.banner_url}
                    onChange={(url) => setPulperiaForm({ ...pulperiaForm, banner_url: url })}
                    aspectRatio="banner"
                    placeholder="Subir banner"
                    maxSize={5}
                  />
                </div>
              </div>
            </div>

            {/* Sección 3: Ubicación */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5 text-green-400" />
                </div>
                Ubicación
              </h3>
              
              <Button
                type="button"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className="w-full bg-stone-800 hover:bg-stone-700 text-white border border-stone-700"
              >
                {gettingLocation ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Obteniendo ubicación...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {pulperiaForm.lat ? 'Actualizar Ubicación GPS' : 'Obtener Mi Ubicación'}
                  </span>
                )}
              </Button>
              
              {pulperiaForm.lat && pulperiaForm.lng && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-green-400 text-sm font-medium">Ubicación guardada</p>
                    <p className="text-green-400/60 text-xs">
                      {parseFloat(pulperiaForm.lat).toFixed(4)}, {parseFloat(pulperiaForm.lng).toFixed(4)}
                    </p>
                  </div>
                </div>
              )}
              
              {!pulperiaForm.lat && !editingPulperia && (
                <p className="text-amber-400/80 text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  Requerido para crear tu pulpería
                </p>
              )}
              
              <Input
                required
                value={pulperiaForm.address}
                onChange={(e) => setPulperiaForm({ ...pulperiaForm, address: e.target.value })}
                placeholder="Dirección completa"
                className="bg-stone-900 border-stone-700 text-white placeholder:text-stone-600"
              />
            </div>

            {/* Sección 4: Contacto */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Phone className="w-3.5 h-3.5 text-purple-400" />
                </div>
                Contacto
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={pulperiaForm.phone}
                  onChange={(e) => setPulperiaForm({ ...pulperiaForm, phone: e.target.value })}
                  placeholder="Teléfono"
                  className="bg-stone-900 border-stone-700 text-white placeholder:text-stone-600"
                />
                <Input
                  value={pulperiaForm.hours}
                  onChange={(e) => setPulperiaForm({ ...pulperiaForm, hours: e.target.value })}
                  placeholder="Horario"
                  className="bg-stone-900 border-stone-700 text-white placeholder:text-stone-600"
                />
              </div>
            </div>

            {/* Sección 5: Personalización Visual */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-pink-500/20 flex items-center justify-center">
                  <Palette className="w-3.5 h-3.5 text-pink-400" />
                </div>
                Estilo Visual
              </h3>
              
              {/* Color Selection */}
              <div>
                <Label className="text-stone-400 text-xs mb-2 block">Color de tu marca</Label>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_OPTIONS.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setPulperiaForm({ ...pulperiaForm, background_color: color.value })}
                      className={`w-10 h-10 rounded-xl transition-all ${
                        pulperiaForm.background_color === color.value
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-stone-950 scale-110'
                          : 'hover:scale-105 opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
              
              {/* Font Selection */}
              <div>
                <Label className="text-stone-400 text-xs mb-2 block">Estilo del nombre</Label>
                <div className="grid grid-cols-2 gap-2">
                  {FONT_OPTIONS.map(font => (
                    <button
                      key={font.value}
                      type="button"
                      onClick={() => setPulperiaForm({ ...pulperiaForm, title_font: font.value })}
                      className={`p-3 rounded-xl border transition-all text-left ${
                        pulperiaForm.title_font === font.value
                          ? 'border-red-500 bg-red-500/10 text-white'
                          : 'border-stone-800 bg-stone-900 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <span className={`text-sm ${font.preview}`}>{font.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="pt-4 border-t border-stone-800">
              <Button 
                type="submit" 
                className="w-full py-5 text-base font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: pulperiaForm.background_color || '#DC2626' }}
                disabled={(!editingPulperia && (!pulperiaForm.lat || !pulperiaForm.lng)) || uploadingLogo}
              >
                {editingPulperia ? 'Guardar Cambios' : 'Crear Mi Pulpería'}
              </Button>
              {!editingPulperia && (!pulperiaForm.lat || !pulperiaForm.lng) && (
                <p className="text-center text-xs text-amber-400/60 mt-3">
                  Primero obtén tu ubicación GPS
                </p>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar' : 'Agregar'} Producto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateProduct} className="space-y-4">
            <div>
              <Label>Nombre *</Label>
              <Input
                required
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              />
            </div>
            <div>
              <Label>Precio (L) *</Label>
              <Input
                required
                type="number"
                step="0.01"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
              />
            </div>
            <div>
              <Label>Categoría</Label>
              <Input
                placeholder="Ej: Bebidas, Snacks, etc."
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
              />
            </div>
            <div>
              <Label>Imagen del Producto</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="cursor-pointer"
              />
              {uploadingImage && (
                <p className="text-sm text-stone-500 mt-1">Cargando imagen...</p>
              )}
              {productForm.image_url && (
                <div className="mt-3">
                  <img
                    src={productForm.image_url}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg border border-stone-200"
                  />
                </div>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={uploadingImage}>
              {editingProduct ? 'Actualizar' : 'Crear'} Producto
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Job Dialog */}
      <Dialog open={showJobDialog} onOpenChange={setShowJobDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Publicar Oferta de Empleo
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateJob} className="space-y-4">
            <div>
              <Label>Título del puesto *</Label>
              <Input
                required
                value={jobForm.title}
                onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                placeholder="Ej: Vendedor de mostrador"
              />
            </div>
            
            <div>
              <Label>Categoría *</Label>
              <select
                required
                value={jobForm.category}
                onChange={(e) => setJobForm({ ...jobForm, category: e.target.value })}
                className="w-full border border-stone-300 rounded-lg px-3 py-2"
              >
                <option value="">Seleccionar...</option>
                {JOB_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <Label>Descripción *</Label>
              <Textarea
                required
                value={jobForm.description}
                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                placeholder="Describe el trabajo, requisitos, horario..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Pago por hora *</Label>
                <Input
                  required
                  type="number"
                  value={jobForm.pay_rate}
                  onChange={(e) => setJobForm({ ...jobForm, pay_rate: e.target.value })}
                />
              </div>
              <div>
                <Label>Moneda</Label>
                <select
                  value={jobForm.pay_currency}
                  onChange={(e) => setJobForm({ ...jobForm, pay_currency: e.target.value })}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2"
                >
                  <option value="HNL">Lempiras (L)</option>
                  <option value="USD">Dólares ($)</option>
                </select>
              </div>
            </div>
            
            <div>
              <Label>Ubicación del trabajo *</Label>
              <Input
                required
                value={jobForm.location}
                onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                placeholder="Ciudad o zona"
              />
            </div>
            
            <div>
              <Label>Contacto para aplicar *</Label>
              <Input
                required
                value={jobForm.contact}
                onChange={(e) => setJobForm({ ...jobForm, contact: e.target.value })}
                placeholder="Teléfono o email"
              />
            </div>
            
            <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
              <p>💼 Esta oferta aparecerá en:</p>
              <ul className="list-disc list-inside mt-1 text-xs">
                <li>Tu perfil de pulpería</li>
                <li>La sección de empleos con tu logo oficial</li>
              </ul>
            </div>
            
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Publicar Empleo
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Announcement Dialog */}
      <Dialog open={showAnnouncementDialog} onOpenChange={setShowAnnouncementDialog}>
        <DialogContent className="max-w-md bg-stone-900 border-stone-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-orange-400" />
              Crear Anuncio
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateAnnouncement} className="space-y-4">
            <div>
              <Label className="text-white">Contenido del anuncio *</Label>
              <Textarea
                required
                value={announcementForm.content}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                placeholder="Escribe tu anuncio aquí... ofertas, promociones, novedades"
                className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500"
                rows={4}
              />
            </div>
            
            <ImageUpload
              value={announcementForm.image_url}
              onChange={(url) => setAnnouncementForm({ ...announcementForm, image_url: url })}
              label="Imagen del anuncio (opcional)"
              aspectRatio="product"
              placeholder="Seleccionar imagen"
              maxSize={5}
            />
            
            <div>
              <Label className="text-white">Tags (separados por coma)</Label>
              <Input
                value={announcementForm.tags}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, tags: e.target.value })}
                placeholder="oferta, nuevo, promoción"
                className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500"
              />
            </div>
            
            <div className="bg-orange-900/30 rounded-lg p-3 text-sm text-orange-300 border border-orange-700/50">
              <p>📢 Tu anuncio aparecerá en:</p>
              <ul className="list-disc list-inside mt-1 text-xs text-orange-400">
                <li>Tu perfil de pulpería (sección Anuncios)</li>
                <li>Visible para todos los clientes</li>
              </ul>
            </div>
            
            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-500">
              Publicar Anuncio
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <BottomNav user={user} />
    </div>
  );
};

export default PulperiaDashboard;