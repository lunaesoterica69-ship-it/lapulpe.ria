// Configuración de API para La Pulpería
// Este archivo asegura que el backend URL sea siempre el correcto

// Backend URL - SIEMPRE usar el de Emergent preview
// Este URL es fijo porque el backend está hosteado en Emergent
export const BACKEND_URL = 'https://lapulperia.preview.emergentagent.com';

// Dominio personalizado
export const CUSTOM_DOMAIN = 'lapulperiastore.net';

// Helper para detectar si estamos en el dominio personalizado
export const isCustomDomain = () => {
  const host = window.location.hostname;
  return host === CUSTOM_DOMAIN || host === `www.${CUSTOM_DOMAIN}`;
};

export default BACKEND_URL;
