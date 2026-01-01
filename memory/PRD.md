# La Pulpería - Product Requirements Document

## Resumen
Aplicación web para conectar pulperías hondureñas con clientes locales. Diseño galáctico con estrellas animadas estilo Grok.

## URLs
- **Preview**: https://lapulperia.preview.emergentagent.com
- **Dominio**: https://lapulperiastore.net

## Diseño Visual
- **Tema**: Galáctico con nebulosas rojas y estrellas animadas
- **Fondo**: stone-950 con efectos de blur
- **Animaciones**:
  - Estrellas que parpadean (twinkle, twinkle-delayed)
  - Nebulosas pulsantes (pulse-slow)
  - Partículas flotantes (float-1, float-2, float-3)
  - Fade in con escala en elementos UI
  - Hover con glow en botones

## Autenticación
- **Preview**: Emergent Auth
- **Dominio personalizado**: Google OAuth propio con retry (3 intentos)
- Token guardado en localStorage

## Endpoints de Salud
- `/health` - Health check root
- `/api/health` - Health check bajo /api

## Archivos Clave
- `/src/App.css` - Todas las animaciones CSS
- `/src/components/AnimatedBackground.js` - Fondo galáctico
- `/src/config/api.js` - Config de backend dinámico
- `/src/pages/LandingPage.js` - Login con retry y animaciones

## Credenciales
- **Admin**: onol4sco05@gmail.com / AlEjA127

## Última Actualización: Enero 1, 2025
- Animaciones galácticas estilo Grok
- Login con retry (3 intentos) y mejor manejo de errores
- Endpoint /health para deployment
