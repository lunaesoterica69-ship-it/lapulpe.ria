# La Pulpería - Product Requirements Document

## Resumen
Aplicación web para conectar pulperías hondureñas con clientes locales. Permite a los dueños de pulperías gestionar sus negocios, productos y pedidos, mientras los clientes pueden explorar, ordenar y rastrear sus compras con una mascota animada que representa al "Pulpero" (dueño de la pulpería).

## URLs
- **Preview**: https://lapulperia.preview.emergentagent.com
- **Dominio Personalizado**: https://lapulperiastore.net

## Design System
- **Fondo**: stone-950 con efecto nebulosa roja (CSS puro, sin JavaScript)
- **Estrellas**: CSS gradients estáticos - ultra ligero
- **Lazy Loading**: Todas las páginas excepto LandingPage cargan bajo demanda
- **Tiempo de carga**: ~0.7 segundos en landing page
- **Colores primarios**: Red-500/600 para acentos, stone tones para fondos

## Sistema de Autenticación
- **Preview Domain**: Emergent Auth (Google OAuth manejado)
- **Dominio Personalizado**: Google OAuth propio configurado
  - Client ID: 792440030382-...
  - Callback URL: https://lapulperiastore.net/auth/callback

## Sistema de Notificaciones Push
- **Service Worker**: `/public/sw.js` para notificaciones persistentes
- **Permisos**: Solicita permiso al cargar la app
- **Funcionamiento**: Notificaciones incluso con navegador minimizado
- **Eventos notificados**:
  - Nueva orden (para dueños de pulpería)
  - Orden aceptada (para clientes)
  - Orden lista para recoger (para clientes)
  - Orden completada (para clientes)

## Notificaciones Mejoradas
- Muestran resumen de productos (ej: "2x Pan, 1x Leche")
- Muestran total de productos y monto
- Panel expandible con desglose de productos para dueños
- Integradas con WebSocket para tiempo real

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
- [x] Google OAuth propio para dominio personalizado
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
- [x] Service Worker para notificaciones push
- [x] Notificaciones mejoradas con desglose de productos
- [x] Soporte para dominio personalizado

## Backlog
- [ ] Editar/Eliminar Anuncios
- [ ] Notificaciones por email (SendGrid) - requiere API key
- [ ] Crear CLOUDFLARE_DEPLOY_GUIDE.md

## Arquitectura de Archivos Clave
```
/app/frontend/
├── public/
│   ├── sw.js                    # Service Worker para notificaciones
│   ├── manifest.json            # PWA manifest
│   └── index.html               # Meta tags actualizados
├── src/
│   ├── config/
│   │   └── api.js               # Configuración dinámica de API URL
│   ├── components/
│   │   ├── Pulpero.js           # Mascota con mensajes del dueño
│   │   ├── Header.js            # Notificaciones mejoradas
│   │   ├── AnimatedBackground.js # Estrellas optimizado
│   │   └── DisclaimerModal.js   # Modal de disclaimer
│   ├── pages/
│   │   ├── LandingPage.js       # OAuth dinámico (Emergent/Google)
│   │   ├── GoogleCallback.js    # Callback para OAuth propio
│   │   ├── MapView.js           # Tabs Cercanas/Favoritas
│   │   ├── PulperiaProfile.js   # Favoritos, visor imágenes
│   │   ├── MyOrders.js          # Órdenes por pulpería + historial
│   │   └── ShoppingCart.js      # Checkout por pulpería
│   └── hooks/
│       ├── useWebSocket.js      # WebSocket + notificaciones
│       └── useNotifications.js  # Service Worker + push
/app/backend/
└── server.py                    # Endpoints OAuth, notificaciones mejoradas
```

## Credenciales
- **Admin Email**: onol4sco05@gmail.com
- **Admin Password**: AlEjA127

## Configuración Google OAuth (Dominio Personalizado)
En Google Cloud Console, agregar:
- **URIs de redirección autorizados**:
  - https://lapulperiastore.net/auth/callback
  - https://www.lapulperiastore.net/auth/callback
- **Orígenes de JavaScript autorizados**:
  - https://lapulperiastore.net
  - https://www.lapulperiastore.net

## Testing
- **Backend**: Endpoints de notificaciones y OAuth validados
- **Frontend**: Modals, notificaciones y OAuth funcionando
- **Service Worker**: Registrado y funcionando

## Última Actualización: Enero 1, 2025
- Implementado Google OAuth propio para dominio personalizado
- Service Worker para notificaciones push persistentes
- Notificaciones mejoradas con desglose de productos
- PWA manifest y meta tags actualizados
- Lint errors corregidos
