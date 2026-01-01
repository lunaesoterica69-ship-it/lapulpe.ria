# La Pulpería - Product Requirements Document

## Estado Actual: ✅ LISTO PARA LANZAMIENTO

## URLs
- **Preview**: https://achiev-meritocracy.preview.emergentagent.com
- **Dominio**: https://lapulperiastore.net

## Base de Datos
### Pulperías Activas: 2
1. **Panaderia Las Recetas de Alba** - Panadería local
2. **Bodega Diaz** - Bodega/tienda

### Admin
- Email: onol4sco05@gmail.com

## Diseño
- Tema galáctico oscuro con nebulosas rojas
- Logo SVG Art Deco con:
  - Techo PLANO escalonado (3 niveles horizontales)
  - Paredes color crema
  - Ventanas con productos y decoraciones Art Deco
  - Puerta de madera con arco decorativo
  - Letrero "PULPERÍA"
  - Líneas doradas decorativas
- Medallas doradas estilo Art Deco

## Sistema de Meritocracia (Medallas)
Las medallas se ganan automáticamente basadas en métricas reales:

### Nivel 1 - Principiante
| Medalla | Criterio | Puntos |
|---------|----------|--------|
| Primera Venta | 1 venta | 10 |
| Catálogo Inicial | 5 productos | 10 |

### Nivel 2 - En Progreso
| Medalla | Criterio | Puntos |
|---------|----------|--------|
| 10 Ventas | 10 ventas | 25 |
| Catálogo Completo | 15 productos | 25 |
| Ganando Visibilidad | 50 visitas | 20 |

### Nivel 3 - Establecido
| Medalla | Criterio | Puntos |
|---------|----------|--------|
| Clientes Felices | 10 reseñas 4+ estrellas | 40 |
| Vendedor Activo | 50 ventas | 50 |
| Pulpería Popular | 200 visitas | 40 |

### Nivel 4 - Experto
| Medalla | Criterio | Puntos |
|---------|----------|--------|
| Vendedor Estrella | 100 ventas | 75 |
| Super Catálogo | 30 productos | 50 |
| Muy Popular | 500 visitas | 60 |

### Nivel 5 - Legendario
| Medalla | Criterio | Puntos |
|---------|----------|--------|
| Verificado | Admin verifica | 100 |
| Top Vendedor | 250 ventas | 150 |
| Leyenda Local | 1000 visitas + 50 reseñas | 200 |

## Sistema de Anuncios Destacados (1000 Lps/mes)
1. Admin habilita slot para pulpería en `/admin`
2. Pulpería recibe notificación
3. Pulpería sube 1 anuncio (imagen/video) en `/anuncios`
4. Anuncio visible para todos por 30 días

## Sistema de Cerrar Tienda
- Los dueños pueden cerrar su pulpería permanentemente
- Accesible desde Dashboard > Editar > "Cerrar Mi Tienda Permanentemente"
- Requiere escribir el nombre exacto de la pulpería como confirmación
- Elimina: productos, órdenes, reseñas, logros, anuncios, empleos
- Cambia el usuario a tipo "cliente" automáticamente

## Funcionalidades Implementadas
- ✅ Login con Google (Emergent Auth + OAuth propio para dominio)
- ✅ Mapa con pulperías cercanas
- ✅ Carrito de compras
- ✅ Sistema de órdenes
- ✅ Dashboard para pulperías con estadísticas
- ✅ Sistema de logros/medallas por meritocracia
- ✅ Sistema de anuncios destacados (admin habilita)
- ✅ Notificaciones (contador solo de no leídas)
- ✅ Página de búsqueda de productos
- ✅ Sistema de cerrar tienda (eliminar pulpería)

## Endpoints Importantes
- `GET /api/pulperias` - Lista de pulperías
- `GET /api/featured-ads` - Anuncios destacados
- `GET /api/achievements/definitions` - Definiciones de logros
- `GET /api/pulperias/{id}/achievements` - Logros de una pulpería
- `GET /api/pulperias/{id}/stats` - Estadísticas (auto-verifica logros)
- `POST /api/admin/featured-ads/enable-slot` - Habilitar slot de anuncio
- `DELETE /api/pulperias/{id}/close` - Cerrar tienda (dueño)

## Arquitectura
```
/app/
├── backend/
│   └── server.py          # FastAPI + MongoDB
└── frontend/
    └── src/
        ├── components/
        │   ├── ArtDecoBadge.js      # Medallas doradas
        │   ├── FeaturedAdsCarousel.js # Carousel de anuncios
        │   └── ...
        └── pages/
            ├── LandingPage.js       # Logo SVG Art Deco (techo plano)
            ├── FeaturedAdsPage.js   # Página de anuncios
            ├── PulperiaDashboard.js # Dashboard con logros y cerrar tienda
            └── AdminPanel.js        # Panel admin con slots
```

## Última Actualización
- Fecha: Enero 2025
- Cambios:
  - Logo Art Deco con techo PLANO escalonado (no triangular)
  - Sistema para cerrar tienda implementado (DELETE /api/pulperias/{id}/close)
  - Eliminada página temporal BadgeDemo
  - Mejorado manejo de login en dominio personalizado
