import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Briefcase, Search, Plus, MapPin, DollarSign, Trash2, Users, Wrench, Send, FileText, Phone, Mail, Eye, X, Check } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-stone-600 font-semibold">Cargando...</p>
        </div>
      </div>
    );
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <Header 
        user={user} 
        title="Empleos y Servicios" 
        subtitle="Encuentra trabajo u ofrece tus servicios"
      />
      
      <div className="bg-gradient-to-b from-blue-600 to-blue-700 text-white px-6 pb-6">
        {/* Disclaimer */}
        <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-xs mb-4">
          ⚠️ <strong>Aviso importante:</strong> La comunicación y acuerdos entre usuarios son su responsabilidad. 
          Verifique la información de contacto y use su criterio al contratar servicios o aceptar empleos.
        </div>
        
        {/* Search */}
        <div className="flex gap-2">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar..."
            className="bg-white/90 text-stone-800 border-0"
          />
          <Button className="bg-white text-blue-600 hover:bg-white/90">
            <Search className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        <Tabs defaultValue="jobs" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="jobs" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Briefcase className="w-4 h-4 mr-2" />
              Buscar Empleo
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Wrench className="w-4 h-4 mr-2" />
              Buscar Servicios
            </TabsTrigger>
          </TabsList>

          {/* Jobs Tab */}
          <TabsContent value="jobs">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white border-2 border-blue-100 rounded-xl px-4 py-2 font-semibold text-stone-700"
              >
                <option value="">Todas las categorías</option>
                {CATEGORIES.jobs.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              
              <Button
                onClick={() => setShowJobDialog(true)}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Publicar Empleo
              </Button>
            </div>

            <div className="space-y-4">
              {filterJobs().map(job => (
                <div
                  key={job.job_id}
                  className="bg-white rounded-2xl shadow-sm border border-blue-100 p-5 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-stone-800 mb-1">{job.title}</h3>
                      <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full mb-2">
                        {job.category}
                      </span>
                      <p className="text-stone-600 text-sm mb-3">{job.description}</p>
                      
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="flex items-center gap-1 text-stone-600 bg-stone-100 px-2 py-1 rounded-lg">
                          <MapPin className="w-4 h-4" /> {job.location}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                          <DollarSign className="w-4 h-4" /> 
                          {job.pay_rate} {job.pay_currency}/hora
                        </span>
                      </div>
                    </div>
                    
                    {user?.user_id === job.employer_user_id && (
                      <div className="flex flex-col gap-2 ml-3">
                        <button
                          onClick={() => handleViewApplications(job)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver aplicaciones"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.job_id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-blue-50 rounded-xl p-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-stone-700 flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {job.employer_name}
                      </p>
                      <p className="text-xs text-stone-600 mt-1">📞 {job.contact}</p>
                    </div>
                    
                    {user?.user_id !== job.employer_user_id && (
                      <Button
                        onClick={() => {
                          setSelectedJob(job);
                          setApplyForm({ contact: user?.email || '', cv_url: '', message: '' });
                          setShowApplyDialog(true);
                        }}
                        className="bg-blue-600 text-white hover:bg-blue-700"
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
                <div className="text-center py-12 bg-white rounded-2xl">
                  <Briefcase className="w-16 h-16 mx-auto text-stone-300 mb-4" />
                  <p className="text-stone-500">No hay empleos disponibles</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white border-2 border-blue-100 rounded-xl px-4 py-2 font-semibold text-stone-700"
              >
                <option value="">Todas las categorías</option>
                {CATEGORIES.services.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              
              <Button
                onClick={() => setShowServiceDialog(true)}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Ofrecer Servicio
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filterServices().map(service => (
                <div
                  key={service.service_id}
                  className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden hover:shadow-md transition-all"
                >
                  {service.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-1 max-h-48">
                      {service.images.slice(0, 4).map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`${service.title} ${idx + 1}`}
                          className="w-full h-24 object-cover"
                        />
                      ))}
                    </div>
                  )}
                  
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-stone-800 mb-1">{service.title}</h3>
                        <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                          {service.category}
                        </span>
                      </div>
                      
                      {user?.user_id === service.provider_user_id && (
                        <button
                          onClick={() => handleDeleteService(service.service_id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    
                    <p className="text-stone-600 text-sm mb-3">{service.description}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-black text-green-600">
                        {service.hourly_rate} {service.rate_currency}/hora
                      </span>
                    </div>
                    
                    <div className="bg-blue-50 rounded-xl p-3">
                      <p className="text-sm font-bold text-stone-700 flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {service.provider_name}
                      </p>
                      <p className="text-xs text-stone-600 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {service.location}
                      </p>
                      <p className="text-xs text-stone-600 mt-1">📞 {service.contact}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {filterServices().length === 0 && (
                <div className="col-span-2 text-center py-12 bg-white rounded-2xl">
                  <Wrench className="w-16 h-16 mx-auto text-stone-300 mb-4" />
                  <p className="text-stone-500">No hay servicios disponibles</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Job Dialog */}
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
                {CATEGORIES.jobs.map(cat => (
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
                placeholder="Describe el trabajo..."
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
              <Label>Ubicación *</Label>
              <Input
                required
                value={jobForm.location}
                onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                placeholder="Ciudad o zona"
              />
            </div>
            
            <div>
              <Label>Contacto *</Label>
              <Input
                required
                value={jobForm.contact}
                onChange={(e) => setJobForm({ ...jobForm, contact: e.target.value })}
                placeholder="Teléfono o email"
              />
            </div>
            
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              <Check className="w-4 h-4 mr-2" />
              Publicar Empleo
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Service Dialog */}
      <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-600" />
              Ofrecer un Servicio
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateService} className="space-y-4">
            <div>
              <Label>Título del servicio *</Label>
              <Input
                required
                value={serviceForm.title}
                onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                placeholder="Ej: Corte de césped profesional"
              />
            </div>
            
            <div>
              <Label>Categoría *</Label>
              <select
                required
                value={serviceForm.category}
                onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                className="w-full border border-stone-300 rounded-lg px-3 py-2"
              >
                <option value="">Seleccionar...</option>
                {CATEGORIES.services.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <Label>Descripción *</Label>
              <Textarea
                required
                value={serviceForm.description}
                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                placeholder="Describe tu servicio..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Precio por hora *</Label>
                <Input
                  required
                  type="number"
                  value={serviceForm.hourly_rate}
                  onChange={(e) => setServiceForm({ ...serviceForm, hourly_rate: e.target.value })}
                />
              </div>
              <div>
                <Label>Moneda</Label>
                <select
                  value={serviceForm.rate_currency}
                  onChange={(e) => setServiceForm({ ...serviceForm, rate_currency: e.target.value })}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2"
                >
                  <option value="HNL">Lempiras (L)</option>
                  <option value="USD">Dólares ($)</option>
                </select>
              </div>
            </div>
            
            <div>
              <Label>Ubicación *</Label>
              <Input
                required
                value={serviceForm.location}
                onChange={(e) => setServiceForm({ ...serviceForm, location: e.target.value })}
                placeholder="Ciudad o zona donde ofreces el servicio"
              />
            </div>
            
            <div>
              <Label>Contacto *</Label>
              <Input
                required
                value={serviceForm.contact}
                onChange={(e) => setServiceForm({ ...serviceForm, contact: e.target.value })}
                placeholder="Teléfono o email"
              />
            </div>
            
            <div>
              <Label>Fotos de tu trabajo (máx. 5)</Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploadingImages}
                className="cursor-pointer"
              />
              {serviceForm.images.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {serviceForm.images.map((img, idx) => (
                    <img key={idx} src={img} alt="" className="w-16 h-16 object-cover rounded-lg" />
                  ))}
                </div>
              )}
            </div>
            
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={uploadingImages}>
              <Check className="w-4 h-4 mr-2" />
              Publicar Servicio
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Apply to Job Dialog */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-600" />
              Aplicar a: {selectedJob?.title}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleApplyToJob} className="space-y-4">
            <div>
              <Label>Tu contacto (teléfono o email) *</Label>
              <Input
                required
                value={applyForm.contact}
                onChange={(e) => setApplyForm({ ...applyForm, contact: e.target.value })}
                placeholder="+504 9999-9999 o email@ejemplo.com"
              />
            </div>
            
            <div>
              <Label>Subir CV/Hoja de Vida (opcional)</Label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx,image/*"
                onChange={handleCVUpload}
                disabled={uploadingCV}
                className="cursor-pointer"
              />
              {applyForm.cv_url && (
                <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  CV cargado ✓
                </p>
              )}
              {uploadingCV && <p className="text-sm text-stone-500 mt-1">Cargando...</p>}
            </div>
            
            <div>
              <Label>Mensaje para el empleador</Label>
              <Textarea
                value={applyForm.message}
                onChange={(e) => setApplyForm({ ...applyForm, message: e.target.value })}
                placeholder="Preséntate brevemente y explica por qué eres buen candidato..."
                rows={4}
              />
            </div>
            
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={uploadingCV}>
              <Send className="w-4 h-4 mr-2" />
              Enviar Aplicación
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Applications Dialog */}
      <Dialog open={showApplicationsDialog} onOpenChange={setShowApplicationsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Aplicaciones para: {selectedJob?.title}
            </DialogTitle>
          </DialogHeader>
          
          {applications.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-stone-300 mb-3" />
              <p className="text-stone-500">Aún no hay aplicaciones</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {applications.map(app => (
                <div key={app.application_id} className="bg-blue-50 rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-stone-800">{app.applicant_name}</p>
                      <p className="text-sm text-stone-600 flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" />
                        {app.contact}
                      </p>
                    </div>
                    <span className="text-xs text-stone-500">
                      {new Date(app.created_at).toLocaleDateString('es-HN')}
                    </span>
                  </div>
                  
                  {app.message && (
                    <p className="text-sm text-stone-600 mt-3 bg-white rounded-lg p-3">
                      &quot;{app.message}&quot;
                    </p>
                  )}
                  
                  {app.cv_url && (
                    <a 
                      href={app.cv_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-3 text-sm text-blue-600 hover:text-blue-800"
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
