import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { MapPin, Navigation, Store as StoreIcon, Phone, Star, Crown, Sparkles } from 'lucide-react';
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
      map.flyTo(position, 13);
    }
  }, [map, position]);

  return position ? (
    <Marker position={position}>
      <Popup>Tu ubicación actual</Popup>
    </Marker>
  ) : null;
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
  const [locationError, setLocationError] = useState(null);
  const [radius, setRadius] = useState(5); // km

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

        // Mejorar geolocalización
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const coords = [position.coords.latitude, position.coords.longitude];
              console.log('Ubicación obtenida:', coords);
              setUserLocation(coords);
              setLocationError(null);
              
              // Filter pulperias by radius
              filterPulperiasByRadius(pulperiasRes.data, coords, radius);
            },
            (error) => {
              console.error('Error de geolocalización:', error);
              let errorMsg = 'No se pudo obtener tu ubicación. ';
              
              switch(error.code) {
                case error.PERMISSION_DENIED:
                  errorMsg += 'Permiso denegado. Por favor, habilita la ubicación en tu navegador.';
                  break;
                case error.POSITION_UNAVAILABLE:
                  errorMsg += 'Ubicación no disponible.';
                  break;
                case error.TIMEOUT:
                  errorMsg += 'Tiempo de espera agotado.';
                  break;
                default:
                  errorMsg += 'Error desconocido.';
              }
              
              setLocationError(errorMsg);
              toast.error(errorMsg);
              // Fallback a Tegucigalpa
              const fallbackCoords = [14.0723, -87.1921];
              setUserLocation(fallbackCoords);
              filterPulperiasByRadius(pulperiasRes.data, fallbackCoords, radius);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
        } else {
          setLocationError('Tu navegador no soporta geolocalización');
          toast.error('Tu navegador no soporta geolocalización');
          const fallbackCoords = [14.0723, -87.1921];
          setUserLocation(fallbackCoords);
          filterPulperiasByRadius(pulperiasRes.data, fallbackCoords, radius);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error al cargar datos');
        setUserLocation([14.0723, -87.1921]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (userLocation && allPulperias.length > 0) {
      filterPulperiasByRadius(allPulperias, userLocation, radius);
    }
  }, [radius]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const filterPulperiasByRadius = (pulperiasData, coords, radiusKm) => {
    const filtered = pulperiasData.filter(pulperia => {
      const distance = calculateDistance(
        coords[0], coords[1],
        pulperia.location.lat, pulperia.location.lng
      );
      return distance <= radiusKm;
    });
    setPulperias(filtered);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      const response = await axios.get(`${BACKEND_URL}/api/pulperias?search=${searchTerm}`);
      setPulperias(response.data);
    } catch (error) {
      console.error('Error searching:', error);
      toast.error('Error en la búsqueda');
    }
  };

  if (loading || !userLocation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-stone-600 font-semibold">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with Profile Dropdown */}
      <Header 
        user={user} 
        title="Pulperías Cercanas" 
        subtitle={`${pulperias.length} pulperías en ${radius} km`}
      />

      {/* Search and Filters */}
      <div className="bg-gradient-to-b from-primary to-red-600 text-white px-6 pb-6">
        {/* Radius Selector */}
        <div className="mb-4">
          <label className="text-sm font-semibold mb-2 block">Radio de búsqueda:</label>
          <div className="flex gap-2">
            {[2, 5, 10, 20].map(r => (
              <button
                key={r}
                onClick={() => setRadius(r)}
                className={`px-4 py-2 rounded-full font-bold transition-all ${
                  radius === r 
                    ? 'bg-white text-primary' 
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>
        </div>
        
        {locationError && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 mb-4 text-sm">
            <p className="font-semibold mb-1">⚠️ Problema de ubicación</p>
            <p className="text-white/90">{locationError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-all"
            >
              Intentar nuevamente
            </button>
          </div>
        )}
        
        {/* Search Bar */}
        <div className="flex gap-2">
          <input
            data-testid="search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Buscar pulpería..."
            className="flex-1 bg-white/90 backdrop-blur text-stone-800 border-0 focus:ring-2 focus:ring-white rounded-xl py-3 px-4 placeholder:text-stone-500"
          />
          <button
            data-testid="search-button"
            onClick={handleSearch}
            className="bg-white text-primary hover:bg-white/90 font-bold px-6 rounded-xl transition-all"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="px-6 py-6">
        <div className="map-container">
          <MapContainer
            center={userLocation}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={userLocation} />
            
            {pulperias.map((pulperia) => (
              <Marker
                key={pulperia.pulperia_id}
                position={[pulperia.location.lat, pulperia.location.lng]}
              >
                <Popup>
                  <div className="p-2">
                    <div className="flex items-center gap-2 mb-2">
                      {pulperia.logo_url && (
                        <img
                          src={pulperia.logo_url}
                          alt={pulperia.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <h3 className="font-bold text-lg">{pulperia.name}</h3>
                        {pulperia.rating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-semibold">{pulperia.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-stone-600 mb-2">{pulperia.address}</p>
                    {pulperia.phone && (
                      <p className="text-sm text-stone-600 mb-3 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {pulperia.phone}
                      </p>
                    )}
                    <button
                      onClick={() => navigate(`/pulperia/${pulperia.pulperia_id}`)}
                      className="w-full bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary/90 transition-all"
                    >
                      Ver Productos
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Featured Pulperias Section */}
      {featuredPulperias.length > 0 && (
        <div className="px-6 pb-6">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-black text-stone-800">Pulperías Destacadas</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
            {featuredPulperias.map((pulperia) => {
              const bgColor = pulperia.background_color || '#DC2626';
              return (
                <div
                  key={pulperia.pulperia_id}
                  onClick={() => navigate(`/pulperia/${pulperia.pulperia_id}`)}
                  className="flex-shrink-0 w-64 rounded-2xl p-4 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
                  style={{ background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}cc 100%)` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {pulperia.logo_url ? (
                      <img
                        src={pulperia.logo_url}
                        alt={pulperia.name}
                        className="w-14 h-14 rounded-full object-cover border-3 border-white shadow-md"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-white/30 flex items-center justify-center">
                        <StoreIcon className="w-7 h-7" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate text-lg">{pulperia.name}</h3>
                      <div className="flex items-center gap-1">
                        {pulperia.ad_plan === 'premium' && <Crown className="w-4 h-4 text-yellow-300" />}
                        {pulperia.ad_plan === 'destacado' && <Sparkles className="w-4 h-4 text-white" />}
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full capitalize">{pulperia.ad_plan}</span>
                      </div>
                    </div>
                  </div>
                  {pulperia.rating > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                      <span className="text-sm font-bold">{pulperia.rating.toFixed(1)}</span>
                    </div>
                  )}
                  <p className="text-sm opacity-90 truncate">{pulperia.address}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pulperias List */}
      <div className="px-6 pb-6">
        <h2 className="text-2xl font-black mb-4 text-stone-800">Todas las Pulperías</h2>
        <div className="space-y-4">
          {pulperias.map((pulperia) => {
            const bgColor = pulperia.background_color || '#DC2626';
            return (
              <div
                key={pulperia.pulperia_id}
                data-testid={`pulperia-card-${pulperia.pulperia_id}`}
                onClick={() => navigate(`/pulperia/${pulperia.pulperia_id}`)}
                className="bg-white rounded-2xl shadow-md p-6 card-hover cursor-pointer overflow-hidden"
                style={{ borderLeft: `4px solid ${bgColor}` }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {pulperia.logo_url ? (
                      <img
                        src={pulperia.logo_url}
                        alt={pulperia.name}
                        className="w-16 h-16 rounded-full object-cover border-2 shadow-md"
                        style={{ borderColor: `${bgColor}40` }}
                      />
                    ) : (
                      <div 
                        className="p-3 rounded-full"
                        style={{ backgroundColor: `${bgColor}20` }}
                      >
                        <StoreIcon className="w-10 h-10" style={{ color: bgColor }} strokeWidth={2.5} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-stone-800 mb-1">{pulperia.name}</h3>
                    
                    {pulperia.rating > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= pulperia.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-stone-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm font-semibold text-stone-700 ml-1">
                          {pulperia.rating.toFixed(1)} ({pulperia.review_count})
                        </span>
                      </div>
                    )}
                    
                    <p className="text-stone-600 flex items-center gap-1 mb-2">
                      <MapPin className="w-4 h-4" /> {pulperia.address}
                    </p>
                    {pulperia.description && (
                      <p className="text-sm text-stone-500">{pulperia.description}</p>
                    )}
                  </div>
                  <Navigation className="w-5 h-5 text-stone-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav user={user} />
    </div>
  );
};

export default MapView;