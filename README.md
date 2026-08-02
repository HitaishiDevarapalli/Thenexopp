# The Nexopp - Production Architecture & Deployment Guide

> **Tagline**: The Nexopp – India's Trusted Platform for Verified Listings to Buy and Sell

---

## 🚀 Architecture Overview

This application features a full-stack, enterprise-grade architecture for verified real estate properties, franchises, and business acquisitions.

* **Frontend**: React 19 + TypeScript + Vite + Zustand + Framer Motion
* **Backend**: Node.js + Express 5 + Prisma ORM + PostgreSQL + Sharp (WebP) + Pino Logging
* **Security & Performance**: Helmet, Express Rate Limit, Compression, HPP, CORS, JWT
* **Process Management**: PM2 Cluster Mode

---

## 📂 Project Structure

```
VENTURO/
├── src/                  # React Frontend Source Code
├── server/               # Express Backend API Server
│   ├── server.js         # API Routes, Security Middlewares & Controllers
│   ├── db.js             # Prisma Database Connection Manager
│   ├── auth.js           # JWT Authentication & Password Hashing
│   ├── imageProcessor.js # Sharp WebP Image Optimization Engine
│   └── validators.js     # Zod Payload Validation Schemas
├── prisma/
│   └── schema.prisma     # PostgreSQL Prisma Models & Relations
├── uploads/              # Statically Served Upload Directory
│   ├── property-images/  # Optimized Property Photos & WebP Images
│   ├── broker-images/    # Broker & Agent Avatars
│   └── profile-images/   # User Profile Pictures
├── public/
│   ├── sitemap.xml       # SEO Search Engine XML Sitemap
│   └── robots.txt        # Crawler Directives
├── ecosystem.config.cjs  # PM2 Production Process Manager Config
├── .env.example          # Production Environment Template
├── index.html            # Primary SEO Meta Tags & JSON-LD Schemas
└── package.json
```

---

## 🛠️ Local Development & PostgreSQL Migration Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your PostgreSQL credentials:
```env
NODE_ENV=development
PORT=8081
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/thenexopp?schema=public"
JWT_SECRET="secure_random_secret_nexopp_2026_dev"
UPLOAD_DIR="uploads"
VITE_API_BASE_URL="http://localhost:8081"
```

### 3. Generate Prisma Client & Run Database Migration
```bash
npx prisma generate
npx prisma db push
```

### 4. Start Development Server
```bash
# Start Vite Frontend
npm run dev

# Start Node API Server
npm run server
```

---

## 🌐 Production VPS Deployment (Hostinger / Nginx / PM2)

### 1. Build Frontend Bundle
```bash
npm run build
```

### 2. PM2 Cluster Startup
```bash
pm2 start ecosystem.config.cjs --env production
pm2 save
```

### 3. Nginx Reverse Proxy Configuration (`/etc/nginx/sites-available/thenexopp.com`)
```nginx
server {
    listen 80;
    server_name thenexopp.com www.thenexopp.com;

    root /var/www/thenexopp/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8081/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads/ {
        proxy_pass http://localhost:8081/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

---

## 🔒 Security & Performance Features

* **Helmet**: Enforces HTTP security headers.
* **Rate Limiting**: Protects endpoints against DDoS/brute-force attacks.
* **Sharp Engine**: Automatically resizes images to max 1920px width and converts them to high-efficiency WebP format.
* **Pino Logging**: High-performance structured JSON request and error logger.
* **Centralized Error Handler**: Hides stack traces in production environment.
