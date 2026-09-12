#!/usr/bin/env bash
# ==============================================================================
# TheNexopp Agent - Master VPS Setup & Deployment Script
# Target: /opt/thenexopp-agent (Ubuntu 22.04 / 24.04 LTS)
# Domain: api.thenexopp.com -> Admin Portal + REST API + WebSockets
# ==============================================================================

set -e

APP_DIR="/opt/thenexopp-agent"
echo "🚀 Starting TheNexopp Agent Setup for api.thenexopp.com..."

# 1. Update system packages
apt-get update -y
apt-get install -y curl git nginx ufw build-essential unzip sqlite3 certbot python3-certbot-nginx

# 2. Install Node.js 20 LTS
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# 3. Install PM2
npm install -g pm2

# 4. Create Persistent Upload Directories
mkdir -p "$APP_DIR/backend/uploads/private-kyc"
mkdir -p "$APP_DIR/backend/uploads/property-images"
mkdir -p "$APP_DIR/backend/uploads/payment-proofs"
mkdir -p "$APP_DIR/backend/uploads/common"
chmod -R 777 "$APP_DIR/backend/uploads"

# 5. Build Backend
echo "🔨 Building Backend API & WebSocket Server..."
cd "$APP_DIR/backend"
npm install
npm run build

# 6. Build Admin Portal
echo "🔨 Building Admin Management Portal..."
cd "$APP_DIR/admin"
npm install
npm run build

# 6.5 Deploy Mobile App
echo "📱 Deploying Mobile Web App..."
mkdir -p "$APP_DIR/mobile/build/web"
if [ -f "$APP_DIR/deploy/mobile-web.tar.gz" ]; then
    tar -xzf "$APP_DIR/deploy/mobile-web.tar.gz" -C "$APP_DIR/mobile/build/web"
fi

# 7. Configure Nginx
echo "🌐 Configuring Nginx for api.thenexopp.com..."
rm -f /etc/nginx/sites-enabled/*
rm -f /etc/nginx/conf.d/*

cat << 'NGINX_EOF' > /etc/nginx/sites-available/thenexopp
# ==============================================================================
# 1. Primary Host: api.thenexopp.com & admin.thenexopp.com
# ==============================================================================
server {
    listen 80;
    listen [::]:80;
    server_name api.thenexopp.com admin.thenexopp.com;

    client_max_body_size 50M;

    # Admin Portal (React App)
    root /opt/thenexopp-agent/admin/dist;
    index index.html;

    # 1. Backend REST API
    location /api/v1/ {
        proxy_pass http://127.0.0.1:3000/api/v1/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90s;
    }

    # 2. Socket.io WebSockets
    location /socket.io/ {
        proxy_pass http://127.0.0.1:3000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    location /ws/ {
        proxy_pass http://127.0.0.1:3000/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # 3. Uploads Storage
    location /uploads/ {
        alias /opt/thenexopp-agent/backend/uploads/;
        autoindex off;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        try_files $uri =404;
    }

    # 4. Admin Frontend SPA Routing
    location /admin {
        alias /opt/thenexopp-agent/admin/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# ==============================================================================
# 2. Default Host / Mobile Agent App (VPS IP / Port 80 default)
# ==============================================================================
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name app.thenexopp.com agent.thenexopp.com _;

    client_max_body_size 50M;

    root /opt/thenexopp-agent/mobile/build/web;
    index index.html;

    location /api/v1/ {
        proxy_pass http://127.0.0.1:3000/api/v1/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /socket.io/ {
        proxy_pass http://127.0.0.1:3000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    location /ws/ {
        proxy_pass http://127.0.0.1:3000/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    location /uploads/ {
        alias /opt/thenexopp-agent/backend/uploads/;
        expires 30d;
    }

    location /admin {
        alias /opt/thenexopp-agent/admin/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX_EOF

ln -sf /etc/nginx/sites-available/thenexopp /etc/nginx/sites-enabled/thenexopp
nginx -t
systemctl reload nginx || systemctl restart nginx
systemctl enable nginx

# 8. Start Backend with PM2
echo "⚡ Starting PM2 Services..."
cd "$APP_DIR/backend"
pm2 delete thenexopp-backend || true
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup systemd -u root --hp /root || true

# 9. Configure Firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw allow 3001/tcp
ufw allow 8080/tcp
ufw --force enable

echo "=============================================================================="
echo "🎉 DEPLOYMENT COMPLETE!"
echo "👉 Admin Management:    https://api.thenexopp.com/"
echo "👉 Backend REST API:    https://api.thenexopp.com/api/v1"
echo "👉 WebSocket Gateway:   wss://api.thenexopp.com/socket.io/"
echo "👉 Uploads Storage:     $APP_DIR/backend/uploads"
echo "=============================================================================="
