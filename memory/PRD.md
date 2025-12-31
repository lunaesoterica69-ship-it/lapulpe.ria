# La Pulpería - Product Requirements Document

## Resumen
Aplicación web para conectar pulperías hondureñas con clientes locales. Permite a los dueños de pulperías gestionar sus negocios, productos y pedidos, mientras los clientes pueden explorar, ordenar y rastrear sus compras con una mascota animada que representa al "Pulpero" (dueño de la pulpería).

## URL de Preview
https://pulpito-delivery.preview.emergentagent.com

## Design System
- **Fondo**: stone-950 con efecto nebulosa roja (blur gradients)
- **Animación**: Partículas flotantes simples estilo "Grok"
- **Scrollbar**: Personalizado oscuro
- **Colores primarios**: Red-500/600 para acentos, stone tones para fondos
- **Tipografía**: System fonts con variantes personalizables por pulpería

## Mascota "Pulpero"
- Componente animado SVG: `/app/frontend/src/components/Pulpero.js`
- **Concepto**: Representa al dueño de la pulpería hablándole al cliente
- **Estados y mensajes**:
  - `pending`: "¡Hola! Ya recibí tu pedido, déjame revisarlo..." (buscando con clipboard)
  - `accepted`: "¡Ya estoy en eso! Preparando con cariño..." (con delantal trabajando)
  - `ready`: "¡Listo compa! Ya podés pasar a buscarlo" (celebrando con campana)
  - `completed`: Satisfecho (opacidad reducida)

## Panel de Personalización de Pulperías
Ubicado en `/app/frontend/src/pages/PulperiaDashboard.js`
### Secciones:
1. **Vista Previa en Vivo** - Muestra cómo se verá el perfil en tiempo real
2. **Información Básica** - Nombre y descripción del negocio
3. **Imágenes** - Logo (cuadrado) y Banner (rectangular)
4. **Ubicación** - GPS automático + dirección manual
5. **Contacto** - Teléfono y horario
6. **Estilo Visual** - Selector de colores y fuentes del título

## Funcionalidades Completadas
- [x] Google OAuth con emergentintegrations
- [x] CRUD de productos y pulperías
- [x] Sistema de pedidos con WebSocket real-time
- [x] Panel de personalización renovado (tema oscuro)
- [x] Mascota "Pulpero" con mensajes del dueño
- [x] Imágenes de productos en carrito y órdenes
- [x] Gestión de estado de órdenes desde notificaciones del Header
- [x] Panel de admin con password "AlEjA127"
- [x] Sistema de suspensión temporal de pulperías
- [x] Badges gaming para pulperías (Novato, Emergente, Popular, Estrella)
- [x] Notificaciones WebSocket para mensajes de admin
- [x] Precios de publicidad: L.200, L.400, L.600
- [x] Landing page con nebulosa roja y partículas flotantes

## Backlog
- [ ] Editar/Eliminar Anuncios
- [ ] Crear CLOUDFLARE_DEPLOY_GUIDE.md
- [ ] Sistema de valoración con estrellas animadas

## Arquitectura de Archivos Clave
```
/app/frontend/src/
├── components/
│   ├── Pulpero.js              # Mascota con mensajes del dueño
│   ├── Header.js               # Notificaciones y modal de órdenes
│   ├── AnimatedBackground.js   # Partículas flotantes
│   ├── ProtectedRoute.js       # Rutas protegidas
│   └── BottomNav.js            # Navegación inferior
├── pages/
│   ├── PulperiaDashboard.js    # Panel con personalización renovada
│   ├── MyOrders.js             # Pedidos con mascota Pulpero
│   ├── ShoppingCart.js         # Carrito con imágenes
│   ├── AdminPanel.js           # Panel admin con password
│   └── LandingPage.js          # Página inicial con nebulosa
├── hooks/
│   └── useWebSocket.js         # Hook para WebSocket
└── contexts/
    └── AuthContext.js          # Contexto de autenticación
```

## Credenciales
- **Admin Email**: onol4sco05@gmail.com
- **Admin Password**: AlEjA127

## Testing
- **Backend**: 22/22 tests pasando (100%)
- **Frontend**: Todas las páginas cargan correctamente
- **Test files**: `/app/test_reports/iteration_3.json`

## Última Actualización: Diciembre 31, 2024
- Renombrado Pulpito → Pulpero (representa al dueño de la pulpería)
- Mensajes más humanos y cercanos en español hondureño
- Panel de personalización con tema oscuro stone-950
- Corregidos errores de linting en useWebSocket, Header, ProtectedRoute
- Verificación final completada - listo para lanzamiento
