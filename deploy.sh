#!/usr/bin/env bash
# ==============================================================================
# TheNexopp Complete VPS Deployment Script
# Automatically builds & deploys Website, Agent Backend & Agent Admin
# ==============================================================================

set -e

echo "🚀 [1/6] Starting Safe Production Deployment on KVM VPS..."

cd /opt/Thenexopp

# 1. Pull latest git changes
echo "📥 [2/6] Pulling latest code from GitHub main branch..."
git pull origin main

mkdir -p logs
mkdir -p "thenexopp app/nexopp-app/backend/logs"
mkdir -p "thenexopp app/nexopp-app/backend/uploads"

# 2. Build Agent NestJS Backend
echo "⚙️ [3/6] Building Agent NestJS Backend API..."
cd "/opt/Thenexopp/thenexopp app/nexopp-app/backend"
npm install
npm run build
cd /opt/Thenexopp

# 3. Build Agent Admin React Portal
echo "💻 [4/6] Building Agent Admin Management Portal..."
cd "/opt/Thenexopp/thenexopp app/nexopp-app/admin"
npm install
npm run build
cd /opt/Thenexopp

# 4. Build Website Frontend & Sync Database (automatically embeds Agent Admin dist)
echo "🗄️ [5/6] Syncing Website Prisma Database & Building Website Bundle..."
npm install
npx prisma generate
npm run build

# 5. Restart PM2 Unified Processes Directly
echo "🔄 [6/6] Reloading PM2 Processes Directly..."
pm2 delete all || true

# Start Website Backend (Port 8081)
cd /opt/Thenexopp
PORT=8081 pm2 start server/server.js --name "thenexopp-api" --update-env

# Start Agent Backend API (Port 3000)
cd "/opt/Thenexopp/thenexopp app/nexopp-app/backend"
PORT=3000 AGENT_PORT=3000 pm2 start dist/main.js --name "thenexopp-backend" --interpreter node --update-env

cd /opt/Thenexopp
pm2 save

# 6. Apply & Reload Nginx
echo "🌐 Updating & Reloading Nginx Configuration..."
if [ -d "/etc/nginx/sites-available" ]; then
    sudo cp "/opt/Thenexopp/thenexopp app/nexopp-app/deploy/nginx-thenexopp-production.conf" /etc/nginx/sites-available/thenexopp.conf || true
    sudo ln -sf /etc/nginx/sites-available/thenexopp.conf /etc/nginx/sites-enabled/thenexopp.conf || true
fi
sudo nginx -t && sudo systemctl reload nginx || true

echo "=============================================================================="
echo "✅ DEPLOYMENT COMPLETE & ALL PROCESSES RUNNING!"
echo "👉 Website:                https://thenexopp.com"
echo "👉 Website Admin Portal:   https://thenexopp.com/secure-control-x7k9p2"
echo "👉 Direct Agent Admin Link:https://thenexopp.com/secure-control-x7k9p2/agentadmin"
echo "👉 Agent Backend API:      https://api.thenexopp.com/api/v1 (or https://thenexopp.com/api/v1)"
echo "=============================================================================="
pm2 status
