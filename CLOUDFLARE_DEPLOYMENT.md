# 🚀 Guía de Deployment en Cloudflare - La Pulpería

## 📋 Resumen

Esta guía te ayudará a deployar La Pulpería en Cloudflare de manera optimizada:
- **Frontend**: Cloudflare Pages (React optimizado)
- **Backend**: Servidor tradicional (Railway, Render, DigitalOcean, etc.)
- **CDN**: Cloudflare para caching y performance

---

## 🎯 Arquitectura de Deployment

```
┌─────────────────────────────────────────────────┐
│           CLOUDFLARE (Global CDN)               │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────┐     ┌──────────────────┐  │
│  │ Cloudflare Pages│     │  Cloudflare CDN  │  │
│  │   (Frontend)    │     │  (Static Assets) │  │
│  └────────┬────────┘     └──────────────────┘  │
│           │                                     │
│           │ API Calls                          │
│           ▼                                     │
│  ┌─────────────────┐                          │
│  │   Backend API   │  (Railway/Render/VPS)    │
│  │   FastAPI       │                          │
│  └────────┬────────┘                          │
│           │                                     │
│           ▼                                     │
│  ┌─────────────────┐                          │
│  │    MongoDB      │  (MongoDB Atlas)         │
│  └─────────────────┘                          │
└─────────────────────────────────────────────────┘
```

---

## 📦 PARTE 1: Frontend en Cloudflare Pages

### Opción A: Deploy Automático desde GitHub (Recomendado)

#### Paso 1: Preparar el Repositorio
```bash
# Asegúrate de que tu código esté en GitHub
git add .
git commit -m "Optimizado para Cloudflare Pages"
git push origin main
```

#### Paso 2: Conectar con Cloudflare Pages
1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click en **"Pages"** en el menú lateral
3. Click en **"Create a project"**
4. Selecciona **"Connect to Git"**
5. Autoriza GitHub y selecciona tu repositorio

#### Paso 3: Configurar el Build
```yaml
Framework preset: Create React App
Build command: cd frontend && yarn install && yarn build
Build output directory: frontend/build
Root directory: /
```

#### Paso 4: Variables de Entorno
En Cloudflare Pages settings, añade:
```
REACT_APP_BACKEND_URL=https://tu-backend.railway.app
# o la URL donde esté tu backend
```

#### Paso 5: Deploy
- Click en **"Save and Deploy"**
- Cloudflare construirá y desplegará automáticamente
- Tu sitio estará en: `https://tu-proyecto.pages.dev`

---

### Opción B: Deploy Manual con Wrangler CLI

#### Paso 1: Instalar Wrangler
```bash
npm install -g wrangler
# o
yarn global add wrangler
```

#### Paso 2: Login a Cloudflare
```bash
wrangler login
```

#### Paso 3: Crear el Build
```bash
cd /app/frontend
yarn build
```

#### Paso 4: Deploy
```bash
wrangler pages deploy build --project-name=la-pulperia
```

---

## 🔧 PARTE 2: Backend en Servidor Tradicional

### Opción 1: Railway (Recomendado - Fácil)

#### Paso 1: Crear cuenta en [Railway.app](https://railway.app)

#### Paso 2: New Project
1. Click en **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Selecciona tu repositorio

#### Paso 3: Configurar
```yaml
Start Command: cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT
Root Directory: /
```

#### Paso 4: Variables de Entorno
```env
MONGO_URL=mongodb+srv://...
DB_NAME=la_pulperia_db
CORS_ORIGINS=https://tu-frontend.pages.dev
```

#### Paso 5: Deploy
- Railway desplegará automáticamente
- Te dará una URL: `https://tu-backend.railway.app`

---

### Opción 2: Render.com (Gratis con limitaciones)

#### Paso 1: Crear cuenta en [Render.com](https://render.com)

#### Paso 2: New Web Service
1. Connect tu repositorio de GitHub
2. Name: `la-pulperia-backend`
3. Environment: `Python 3`

#### Paso 3: Configurar
```yaml
Build Command: cd backend && pip install -r requirements.txt
Start Command: cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT
Root Directory: /
```

#### Paso 4: Variables de Entorno
Igual que Railway

---

### Opción 3: DigitalOcean / VPS (Mayor control)

```bash
# Conectar por SSH
ssh root@tu-servidor

# Instalar dependencias
apt update && apt install -y python3 python3-pip mongodb

# Clonar repo
git clone https://github.com/tu-usuario/la-pulperia.git
cd la-pulperia

# Instalar backend
cd backend
pip3 install -r requirements.txt

# Configurar systemd service
sudo nano /etc/systemd/system/lapulperia.service
```

**Contenido del service:**
```ini
[Unit]
Description=La Pulperia Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/root/la-pulperia/backend
ExecStart=/usr/bin/uvicorn server:app --host 0.0.0.0 --port 8001
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Iniciar servicio
sudo systemctl start lapulperia
sudo systemctl enable lapulperia

# Configurar Nginx como reverse proxy
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/lapulperia
```

**Configuración Nginx:**
```nginx
server {
    listen 80;
    server_name api.lapulperia.com;

    location / {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/lapulperia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# SSL con Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.lapulperia.com
```

---

## 💾 PARTE 3: Base de Datos (MongoDB Atlas)

### Paso 1: Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

### Paso 2: Crear Cluster
1. Click en **"Build a Database"**
2. Selecciona **"Free Tier"** (M0)
3. Selecciona región más cercana a Honduras (ej: US East)
4. Click en **"Create"**

### Paso 3: Configurar Acceso
1. **Database Access**: Crear usuario
   - Username: `lapulperia`
   - Password: [generar contraseña segura]
   - Role: `Atlas Admin`

2. **Network Access**: Añadir IPs
   - Click en **"Add IP Address"**
   - Selecciona **"Allow Access from Anywhere"** (0.0.0.0/0)
   - O añade la IP de tu servidor backend

### Paso 4: Obtener Connection String
1. Click en **"Connect"**
2. Selecciona **"Connect your application"**
3. Copia el string:
   ```
   mongodb+srv://lapulperia:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Paso 5: Actualizar Backend
En las variables de entorno de tu backend:
```env
MONGO_URL=mongodb+srv://lapulperia:TU_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
DB_NAME=la_pulperia_db
```

---

## ⚡ PARTE 4: Optimizaciones de Cloudflare

### Configuración de DNS
1. En Cloudflare Dashboard, ve a tu dominio
2. Añade registros DNS:

```
Tipo  Nombre          Contenido                    Proxy
A     @               [IP de tu backend]           ✅
A     www             [IP de tu backend]           ✅
A     api             [IP de tu backend]           ✅
CNAME la-pulperia     tu-proyecto.pages.dev        ✅
```

### Configuración de Cache
1. Ve a **"Caching"** → **"Configuration"**
2. Browser Cache TTL: `4 hours`
3. Caching Level: `Standard`

### Configuración de Speed
1. Ve a **"Speed"** → **"Optimization"**
2. Activa:
   - ✅ Auto Minify (JS, CSS, HTML)
   - ✅ Brotli compression
   - ✅ HTTP/2
   - ✅ HTTP/3 (QUIC)

### Page Rules (Opcional)
```
URL Pattern: api.lapulperia.com/*
Settings:
  - Cache Level: Bypass
  - Disable Performance

URL Pattern: *.lapulperia.com/*.jpg
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
```

---

## 🔒 PARTE 5: Seguridad

### SSL/TLS
1. Ve a **"SSL/TLS"** → **"Overview"**
2. Selecciona: **"Full (strict)"**

### Firewall
1. Ve a **"Security"** → **"WAF"**
2. Activa **"Managed Rules"**
3. Security Level: **"Medium"**

### DDoS Protection
Ya está activado automáticamente en Cloudflare

---

## 📊 PARTE 6: Monitoreo

### Cloudflare Analytics
- Ve a **"Analytics"** → **"Web Analytics"**
- Monitorea:
  - Requests por segundo
  - Bandwidth
  - Cache hit rate
  - Errores 4xx/5xx

### Backend Monitoring
**Opción 1: Usar Railway/Render dashboard**

**Opción 2: Instalar Sentry**
```bash
cd /app/backend
pip install sentry-sdk
```

En `server.py`:
```python
import sentry_sdk

sentry_sdk.init(
    dsn="tu-sentry-dsn",
    traces_sample_rate=1.0,
)
```

---

## 💰 PARTE 7: Costos Estimados

### Opción Gratis (Para empezar)
```
Cloudflare Pages:    $0/mes (unlimited)
Render.com:          $0/mes (con limitaciones)
MongoDB Atlas:       $0/mes (M0 cluster)
Total:               $0/mes
```

### Opción Básica (Recomendada)
```
Cloudflare Pages:    $0/mes
Railway:             $5/mes (Hobby plan)
MongoDB Atlas:       $9/mes (M2 cluster)
Total:               $14/mes
```

### Opción Profesional
```
Cloudflare Pages:    $0/mes
DigitalOcean Droplet: $12/mes (2GB RAM)
MongoDB Atlas:       $25/mes (M10 cluster)
Cloudflare Pro:      $20/mes (opcional)
Total:               $37-57/mes
```

---

## ✅ CHECKLIST DE DEPLOYMENT

### Pre-Deployment
- [ ] Código en GitHub
- [ ] Build de producción funciona
- [ ] Variables de entorno documentadas
- [ ] MongoDB Atlas configurado

### Frontend (Cloudflare Pages)
- [ ] Proyecto creado en Cloudflare
- [ ] Repository conectado
- [ ] Build command configurado
- [ ] Variables de entorno añadidas
- [ ] Primera deployment exitosa
- [ ] Dominio custom configurado (opcional)

### Backend
- [ ] Servicio desplegado (Railway/Render/VPS)
- [ ] Variables de entorno configuradas
- [ ] MongoDB connection string actualizada
- [ ] CORS configurado para frontend
- [ ] SSL/HTTPS funcionando

### DNS y Cloudflare
- [ ] Registros DNS añadidos
- [ ] Proxy activado
- [ ] SSL en modo Full (strict)
- [ ] Cache configurado
- [ ] Firewall activado

### Testing
- [ ] Frontend accesible
- [ ] Backend API responde
- [ ] Login funciona
- [ ] Crear pulpería funciona
- [ ] Órdenes funcionan
- [ ] WebSockets funcionan

---

## 🚀 COMANDOS RÁPIDOS

### Build Local
```bash
cd /app/frontend
yarn build
```

### Deploy Frontend (Wrangler)
```bash
cd /app/frontend
wrangler pages deploy build --project-name=la-pulperia
```

### Ver Logs Backend (Railway)
```bash
railway logs
```

### Actualizar Backend
```bash
git add .
git commit -m "Update backend"
git push origin main
# Railway/Render auto-deploya
```

---

## 🆘 TROUBLESHOOTING

### Error: "Failed to fetch"
**Causa**: CORS no configurado correctamente
**Solución**:
```python
# En backend/server.py
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,  # Tu dominio de Cloudflare
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Error: "WebSocket connection failed"
**Causa**: Cloudflare no proxy WebSockets en ciertos planes
**Solución**: 
- Usar dominio directo para WebSockets
- O actualizar a plan Pro de Cloudflare

### Error: "Build failed"
**Causa**: Node version incorrecta
**Solución**: 
- En Cloudflare Pages settings
- Set `NODE_VERSION = 18`

---

## 📚 RECURSOS ADICIONALES

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Railway Docs](https://docs.railway.app/)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)

---

## 🎉 ¡Deployment Exitoso!

Una vez completados todos los pasos, tu aplicación estará:
- ✅ Distribuida globalmente vía Cloudflare CDN
- ✅ Con SSL/HTTPS automático
- ✅ Protegida contra DDoS
- ✅ Con caching optimizado
- ✅ Escalable y confiable

**URLs Finales:**
```
Frontend: https://lapulperia.pages.dev
Backend:  https://api.lapulperia.com
Docs:     https://api.lapulperia.com/docs
```

**¡Éxito con el deployment en Cloudflare! 🚀**
