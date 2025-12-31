# La Pulpería - Product Requirements Document

## Resumen
Aplicación web para conectar pulperías hondureñas con clientes locales. Permite a los dueños de pulperías gestionar sus negocios, productos y pedidos, mientras los clientes pueden explorar, ordenar y rastrear sus compras con una mascota animada llamada "Pulpero".

## Design System
- **Fondo**: stone-950 con nebulosa roja (blur gradients)
- **Animación**: Partículas flotantes simples estilo "Grok"
- **Scrollbar**: Personalizado oscuro
- **Colores primarios**: Red-500/600 para acentos, stone tones para fondos

## Mascota "Pulpero"
- Componente animado SVG ubicado en `/app/frontend/src/components/Pulpero.js`
- Estados: pending (buscando), accepted (cocinando con gorro de chef), ready (celebrando), completed (satisfecho)
- Mensajes humanos en español: "Dame un momento...", "¡Manos a la obra!", "¡Listo compa!"

## Completado
- [x] Google OAuth con emergentintegrations
- [x] CRUD de productos y pulperías
- [x] Sistema de pedidos con WebSocket real-time
- [x] Panel de personalización de pulperías renovado (Vista Previa, Info Básica, Imágenes, Ubicación, Contacto, Estilo Visual)
- [x] Mascota "Pulpero" con animaciones y mensajes humanos
- [x] Imágenes de productos en carrito y órdenes
- [x] Gestión de estado de órdenes desde notificaciones del Header
- [x] Panel de admin con password "AlEjA127"
- [x] Sistema de suspensión temporal de pulperías
- [x] Badges gaming para pulperías
- [x] Notificaciones WebSocket para mensajes de admin
- [x] Precios de publicidad: L.200, L.400, L.600

## Backlog
- [ ] Editar/Eliminar Anuncios
- [ ] Botón fullscreen mapa
- [ ] Crear CLOUDFLARE_DEPLOY_GUIDE.md

## Arquitectura de Archivos Clave
```
/app/frontend/src/
├── components/
│   ├── Pulpero.js          # Mascota animada con estados y mensajes
│   ├── Header.js           # Notificaciones y modal de gestión de órdenes
│   ├── AnimatedBackground.js # Partículas flotantes
│   └── BottomNav.js        # Navegación inferior
├── pages/
│   ├── PulperiaDashboard.js # Panel de gestión con personalización renovada
│   ├── MyOrders.js         # Pedidos del cliente con mascota Pulpero
│   ├── ShoppingCart.js     # Carrito con imágenes de productos
│   ├── AdminPanel.js       # Panel admin con password protection
│   └── LandingPage.js      # Página inicial con nebulosa roja
└── hooks/
    └── useWebSocket.js     # Hook para conexión WebSocket
```

## Credentials
- Admin: onol4sco05@gmail.com
- Password: AlEjA127

## Última Actualización: Diciembre 2024
- Renombrado Pulpito → Pulpero con mensajes más humanos
- Renovado panel de personalización de pulperías con diseño oscuro moderno
- Agregadas notificaciones WebSocket para mensajes de admin
