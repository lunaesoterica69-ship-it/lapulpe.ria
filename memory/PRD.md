# La Pulpería - Product Requirements Document

## Resumen
Aplicación web para conectar pulperías hondureñas con clientes locales.

## URLs
- **Preview**: https://lapulperia.preview.emergentagent.com
- **Dominio Personalizado**: https://lapulperiastore.net

## Autenticación
- **Preview Domain**: Emergent Auth (automático)
- **Dominio Personalizado**: Google OAuth propio
  - Client ID: 792440030382-6aqt3dqunub3hddt0n9plbkc0v4r7l59.apps.googleusercontent.com

### Configuración Google Cloud Console (REQUERIDO)
```
URIs de redirección autorizados:
https://lapulperiastore.net/auth/callback

Orígenes JavaScript autorizados:
https://lapulperiastore.net
```

## Arquitectura
- **Frontend**: React (desplegado en dominio personalizado)
- **Backend**: FastAPI (siempre en lapulperia.preview.emergentagent.com)
- **Base de datos**: MongoDB

### Config centralizado
Todos los componentes usan `/src/config/api.js` para el BACKEND_URL:
```javascript
export const BACKEND_URL = 'https://lapulperia.preview.emergentagent.com';
```

## Sistema de Notificaciones (Triple Capa)
1. **Push del navegador** - Service Worker
2. **Flotantes** - Tarjetas visuales (z-index: 99999)
3. **Toast** - Backup con Sonner

## Funcionalidades
- [x] Google OAuth (dominio personalizado)
- [x] Emergent Auth (preview)
- [x] Notificaciones push + flotantes + toast
- [x] Dirección clickeable → Google Maps
- [x] Sistema de favoritos
- [x] Órdenes por pulpería
- [x] Mascota "Pulpero"
- [x] Panel admin

## Credenciales
- **Admin**: onol4sco05@gmail.com / AlEjA127

## Última Actualización: Enero 1, 2025
- Backend URL centralizado en /src/config/api.js
- Google OAuth propio para dominio personalizado
- Z-index de notificaciones: 99999
