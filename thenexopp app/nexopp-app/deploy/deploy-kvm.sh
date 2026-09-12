#!/usr/bin/env bash
# ==============================================================================
# TheNexopp Complete Multi-Service KVM VPS Deployment Script
# Safely deploys Website, Website Admin, Agent API & Agent Admin
# ==============================================================================

set -e

echo "🚀 [1/6] Starting Safe Production Deployment on KVM VPS..."

# 1. Pull latest git changes
echo "📥 [2/6] Pulling latest updates from Git repository..."
cd /opt/Thenexopp
git pull origin main

mkdir -p logs
mkdir -p "thenexopp app/nexopp-app/backend/logs"
mkdir -p "thenexopp app/nexopp-app/backend/uploads"

# 2. Build Website Frontend & Sync Database
echo "🗄️ [3/6] Syncing Website Prisma Database & Building Website Bundle..."
npm install
npx prisma generate
npx prisma db push
npm run build

# 3. Build Agent NestJS Backend
echo "⚙️ [4/6] Building Agent NestJS Backend API..."
cd "thenexopp app/nexopp-app/backend"
npm install
npm run build
cd /opt/Thenexopp

# 4. Build Agent Admin React Portal
echo "💻 [5/6] Building Agent Admin Management Portal..."
cd "thenexopp app/nexopp-app/admin"
npm install
npm run build
cd /opt/Thenexopp

# 5. Restart PM2 Unified Processes
echo "🔄 [6/6] Reloading PM2 Processes with Zero Downtime..."
pm2 startOrReload ecosystem.production.cjs --env production || (pm2 delete all && pm2 start ecosystem.production.cjs --env production)
pm2 save

# 6. Test and Reload Nginx
echo "🌐 Reloading Nginx Configuration..."
sudo nginx -t && sudo systemctl reload nginx || true

echo "=============================================================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "👉 Website:                https://thenexopp.com"
echo "👉 Website Admin Portal:   https://thenexopp.com/secure-control-x7k9p2"
echo "👉 Website Admin Subdomain:https://admin.thenexopp.com"
echo "👉 Agent Backend API:      https://api.thenexopp.com/api/v1 (or https://thenexopp.com/api/v1)"
echo "👉 Agent Admin Subdomain:  https://agent-admin.thenexopp.com"
echo "👉 Agent Admin Subpath:    https://thenexopp.com/agent-admin/"
echo "👉 Swagger Docs:           https://api.thenexopp.com/api/docs"
echo "=============================================================================="
