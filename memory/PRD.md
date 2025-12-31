# La Pulpería - Product Requirements Document

## Resumen
Aplicación web para conectar pulperías hondureñas con clientes locales. Permite a los dueños de pulperías gestionar sus negocios, productos y pedidos, mientras los clientes pueden explorar, ordenar y rastrear sus compras con una mascota animada que representa al "Pulpero" (dueño de la pulpería).

## URL de Preview
https://pulpito-delivery.preview.emergentagent.com

## Design System
- **Fondo**: stone-950 con efecto nebulosa roja (CSS puro, sin JavaScript)
- **Estrellas**: CSS gradients estáticos - ultra ligero
- **Lazy Loading**: Todas las páginas excepto LandingPage cargan bajo demanda
- **Tiempo de carga**: ~0.7 segundos en landing page
- **Colores primarios**: Red-500/600 para acentos, stone tones para fondos

## Mascota "Pulpero"
- Componente animado SVG: `/app/frontend/src/components/Pulpero.js`
- **Concepto**: Representa al dueño de la pulpería hablándole al cliente
- **Estados y mensajes**:
  - `pending`: "¡Hola! Ya recibí tu pedido, déjame revisarlo..."
  - `accepted`: "¡Ya estoy en eso! Preparando con cariño..."
  - `ready`: "¡Listo compa! Ya podés pasar a buscarlo"
  - `completed`: Satisfecho (opacidad reducida)

## Sistema de Favoritos
- **Tab en MapView**: "Cercanas" | "Favoritas"
- **Botón corazón**: En banner de PulperiaProfile
- **Endpoints**:
  - GET /api/favorites - Lista de pulperías favoritas
  - POST /api/favorites/{id} - Agregar a favoritos
  - DELETE /api/favorites/{id} - Quitar de favoritos
  - GET /api/favorites/{id}/check - Verificar si es favorito

## Sistema de Órdenes por Pulpería
- Si el cliente compra de múltiples pulperías, se crean órdenes **separadas**
- Cada orden tiene su propio estado y mascota Pulpero
- El carrito muestra aviso cuando hay productos de múltiples pulperías
- Checkout individual por pulpería o "Ordenar Todo"

## Historial de Compras
- **Tab**: "Activas" | "Historial"
- **Estadísticas**: Total gastado, órdenes completadas, productos comprados, pulperías visitadas
- **Órdenes expandibles**: Click para ver desglose de productos

## Funcionalidades Completadas
- [x] Google OAuth con emergentintegrations
- [x] CRUD de productos y pulperías
- [x] Sistema de pedidos con WebSocket real-time
- [x] Panel de personalización de pulperías (tema oscuro)
- [x] Mascota "Pulpero" con mensajes del dueño
- [x] Imágenes de productos en carrito y órdenes
- [x] Gestión de estado de órdenes desde notificaciones
- [x] Panel de admin con password "AlEjA127"
- [x] Sistema de suspensión temporal de pulperías
- [x] Badges gaming para pulperías
- [x] Notificaciones WebSocket para mensajes de admin
- [x] Sistema de favoritos con tab dedicado
- [x] Animación de estrellitas estilo Grok (30fps)
- [x] Notificaciones con z-index corregido (9999)
- [x] Órdenes separadas por pulpería
- [x] Historial de compras con estadísticas
- [x] Anuncios con imágenes

## Backlog
- [ ] Editar/Eliminar Anuncios
- [ ] Crear CLOUDFLARE_DEPLOY_GUIDE.md

## Arquitectura de Archivos Clave
```
/app/frontend/src/
├── components/
│   ├── Pulpero.js              # Mascota con mensajes del dueño
│   ├── Header.js               # Notificaciones z-index 9999
│   ├── AnimatedBackground.js   # Estrellas 30fps optimizado
│   └── BottomNav.js            # Navegación inferior
├── pages/
│   ├── MapView.js              # Tabs Cercanas/Favoritas
│   ├── PulperiaProfile.js      # Botón favoritos en banner
│   ├── MyOrders.js             # Órdenes por pulpería + historial
│   ├── ShoppingCart.js         # Checkout por pulpería
│   └── AdminPanel.js           # Panel admin con password
└── hooks/
    └── useWebSocket.js         # WebSocket optimizado
```

## Credenciales
- **Admin Email**: onol4sco05@gmail.com
- **Admin Password**: AlEjA127

## Testing
- **Backend**: 22/22 tests pasando (100%)
- **Frontend**: Carga en 0.92s con animaciones
- **Test files**: `/app/test_reports/iteration_4.json`

## Última Actualización: Diciembre 31, 2024
- Optimizada velocidad de carga (0.92s)
- Notificaciones con z-index 9999 (siempre visibles)
- Sistema de favoritos con tab dedicado
- Animación de estrellitas estilo Grok optimizada a 30fps
- Órdenes separadas por pulpería
- Historial de compras con estadísticas y desglose
