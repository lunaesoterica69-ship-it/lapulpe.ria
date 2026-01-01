# La Pulpería - Product Requirements Document

## Resumen
Aplicación web para conectar pulperías hondureñas con clientes locales.

## URLs
- **Preview**: https://premium-grocery-1.preview.emergentagent.com
- **Dominio**: https://lapulperiastore.net

## Base de Datos
- **MongoDB**: `test_database`
- **Colecciones**: users, pulperias, orders, products, advertisements, etc.

## Diseño Visual
- **Tema**: Galáctico oscuro con nebulosas rojas
- **Logo**: Pulpería simple con toldo rojo
- **Medallas**: Art Deco con laureles

## Sistema de Notificaciones
- Contador solo de NO LEÍDAS
- Se marcan como leídas automáticamente
- Endpoint: `POST /api/notifications/mark-read`

## Planes de Publicidad
| Plan | Precio | Duración |
|------|--------|----------|
| Básico | L. 250 | 7 días |
| Destacado | L. 400 | 15 días |
| Premium | L. 600 | 30 días |
| Recomendado | L. 1,000 | 30 días |

## Credenciales
- **Admin**: onol4sco05@gmail.com / AlEjA127

## Usuarios de Prueba
- `onol4sco05@gmail.com` - Admin/Cliente
- `lasrecetasdealba1954@gmail.com` - Pulpería (Panaderia Las Recetas de Alba)
- `pseduardo67@gmail.com` - Pulpería (Bodega Diaz)

## Última Actualización: Enero 1, 2025
- ✅ Medallas Art Deco
- ✅ Notificaciones mejoradas
- ✅ Plan Recomendado (L. 1,000)
- ✅ Página de Pulperías Recomendadas
- ✅ Backend conectado a test_database
