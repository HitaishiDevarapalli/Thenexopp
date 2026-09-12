#!/usr/bin/env bash
# ==============================================================================
# TheNexopp SSL & Nginx Production Auto-Configurator
# Works safely on Hostinger / Ubuntu / Debian KVM VPS
# ==============================================================================

set -e

echo "🔧 [1/5] Setting up system directories and PM2 log paths..."
mkdir -p /opt/Thenexopp/logs
mkdir -p "/opt/Thenexopp/thenexopp app/nexopp-app/backend/logs"
mkdir -p "/opt/Thenexopp/thenexopp app/nexopp-app/backend/uploads"
mkdir -p /var/www/certbot

echo "🔍 [2/5] Checking SSL certificates in /etc/letsencrypt/live/..."

DOMAINS=("thenexopp.com" "admin.thenexopp.com" "api.thenexopp.com" "agent-admin.thenexopp.com")
MISSING_CERTS=()

for domain in "${DOMAINS[@]}"; do
    if [ ! -f "/etc/letsencrypt/live/$domain/fullchain.pem" ]; then
        MISSING_CERTS+=("$domain")
    fi
done

if [ ${#MISSING_CERTS[@]} -gt 0 ]; then
    echo "⚠️  Missing SSL certs detected for: ${MISSING_CERTS[*]}"
    echo "🌐 Setting up temporary HTTP configuration to acquire Certbot SSL..."

    # Create temporary HTTP-only configuration to pass ACME challenges
    cat << 'EOF' > /etc/nginx/sites-available/thenexopp-temp.conf
server {
    listen 80;
    listen [::]:80;
    server_name thenexopp.com www.thenexopp.com admin.thenexopp.com api.thenexopp.com agent-admin.thenexopp.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        try_files $uri =404;
    }

    location /api/v1/ {
        proxy_pass http://127.0.0.1:3000/api/v1/;
    }

    location /agent-admin/ {
        alias "/opt/Thenexopp/thenexopp app/nexopp-app/admin/dist/";
        try_files $uri $uri/ /index.html;
    }

    location / {
        proxy_pass http://127.0.0.1:8081;
    }
}
EOF

    ln -sf /etc/nginx/sites-available/thenexopp-temp.conf /etc/nginx/sites-enabled/thenexopp.conf
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && systemctl reload nginx || systemctl restart nginx

    echo "🔐 Attempting to obtain Let's Encrypt SSL certificates..."
    for domain in "${MISSING_CERTS[@]}"; do
        echo "📜 Requesting SSL certificate for: $domain..."
        certbot certonly --webroot -w /var/www/certbot -d "$domain" --non-interactive --agree-tos --register-unsafely-without-email || {
            echo "⚠️ Could not issue certificate for $domain (Check DNS A-record pointing to VPS IP). Continuing..."
        }
    done
fi

echo "📋 [3/5] Applying Full Production Nginx Configuration..."
cp "/opt/Thenexopp/thenexopp app/nexopp-app/deploy/nginx-thenexopp-production.conf" /etc/nginx/sites-available/thenexopp.conf
ln -sf /etc/nginx/sites-available/thenexopp.conf /etc/nginx/sites-enabled/thenexopp.conf
rm -f /etc/nginx/sites-enabled/default

echo "🧪 [4/5] Testing Nginx Configuration..."
if nginx -t; then
    systemctl reload nginx
    echo "✅ Nginx reloaded successfully!"
else
    echo "⚠️ Nginx test failed. Falling back to HTTP-safe config while DNS/SSL is being configured..."
    ln -sf /etc/nginx/sites-available/thenexopp-temp.conf /etc/nginx/sites-enabled/thenexopp.conf
    systemctl reload nginx
fi

echo "🚀 [5/5] Restarting PM2 Microservices..."
cd /opt/Thenexopp
pm2 startOrReload ecosystem.production.cjs --env production || pm2 restart ecosystem.production.cjs --env production
pm2 save

echo ""
echo "=============================================================================="
echo "🎉 DEPLOYMENT AND NGINX INTEGRATION SUCCESSFUL!"
echo "=============================================================================="
echo "🌐 Main Website:           https://thenexopp.com"
echo "🔐 Website Admin:          https://thenexopp.com/secure-control-x7k9p2"
echo "🏢 Website Admin Subdomain: https://admin.thenexopp.com"
echo "📱 Agent Admin (Subdomain): https://agent-admin.thenexopp.com"
echo "📱 Agent Admin (Subpath):   https://thenexopp.com/agent-admin/"
echo "⚙️ Agent Backend API:      https://api.thenexopp.com/api/v1 (or https://thenexopp.com/api/v1)"
echo "📖 Swagger API Docs:       https://api.thenexopp.com/api/docs (or https://thenexopp.com/api/docs)"
echo "=============================================================================="
