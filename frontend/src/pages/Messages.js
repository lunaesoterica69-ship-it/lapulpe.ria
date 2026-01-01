import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { MessageCircle, Send } from 'lucide-react';
import BottomNav from '../components/BottomNav';

import { BACKEND_URL } from '../config/api';

const Messages = () => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, messagesRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/auth/me`, { withCredentials: true }),
          axios.get(`${BACKEND_URL}/api/messages`, { withCredentials: true })
        ]);
        
        setUser(userRes.data);
        setMessages(messagesRes.data);
        
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error al cargar mensajes');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-hero text-white px-6 py-8">
        <h1 className="text-3xl font-black mb-2">Mensajes</h1>
        <p className="text-white/90">Comunícate con las pulperías</p>
      </div>

      {/* Messages */}
      <div className="px-6 py-6">
        {messages.length === 0 ? (
          <div className="text-center py-16">
            <MessageCircle className="w-16 h-16 mx-auto text-stone-300 mb-4" />
            <p className="text-stone-500 text-lg mb-2">No tienes mensajes</p>
            <p className="text-stone-400 text-sm">
              Los mensajes aparecerán cuando te comuniques con las pulperías
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md border border-orange-100 p-4">
            <p className="text-stone-600 text-center py-8">
              Sistema de mensajería próximamente
            </p>
          </div>
        )}
      </div>

      <BottomNav user={user} cartCount={cartCount} />
    </div>
  );
};

export default Messages;