#!/usr/bin/env bash
set -e

echo "🚀 Starting Deployment on KVM2 VPS..."

# 1. Pull latest code from main branch
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# 2. Install dependencies
echo "📦 Installing dependencies..."
npm install
rm -rf server/node_modules

# 3. Prisma database sync & client generation
echo "🗄️ Syncing Prisma schema..."
npx prisma generate
npx prisma db push

# 4. Build Frontend Assets
echo "🏗️ Building frontend dist bundle..."
npm run build

# 5. Restart PM2 Process
echo "🔄 Restarting Node API in PM2..."
pm2 restart ecosystem.config.cjs --env production || pm2 start ecosystem.config.cjs --env production
pm2 save

# 6. Test Nginx & Reload
echo "🌐 Reloading Nginx server..."
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Deployment complete! Check backend logs with: pm2 logs thenexopp-api"
