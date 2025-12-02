#!/bin/bash

# PD Portal Docker Commands
# Run this script from the project root

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== PD Portal Docker Manager ===${NC}\n"

case "${1:-help}" in
  start)
    echo -e "${GREEN}Starting Docker containers...${NC}"
    docker-compose up -d
    echo -e "${GREEN}✅ Containers started${NC}"
    echo -e "PostgreSQL: localhost:5432"
    echo -e "Backend should connect automatically with existing .env"
    ;;
  
  stop)
    echo -e "${YELLOW}Stopping Docker containers...${NC}"
    docker-compose down
    echo -e "${GREEN}✅ Containers stopped${NC}"
    ;;
  
  restart)
    echo -e "${YELLOW}Restarting Docker containers...${NC}"
    docker-compose restart
    echo -e "${GREEN}✅ Containers restarted${NC}"
    ;;
  
  clean)
    echo -e "${YELLOW}Removing containers and volumes (WARNING: deletes database)${NC}"
    read -p "Are you sure? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      docker-compose down -v
      echo -e "${GREEN}✅ Cleaned up${NC}"
    fi
    ;;
  
  logs)
    echo -e "${BLUE}Showing PostgreSQL logs...${NC}"
    docker-compose logs -f postgres
    ;;
  
  pgadmin)
    echo -e "${GREEN}Opening pgAdmin...${NC}"
    echo "URL: http://localhost:5050"
    echo "Email: admin@example.com"
    echo "Password: admin"
    docker-compose --profile debug up -d pgadmin
    ;;
  
  shell)
    echo -e "${GREEN}Opening PostgreSQL shell...${NC}"
    docker-compose exec postgres psql -U postgres -d pd_portal
    ;;
  
  status)
    echo -e "${BLUE}Container status:${NC}"
    docker-compose ps
    ;;
  
  *)
    echo "Usage: ./docker-manager.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start     - Start all containers"
    echo "  stop      - Stop all containers"
    echo "  restart   - Restart all containers"
    echo "  clean     - Remove containers and volumes (deletes data!)"
    echo "  logs      - Show PostgreSQL logs"
    echo "  pgadmin   - Start pgAdmin (UI for database management)"
    echo "  shell     - Open PostgreSQL shell"
    echo "  status    - Show container status"
    ;;
esac
