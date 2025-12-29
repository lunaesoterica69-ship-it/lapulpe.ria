#!/bin/bash

# La Pulpería - Script de Inicio
# Este script inicia la aplicación completa

set -e

echo "🎉 Iniciando La Pulpería..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -d "/app/backend" ] || [ ! -d "/app/frontend" ]; then
    echo -e "${RED}❌ Error: Directorios backend o frontend no encontrados${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Directorios verificados${NC}"

# Verificar variables de entorno
if [ ! -f "/app/backend/.env" ]; then
    echo -e "${RED}❌ Error: backend/.env no encontrado${NC}"
    exit 1
fi

if [ ! -f "/app/frontend/.env" ]; then
    echo -e "${RED}❌ Error: frontend/.env no encontrado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Variables de entorno verificadas${NC}"

# Verificar MongoDB
echo -e "${YELLOW}🔍 Verificando MongoDB...${NC}"
if ! pgrep -x "mongod" > /dev/null; then
    echo -e "${YELLOW}⚠️ MongoDB no está corriendo. Intentándolo iniciar...${NC}"
    sudo service mongodb start || echo -e "${YELLOW}⚠️ No se pudo iniciar MongoDB automáticamente${NC}"
fi

# Iniciar servicios con supervisor
echo -e "${YELLOW}🚀 Iniciando servicios...${NC}"

if [ -f "/app/supervisord.conf" ]; then
    echo -e "${GREEN}Usando Supervisor...${NC}"
    sudo supervisorctl reread
    sudo supervisorctl update
    sudo supervisorctl start all
    
    sleep 3
    
    echo -e "\n${GREEN}🎉 Servicios iniciados!${NC}"
    echo -e "\n${YELLOW}Estado de los servicios:${NC}"
    sudo supervisorctl status
    
    echo -e "\n${GREEN}🌐 URLs de Acceso:${NC}"
    echo -e "  Frontend: ${GREEN}http://localhost:3000${NC}"
    echo -e "  Backend API: ${GREEN}http://localhost:8001/api${NC}"
    echo -e "  API Docs: ${GREEN}http://localhost:8001/docs${NC}"
    
    echo -e "\n${YELLOW}📝 Ver Logs:${NC}"
    echo -e "  Backend: ${GREEN}tail -f /var/log/supervisor/backend.out.log${NC}"
    echo -e "  Frontend: ${GREEN}tail -f /var/log/supervisor/frontend.out.log${NC}"
    
    echo -e "\n${YELLOW}🔄 Reiniciar Servicios:${NC}"
    echo -e "  ${GREEN}sudo supervisorctl restart all${NC}"
    
else
    echo -e "${RED}❌ supervisord.conf no encontrado${NC}"
    echo -e "${YELLOW}Iniciando manualmente...${NC}"
    
    # Backend
    cd /app/backend
    echo -e "${YELLOW}Iniciando backend...${NC}"
    nohup uvicorn server:app --host 0.0.0.0 --port 8001 --reload > /tmp/backend.log 2>&1 &
    
    # Frontend
    cd /app/frontend
    echo -e "${YELLOW}Iniciando frontend...${NC}"
    nohup bash -c "PORT=3000 yarn start" > /tmp/frontend.log 2>&1 &
    
    sleep 3
    
    echo -e "\n${GREEN}🎉 Servicios iniciados manualmente!${NC}"
    echo -e "${YELLOW}Logs:${NC}"
    echo -e "  Backend: ${GREEN}tail -f /tmp/backend.log${NC}"
    echo -e "  Frontend: ${GREEN}tail -f /tmp/frontend.log${NC}"
fi

echo -e "\n${GREEN}✅ La Pulpería está corriendo!${NC}"
echo -e "${YELLOW}❤️  Lema: Qué deseaba${NC}\n"
