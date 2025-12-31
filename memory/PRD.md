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

### Pulperia Features
- Profile with logo, banner, and description
- Product catalog management
- Order management dashboard
- Announcements wall
- Reviews system

### Client Features
- Search products across all pulperias
- Interactive map to find nearby stores
- Shopping cart and checkout
- Order history
- Notifications system

### Admin Features
- View all pulperias
- Activate/deactivate advertising plans
- Suspend stores with reason
- Assign gaming-style badges
- Send direct messages to pulperias

---

## What's Been Implemented

### Session: December 31, 2025

#### P0 - Critical Features Completed
- [x] **Banner URL Fix**: Fixed bug where `banner_url` wasn't saving on pulperia profile update
- [x] **Advanced Admin Panel**: Complete rewrite with gaming-style badges system
  - 8 unique badges: Starter, Rising Star, On Fire, Elite, Champion, Legendary, Verified, Partner
  - Store suspension with reason
  - Direct messaging to pulperias
  - Ad plan activation/deactivation
- [x] **Jobs/Services Page Redesign**: Complete redesign with blue theme
  - Blue animated background variant
  - Consistent dark theme with blue accents
  - Improved job and service cards

#### UI/UX Improvements
- [x] **AnimatedBackground Component**: Updated to support color variants (red/blue)
- [x] **Design Consistency**: Blue theme for Chamba section while maintaining red for main app

---

## Technical Architecture

### Frontend (React)
```
/app/frontend/src/
├── pages/
│   ├── LandingPage.js        # Custom dark theme landing
│   ├── AdminPanel.js         # Gaming-style admin panel
│   ├── JobsServices.js       # Blue-themed jobs/services
│   ├── PulperiaProfile.js    # Public profile with tabs
│   ├── PulperiaDashboard.js  # Owner dashboard
│   ├── MapView.js            # Interactive map
│   ├── SearchProducts.js     # Product search
│   └── MyOrders.js           # Order history
├── components/
│   ├── AnimatedBackground.js # Animated particles (red/blue)
│   ├── ImageUpload.js        # File upload component
│   ├── Header.js             # Navigation header
│   └── BottomNav.js          # Mobile navigation
└── contexts/
    └── AuthContext.js        # Authentication state
```

### Backend (FastAPI)
```
/app/backend/
├── server.py                 # Main API with all endpoints
└── requirements.txt          # Python dependencies
```

### Database (MongoDB)
Collections:
- `users`: User accounts and profiles
- `pulperias`: Store information with banner_url, badge
- `products`: Product catalog
- `orders`: Customer orders
- `jobs`: Job listings
- `services`: Service offerings
- `announcements`: Store announcements
- `ads`: Advertising plans
- `admin_messages`: Admin-to-store messages

---

## Prioritized Backlog

### P1 - Next Priority
- [ ] Edit/Delete Announcements: Allow pulperias to modify or delete their announcements
- [ ] Fuzzy search verification: Test the thefuzz library integration

### P2 - Medium Priority
- [ ] "Chamba" search toggle: Toggle in search page to switch context to jobs
- [ ] Map fullscreen/resize button

### P3 - Future Features
- [ ] Push notifications
- [ ] Payment integration
- [ ] Analytics dashboard for pulperias

---

## API Endpoints

### Public
- `GET /api/pulperias` - List all stores
- `GET /api/products` - List all products
- `GET /api/jobs` - List all jobs
- `GET /api/services` - List all services
- `GET /api/ads/plans` - Get ad plans
- `GET /api/ads/featured` - Get featured stores

### Authenticated
- `GET /api/auth/me` - Current user info
- `PUT /api/pulperias/{id}` - Update store profile
- `POST /api/orders` - Create order
- `GET /api/orders` - User's orders

### Admin Only
- `GET /api/admin/pulperias` - All stores (admin)
- `POST /api/admin/pulperias/{id}/suspend` - Suspend store
- `POST /api/admin/pulperias/{id}/unsuspend` - Reactivate store
- `POST /api/admin/pulperias/{id}/badge` - Assign badge
- `POST /api/admin/pulperias/{id}/message` - Send message

---

## Testing Status
- Backend: 22/22 tests passing
- Frontend: All pages loading correctly
- Test files: `/app/tests/test_backend_api.py`
- Test reports: `/app/test_reports/iteration_1.json`

---

## Credentials
- Admin Email: `onol4sco05@gmail.com`
- Authentication: Google OAuth
