import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  Briefcase, Search, Plus, MapPin, DollarSign, Trash2, Users, Wrench, Send, 
  FileText, Phone, Eye, X, Check, Sparkles, Building2, Clock, ChevronRight
} from 'lucide-react';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import AnimatedBackground from '../components/AnimatedBackground';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CATEGORIES = {
  jobs: ['Ventas', 'Construcción', 'Limpieza', 'Cocina', 'Seguridad', 'Otro'],
  services: ['Jardinería', 'Limpieza', 'Plomería', 'Electricidad', 'Paseo de mascotas', 'Otro']
};

const JobsServices = () => {
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [showApplicationsDialog, setShowApplicationsDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState('jobs');
  
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    category: '',
    pay_rate: '',
    pay_currency: 'HNL',
    location: '',
    contact: ''
  });
  
  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    category: '',
    hourly_rate: '',
    rate_currency: 'HNL',
    location: '',
    contact: '',
    images: []
  });

  const [applyForm, setApplyForm] = useState({
    contact: '',
    cv_url: '',
    message: ''
  });
  
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, jobsRes, servicesRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/auth/me`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/jobs`),
        axios.get(`${BACKEND_URL}/api/services`)
      ]);
      
      setUser(userRes.data);
      setJobs(jobsRes.data);
      setServices(servicesRes.data);
      
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post(
        `${BACKEND_URL}/api/jobs`,
        {
          ...jobForm,
          pay_rate: parseFloat(jobForm.pay_rate)
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
      await fetchData();
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Error al publicar empleo');
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post(
        `${BACKEND_URL}/api/services`,
        {
          ...serviceForm,
          hourly_rate: parseFloat(serviceForm.hourly_rate)
        },
        { withCredentials: true }
      );
      
      toast.success('¡Servicio publicado!');
      setShowServiceDialog(false);
      setServiceForm({
        title: '',
        description: '',
        category: '',
        hourly_rate: '',
        rate_currency: 'HNL',
        location: '',
        contact: '',
        images: []
      });
      await fetchData();
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error('Error al publicar servicio');
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    if (files.length === 0) return;

    setUploadingImages(true);
    const imagePromises = files.map(file => {
      return new Promise((resolve, reject) => {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} supera 5MB`);
          resolve(null);
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    try {
      const images = await Promise.all(imagePromises);
      const validImages = images.filter(img => img !== null);
      setServiceForm({ ...serviceForm, images: validImages });
      toast.success(`${validImages.length} imagen(es) cargada(s)`);
    } catch (error) {
      toast.error('Error al cargar imágenes');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleCVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo no debe superar 10MB');
      return;
    }

    setUploadingCV(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setApplyForm({ ...applyForm, cv_url: reader.result });
        setUploadingCV(false);
        toast.success('CV cargado exitosamente');
      };
      reader.onerror = () => {
        toast.error('Error al cargar CV');
        setUploadingCV(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Error al procesar archivo');
      setUploadingCV(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/jobs/${jobId}`, { withCredentials: true });
      toast.success('Oferta eliminada');
      await fetchData();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Error al eliminar');
    }
  };

  const handleDeleteService = async (serviceId) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/services/${serviceId}`, { withCredentials: true });
      toast.success('Servicio eliminado');
      await fetchData();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Error al eliminar');
    }
  };

  const handleApplyToJob = async (e) => {
    e.preventDefault();
    
    if (!selectedJob) return;
    
    try {
      await axios.post(
        `${BACKEND_URL}/api/jobs/${selectedJob.job_id}/apply`,
        applyForm,
        { withCredentials: true }
      );
      
      toast.success('¡Aplicación enviada exitosamente!');
      setShowApplyDialog(false);
      setSelectedJob(null);
      setApplyForm({ contact: '', cv_url: '', message: '' });
    } catch (error) {
      console.error('Error applying to job:', error);
      const msg = error.response?.data?.detail;
      toast.error(typeof msg === 'string' ? msg : 'Error al aplicar');
    }
  };

  const handleViewApplications = async (job) => {
    setSelectedJob(job);
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/jobs/${job.job_id}/applications`,
        { withCredentials: true }
      );
      setApplications(response.data);
      setShowApplicationsDialog(true);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Error al cargar aplicaciones');
    }
  };

  const filterJobs = () => {
    let filtered = jobs;
    if (selectedCategory) {
      filtered = filtered.filter(job => job.category === selectedCategory);
    }
    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  };

  const filterServices = () => {
    let filtered = services;
    if (selectedCategory) {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }
    if (searchTerm) {
      filtered = filtered.filter(service => 
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <AnimatedBackground color="blue" />
        <div className="text-center relative z-10">
          <div className="w-16 h-16 border-4 border-blue-400/30 rounded-full animate-spin border-t-blue-500 mx-auto"></div>
          <p className="mt-4 text-stone-500 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-stone-950 pb-24">
      <AnimatedBackground color="blue" />
      
      {/* Header */}
      <Header 
        user={user} 
        title="Chamba" 
        subtitle="Empleos y Servicios"
      />
      
      {/* Search Section */}
      <div className="relative z-10 px-4 py-4">
        {/* Disclaimer */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
          <p className="text-blue-400/70 text-xs">
            <span className="text-blue-400 font-medium">Aviso:</span> La comunicación entre usuarios es su responsabilidad.
          </p>
        </div>
        
        {/* Search */}
        <div className="flex gap-2">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar empleos o servicios..."
            className="flex-1 bg-stone-900 text-white border border-stone-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl py-3 px-4 placeholder:text-stone-600"
          />
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-5 rounded-xl transition-colors">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="relative z-10 px-4 mb-4">
        <div className="flex bg-stone-900 rounded-xl p-1 border border-stone-800">
          <button
            onClick={() => { setActiveTab('jobs'); setSelectedCategory(''); }}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'jobs' 
                ? 'bg-blue-600 text-white' 
                : 'text-stone-500 hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Buscar Empleo
          </button>
          <button
            onClick={() => { setActiveTab('services'); setSelectedCategory(''); }}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'services' 
                ? 'bg-blue-600 text-white' 
                : 'text-stone-500 hover:text-white'
            }`}
          >
            <Wrench className="w-4 h-4" />
            Buscar Servicios
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-4">
        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            {/* Filters & Add */}
            <div className="flex flex-wrap justify-between items-center gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-stone-800/50 backdrop-blur-sm border border-stone-700/50 rounded-xl px-4 py-2.5 font-semibold text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las categorías</option>
                {CATEGORIES.jobs.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              
              <Button
                onClick={() => setShowJobDialog(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-900/30"
              >
                <Plus className="w-5 h-5 mr-2" />
                Publicar Empleo
              </Button>
            </div>

            {/* Jobs List */}
            <div className="space-y-4">
              {filterJobs().map(job => (
                <div
                  key={job.job_id}
                  className="bg-stone-800/50 backdrop-blur-sm rounded-2xl border border-stone-700/50 overflow-hidden hover:border-blue-500/50 transition-all group"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-500/30">
                            {job.category}
                          </span>
                          {job.pulperia_name && (
                            <span className="text-xs text-stone-500 flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {job.pulperia_name}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{job.title}</h3>
                        <p className="text-stone-400 text-sm line-clamp-2">{job.description}</p>
                      </div>
                      
                      {user?.user_id === job.employer_user_id && (
                        <div className="flex flex-col gap-2 ml-3">
                          <button
                            onClick={() => handleViewApplications(job)}
                            className="p-2.5 text-blue-400 hover:bg-blue-500/20 rounded-xl transition-colors border border-blue-500/30"
                            title="Ver aplicaciones"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job.job_id)}
                            className="p-2.5 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors border border-red-500/30"
                            title="Eliminar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-3 text-sm mb-4">
                      <span className="flex items-center gap-1.5 text-stone-400 bg-stone-700/50 px-3 py-1.5 rounded-lg">
                        <MapPin className="w-4 h-4 text-blue-400" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1.5 font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                        <DollarSign className="w-4 h-4" /> 
                        {job.pay_rate} {job.pay_currency}/hora
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-stone-900/50 px-5 py-4 flex justify-between items-center border-t border-stone-700/50">
                    <div>
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        {job.employer_name}
                      </p>
                      <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {job.contact}
                      </p>
                    </div>
                    
                    {user?.user_id !== job.employer_user_id && (
                      <Button
                        onClick={() => {
                          setSelectedJob(job);
                          setApplyForm({ contact: user?.email || '', cv_url: '', message: '' });
                          setShowApplyDialog(true);
                        }}
                        className="bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-900/30"
                        size="sm"
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Aplicar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {filterJobs().length === 0 && (
                <div className="text-center py-16 bg-stone-800/30 rounded-2xl border border-stone-700/50">
                  <div className="w-20 h-20 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-10 h-10 text-stone-600" />
                  </div>
                  <p className="text-stone-500 text-lg">No hay empleos disponibles</p>
                  <p className="text-stone-600 text-sm mt-1">¡Sé el primero en publicar!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            {/* Filters & Add */}
            <div className="flex flex-wrap justify-between items-center gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-stone-800/50 backdrop-blur-sm border border-stone-700/50 rounded-xl px-4 py-2.5 font-semibold text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las categorías</option>
                {CATEGORIES.services.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              
              <Button
                onClick={() => setShowServiceDialog(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-900/30"
              >
                <Plus className="w-5 h-5 mr-2" />
                Ofrecer Servicio
              </Button>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filterServices().map(service => (
                <div
                  key={service.service_id}
                  className="bg-stone-800/50 backdrop-blur-sm rounded-2xl border border-stone-700/50 overflow-hidden hover:border-blue-500/50 transition-all group"
                >
                  {service.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-0.5 max-h-40 overflow-hidden">
                      {service.images.slice(0, 4).map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`${service.title} ${idx + 1}`}
                          className="w-full h-20 object-cover"
                        />
                      ))}
                    </div>
                  )}
                  
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <span className="inline-block bg-blue-500/20 text-blue-400 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-500/30 mb-2">
                          {service.category}
                        </span>
                        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{service.title}</h3>
                      </div>
                      
                      {user?.user_id === service.provider_user_id && (
                        <button
                          onClick={() => handleDeleteService(service.service_id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors border border-red-500/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <p className="text-stone-400 text-sm mb-4 line-clamp-2">{service.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-black text-emerald-400">
                        {service.hourly_rate} {service.rate_currency}<span className="text-sm text-stone-500">/hora</span>
                      </span>
                    </div>
                    
                    <div className="bg-stone-900/50 rounded-xl p-3 border border-stone-700/50">
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        {service.provider_name}
                      </p>
                      <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {service.location}
                      </p>
                      <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {service.contact}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {filterServices().length === 0 && (
                <div className="col-span-2 text-center py-16 bg-stone-800/30 rounded-2xl border border-stone-700/50">
                  <div className="w-20 h-20 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wrench className="w-10 h-10 text-stone-600" />
                  </div>
                  <p className="text-stone-500 text-lg">No hay servicios disponibles</p>
                  <p className="text-stone-600 text-sm mt-1">¡Ofrece tu servicio!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Job Dialog */}
      <Dialog open={showJobDialog} onOpenChange={setShowJobDialog}>
        <DialogContent className="max-w-md bg-stone-900 border-stone-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              Publicar Oferta de Empleo
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateJob} className="space-y-4">
            <div>
              <Label className="text-white">Título del puesto *</Label>
              <Input
                required
                value={jobForm.title}
                onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                placeholder="Ej: Vendedor de mostrador"
                className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500"
              />
            </div>
            
            <div>
              <Label className="text-white">Categoría *</Label>
              <select
                required
                value={jobForm.category}
                onChange={(e) => setJobForm({ ...jobForm, category: e.target.value })}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Seleccionar...</option>
                {CATEGORIES.jobs.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <Label className="text-white">Descripción *</Label>
              <Textarea
                required
                value={jobForm.description}
                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                placeholder="Describe el trabajo, requisitos, horario..."
                className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white">Pago por hora *</Label>
                <Input
                  required
                  type="number"
                  value={jobForm.pay_rate}
                  onChange={(e) => setJobForm({ ...jobForm, pay_rate: e.target.value })}
                  className="bg-stone-800 border-stone-700 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Moneda</Label>
                <select
                  value={jobForm.pay_currency}
                  onChange={(e) => setJobForm({ ...jobForm, pay_currency: e.target.value })}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="HNL">Lempiras (L)</option>
                  <option value="USD">Dólares ($)</option>
                </select>
              </div>
            </div>
            
            <div>
              <Label className="text-white">Ubicación *</Label>
              <Input
                required
                value={jobForm.location}
                onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                placeholder="Ciudad o zona"
                className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500"
              />
            </div>
            
            <div>
              <Label className="text-white">Contacto *</Label>
              <Input
                required
                value={jobForm.contact}
                onChange={(e) => setJobForm({ ...jobForm, contact: e.target.value })}
                placeholder="Teléfono o email"
                className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500"
              />
            </div>
            
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-900/30">
              <Check className="w-4 h-4 mr-2" />
              Publicar Empleo
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Service Dialog */}
      <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
        <DialogContent className="max-w-md bg-stone-900 border-stone-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              Ofrecer un Servicio
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateService} className="space-y-4">
            <div>
              <Label className="text-white">Título del servicio *</Label>
              <Input
                required
                value={serviceForm.title}
                onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                placeholder="Ej: Corte de césped profesional"
                className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500"
              />
            </div>
            
            <div>
              <Label className="text-white">Categoría *</Label>
              <select
                required
                value={serviceForm.category}
                onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Seleccionar...</option>
                {CATEGORIES.services.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <Label className="text-white">Descripción *</Label>
              <Textarea
                required
                value={serviceForm.description}
                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                placeholder="Describe tu servicio..."
                className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white">Precio por hora *</Label>
                <Input
                  required
                  type="number"
                  value={serviceForm.hourly_rate}
                  onChange={(e) => setServiceForm({ ...serviceForm, hourly_rate: e.target.value })}
                  className="bg-stone-800 border-stone-700 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Moneda</Label>
                <select
                  value={serviceForm.rate_currency}
                  onChange={(e) => setServiceForm({ ...serviceForm, rate_currency: e.target.value })}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="HNL">Lempiras (L)</option>
                  <option value="USD">Dólares ($)</option>
                </select>
              </div>
            </div>
            
            <div>
              <Label className="text-white">Ubicación *</Label>
              <Input
                required
                value={serviceForm.location}
                onChange={(e) => setServiceForm({ ...serviceForm, location: e.target.value })}
                placeholder="Ciudad o zona donde ofreces el servicio"
                className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500"
              />
            </div>
            
            <div>
              <Label className="text-white">Contacto *</Label>
              <Input
                required
                value={serviceForm.contact}
                onChange={(e) => setServiceForm({ ...serviceForm, contact: e.target.value })}
                placeholder="Teléfono o email"
                className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500"
              />
            </div>
            
            <div>
              <Label className="text-white">Fotos de tu trabajo (máx. 5)</Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploadingImages}
                className="cursor-pointer bg-stone-800 border-stone-700 text-white"
              />
              {serviceForm.images.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {serviceForm.images.map((img, idx) => (
                    <img key={idx} src={img} alt="" className="w-16 h-16 object-cover rounded-lg border border-stone-700" />
                  ))}
                </div>
              )}
            </div>
            
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-900/30" disabled={uploadingImages}>
              <Check className="w-4 h-4 mr-2" />
              Publicar Servicio
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Apply to Job Dialog */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent className="max-w-md bg-stone-900 border-stone-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
              Aplicar a: {selectedJob?.title}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleApplyToJob} className="space-y-4">
            <div>
              <Label className="text-white">Tu contacto (teléfono o email) *</Label>
              <Input
                required
                value={applyForm.contact}
                onChange={(e) => setApplyForm({ ...applyForm, contact: e.target.value })}
                placeholder="+504 9999-9999 o email@ejemplo.com"
                className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500"
              />
            </div>
            
            <div>
              <Label className="text-white">Subir CV/Hoja de Vida (opcional)</Label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx,image/*"
                onChange={handleCVUpload}
                disabled={uploadingCV}
                className="cursor-pointer bg-stone-800 border-stone-700 text-white"
              />
              {applyForm.cv_url && (
                <p className="text-sm text-emerald-400 mt-1 flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  CV cargado ✓
                </p>
              )}
              {uploadingCV && <p className="text-sm text-stone-500 mt-1">Cargando...</p>}
            </div>
            
            <div>
              <Label className="text-white">Mensaje para el empleador</Label>
              <Textarea
                value={applyForm.message}
                onChange={(e) => setApplyForm({ ...applyForm, message: e.target.value })}
                placeholder="Preséntate brevemente..."
                rows={4}
                className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500"
              />
            </div>
            
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-900/30" disabled={uploadingCV}>
              <Send className="w-4 h-4 mr-2" />
              Enviar Aplicación
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Applications Dialog */}
      <Dialog open={showApplicationsDialog} onOpenChange={setShowApplicationsDialog}>
        <DialogContent className="max-w-lg bg-stone-900 border-stone-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Users className="w-5 h-5 text-blue-400" />
              Aplicaciones: {selectedJob?.title}
            </DialogTitle>
          </DialogHeader>
          
          {applications.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-stone-600 mb-3" />
              <p className="text-stone-500">Aún no hay aplicaciones</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {applications.map(app => (
                <div key={app.application_id} className="bg-stone-800/50 rounded-xl p-4 border border-stone-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-white">{app.applicant_name}</p>
                      <p className="text-sm text-stone-400 flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" />
                        {app.contact}
                      </p>
                    </div>
                    <span className="text-xs text-stone-500">
                      {new Date(app.created_at).toLocaleDateString('es-HN')}
                    </span>
                  </div>
                  
                  {app.message && (
                    <p className="text-sm text-stone-400 mt-3 bg-stone-900/50 rounded-lg p-3 border border-stone-700">
                      &quot;{app.message}&quot;
                    </p>
                  )}
                  
                  {app.cv_url && (
                    <a 
                      href={app.cv_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-3 text-sm text-blue-400 hover:text-blue-300"
                    >
                      <FileText className="w-4 h-4" />
                      Ver CV
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav user={user} cartCount={cartCount} />
    </div>
  );
};

export default JobsServices;
