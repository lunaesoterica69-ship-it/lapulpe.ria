#!/bin/bash

# 🚀 Script de Deployment Completo para Cloudflare
# La Pulpería - Deployment Automatizado

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "================================================"
echo "  🚀 La Pulpería - Deployment a Cloudflare"
echo "================================================"
echo -e "${NC}"

# Verificar que estamos en el directorio correcto
if [ ! -d "/app/frontend" ]; then
    echo -e "${RED}❌ Error: Directorio /app/frontend no encontrado${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Paso 1: Limpiando builds anteriores...${NC}"
cd /app/frontend
rm -rf build node_modules/.cache
echo -e "${GREEN}✅ Limpieza completada${NC}"

echo ""
echo -e "${YELLOW}🔧 Paso 2: Verificando variables de entorno...${NC}"
if [ -f ".env.production" ]; then
    echo -e "${GREEN}✅ .env.production encontrado${NC}"
    cat .env.production
else
    echo -e "${RED}❌ .env.production no encontrado${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}🏗️ Paso 3: Creando build de producción...${NC}"
echo -e "${BLUE}Esto puede tomar 1-2 minutos...${NC}"
CI=false yarn build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error en el build${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completado${NC}"

echo ""
echo -e "${YELLOW}🔍 Paso 4: Verificando build...${NC}"

# Verificar que usa URL correcta
BACKEND_URL=$(grep -o 'gui-redesign-1.preview.emergentagent.com' build/static/js/main.*.js | head -1)
if [ -n "$BACKEND_URL" ]; then
    echo -e "${GREEN}✅ Backend URL correcta: $BACKEND_URL${NC}"
else
    echo -e "${RED}❌ Backend URL no encontrada${NC}"
    exit 1
fi

# Verificar que NO usa localhost
LOCALHOST_COUNT=$(grep -c 'localhost:8001' build/static/js/main.*.js 2>/dev/null || echo "0")
if [ "$LOCALHOST_COUNT" -eq "0" ]; then
    echo -e "${GREEN}✅ Sin referencias a localhost${NC}"
else
    echo -e "${RED}❌ Encontradas $LOCALHOST_COUNT referencias a localhost${NC}"
    exit 1
fi

# Verificar archivos de Cloudflare
if [ -f "build/_headers" ]; then
    echo -e "${GREEN}✅ _headers presente${NC}"
else
    echo -e "${YELLOW}⚠️ _headers no encontrado, copiando...${NC}"
    cp public/_headers build/
fi

if [ -f "build/_redirects" ]; then
    echo -e "${GREEN}✅ _redirects presente${NC}"
else
    echo -e "${YELLOW}⚠️ _redirects no encontrado, copiando...${NC}"
    cp public/_redirects build/
fi

echo ""
echo -e "${YELLOW}📊 Paso 5: Estadísticas del build...${NC}"
du -sh build/
du -sh build/static/js/
du -sh build/static/css/

echo ""
echo -e "${GREEN}"
echo "================================================"
echo "  ✅ Build Completado y Verificado"
echo "================================================"
echo -e "${NC}"

echo ""
echo -e "${BLUE}📦 Archivos listos en: ${GREEN}/app/frontend/build/${NC}"
echo ""
echo -e "${YELLOW}🚀 Próximos pasos para deployar:${NC}"
echo ""
echo -e "${BLUE}Opción 1 - Wrangler CLI (Recomendado):${NC}"
echo -e "  ${GREEN}cd /app/frontend${NC}"
echo -e "  ${GREEN}wrangler pages deploy build --project-name=la-pulperia${NC}"
echo ""
echo -e "${BLUE}Opción 2 - GitHub (Auto-deploy):${NC}"
echo -e "  ${GREEN}git add .${NC}"
echo -e "  ${GREEN}git commit -m 'Deploy to Cloudflare'${NC}"
echo -e "  ${GREEN}git push origin main${NC}"
echo ""
echo -e "${BLUE}Opción 3 - Drag & Drop:${NC}"
echo -e "  1. Ve a Cloudflare Pages Dashboard"
echo -e "  2. Tu proyecto → Upload assets"
echo -e "  3. Arrastra la carpeta: ${GREEN}/app/frontend/build${NC}"
echo ""
echo -e "${YELLOW}⚙️ Variables de entorno en Cloudflare Pages:${NC}"
echo -e "  ${GREEN}REACT_APP_BACKEND_URL${NC} = https://achiev-meritocracy.preview.emergentagent.com"
echo ""
echo -e "${GREEN}¡Listo para deployar! 🎉${NC}"
echo ""
