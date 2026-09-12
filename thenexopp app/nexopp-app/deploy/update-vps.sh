#!/usr/bin/env bash
# ==============================================================================
# TheNexopp Agent - Quick Update & Redeploy Script
# ==============================================================================

set -e

APP_DIR="/opt/thenexopp-agent"
echo "🔄 Pulling latest updates in $APP_DIR..."
cd "$APP_DIR"
git pull origin master || git pull

# 1. Update Backend
echo "🔨 Updating Backend..."
cd "$APP_DIR/backend"
npm install
npm run build
pm2 restart thenexopp-backend --update-env

# 2. Update Admin Portal
echo "🔨 Updating Admin Portal..."
cd "$APP_DIR/admin"
npm install
npm run build

# 3. Update Mobile App if archive present
if [ -f "$APP_DIR/deploy/mobile-web.tar.gz" ]; then
    mkdir -p "$APP_DIR/mobile/build/web"
    tar -xzf "$APP_DIR/deploy/mobile-web.tar.gz" -C "$APP_DIR/mobile/build/web"
fi

# 4. Reload Nginx
nginx -t && systemctl reload nginx

echo "✅ All services updated and running smoothly!"
