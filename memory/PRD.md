# La Pulpería - Product Requirements Document

## Original Problem Statement
Aplicación web para pulperías hondureñas con Google OAuth, sistema de roles, mapa interactivo, catálogo de productos, sistema de pedidos, panel de administración, y sección de empleos/servicios ("Chamba").

## Design System - Estilo Grok
- **Fondo**: stone-950 (oscuro sólido, sin gradientes)
- **Animación**: Partículas flotantes simples (puntitos, sin brillo)
- **Colores**: Rojo para app general, Azul para sección Chamba
- **UI**: Minimalista, limpia, sin sombras excesivas
- **Tipografía**: Pesos normales, sin negritas excesivas

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

### UI Refresh - Estilo Grok
- [x] AnimatedBackground: Partículas simples flotantes (sin brillo)
- [x] Landing page: Minimalista, centrada, limpia
- [x] Header: Simplificado, backdrop-blur-sm
- [x] BottomNav: Simplificado, iconos más pequeños
- [x] MapView: Fondo sólido, botones simples
- [x] SearchProducts: Estilo consistente
- [x] JobsServices: Tema azul con partículas azules

### Admin Panel
- [x] Contraseña requerida: AlEjA127
- [x] Badges en español
- [x] Baneo temporal con duración
- [x] Mensajes a pulperías
- [x] Precios actualizados

### Pulperia Dashboard
- [x] Preview del banner visible
- [x] Pestaña "Mensajes del Admin"

---

## API Pricing
- Básico: L.200 / 7 días
- Destacado: L.400 / 15 días  
- Premium: L.600 / 30 días

## Badge System (Spanish)
| ID | Name | Icon |
|----|------|------|
| novato | Novato | Star |
| en_ascenso | En Ascenso | Zap |
| en_llamas | En Llamas | Flame |
| elite | Élite | Gem |
| campeon | Campeón | Trophy |
| legendario | Legendario | Crown |
| verificado | Verificado | Check |
| socio | Socio Oficial | Target |

---

## Backlog

### P1
- [ ] Editar/Eliminar Anuncios

### P2
- [ ] Botón fullscreen mapa

### P3
- [ ] Push notifications
- [ ] Pagos integrados

---

## Credentials
- Admin: onol4sco05@gmail.com
- Admin Password: AlEjA127
