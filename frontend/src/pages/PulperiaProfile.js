import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { MapPin, Phone, Clock, Plus, Minus, ShoppingCart, ArrowLeft, Star, Send, Camera, Check, X, Briefcase, Mail, Globe, DollarSign, Package } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-orange-50">
        <div className="w-16 h-16 border-4 border-red-200 rounded-full animate-spin border-t-red-600"></div>
      </div>
    );
  }

  if (!pulperia) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-orange-50">
        <p className="text-stone-500">Pulpería no encontrada</p>
      </div>
    );
  }

  const bgColor = pulperia.background_color || '#DC2626';
  const fontClass = FONT_CLASSES[pulperia.title_font] || FONT_CLASSES.default;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50 pb-24">
      {/* Header */}
      <div className="relative h-48" style={{ background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}dd 100%)` }}>
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 bg-white/20 p-2 rounded-full text-white hover:bg-white/30">
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        {pulperia.logo_url && (
          <div className="absolute -bottom-12 left-6">
            <img src={pulperia.logo_url} alt={pulperia.name} className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl object-cover" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-6 pt-16 pb-4">
        <h1 className={`text-2xl ${fontClass} text-stone-800`}>{pulperia.name}</h1>
        
        {pulperia.rating > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="font-bold text-stone-700">{pulperia.rating.toFixed(1)}</span>
            <span className="text-stone-500 text-sm">({pulperia.review_count} reviews)</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-3 text-sm text-stone-600">
          {pulperia.address && (
            <div className="flex items-center gap-1"><MapPin className="w-4 h-4 text-red-500" />{pulperia.address}</div>
          )}
          {pulperia.phone && (
            <a href={`tel:${pulperia.phone}`} className="flex items-center gap-1"><Phone className="w-4 h-4 text-green-500" />{pulperia.phone}</a>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex bg-white rounded-xl p-1 shadow-sm">
          {['products', 'empleos', 'reviews'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white' : 'text-stone-600'
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
          <div className="grid grid-cols-2 gap-3">
            {products.map(product => {
              const qty = getCartQuantity(product.product_id);
              return (
                <div key={product.product_id} className="bg-white rounded-xl shadow-sm border border-red-50 overflow-hidden hover:shadow-md transition-all">
                  <div className="h-24 bg-red-100 flex items-center justify-center">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-8 h-8 text-red-300" />
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-stone-800 text-sm truncate">{product.name}</h3>
                    <p className="text-red-600 font-black text-lg">L{product.price.toFixed(0)}</p>
                    
                    {qty > 0 ? (
                      <div className="flex items-center justify-between mt-2 bg-red-100 rounded-lg">
                        <button onClick={() => removeFromCart(product.product_id)} className="p-2">
                          <Minus className="w-4 h-4 text-red-600" />
                        </button>
                        <span className="font-bold text-red-700">{qty}</span>
                        <button onClick={() => addToCart(product)} className="p-2">
                          <Plus className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(product)} className="w-full mt-2 bg-gradient-to-r from-red-600 to-orange-500 text-white py-2 rounded-lg text-sm font-bold">
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
                <div key={job.job_id} className="bg-white rounded-xl p-4 shadow-sm border border-red-50">
                  <h3 className="font-bold text-stone-800">{job.title}</h3>
                  <p className="text-stone-600 text-sm mt-1">{job.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span className="font-bold text-green-600">L{job.pay_rate}/{job.pay_currency}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-3">
            {user?.user_type === 'cliente' && !hasReviewed && (
              <button onClick={() => setShowReviewDialog(true)} className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white py-3 rounded-xl font-bold">
                Dejar Review
              </button>
            )}
            
            {reviews.length === 0 ? (
              <p className="text-center text-stone-500 py-8">No hay reviews aún</p>
            ) : (
              reviews.map(review => (
                <div key={review.review_id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="font-bold text-stone-800">{review.user_name}</div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-stone-200'}`} />
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="text-stone-600 text-sm mt-2">{review.comment}</p>}
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
