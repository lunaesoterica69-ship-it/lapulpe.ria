import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { MapPin, Phone, Clock, Plus, Minus, ShoppingCart, ArrowLeft, Star, Send, Camera, Check, X, Briefcase, Mail, Globe, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Font options for customization
const FONT_CLASSES = {
  default: 'font-black',
  serif: 'font-serif font-bold',
  script: 'font-serif italic',
  bold: 'font-extrabold tracking-tight'
};

const PulperiaProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [pulperia, setPulperia] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewImages, setReviewImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, pulperiaRes, productsRes, reviewsRes, jobsRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/auth/me`, { withCredentials: true }),
          axios.get(`${BACKEND_URL}/api/pulperias/${id}`),
          axios.get(`${BACKEND_URL}/api/pulperias/${id}/products`),
          axios.get(`${BACKEND_URL}/api/pulperias/${id}/reviews`),
          axios.get(`${BACKEND_URL}/api/pulperias/${id}/jobs`).catch(() => ({ data: [] }))
        ]);
        
        setUser(userRes.data);
        setPulperia(pulperiaRes.data);
        setProducts(productsRes.data.filter(p => p.available !== false));
        setReviews(reviewsRes.data);
        setJobs(jobsRes.data);
        
        const userReview = reviewsRes.data.find(r => r.user_id === userRes.data.user_id);
        setHasReviewed(!!userReview);
        
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error al cargar la pulpería');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product_id === product.product_id);
    let newCart;
    
    if (existingItem) {
      newCart = cart.map(item =>
        item.product_id === product.product_id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1, pulperia_id: id }];
    }
    
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    toast.success(`${product.name} agregado al carrito`);
  };

  const removeFromCart = (productId) => {
    const existingItem = cart.find(item => item.product_id === productId);
    let newCart;
    
    if (existingItem && existingItem.quantity > 1) {
      newCart = cart.map(item =>
        item.product_id === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    } else {
      newCart = cart.filter(item => item.product_id !== productId);
    }
    
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const getCartQuantity = (productId) => {
    const item = cart.find(item => item.product_id === productId);
    return item ? item.quantity : 0;
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files).slice(0, 2);
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
      setReviewImages(validImages);
      toast.success(`${validImages.length} imagen(es) cargada(s)`);
    } catch (error) {
      toast.error('Error al cargar imágenes');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmitReview = async () => {
    if (user.user_type !== 'cliente') {
      toast.error('Solo clientes pueden dejar reviews');
      return;
    }

    if (hasReviewed) {
      toast.error('Ya dejaste una review para esta pulpería');
      return;
    }

    try {
      await axios.post(
        `${BACKEND_URL}/api/pulperias/${id}/reviews`,
        { rating, comment, images: reviewImages },
        { withCredentials: true }
      );

      toast.success('¡Review enviada exitosamente!');
      setShowReviewDialog(false);
      setRating(5);
      setComment('');
      setReviewImages([]);
      setHasReviewed(true);

      const [reviewsRes, pulperiaRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/pulperias/${id}/reviews`),
        axios.get(`${BACKEND_URL}/api/pulperias/${id}`)
      ]);
      setReviews(reviewsRes.data);
      setPulperia(pulperiaRes.data);
    } catch (error) {
      console.error('Error submitting review:', error);
      const msg = error.response?.data?.detail;
      toast.error(typeof msg === 'string' ? msg : 'Error al enviar review');
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

  if (!pulperia) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-xl text-stone-600">Pulpería no encontrada</p>
      </div>
    );
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const bgColor = pulperia.background_color || '#DC2626';
  const fontClass = FONT_CLASSES[pulperia.title_font] || FONT_CLASSES.default;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Custom Header with pulperia's brand colors */}
      <div 
        className="text-white px-6 py-8"
        style={{ background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}dd 100%)` }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-4 text-white/90 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6">
          {/* Large Logo */}
          {pulperia.logo_url ? (
            <img
              src={pulperia.logo_url}
              alt={pulperia.name}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-2xl"
            />
          ) : (
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-5xl">🏪</span>
            </div>
          )}
          
          <div className="flex-1 text-center md:text-left">
            <h1 className={`text-4xl md:text-5xl mb-3 ${fontClass}`}>{pulperia.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 ${
                      star <= (pulperia.rating || 0)
                        ? 'fill-yellow-300 text-yellow-300'
                        : 'text-white/40'
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-xl">{pulperia.rating?.toFixed(1) || '0.0'}</span>
              <span className="text-white/80">({pulperia.review_count || 0} reviews)</span>
            </div>
            
            {pulperia.description && (
              <p className="text-white/90 text-lg max-w-xl">{pulperia.description}</p>
            )}
          </div>
        </div>
        
        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <a 
            href={`https://www.google.com/maps?q=${pulperia.location.lat},${pulperia.location.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl p-3 flex items-center gap-3 transition-all"
          >
            <MapPin className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm truncate">{pulperia.address}</span>
          </a>
          
          {pulperia.phone && (
            <a 
              href={`tel:${pulperia.phone}`}
              className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl p-3 flex items-center gap-3 transition-all"
            >
              <Phone className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{pulperia.phone}</span>
            </a>
          )}
          
          {pulperia.email && (
            <a 
              href={`mailto:${pulperia.email}`}
              className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl p-3 flex items-center gap-3 transition-all"
            >
              <Mail className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm truncate">{pulperia.email}</span>
            </a>
          )}
          
          {pulperia.hours && (
            <div className="bg-white/20 backdrop-blur rounded-xl p-3 flex items-center gap-3">
              <Clock className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{pulperia.hours}</span>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <div className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold flex items-center gap-2">
            💵 Solo Efectivo
          </div>
          
          {user?.user_type === 'cliente' && !hasReviewed && (
            <button
              onClick={() => setShowReviewDialog(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 transition-all"
            >
              <Star className="w-4 h-4" />
              Dejar Review
            </button>
          )}
          
          {hasReviewed && (
            <div className="bg-green-500/30 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2">
              <Check className="w-4 h-4" />
              Ya dejaste tu review
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="sticky top-0 z-10 bg-white border-b border-stone-200 px-6">
        <div className="flex gap-1 overflow-x-auto py-2">
          {[
            { id: 'products', label: 'Productos', icon: '🛒', count: products.length },
            { id: 'jobs', label: 'Empleos', icon: '💼', count: jobs.length },
            { id: 'reviews', label: 'Reviews', icon: '⭐', count: reviews.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary text-white' 
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-white/30' : 'bg-stone-300'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {/* Products Tab */}
        {activeTab === 'products' && (
          <>
            {products.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl">
                <span className="text-6xl mb-4 block">📦</span>
                <p className="text-stone-500">Esta pulpería aún no tiene productos disponibles</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => {
                  const quantity = getCartQuantity(product.product_id);
                  
                  return (
                    <div
                      key={product.product_id}
                      className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden card-hover"
                    >
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-40 object-cover"
                        />
                      )}
                      
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg text-stone-800">{product.name}</h3>
                          {product.category && (
                            <span className="text-xs px-2 py-1 rounded-full font-semibold"
                              style={{ backgroundColor: `${bgColor}20`, color: bgColor }}
                            >
                              {product.category}
                            </span>
                          )}
                        </div>
                        
                        {product.description && (
                          <p className="text-sm text-stone-600 mb-3">{product.description}</p>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <p className="text-2xl font-black" style={{ color: bgColor }}>
                            L {product.price.toFixed(2)}
                          </p>
                          
                          {quantity > 0 ? (
                            <div className="flex items-center gap-2 rounded-full px-2 py-1"
                              style={{ backgroundColor: `${bgColor}20` }}
                            >
                              <button
                                onClick={() => removeFromCart(product.product_id)}
                                className="bg-white rounded-full p-1 hover:bg-stone-100 transition-colors"
                              >
                                <Minus className="w-4 h-4" style={{ color: bgColor }} strokeWidth={3} />
                              </button>
                              <span className="font-bold w-6 text-center" style={{ color: bgColor }}>{quantity}</span>
                              <button
                                onClick={() => addToCart(product)}
                                className="bg-white rounded-full p-1 hover:bg-stone-100 transition-colors"
                              >
                                <Plus className="w-4 h-4" style={{ color: bgColor }} strokeWidth={3} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(product)}
                              className="text-white p-2 rounded-full hover:opacity-90 transition-all"
                              style={{ backgroundColor: bgColor }}
                            >
                              <ShoppingCart className="w-5 h-5" strokeWidth={2.5} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <>
            {jobs.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl">
                <span className="text-6xl mb-4 block">💼</span>
                <p className="text-stone-500">Esta pulpería no tiene ofertas de empleo activas</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map(job => (
                  <div
                    key={job.job_id}
                    className="bg-white rounded-2xl shadow-sm border border-blue-100 p-5 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      {pulperia.logo_url && (
                        <img
                          src={pulperia.logo_url}
                          alt={pulperia.name}
                          className="w-14 h-14 rounded-xl object-cover border-2 border-blue-100"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-stone-800 mb-1">{job.title}</h3>
                        <p className="text-sm text-blue-600 font-semibold mb-2">{pulperia.name}</p>
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
                        
                        <div className="mt-3 pt-3 border-t border-stone-100">
                          <p className="text-sm text-stone-600">
                            📞 Contacto: <strong>{job.contact}</strong>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <>
            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl">
                <span className="text-6xl mb-4 block">⭐</span>
                <p className="text-stone-500">Aún no hay reviews para esta pulpería</p>
                {user?.user_type === 'cliente' && !hasReviewed && (
                  <Button
                    onClick={() => setShowReviewDialog(true)}
                    className="mt-4"
                    style={{ backgroundColor: bgColor }}
                  >
                    ¡Sé el primero en dejar una review!
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.review_id}
                    className="bg-white rounded-2xl shadow-sm border border-orange-100 p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-stone-800">{review.user_name}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-stone-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-stone-500">
                        {new Date(review.created_at).toLocaleDateString('es-HN')}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-stone-600 text-sm mb-3">{review.comment}</p>
                    )}
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {review.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`Review ${idx + 1}`}
                            onClick={() => setSelectedImage(img)}
                            className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border-2 border-orange-100"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Disclaimer */}
      <div className="mx-6 mb-6 bg-stone-100 rounded-xl p-4 text-xs text-stone-600">
        ⚠️ <strong>Aviso:</strong> La comunicación directa entre usuarios es su responsabilidad. 
        Use la información de contacto proporcionada bajo su propio criterio.
      </div>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Dejar una Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold mb-2">Tu Calificación:</p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-2xl font-black text-stone-700">{rating}/5</span>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-semibold mb-2">Comentario (Opcional):</p>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Comparte tu experiencia..."
                className="min-h-[100px]"
              />
            </div>
            
            <div>
              <Label className="text-sm font-semibold mb-2 block">Fotos (máx. 2):</Label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer bg-stone-100 hover:bg-stone-200 rounded-xl p-4 flex flex-col items-center gap-2 transition-colors flex-1">
                  <Camera className="w-6 h-6 text-stone-500" />
                  <span className="text-xs text-stone-600">Agregar fotos</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImages}
                  />
                </label>
                {reviewImages.length > 0 && (
                  <div className="flex gap-2">
                    {reviewImages.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={img}
                          alt={`Preview ${idx + 1}`}
                          className="w-16 h-16 object-cover rounded-lg border-2 border-orange-200"
                        />
                        <button
                          onClick={() => setReviewImages(reviewImages.filter((_, i) => i !== idx))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <Button
              onClick={handleSubmitReview}
              className="w-full text-white font-bold py-3"
              style={{ backgroundColor: bgColor }}
              disabled={uploadingImages}
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar Review
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          {selectedImage && (
            <img src={selectedImage} alt="Review" className="w-full h-auto" />
          )}
        </DialogContent>
      </Dialog>

      <BottomNav user={user} cartCount={cartCount} />
    </div>
  );
};

export default PulperiaProfile;
