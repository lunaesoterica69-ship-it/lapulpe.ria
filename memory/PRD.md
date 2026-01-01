# La Pulpería - Product Requirements Document

## Resumen
Aplicación web para conectar pulperías hondureñas con clientes locales.

## URLs
- **Preview**: https://lapulperia.preview.emergentagent.com
- **Dominio Personalizado**: https://lapulperiastore.net (usar Emergent Auth)

## Autenticación
- **Método**: Emergent Auth (Google OAuth manejado)
- Funciona en PC y móvil
- Redirección: `https://auth.emergentagent.com/?redirect={url}/dashboard`

## Sistema de Notificaciones (TRIPLE CAPA)
1. **Notificaciones Push del Navegador** - Service Worker (`/public/sw.js`)
2. **Notificaciones Flotantes** - Componente visual en pantalla (`FloatingNotification.js`)
3. **Toast** - Backup usando Sonner

### Contextos Creados
- `NotificationContext.js` - Maneja notificaciones flotantes en toda la app

### Eventos Notificados
- Nueva orden (para dueños de pulpería)
- Orden aceptada, lista, completada (para clientes)

## Funcionalidades Completadas
- [x] Google OAuth via Emergent Auth
- [x] Notificaciones push del navegador
- [x] Notificaciones flotantes en pantalla
- [x] Toast como backup
- [x] Dirección clickeable -> Google Maps
- [x] Sistema de favoritos
- [x] Órdenes separadas por pulpería
- [x] Mascota "Pulpero"
- [x] Panel de administración

## Arquitectura de Notificaciones
```
/app/frontend/src/
├── components/
│   └── FloatingNotification.js   # Notificaciones visuales flotantes
├── contexts/
│   └── NotificationContext.js    # Contexto global de notificaciones
├── hooks/
│   ├── useNotifications.js       # Push notifications + Service Worker
│   └── useWebSocket.js           # WebSocket + triggers de notificación
└── public/
    └── sw.js                     # Service Worker
```

## Credenciales
- **Admin Email**: onol4sco05@gmail.com
- **Admin Password**: AlEjA127

## Última Actualización: Enero 1, 2025
- Simplificado login para usar solo Emergent Auth (funciona en PC y móvil)
- Sistema de notificaciones de triple capa (push + flotante + toast)
- Dirección clickeable que abre Google Maps
