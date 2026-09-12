# TheNexopp Agent

Commercial Mobile Application and Enterprise Backend Infrastructure for **TheNexopp Agent Network**.

---

## 📌 Project Overview
**TheNexopp Agent** is a commercial mobile application used by human agents working with TheNexopp.

### Key Capabilities
- **Mobile OTP Authentication**: Secure 6-digit OTP login with resend cooldown and attempt rate-limiting.
- **Agent Onboarding State Machine**: Auto-routing across `NEW` ➔ `PROFILE_INCOMPLETE` ➔ `KYC_INCOMPLETE` ➔ `BANK_DETAILS_INCOMPLETE` ➔ `PENDING_APPROVAL` ➔ `APPROVED` / `REJECTED` / `SUSPENDED`.
- **Sensitive KYC Management**: AES-256-CBC encrypted storage for Aadhaar & PAN numbers. Automatic UI masking (`XXXX XXXX 1234`, `XXXXX1234X`).
- **Private MinIO Object Storage**: S3-compatible private file storage for KYC documents, property images, and payment proofs via authenticated presigned S3 URLs.
- **Property & Business Listing Module**: Create, save drafts, multi-image upload wizard, submission for admin verification, details, and status tracking.
- **Financial Ledger & Payment Receipts**: Track total earnings, pending payouts, paid amounts, transaction receipts, and payment proof images.
- **Real-Time WebSocket Sync**: Socket.io live status updates (`agent.status.updated`, `kyc.status.updated`, `property.status.updated`, `payment.created`) with automatic reconnect handling.
- **Firebase Push Notifications**: FCM integration for background status updates.
- **Decoupled Admin Integration**: Clean API adapter architecture allowing the existing admin portal to remain the primary administrative control point.

---

## 🏗 System Architecture

```
d:/Thenexopp Agent/
├── mobile/                    # Flutter Mobile Application
│   ├── android/               # Native Android configurations
│   ├── assets/                # Images, vector icons, human agent logo
│   └── lib/
│       ├── core/              # Theme, Constants, Dio Client, Storage, Widgets
│       ├── features/          # Splash, Auth, Onboarding, Status, Home, Properties, Earnings, Payments, Notifications, Profile
│       ├── routing/           # GoRouter route guards
│       └── shared/            # Riverpod state providers
├── backend/                   # NestJS Enterprise Backend API & Socket.io Gateway
│   ├── src/
│   │   ├── modules/           # Auth, Agents, KYC, Bank, Properties, Earnings, Payments, Notifications, Uploads, Websocket, Admin-Integration, Audit
│   │   ├── common/            # CryptoUtil, JwtAuthGuard, RolesGuard
│   │   └── database/          # TypeORM Entities (PostgreSQL 16)
│   └── test/                  # Automated unit & integration test suite
├── infrastructure/            # Production Infrastructure Configuration
│   ├── docker-compose.yml     # Multi-container orchestration (Postgres, Redis, MinIO, NestJS, Nginx)
│   ├── nginx/                 # Reverse proxy, SSL, CORS, rate limits for api.thenexopp.com
│   ├── postgres/              # Database initialization
│   └── minio/                 # Private bucket setup
├── docs/                      # Production Specs & Deployment Guides
│   ├── API_DOCUMENTATION.md   # OpenAPI details & WebSocket specs
│   ├── KVM2_DEPLOYMENT.md     # Production KVM2 VPS setup guide
│   ├── BACKUP_STRATEGY.md     # PostgreSQL & MinIO backup/restore procedures
│   └── SECURITY_AUDIT.md      # Data masking & security verification report
├── PROJECT_PLAN.md            # Technical Assessment & Master Plan
├── README.md                  # Comprehensive Project Documentation
└── .env.example               # Template environment configuration
```

---

## 🚀 Local Development Setup

### Prerequisites
- **Flutter SDK**: 3.19+ (Dart 3.3+)
- **Node.js**: v20+ & npm 10+
- **PostgreSQL**: 16+
- **Redis**: 7+
- **MinIO**: S3 Object Storage

### 1. Environment Configuration
Copy `.env.example` to `.env` in the root workspace:
```bash
cp .env.example .env
```

### 2. Run Backend (NestJS API)
```bash
cd backend
npm install
npm run start:dev
```
- API Server: `http://localhost:3000/api/v1`
- Swagger OpenAPI Specs: `http://localhost:3000/api/docs`
- WebSocket Gateway: `ws://localhost:3000/ws`

### 3. Run Mobile Application (Flutter)
```bash
cd mobile
flutter pub get
flutter run
```

---

## 🧪 Testing

### Backend Unit & Integration Tests
```bash
cd backend
npm run test
```

### Flutter Widget & Router Tests
```bash
cd mobile
flutter test
flutter analyze
```

---

## 🐳 Production Deployment (KVM2 VPS)

Targeting `api.thenexopp.com` on KVM2 VPS with Docker Compose, Nginx reverse proxy, and Let's Encrypt SSL.

```bash
cd infrastructure
docker compose up -d --build
```

Refer to [KVM2_DEPLOYMENT.md](file:///d:/Thenexopp%20Agent/docs/KVM2_DEPLOYMENT.md) for full deployment instructions.

---

## 📱 Android Release Build (APK & AAB)

To generate signed production release artifacts:

```bash
cd mobile
# Build universal APK
flutter build apk --release

# Build Android App Bundle (AAB) for Google Play
flutter build appbundle --release
```
Artifacts generated:
- APK: `mobile/build/app/outputs/flutter-apk/app-release.apk`
- AAB: `mobile/build/app/outputs/bundle/release/app-release.aab`
