# TheNexopp Agent - Production KVM2 VPS Deployment Guide

This guide details the step-by-step production deployment process on the KVM2 VPS.

---

## 1. KVM2 Prerequisites & Domain DNS Setup
1. **Domain DNS A Record**:
   Configure your DNS registrar to point `api.thenexopp.com` to your KVM2 VPS public IP address (`185.x.x.x`).
2. **Server OS Requirements**:
   Ubuntu 22.04 LTS or 24.04 LTS on KVM2 VPS.
3. **Install Docker & Docker Compose**:
   ```bash
   sudo apt update && sudo apt install -y curl git ufw
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker $USER
   ```

---

## 2. Firewall Configuration (UFW)
Expose only HTTP (80), HTTPS (443), and SSH (22). Do **NOT** expose PostgreSQL (5432), Redis (6379), or MinIO (9000/9001) ports publicly!
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 3. Clone Repository & Environment Setup
```bash
git clone https://github.com/thenexopp/thenexopp-agent.git /opt/thenexopp-agent
cd /opt/thenexopp-agent
cp .env.example .env
nano .env
```
Ensure production passwords, `JWT_SECRET`, `AES_ENCRYPTION_KEY`, and OTP provider credentials are provided in `.env`.

---

## 4. Obtain SSL Certificate via Certbot
```bash
sudo apt install -y certbot
sudo certbot certonly --standalone -d api.thenexopp.com
```
Certificates will be generated at `/etc/letsencrypt/live/api.thenexopp.com/`.

---

## 5. Launch Docker Stack
```bash
cd /opt/thenexopp-agent/infrastructure
docker compose up -d --build
```

Verify service status:
```bash
docker compose ps
docker compose logs -f backend
```

---

## 6. Verification Checklist
- [ ] `https://api.thenexopp.com/api/docs` returns interactive Swagger documentation.
- [ ] `wss://api.thenexopp.com/ws` upgrades WebSocket connection successfully.
- [ ] MinIO private buckets `private-kyc`, `property-images`, `payment-proofs` are active.
- [ ] OTP verification dispatches real SMS via configured provider.
