import { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { MapPin, Store as StoreIcon, Phone, Star, Crown, Sparkles, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

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

// Component to handle map resize when expanded/collapsed
function MapResizer({ isExpanded }) {
  const map = useMap();
  
  useEffect(() => {
    // Invalidate map size after transition
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
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [radius, setRadius] = useState(5);
  const [cart, setCart] = useState([]);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, pulperiasRes, featuredRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/auth/me`, { withCredentials: true }),
          axios.get(`${BACKEND_URL}/api/pulperias`),
          axios.get(`${BACKEND_URL}/api/ads/featured`).catch(() => ({ data: [] }))
        ]);
        
        setUser(userRes.data);
        setAllPulperias(pulperiasRes.data);
        setFeaturedPulperias(featuredRes.data);

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
              // Fallback to Tegucigalpa
              const fallbackCoords = [14.0723, -87.1921];
              setUserLocation(fallbackCoords);
              filterPulperiasByRadius(pulperiasRes.data, fallbackCoords, radius);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        } else {
          const fallbackCoords = [14.0723, -87.1921];
          setUserLocation(fallbackCoords);
          filterPulperiasByRadius(pulperiasRes.data, fallbackCoords, radius);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setUserLocation([14.0723, -87.1921]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filterPulperiasByRadius, radius]);

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
      const response = await axios.get(`${BACKEND_URL}/api/pulperias?search=${searchTerm}`);
      setPulperias(response.data);
    } catch (error) {
      console.error('Error searching:', error);
      toast.error('Error en la búsqueda');
    }
  };

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  if (loading || !userLocation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pulpo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pulpo-200 rounded-full animate-spin border-t-pulpo-600 mx-auto"></div>
          <p className="mt-4 text-pulpo-600 font-medium">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pulpo-50 pb-24">
      {/* Header with Profile Dropdown */}
      <Header 
        user={user} 
        title="Pulperías Cercanas" 
        subtitle={`${pulperias.length} en ${radius} km`}
      />

      {/* Search and Filters */}
      <div className="bg-gradient-to-b from-pulpo-600 to-pulpo-700 text-white px-4 pb-4">
        {/* Radius Selector */}
        <div className="mb-3">
          <div className="flex gap-2">
            {[2, 5, 10, 20].map(r => (
              <button
                key={r}
                onClick={() => setRadius(r)}
                className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${
                  radius === r 
                    ? 'bg-white text-pulpo-600 shadow-md' 
                    : 'bg-white/20 hover:bg-white/30 text-white'
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
            className="flex-1 bg-white/90 text-stone-800 border-0 focus:ring-2 focus:ring-white rounded-xl py-3 px-4 placeholder:text-stone-400"
          />
          <button
            data-testid="search-button"
            onClick={handleSearch}
            className="bg-white text-pulpo-600 hover:bg-pulpo-50 font-bold px-5 rounded-xl transition-all"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Featured Pulperias - Horizontal Scroll */}
      {featuredPulperias.length > 0 && (
        <div className="px-4 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-bold text-stone-800">Destacadas</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
            {featuredPulperias.map((pulperia) => {
              const bgColor = pulperia.background_color || '#B91C1C';
              return (
                <div
                  key={pulperia.pulperia_id}
                  onClick={() => navigate(`/pulperia/${pulperia.pulperia_id}`)}
                  className="flex-shrink-0 w-52 rounded-2xl p-4 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
                  style={{ background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}dd 100%)` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {pulperia.logo_url ? (
                      <img
                        src={pulperia.logo_url}
                        alt={pulperia.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white/50"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
                        <StoreIcon className="w-5 h-5" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate text-sm">{pulperia.name}</h3>
                      <div className="flex items-center gap-1">
                        {pulperia.ad_plan === 'premium' && <Crown className="w-3 h-3 text-yellow-300" />}
                        {pulperia.ad_plan === 'destacado' && <Sparkles className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                  {pulperia.rating > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="w-3 h-3 fill-yellow-300 text-yellow-300" />
                      <span className="font-bold">{pulperia.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mini Map with Expand Toggle */}
      <div className="px-4 py-3">
        <div className={`rounded-2xl overflow-hidden shadow-md border border-pulpo-100 relative transition-all duration-300 ${
          isMapFullscreen ? 'h-[70vh]' : 'h-40'
        }`}>
          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsMapFullscreen(!isMapFullscreen)}
            className="absolute top-2 right-2 z-[1000] bg-white/90 hover:bg-white p-2 rounded-xl shadow-lg border border-pulpo-100 transition-all hover:scale-105"
            title={isMapFullscreen ? 'Reducir mapa' : 'Ampliar mapa'}
          >
            {isMapFullscreen ? (
              <Minimize2 className="w-5 h-5 text-pulpo-600" />
            ) : (
              <Maximize2 className="w-5 h-5 text-pulpo-600" />
            )}
          </button>

          <MapContainer
            center={userLocation}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
            attributionControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
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
                      {pulperia.rating > 0 && (
                        <div className="flex items-center gap-1 text-sm my-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{pulperia.rating.toFixed(1)}</span>
                        </div>
                      )}
                      <button
                        onClick={() => navigate(`/pulperia/${pulperia.pulperia_id}`)}
                        className="mt-2 w-full bg-pulpo-600 text-white text-xs font-bold py-1.5 px-3 rounded-lg hover:bg-pulpo-700 transition-colors"
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

      {/* Pulperias List (hidden in fullscreen) */}
      {!isMapFullscreen && (
      <div className="px-4 pb-4">
        <h2 className="text-lg font-bold mb-3 text-stone-800">Pulperías Cercanas</h2>
        {pulperias.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl">
            <StoreIcon className="w-12 h-12 text-pulpo-200 mx-auto mb-3" />
            <p className="text-stone-500">No hay pulperías en este radio</p>
            <p className="text-stone-400 text-sm">Intenta ampliar el radio de búsqueda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pulperias.map((pulperia) => {
              const bgColor = pulperia.background_color || '#B91C1C';
              return (
                <div
                  key={pulperia.pulperia_id}
                  data-testid={`pulperia-card-${pulperia.pulperia_id}`}
                  onClick={() => navigate(`/pulperia/${pulperia.pulperia_id}`)}
                  className="bg-white rounded-2xl shadow-sm p-4 cursor-pointer border border-pulpo-50 hover:shadow-md hover:border-pulpo-200 transition-all active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {pulperia.logo_url ? (
                        <img
                          src={pulperia.logo_url}
                          alt={pulperia.name}
                          className="w-14 h-14 rounded-xl object-cover border-2"
                          style={{ borderColor: `${bgColor}30` }}
                        />
                      ) : (
                        <div 
                          className="w-14 h-14 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${bgColor}15` }}
                        >
                          <StoreIcon className="w-7 h-7" style={{ color: bgColor }} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-stone-800 truncate">{pulperia.name}</h3>
                      
                      {pulperia.rating > 0 && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold text-stone-600">
                            {pulperia.rating.toFixed(1)}
                          </span>
                          <span className="text-xs text-stone-400">({pulperia.review_count})</span>
                        </div>
                      )}
                      
                      <p className="text-stone-500 text-sm flex items-center gap-1 mt-1 truncate">
                        <MapPin className="w-3 h-3 flex-shrink-0" /> 
                        <span className="truncate">{pulperia.address}</span>
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-stone-300 flex-shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      )}

      {/* Bottom Nav (hidden in fullscreen) */}
      {!isMapFullscreen && <BottomNav user={user} cartCount={cartCount} />}
    </div>
  );
};

export default MapView;
