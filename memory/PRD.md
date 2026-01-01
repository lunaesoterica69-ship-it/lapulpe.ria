# La Pulpería - Product Requirements Document

## Resumen
Aplicación web para conectar pulperías hondureñas con clientes locales. Diseño **Galáctico + Premium** con nebulosas rojas y medallas estilo romano.

## URLs
- **Preview**: https://premium-grocery-1.preview.emergentagent.com
- **Dominio**: https://lapulperiastore.net

## Diseño Visual - Fusión Galáctico/Premium (Enero 2025)
### Estilo General
- **Tema**: Galáctico oscuro con acentos rojos
- **Fondo**: stone-950 con nebulosas rojas animadas
- **Estrellas**: Parpadeantes con efecto twinkle
- **Partículas**: Flotantes animadas

### Logo
- Pulpería simple con toldo ondulado rojo
- Estantes con productos en ventanas
- Estrella dorada en la cima
- Sin bordes octogonales excesivos

### Componentes UI
- **Botones**: Gradiente rojo con bordes redondeados (rounded-xl)
- **Cards**: Fondo semi-transparente con backdrop-blur
- **Modales**: Bordes stone-700/50, sin bordes Art Deco
- **Navegación**: Simple con indicadores rojos

### Sistema de Medallas (Estilo Romano)
Ubicación: `/app/frontend/src/components/ArtDecoBadge.js`
- **Diseño**: Corona de laureles dorados/plateados
- **Niveles**: Bronze, Silver, Gold, Legendary, Special
- **Medallas**: Novato, En Ascenso, En Llamas, Élite, Campeón, Legendario, Verificado, Socio
- **Efectos**: Glow para legendarios, sparkles animados

## Autenticación
- **Preview**: Emergent Auth
- **Dominio personalizado**: Google OAuth con JWT en localStorage
- **Interceptor Axios**: Token automático en requests

## Archivos Clave
- `/src/App.css` - Animaciones galácticas y estilos
- `/src/components/ArtDecoBadge.js` - Medallas estilo romano
- `/src/components/DisclaimerModal.js` - Modal simple
- `/src/components/Header.js` - Header limpio
- `/src/components/BottomNav.js` - Navegación simple
- `/src/pages/LandingPage.js` - Landing con nebulosas

## Notificaciones
- **In-App**: FloatingNotification.js + Service Worker
- **Push**: PWA con manifest.json
- **Email**: No configurado (sin API key)

## Credenciales
- **Admin**: onol4sco05@gmail.com / AlEjA127

## Tareas Pendientes
- [ ] Verificar login en dominio personalizado
- [ ] Optimizar velocidad de dashboards
- [ ] Editar/Eliminar anuncios

## Última Actualización: Enero 1, 2025
- ✅ Fusión de diseño anterior (simple) + nuevo (elegante)
- ✅ Logo simple de pulpería restaurado
- ✅ Nebulosas y estrellas de fondo
- ✅ Medallas estilo romano con laureles
- ✅ UI limpia sin bordes excesivos
- ✅ Modales simplificados
