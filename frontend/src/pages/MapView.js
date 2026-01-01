import { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { MapPin, Store as StoreIcon, Star, Crown, Sparkles, ChevronRight, Maximize2, Minimize2, Heart, Map, List } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import AnimatedBackground from '../components/AnimatedBackground';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

import { api, BACKEND_URL } from '../config/api';

function LocationMarker({ position }) {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.flyTo(position, 14);
    }
  }, [map, position]);

  return position ? (
    <Marker position={position}>
      <Popup>Tu ubicación actual</Popup>
    </Marker>
  ) : null;
}

function MapResizer({ isExpanded }) {
  const map = useMap();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 350);
    return () => clearTimeout(timer);
  }, [map, isExpanded]);
  
  return null;
}

const MapView = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [pulperias, setPulperias] = useState([]);
  const [allPulperias, setAllPulperias] = useState([]);
  const [featuredPulperias, setFeaturedPulperias] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [radius, setRadius] = useState(50); // 50km default to show more stores
  const [cart, setCart] = useState([]);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('nearby'); // 'nearby' | 'favorites'

  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  const filterPulperiasByRadius = useCallback((pulperiasData, coords, radiusKm) => {
    const filtered = pulperiasData.filter(pulperia => {
      if (!pulperia.location) return false;
      const distance = calculateDistance(
        coords[0], coords[1],
        pulperia.location.lat, pulperia.location.lng
      );
      return distance <= radiusKm;
    });
    setPulperias(filtered);
  }, [calculateDistance]);

  // Fetch favorites
  const fetchFavorites = useCallback(async () => {
    try {
      const response = await api.get(`/api/favorites`);
      setFavorites(response.data);
    } catch (error) {
      /* Ignore - user might not be logged in */
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch pulperias first (doesn't require auth)
        const pulperiasRes = await api.get(`/api/pulperias`);
        setAllPulperias(pulperiasRes.data);
        
        // Try to get featured
        try {
          const featuredRes = await api.get(`/api/ads/featured`);
          setFeaturedPulperias(featuredRes.data);
        } catch (e) {
          setFeaturedPulperias([]);
        }
        
        // Try to get user (might not be logged in)
        try {
          const userRes = await api.get(`/api/auth/me`);
          setUser(userRes.data);
          fetchFavorites();
        } catch (e) {
          setUser(null);
        }

        // Get cart from localStorage
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }

        // Get user location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const coords = [position.coords.latitude, position.coords.longitude];
              setUserLocation(coords);
              filterPulperiasByRadius(pulperiasRes.data, coords, radius);
            },
            () => {
              // Use Siguatepeque as fallback (where the pulperias are)
              const fallbackCoords = [14.6, -87.83];
              setUserLocation(fallbackCoords);
              filterPulperiasByRadius(pulperiasRes.data, fallbackCoords, radius);
            },
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
          );
        } else {
          const fallbackCoords = [14.6, -87.83];
          setUserLocation(fallbackCoords);
          filterPulperiasByRadius(pulperiasRes.data, fallbackCoords, radius);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Still set a location so the map shows
        setUserLocation([14.6, -87.83]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filterPulperiasByRadius, radius, fetchFavorites]);

  useEffect(() => {
    if (userLocation && allPulperias.length > 0) {
      filterPulperiasByRadius(allPulperias, userLocation, radius);
    }
  }, [radius, userLocation, allPulperias, filterPulperiasByRadius]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      if (userLocation) {
        filterPulperiasByRadius(allPulperias, userLocation, radius);
      }
      return;
    }
    
    try {
      const response = await api.get(`/api/pulperias?search=${searchTerm}`);
      setPulperias(response.data);
    } catch (error) {
      toast.error('Error en la búsqueda');
    }
  };

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  // Display pulperias based on active tab
  const displayPulperias = activeTab === 'favorites' ? favorites : pulperias;

  if (loading || !userLocation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <AnimatedBackground variant="minimal" />
        <div className="text-center relative z-10">
          <div className="w-16 h-16 border-4 border-red-400/30 rounded-full animate-spin border-t-red-500 mx-auto"></div>
          <p className="mt-4 text-stone-500 font-medium">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 pb-24">
      <AnimatedBackground variant="minimal" />
      
      <Header 
        user={user} 
        title="Explorar" 
        subtitle={activeTab === 'favorites' ? `${favorites.length} favoritas` : `${pulperias.length} en ${radius} km`}
      />

      {/* Tabs: Nearby / Favorites */}
      <div className="relative z-10 px-4 pt-3 pb-2">
        <div className="flex gap-2 bg-stone-900 p-1 rounded-xl border border-stone-800">
          <button
            onClick={() => setActiveTab('nearby')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === 'nearby' 
                ? 'bg-red-600 text-white' 
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Map className="w-4 h-4" />
            Cercanas
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === 'favorites' 
                ? 'bg-red-600 text-white' 
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4" />
            Favoritas ({favorites.length})
          </button>
        </div>
      </div>

      {activeTab === 'nearby' && (
        <>
          {/* Search and Filters */}
          <div className="relative z-10 px-4 py-2">
            {/* Radius Selector */}
            <div className="mb-3">
              <div className="flex gap-2">
                {[2, 5, 10, 20].map(r => (
                  <button
                    key={r}
                    onClick={() => setRadius(r)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                      radius === r 
                        ? 'bg-red-600 text-white' 
                        : 'bg-stone-900 border border-stone-800 text-stone-400 hover:text-white'
                    }`}
                  >
                    {r} km
                  </button>
                ))}
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="flex gap-2">
              <input
                data-testid="search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Buscar pulpería..."
                className="flex-1 bg-stone-900 text-white border border-stone-800 focus:ring-2 focus:ring-red-500 focus:border-transparent rounded-xl py-3 px-4 placeholder:text-stone-600"
              />
              <button
                data-testid="search-button"
                onClick={handleSearch}
                className="bg-red-600 hover:bg-red-500 text-white font-medium px-5 rounded-xl transition-colors"
              >
                Buscar
              </button>
            </div>
          </div>

          {/* Featured Pulperias */}
          {featuredPulperias.length > 0 && (
            <div className="px-4 pt-3">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white">Destacadas</h2>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
                {featuredPulperias.map((pulperia) => {
                  const bgColor = pulperia.background_color || '#B91C1C';
                  return (
                    <div
                      key={pulperia.pulperia_id}
                      onClick={() => navigate(`/pulperia/${pulperia.pulperia_id}`)}
                      className="flex-shrink-0 w-48 rounded-2xl p-3 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] border border-white/10"
                      style={{ background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}99 100%)` }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {pulperia.logo_url ? (
                          <img
                            src={pulperia.logo_url}
                            alt={pulperia.name}
                            className="w-9 h-9 rounded-full object-cover border-2 border-white/30"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                            <StoreIcon className="w-4 h-4" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold truncate text-sm">{pulperia.name}</h3>
                        </div>
                      </div>
                      {pulperia.rating > 0 && (
                        <div className="flex items-center gap-1 text-xs">
                          <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                          <span className="font-bold">{pulperia.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mini Map */}
          <div className="px-4 py-3">
            <div className={`rounded-2xl overflow-hidden shadow-lg border border-stone-700 relative transition-all duration-300 ${
              isMapFullscreen ? 'h-[60vh]' : 'h-40'
            }`}>
              <button
                onClick={() => setIsMapFullscreen(!isMapFullscreen)}
                className="absolute top-2 right-2 z-[1000] bg-stone-800/90 hover:bg-stone-700 p-2 rounded-xl shadow-lg border border-stone-600 transition-all"
              >
                {isMapFullscreen ? (
                  <Minimize2 className="w-5 h-5 text-red-400" />
                ) : (
                  <Maximize2 className="w-5 h-5 text-red-400" />
                )}
              </button>

              <MapContainer
                center={userLocation}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
                attributionControl={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker position={userLocation} />
                <MapResizer isExpanded={isMapFullscreen} />
                
                {pulperias.map((pulperia) => (
                  pulperia.location && (
                    <Marker
                      key={pulperia.pulperia_id}
                      position={[pulperia.location.lat, pulperia.location.lng]}
                    >
                      <Popup>
                        <div className="p-1">
                          <h3 className="font-bold">{pulperia.name}</h3>
                          <button
                            onClick={() => navigate(`/pulperia/${pulperia.pulperia_id}`)}
                            className="mt-2 w-full bg-red-600 text-white text-xs font-bold py-1.5 px-3 rounded-lg"
                          >
                            Ver Pulpería
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  )
                ))}
              </MapContainer>
            </div>
          </div>
        </>
      )}

      {/* Pulperias List */}
      <div className="px-4 pb-4">
        <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
          {activeTab === 'favorites' ? (
            <>
              <Heart className="w-5 h-5 text-red-400" />
              Mis Favoritas
            </>
          ) : (
            <>
              <List className="w-5 h-5 text-red-400" />
              Pulperías Cercanas
            </>
          )}
        </h2>
        
        {displayPulperias.length === 0 ? (
          <div className="text-center py-10 bg-stone-900/50 rounded-2xl border border-stone-800">
            {activeTab === 'favorites' ? (
              <>
                <Heart className="w-12 h-12 text-stone-700 mx-auto mb-3" />
                <p className="text-stone-400">No tienes pulperías favoritas</p>
                <p className="text-stone-500 text-sm mt-1">Explora y guarda tus favoritas</p>
              </>
            ) : (
              <>
                <StoreIcon className="w-12 h-12 text-stone-700 mx-auto mb-3" />
                <p className="text-stone-400">No hay pulperías en este radio</p>
                <p className="text-stone-500 text-sm">Intenta ampliar el radio de búsqueda</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {displayPulperias.map((pulperia) => (
              <div
                key={pulperia.pulperia_id}
                data-testid={`pulperia-card-${pulperia.pulperia_id}`}
                onClick={() => navigate(`/pulperia/${pulperia.pulperia_id}`)}
                className="bg-stone-900/50 rounded-2xl p-4 cursor-pointer border border-stone-800 hover:border-red-500/50 transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {pulperia.logo_url ? (
                      <img
                        src={pulperia.logo_url}
                        alt={pulperia.name}
                        className="w-14 h-14 rounded-xl object-cover border-2 border-stone-700"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-stone-800">
                        <StoreIcon className="w-7 h-7 text-red-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate">{pulperia.name}</h3>
                    
                    {pulperia.rating > 0 && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-semibold text-white">
                          {pulperia.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-stone-500">({pulperia.review_count})</span>
                      </div>
                    )}
                    
                    <p className="text-stone-500 text-sm flex items-center gap-1 mt-1 truncate">
                      <MapPin className="w-3 h-3 flex-shrink-0 text-red-400" /> 
                      <span className="truncate">{pulperia.address}</span>
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-600 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav user={user} cartCount={cartCount} />
    </div>
  );
};

export default MapView;
