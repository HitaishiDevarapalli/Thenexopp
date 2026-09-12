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

# 2. Build Website Frontend & Sync Database
echo "🗄️ [3/6] Syncing Website Prisma Database & Building Website Bundle..."
npm install
npx prisma generate
npm run build

# 3. Build Agent NestJS Backend
echo "⚙️ [4/6] Building Agent NestJS Backend API..."
cd "/opt/Thenexopp/thenexopp app/nexopp-app/backend"
npm install
npm run build
cd /opt/Thenexopp

# 4. Build Agent Admin React Portal
echo "💻 [5/6] Building Agent Admin Management Portal..."
cd "/opt/Thenexopp/thenexopp app/nexopp-app/admin"
npm install
npm run build
cd /opt/Thenexopp

# 5. Restart PM2 Unified Processes Directly
echo "🔄 [6/6] Reloading PM2 Processes Directly..."
pm2 delete all || true

pm2 start server/server.js \
  --name "thenexopp-api" \
  --cwd "/opt/Thenexopp" \
  --max-memory-restart 1G \
  --time

pm2 start "/opt/Thenexopp/thenexopp app/nexopp-app/backend/dist/main.js" \
  --name "thenexopp-backend" \
  --cwd "/opt/Thenexopp/thenexopp app/nexopp-app/backend" \
  --max-memory-restart 1G \
  --time

pm2 save

# 6. Test and Reload Nginx
echo "🌐 Reloading Nginx Configuration..."
sudo nginx -t && sudo systemctl reload nginx || true

echo "=============================================================================="
echo "✅ DEPLOYMENT COMPLETE & ALL PROCESSES RUNNING!"
echo "👉 Website:                https://thenexopp.com"
echo "👉 Website Admin Portal:   https://thenexopp.com/secure-control-x7k9p2"
echo "👉 Agent Backend API:      https://api.thenexopp.com/api/v1 (or https://thenexopp.com/api/v1)"
echo "=============================================================================="
pm2 status
