// API Configuration
// Dynamically determines the backend URL based on the current domain

const CUSTOM_DOMAIN = 'lapulperiastore.net';

export const getBackendUrl = () => {
  const currentHost = window.location.hostname;
  const customDomains = [CUSTOM_DOMAIN, `www.${CUSTOM_DOMAIN}`];
  
  // If on custom domain, use same origin (the deployed app)
  if (customDomains.includes(currentHost)) {
    return window.location.origin;
  }
  
  // Otherwise use environment variable (for preview/development)
  return process.env.REACT_APP_BACKEND_URL;
};

export const isCustomDomain = () => {
  const currentHost = window.location.hostname;
  return currentHost === CUSTOM_DOMAIN || currentHost === `www.${CUSTOM_DOMAIN}`;
};

export const BACKEND_URL = getBackendUrl();
export { CUSTOM_DOMAIN };
