#!/bin/bash

# 🚀 Script de Optimización para Cloudflare Deployment
# La Pulpería

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "================================================"
echo "  🚀 Optimizando La Pulpería para Cloudflare"
echo "================================================"
echo -e "${NC}"

# Verificar que estamos en el directorio correcto
if [ ! -d "/app/frontend" ]; then
    echo -e "${RED}❌ Error: Directorio /app/frontend no encontrado${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Paso 1: Limpiando builds anteriores...${NC}"
cd /app/frontend
rm -rf build
rm -rf node_modules/.cache
echo -e "${GREEN}✅ Limpieza completada${NC}"

echo ""
echo -e "${YELLOW}📦 Paso 2: Instalando dependencias...${NC}"
yarn install --frozen-lockfile
echo -e "${GREEN}✅ Dependencias instaladas${NC}"

echo ""
echo -e "${YELLOW}🛠️  Paso 3: Creando build optimizado de producción...${NC}"
echo -e "${BLUE}Esto puede tomar 1-2 minutos...${NC}"
CI=false yarn build
echo -e "${GREEN}✅ Build completado${NC}"

echo ""
echo -e "${YELLOW}📊 Paso 4: Analizando tamaño del build...${NC}"
du -sh build/
du -sh build/static/js/
du -sh build/static/css/
echo ""

echo -e "${YELLOW}📝 Paso 5: Verificando archivos de Cloudflare...${NC}"
if [ -f "public/_headers" ]; then
    echo -e "${GREEN}✅ _headers encontrado${NC}"
else
    echo -e "${RED}❌ _headers no encontrado${NC}"
fi

if [ -f "public/_redirects" ]; then
    echo -e "${GREEN}✅ _redirects encontrado${NC}"
else
    echo -e "${RED}❌ _redirects no encontrado${NC}"
fi

echo ""
echo -e "${YELLOW}📦 Paso 6: Copiando archivos de configuración...${NC}"
cp public/_headers build/ 2>/dev/null || echo -e "${YELLOW}⚠️  No se pudo copiar _headers${NC}"
cp public/_redirects build/ 2>/dev/null || echo -e "${YELLOW}⚠️  No se pudo copiar _redirects${NC}"
echo -e "${GREEN}✅ Archivos copiados${NC}"

echo ""
echo -e "${GREEN}"
echo "================================================"
echo "  ✅ ¡Optimización Completada!"
echo "================================================"
echo -e "${NC}"

echo ""
echo -e "${BLUE}📊 Estadísticas del Build:${NC}"
echo -e "${YELLOW}Directorio: ${GREEN}/app/frontend/build${NC}"
echo ""

echo -e "${BLUE}🚀 Próximos Pasos:${NC}"
echo ""
echo -e "${YELLOW}Opción 1 - Deploy con Wrangler CLI:${NC}"
echo -e "  ${GREEN}wrangler pages deploy build --project-name=la-pulperia${NC}"
echo ""
echo -e "${YELLOW}Opción 2 - Deploy automático con GitHub:${NC}"
echo -e "  1. ${GREEN}git add .${NC}"
echo -e "  2. ${GREEN}git commit -m 'Optimizado para Cloudflare'${NC}"
echo -e "  3. ${GREEN}git push origin main${NC}"
echo -e "  4. Cloudflare Pages detectará y desplegará automáticamente"
echo ""
echo -e "${BLUE}📚 Documentación completa:${NC}"
echo -e "  ${GREEN}/app/CLOUDFLARE_DEPLOYMENT.md${NC}"
echo ""

echo -e "${GREEN}❤️  Lema: Qué deseaba${NC}"
echo ""
