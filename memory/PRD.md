# La Pulpería - Product Requirements Document

## Resumen
Aplicación web para conectar pulperías hondureñas con clientes locales. Diseño **Art Deco Premium** con acentos dorados y temática de pulpería tradicional.

## URLs
- **Preview**: https://premium-grocery-1.preview.emergentagent.com
- **Dominio**: https://lapulperiastore.net

## Diseño Visual - Art Deco Theme (Actualizado Enero 2025)
- **Tema Principal**: Art Deco con acentos dorados (#D4A843)
- **Fondo**: stone-950 con patrón geométrico Art Deco sutil
- **Logo**: Octágono Art Deco con pulpería tradicional hondureña
- **Botones**: Estilo Art Deco con bordes cortados (clip-path)
- **Tipografía**: Serif para títulos, tracking-wide para subtítulos
- **Animaciones**:
  - Gold shimmer text effect en títulos
  - Nebulosas rojas/ámbar sutiles
  - Hover con scale y glow en botones
  - Badges con efecto shimmer para premium

## Componentes Art Deco
- `art-deco-btn-primary`: Botón principal con gradiente rojo y bordes cortados
- `art-deco-btn-secondary`: Botón secundario con borde dorado
- `art-deco-border`: Marco con doble borde dorado
- `art-deco-card`: Tarjeta con líneas doradas superior/inferior
- `art-deco-diamond`: Forma de diamante para iconos
- `gold-shimmer-text`: Texto con efecto shimmer dorado animado

## Sistema de Medallas Art Deco
Ubicación: `/app/frontend/src/components/ArtDecoBadge.js`
- Novato, En Ascenso, En Llamas, Élite, Campeón, Legendario, Verificado, Socio
- Cada medalla tiene forma octogonal Art Deco con SVG personalizado
- Medalla "Legendario" tiene efecto shimmer premium

## Autenticación
- **Preview**: Emergent Auth
- **Dominio personalizado**: Google OAuth propio con JWT en localStorage
- **Interceptor Axios**: Token automático en todas las requests

## Endpoints de Salud
- `/health` - Health check root
- `/api/health` - Health check bajo /api

## Archivos Clave
- `/src/App.css` - Estilos Art Deco y animaciones CSS
- `/src/components/ArtDecoBadge.js` - Sistema de medallas premium
- `/src/components/DisclaimerModal.js` - Modal Art Deco
- `/src/components/Header.js` - Header con estilo Art Deco
- `/src/components/BottomNav.js` - Navegación con indicadores Art Deco
- `/src/config/api.js` - Config de backend dinámico
- `/src/pages/LandingPage.js` - Landing con logo y diseño Art Deco

## Notificaciones
- **In-App**: FloatingNotification.js + Service Worker (sw.js)
- **Push**: PWA con manifest.json
- **Email**: No configurado (requiere API key de usuario)

## Credenciales
- **Admin**: onol4sco05@gmail.com / AlEjA127

## Tareas Pendientes
- [ ] Verificar login en dominio personalizado (lapulperiastore.net)
- [ ] Configurar email notifications cuando usuario provea API key
- [ ] Optimizar velocidad de dashboards
- [ ] Editar/Eliminar anuncios

## Última Actualización: Enero 1, 2025
- ✅ Rediseño completo Art Deco
- ✅ Logo Art Deco basado en pulpería tradicional hondureña
- ✅ Botones premium con clip-path
- ✅ Sistema de medallas Art Deco con SVG
- ✅ Header y BottomNav con estilo Art Deco
- ✅ Modales (Disclaimer, HowItWorks) actualizados
- ✅ Patrón geométrico Art Deco en fondo
- ✅ Colores de bandera hondureña en footer
