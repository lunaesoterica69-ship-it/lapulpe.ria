# La Pulpería - Product Requirements Document

## Original Problem Statement
Crear una aplicación web para pulperías hondureñas con las siguientes características:
- Google OAuth para autenticación
- Sistema de roles (clientes y pulperías)
- Mapa interactivo para localizar pulperías
- Catálogo de productos con búsqueda
- Sistema de pedidos y carrito de compras
- Panel de administración para gestión de la plataforma
- Sistema de empleos y servicios ("Chamba")
- Anuncios y promociones para pulperías

## User Personas
1. **Cliente**: Persona que busca productos en pulperías cercanas
2. **Pulpería**: Dueño de tienda que quiere vender sus productos
3. **Admin**: Administrador de la plataforma (onol4sco05@gmail.com)

## Core Requirements

### Authentication
- Google OAuth integration
- Session-based authentication with cookies
- Role-based access (client/pulperia/admin)
- **Admin password protection**: AlEjA127

### Pulperia Features
- Profile with logo, banner (adjusted for visibility), and description
- Product catalog management
- Order management dashboard
- Announcements wall
- Reviews system
- **Admin messages tab** in notifications

### Client Features
- Search products across all pulperias
- Interactive map to find nearby stores
- Shopping cart and checkout
- Order history
- Notifications system

### Admin Features
- View all pulperias
- Activate/deactivate advertising plans (L.200, L.400, L.600)
- **Temporary ban/unban** stores with reason and duration
- **Gaming-style badges in Spanish**: Novato, En Ascenso, En Llamas, Élite, Campeón, Legendario, Verificado, Socio Oficial
- Send direct messages to pulperias (received in special tab)
- **Password protected panel**

---

## What's Been Implemented

### Session: December 31, 2025

#### Latest Changes
- [x] **Badges en español**: 8 badges gaming-style traducidos
- [x] **Banner visible para dueño**: Preview del banner en dashboard
- [x] **Animaciones**: Rojo para app general, Azul para sección de empleos
- [x] **Precios actualizados**: L.200, L.400, L.600
- [x] **Admin panel con contraseña**: AlEjA127
- [x] **Mensajes del admin**: Pestaña especial en notificaciones de pulpería
- [x] **Baneo temporal**: Con duración en días (1, 3, 7, 30)
- [x] **Banner ajustado**: object-center para mejor visualización
- [x] **Eliminado**: Concepto de buscador de chamba/toggle

#### Previous Session
- [x] **Banner URL Fix**: Fixed bug where `banner_url` wasn't saving
- [x] **Advanced Admin Panel**: Complete rewrite with gaming-style badges
- [x] **Jobs/Services Page Redesign**: Blue theme

---

## API Endpoints

### Public
- `GET /api/pulperias` - List all stores
- `GET /api/products` - List all products
- `GET /api/jobs` - List all jobs
- `GET /api/services` - List all services
- `GET /api/ads/plans` - Get ad plans (200, 400, 600 HNL)

### Admin Only (password protected)
- `GET /api/admin/pulperias` - All stores
- `POST /api/admin/pulperias/{id}/suspend?reason=X&days=7` - Temp ban
- `POST /api/admin/pulperias/{id}/unsuspend` - Remove ban
- `POST /api/admin/pulperias/{id}/badge?badge=novato` - Assign badge
- `POST /api/admin/pulperias/{id}/message?message=X` - Send message

### Pulperia
- `GET /api/pulperias/{id}/admin-messages` - Get admin messages

---

## Badge System (Spanish)
| ID | Name | Description |
|----|------|-------------|
| novato | Novato | Nuevo en la plataforma |
| en_ascenso | En Ascenso | Creciendo rápidamente |
| en_llamas | En Llamas | Muy activo |
| elite | Élite | Vendedor destacado |
| campeon | Campeón | Top vendedor |
| legendario | Legendario | Leyenda viviente |
| verificado | Verificado | Verificado oficialmente |
| socio | Socio Oficial | Socio de La Pulpería |

---

## Prioritized Backlog

### P1 - Next Priority
- [ ] Edit/Delete Announcements for pulperias

### P2 - Medium Priority
- [ ] Map fullscreen/resize button

### P3 - Future Features
- [ ] Push notifications
- [ ] Payment integration
- [ ] Analytics dashboard

---

## Credentials
- Admin Email: `onol4sco05@gmail.com`
- Admin Panel Password: `AlEjA127`
- Authentication: Google OAuth
