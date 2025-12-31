# La Pulpería - Product Requirements Document

## Original Problem Statement
Aplicación web para pulperías hondureñas con Google OAuth, sistema de roles, mapa interactivo, catálogo de productos, sistema de pedidos, panel de administración, y sección de empleos/servicios ("Chamba").

## Design System - Estilo Grok con Nebulosa
- **Fondo**: stone-950 con nebulosa roja (blur gradients)
- **Animación**: Partículas flotantes simples (puntitos sin brillo)
- **Scrollbar**: Oscuro (stone-900/stone-800) - NO blanco
- **Colores**: Rojo para app general, Azul para Chamba
- **UI**: Minimalista, bordes stone-800, sin sombras excesivas

## Core Features

### Authentication
- Google OAuth
- Admin panel protegido con contraseña: `AlEjA127`

### Admin Features (solo onol4sco05@gmail.com)
- Precios: L.200 (básico), L.400 (destacado), L.600 (premium)
- Baneo temporal: 1, 3, 7, 30 días
- Badges en español: Novato, En Ascenso, En Llamas, Élite, Campeón, Legendario, Verificado, Socio Oficial
- Mensajes a pulperías (pestaña especial en dashboard)

### Pulperia Features
- Banner visible en dashboard (como lo ve el cliente)
- Pestaña "Mensajes del Admin" en notificaciones

---

## Implemented (December 31, 2025)

### UI Overhaul Completo
- [x] **Landing Page**: Nebulosa roja con partículas flotantes
- [x] **Scrollbar oscuro**: CSS personalizado para todas las páginas
- [x] **Header z-index**: Corregido para notificaciones (z-99999)
- [x] **Advertising Page**: Overhaul visual con colores emerald, violet, amber
- [x] **OrderHistory/Reportes**: Overhaul visual y funcional con cards oscuras
- [x] **PulperiaDashboard**: Estilo oscuro consistente
- [x] **Todas las páginas**: bg-stone-950, borders stone-800

### Componentes Actualizados
- AnimatedBackground: Partículas simples flotantes
- Header: Simplificado, dropdown z-99999
- BottomNav: Estilo oscuro
- index.css: Scrollbar oscuro, variables dark theme

---

## Visual Theme Specs
```css
/* Colors */
Background: #0c0a09 (stone-950)
Cards: #1c1917 (stone-900)
Borders: #292524 (stone-800)
Text Primary: white
Text Secondary: #78716c (stone-500)
Accent Red: #ef4444 (red-500)
Accent Blue: #3b82f6 (blue-500)

/* Scrollbar */
Track: #0c0a09
Thumb: #292524
Thumb Hover: #44403c
```

---

## Backlog

### P1
- [ ] Editar/Eliminar Anuncios

### P2
- [ ] Botón fullscreen mapa

---

## Credentials
- Admin: onol4sco05@gmail.com
- Admin Password: AlEjA127
