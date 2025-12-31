# 🚀 Guía de Deployment en Cloudflare - La Pulpería

Esta aplicación está lista para ser desplegada en Cloudflare. Sigue estos pasos para tenerla funcionando.

## 🎯 Arquitectura de Deployment

```
┌─────────────────────────────────────────────┐
│       CLOUDFLARE PAGES (Frontend)           │
│       tu-proyecto.pages.dev                 │
│                                             │
│  • React App (build estático)              │
│  • SSL/HTTPS automático                    │
│  • CDN global                              │
├─────────────────────────────────────────────┤
│               API Calls                     │
│                   ↓                         │
│       BACKEND (Emergent/Railway)            │
│   red-auth-connect.preview.emergentagent.com│
│                                             │
│  • FastAPI                                 │
│  • Google OAuth via Emergent Auth          │
│  • MongoDB                                 │
└─────────────────────────────────────────────┘
```

## 📦 PASO 1: Preparar el Build

```bash
cd frontend
yarn install
yarn build
```

Esto creará una carpeta `build/` con los archivos estáticos optimizados.

## ☁️ PASO 2: Deploy a Cloudflare Pages

### Opción A: Deploy Automático desde GitHub (Recomendado)

1. **Sube tu código a GitHub:**
   ```bash
   git add .
   git commit -m "Ready for Cloudflare deployment"
   git push origin main
   ```

2. **Conecta con Cloudflare Pages:**
   - Ve a [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Click en **"Pages"** en el menú lateral
   - Click en **"Create a project"** → **"Connect to Git"**
   - Selecciona tu repositorio

3. **Configura el Build:**
   ```
   Framework preset: Create React App
   Build command: cd frontend && yarn install && yarn build
   Build output directory: frontend/build
   Root directory: /
   ```

4. **Variables de Entorno (MUY IMPORTANTE):**
   ```
   REACT_APP_BACKEND_URL = https://pulpito-delivery.preview.emergentagent.com
   NODE_VERSION = 18
   ```

5. Click en **"Save and Deploy"**

### Opción B: Deploy Manual con Wrangler CLI

```bash
# Instalar Wrangler
npm install -g wrangler

# Login a Cloudflare
wrangler login

# Build
cd frontend
yarn build

# Deploy
wrangler pages deploy build --project-name=la-pulperia
```

## 🔐 PASO 3: Configurar Google OAuth

Para que el login funcione desde tu dominio de Cloudflare:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Selecciona tu proyecto OAuth
3. Edita el "OAuth 2.0 Client ID"
4. En **"Authorized redirect URIs"**, añade:
   ```
   https://tu-proyecto.pages.dev/dashboard
   https://tu-dominio-personalizado.com/dashboard
   ```
5. Guarda los cambios

**IMPORTANTE:** El sistema usa Emergent Auth que maneja Google OAuth automáticamente.
El redirect dinámico (`window.location.origin`) asegura que funcione en cualquier dominio.

## 🌐 PASO 4: Dominio Personalizado (Opcional)

1. En Cloudflare Pages, ve a tu proyecto
2. Click en **"Custom domains"**
3. Añade tu dominio (ej: `lapulperiahn.shop`)
4. Sigue las instrucciones para configurar DNS

## ✅ Verificación

Después del deploy, verifica:

1. **Frontend carga:** `https://tu-proyecto.pages.dev`
2. **Botón de login funciona:** Debería redirigir a Google
3. **Después de login:** Debería volver a tu app y mostrar el selector de tipo de usuario

## 🚨 Troubleshooting

### Error: "Redirect URI mismatch"
- Verifica que tu dominio esté en las URIs autorizadas de Google Cloud Console

### Error: "CORS error"
- El backend ya tiene CORS configurado para aceptar cualquier origen (`*`)
- Si usas un dominio específico, asegúrate de que esté en `CORS_ORIGINS`

### Login no funciona
- Abre DevTools (F12) → Console
- Verifica que no haya errores de red
- Verifica que `REACT_APP_BACKEND_URL` sea correcto

## 📝 Resumen de URLs

| Componente | URL |
|------------|-----|
| Frontend (Cloudflare) | `https://tu-proyecto.pages.dev` |
| Backend (Emergent) | `https://pulpito-delivery.preview.emergentagent.com` |
| Auth Service | `https://auth.emergentagent.com` |

## 🎉 ¡Listo!

Tu aplicación La Pulpería está ahora desplegada en Cloudflare con:
- ✅ SSL/HTTPS automático
- ✅ CDN global para carga rápida
- ✅ Google OAuth funcionando
- ✅ Diseño profesional "Rojo Pulpo"
- ✅ Listo para producción
