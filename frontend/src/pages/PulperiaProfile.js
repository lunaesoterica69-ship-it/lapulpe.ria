import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { MapPin, Phone, Clock, Plus, Minus, ShoppingCart, ArrowLeft, Star, Send, Camera, Check, X, Briefcase, Mail, Globe, DollarSign, Package, Megaphone, Image } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

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
  const [hasReviewed, setHasReviewed] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [announcements, setAnnouncements] = useState([]);

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
        
        // Fetch announcements
        try {
          const announcementsRes = await axios.get(`${BACKEND_URL}/api/pulperias/${id}/announcements`);
          setAnnouncements(announcementsRes.data);
        } catch (e) {
          setAnnouncements([]);
        }
        
        const userReview = reviewsRes.data.find(r => r.user_id === userRes.data.user_id);
        setHasReviewed(!!userReview);
        
        try {
          const savedCart = localStorage.getItem('cart');
          if (savedCart) setCart(JSON.parse(savedCart));
        } catch (e) {
          localStorage.removeItem('cart');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al cargar');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Save cart with minimal data
  const saveCart = (newCart) => {
    try {
      const minimalCart = newCart.map(item => ({
        product_id: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        pulperia_id: item.pulperia_id,
        pulperia_name: item.pulperia_name
      }));
      localStorage.setItem('cart', JSON.stringify(minimalCart));
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        localStorage.removeItem('cart');
        toast.error('Carrito reiniciado');
      }
    }
  };

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
      newCart = [...cart, {
        product_id: product.product_id,
        name: product.name,
        price: product.price,
        quantity: 1,
        pulperia_id: id,
        pulperia_name: pulperia?.name || 'Pulpería'
      }];
    }
    
    setCart(newCart);
    saveCart(newCart);
    toast.success(`${product.name} agregado`);
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
    saveCart(newCart);
  };

  const getCartQuantity = (productId) => {
    const item = cart.find(item => item.product_id === productId);
    return item ? item.quantity : 0;
  };

  const handleSubmitReview = async () => {
    if (rating < 1 || rating > 5) {
      toast.error('Rating debe estar entre 1 y 5');
      return;
    }

    try {
      await axios.post(`${BACKEND_URL}/api/pulperias/${id}/reviews`, {
        rating,
        comment,
        images: []
      }, { withCredentials: true });

      toast.success('¡Gracias por tu review!');
      setShowReviewDialog(false);
      setHasReviewed(true);
      
      const reviewsRes = await axios.get(`${BACKEND_URL}/api/pulperias/${id}/reviews`);
      setReviews(reviewsRes.data);
      
      const pulperiaRes = await axios.get(`${BACKEND_URL}/api/pulperias/${id}`);
      setPulperia(pulperiaRes.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al enviar review');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-red-800 to-red-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-400/30 rounded-full animate-spin border-t-white mx-auto"></div>
          <p className="text-white/80 mt-4 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!pulperia) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-red-800 to-red-900">
        <p className="text-white/70">Pulpería no encontrada</p>
      </div>
    );
  }

  const bgColor = pulperia.background_color || '#DC2626';
  const fontClass = FONT_CLASSES[pulperia.title_font] || FONT_CLASSES.default;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 pb-24">
      {/* Header */}
      <div className="relative h-56" style={{ background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}cc 50%, #1c1917 100%)` }}>
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm p-2.5 rounded-full text-white hover:bg-black/50 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        {pulperia.logo_url && (
          <div className="absolute -bottom-14 left-6">
            <img src={pulperia.logo_url} alt={pulperia.name} className="w-28 h-28 rounded-2xl border-4 border-stone-800 shadow-2xl object-cover" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-6 pt-18 pb-4" style={{ paddingTop: pulperia.logo_url ? '4.5rem' : '1.5rem' }}>
        <h1 className={`text-2xl ${fontClass} text-white`}>{pulperia.name}</h1>
        
        {pulperia.rating > 0 && (
          <div className="flex items-center gap-1 mt-2">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-white">{pulperia.rating.toFixed(1)}</span>
            <span className="text-stone-400 text-sm">({pulperia.review_count} reviews)</span>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mt-3 text-sm text-stone-400">
          {pulperia.address && (
            <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-red-400" />{pulperia.address}</div>
          )}
          {pulperia.phone && (
            <a href={`tel:${pulperia.phone}`} className="flex items-center gap-1.5 text-green-400 hover:text-green-300"><Phone className="w-4 h-4" />{pulperia.phone}</a>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex bg-stone-800/50 backdrop-blur-sm rounded-xl p-1 border border-stone-700/50">
          {['products', 'empleos', 'reviews'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg' : 'text-stone-400 hover:text-white'
              }`}
            >
              {tab === 'products' ? `Productos (${products.length})` : 
               tab === 'empleos' ? `Empleos (${jobs.length})` : 
               `Reviews (${reviews.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4">
        {activeTab === 'products' && (
          <div className="grid grid-cols-2 gap-4">
            {products.map(product => {
              const qty = getCartQuantity(product.product_id);
              return (
                <div key={product.product_id} className="bg-stone-800/50 backdrop-blur-sm rounded-2xl border border-stone-700/50 overflow-hidden hover:border-red-500/50 transition-all group">
                  <div className="h-40 bg-gradient-to-br from-stone-700 to-stone-800 flex items-center justify-center overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <Package className="w-12 h-12 text-stone-500" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white text-sm truncate">{product.name}</h3>
                    <p className="text-red-400 font-black text-xl mt-1">L{product.price.toFixed(0)}</p>
                    
                    {qty > 0 ? (
                      <div className="flex items-center justify-between mt-3 bg-stone-700/50 rounded-xl border border-stone-600">
                        <button onClick={() => removeFromCart(product.product_id)} className="p-2.5 hover:bg-stone-600 rounded-l-xl transition-colors">
                          <Minus className="w-4 h-4 text-red-400" />
                        </button>
                        <span className="font-bold text-white">{qty}</span>
                        <button onClick={() => addToCart(product)} className="p-2.5 hover:bg-stone-600 rounded-r-xl transition-colors">
                          <Plus className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(product)} className="w-full mt-3 bg-gradient-to-r from-red-600 to-red-500 text-white py-2.5 rounded-xl text-sm font-bold hover:from-red-500 hover:to-red-400 transition-all shadow-lg shadow-red-900/30">
                        Agregar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'empleos' && (
          <div className="space-y-3">
            {jobs.length === 0 ? (
              <p className="text-center text-stone-500 py-8">No hay empleos disponibles</p>
            ) : (
              jobs.map(job => (
                <div key={job.job_id} className="bg-stone-800/50 backdrop-blur-sm rounded-xl p-4 border border-stone-700/50">
                  <h3 className="font-bold text-white">{job.title}</h3>
                  <p className="text-stone-400 text-sm mt-1">{job.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="font-bold text-green-400">L{job.pay_rate}/{job.pay_currency}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-3">
            {user?.user_type === 'cliente' && !hasReviewed && (
              <button onClick={() => setShowReviewDialog(true)} className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-900/30">
                Dejar Review
              </button>
            )}
            
            {reviews.length === 0 ? (
              <p className="text-center text-stone-500 py-8">No hay reviews aún</p>
            ) : (
              reviews.map(review => (
                <div key={review.review_id} className="bg-stone-800/50 backdrop-blur-sm rounded-xl p-4 border border-stone-700/50">
                  <div className="flex items-center gap-2">
                    <div className="font-bold text-white">{review.user_name}</div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-600'}`} />
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="text-stone-400 text-sm mt-2">{review.comment}</p>}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Dejar Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rating</Label>
              <div className="flex gap-1 mt-1">
                {[1,2,3,4,5].map(i => (
                  <button key={i} onClick={() => setRating(i)}>
                    <Star className={`w-8 h-8 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-stone-200'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Comentario</Label>
              <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tu opinión..." />
            </div>
            <Button onClick={handleSubmitReview} className="w-full bg-red-600 hover:bg-red-700">Enviar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav user={user} cartCount={cartCount} />
    </div>
  );
};

export default PulperiaProfile;
