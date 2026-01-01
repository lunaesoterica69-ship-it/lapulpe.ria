// Configuración de API para La Pulpería
// Este archivo configura axios para enviar el token en todas las requests

import axios from 'axios';

// Detectar el backend URL basado en el ambiente
const getBackendUrl = () => {
  // Si hay una variable de entorno, usarla
  if (process.env.REACT_APP_BACKEND_URL) {
    return process.env.REACT_APP_BACKEND_URL;
  }
  
  // En producción (dominio personalizado), usar el mismo origen
  const host = window.location.hostname;
  if (host === 'lapulperiastore.net' || host === 'www.lapulperiastore.net') {
    // El backend está en el mismo dominio en producción
    return window.location.origin;
  }
  
  // Fallback al preview de Emergent
  return 'https://premium-grocery-1.preview.emergentagent.com';
};

// Backend URL
export const BACKEND_URL = getBackendUrl();

// Dominio personalizado
export const CUSTOM_DOMAIN = 'lapulperiastore.net';

// Helper para detectar si estamos en el dominio personalizado
export const isCustomDomain = () => {
  const host = window.location.hostname;
  return host === CUSTOM_DOMAIN || host === `www.${CUSTOM_DOMAIN}`;
};

// Crear instancia de axios configurada
const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
  timeout: 30000
});

// Interceptor para añadir token a todas las requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('session_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de auth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('session_token');
      // Solo redirigir si no estamos ya en la landing page
      if (window.location.pathname !== '/' && window.location.pathname !== '/auth/callback') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export { api };
export default BACKEND_URL;
