# La Pulpería - Product Requirements Document

## Resumen
Aplicación web para conectar pulperías hondureñas con clientes locales. Diseño galáctico con medallas Art Deco premium.

## URLs
- **Preview**: https://premium-grocery-1.preview.emergentagent.com
- **Dominio**: https://lapulperiastore.net

## Diseño Visual (Enero 2025)
### Tema General
- **Fondo**: stone-950 con nebulosas rojas animadas
- **Estrellas**: Parpadeantes sutiles
- **Estética**: Simple y elegante, sin bordes excesivos

### Logo
- Pulpería simple con toldo ondulado rojo
- Productos en ventanas (botellas coloridas)
- Estrella dorada en la cima

### Componentes UI
- **Botones**: Gradiente rojo, bordes redondeados (rounded-xl)
- **Cards**: Fondo semi-transparente con backdrop-blur
- **Navegación**: Simple, iconos profesionales

### Sistema de Medallas Art Deco
Ubicación: `/app/frontend/src/components/ArtDecoBadge.js`
- **Estilo**: Medalla circular con laureles y decoraciones geométricas
- **Tiers**: Bronze, Silver, Gold, Legendary, Special
- **Medallas**: Novato, En Ascenso, En Llamas, Élite, Campeón, Legendario, Verificado, Socio
- **Efectos**: Glow para legendarios, sparkles animados
- **Iconos profesionales**: Star, Rocket, Flame, Gem, Trophy, Crown, BadgeCheck, Shield

## Sistema de Notificaciones
- **Indicador**: Solo muestra notificaciones NO LEÍDAS
- **Marcar como leídas**: Automático después de 1.5s de abrir dropdown
- **Endpoint nuevo**: `POST /api/notifications/mark-read`

## Planes de Publicidad
| Plan | Precio | Duración | Características |
|------|--------|----------|-----------------|
| Básico | L. 250 | 7 días | Badge básico |
| Destacado | L. 400 | 15 días | Aparece primero, badge destacado |
| Premium | L. 600 | 30 días | Banner en inicio, badge premium |
| **Recomendado** | **L. 1,000** | **30 días** | **Página exclusiva, máxima visibilidad** |

## Nueva Página: Pulperías Recomendadas
- **Ruta**: `/recommended`
- **Acceso**: BottomNav para clientes (icono Corona)
- **Contenido**: Solo pulperías con plan "Recomendado" activo
- **Endpoint**: `GET /api/ads/recommended`

## Archivos Clave Actualizados
- `/src/components/ArtDecoBadge.js` - Medallas Art Deco
- `/src/components/Header.js` - Notificaciones mejoradas
- `/src/components/BottomNav.js` - Link a Recomendadas
- `/src/pages/RecommendedPage.js` - Nueva página
- `/backend/server.py` - Endpoints de notificaciones y recomendados

## Credenciales
- **Admin**: onol4sco05@gmail.com / AlEjA127

## Última Actualización: Enero 1, 2025
- ✅ Medallas Art Deco con laureles y decoraciones
- ✅ Notificaciones: contador solo de no leídas
- ✅ Nuevo plan "Recomendado" (L. 1,000)
- ✅ Nueva página de Pulperías Recomendadas
- ✅ Iconos profesionales actualizados
- ✅ BottomNav con link a Recomendadas
