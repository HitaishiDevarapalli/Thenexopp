# TheNexopp Agent - Master Project Plan & Technical Assessment

## 1. Executive Summary & Workspace Assessment

### Workspace Technical Assessment
- **Workspace Status**: Fresh/Empty workspace (`d:\Thenexopp Agent`).
- **Existing Codebase/APIs**: None detected in workspace. Clean slate for establishing production monorepo structure with decoupled integration adapters for future admin portal / existing system linkage.
- **Environment Capabilities**:
  - **Flutter SDK**: Installed (3.38.7, Dart 3.10.7)
  - **Node.js Runtime**: Installed (v24.13.0, npm 11.6.2)
  - **Containerization Target**: Docker & Docker Compose configs targeting KVM2 VPS (`api.thenexopp.com`).

---

## 2. Architecture & Monorepo Structure

```
d:/Thenexopp Agent/
├── mobile/                    # Flutter Mobile Application
│   ├── android/               # Android Native Config & Build setup
│   ├── ios/                   # iOS Config
│   ├── assets/                # Images, Icons, Logos, Fonts
│   └── lib/
│       ├── core/              # Theme, Constants, Network (Dio), Storage, Errors, Utils, Widgets
│       ├── features/          # Feature-based modular architecture
│       │   ├── splash/
│       │   ├── auth/          # Login, OTP verification, Token refresh
│       │   ├── onboarding/    # Profile setup, KYC, Bank/UPI details
│       │   ├── status/        # Pending approval, Rejected, Suspended states
│       │   ├── home/          # Agent Dashboard, Summary metrics
│       │   ├── properties/    # Property creation, Drafts, Photos, Verification status
│       │   ├── earnings/      # Earnings dashboard, Filtered earnings list
│       │   ├── payments/      # Payment history, Proof viewer
│       │   ├── notifications/ # FCM & Notification center
│       │   └── profile/       # Profile management, Settings, Security
│       ├── routing/           # GoRouter route guards & state-driven navigation
│       └── shared/            # Shared models & state providers
├── backend/                   # NestJS Enterprise REST & WebSocket API Server
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/          # OTP, JWT, Refresh Token, Rate Limiter
│   │   │   ├── users/         # Base user management
│   │   │   ├── agents/        # Agent state machine (NEW -> APPROVED -> SUSPENDED)
│   │   │   ├── kyc/           # Sensitive KYC submission & verification
│   │   │   ├── bank/          # Bank & UPI account validation
│   │   │   ├── properties/    # Property listing lifecycle & drafts
│   │   │   ├── earnings/      # Financial earnings computation
│   │   │   ├── payments/      # Payment logs & secure proof access
│   │   │   ├── notifications/ # Push notification (FCM) engine
│   │   │   ├── uploads/       # MinIO presigned S3 URLs & MIME validation
│   │   │   ├── websocket/     # Socket.io gateway for live updates
│   │   │   ├── admin-integration/ # Adapter interface for existing admin portal
│   │   │   └── audit/         # Tamper-evident activity logs
│   │   ├── common/            # Guards, Interceptors, Filters, Decorators
│   │   ├── database/          # TypeORM/Knex migrations & entities
│   │   └── config/            # Environment validation & secrets loader
│   ├── test/                  # Backend unit, integration & e2e tests
├── infrastructure/            # Production Infrastructure Configuration
│   ├── docker-compose.yml     # Multi-container orchestration (PostgreSQL, Redis, MinIO, NestJS, Nginx)
│   ├── nginx/                 # Reverse proxy, SSL, Rate limiting, CORS
│   ├── postgres/              # Database initialization & health checks
│   ├── redis/                 # Redis configuration for cache & rate limit
│   └── minio/                 # Private bucket initialization scripts
├── docs/                      # Production Deployment & API Specs
│   ├── API_DOCUMENTATION.md   # OpenAPI / Swagger details
│   ├── KVM2_DEPLOYMENT.md     # VPS deployment step-by-step
│   ├── BACKUP_STRATEGY.md     # Postgres & MinIO disaster recovery
│   └── SECURITY_AUDIT.md      # Masking, encryption, and protection policies
├── PROJECT_PLAN.md            # Master Plan Document
├── README.md                  # Comprehensive Documentation
└── .env.example               # Template environment configuration
```

---

## 3. Database Schema (PostgreSQL)

Targeting PostgreSQL 16+ with strict foreign keys, indexes, and UUID primary keys.

### Tables Specification
1. `users`: `id` (UUID), `mobile_number` (VARCHAR(15), UNIQUE, INDEX), `role` (ENUM: AGENT, ADMIN), `is_active` (BOOL), `created_at`, `updated_at`.
2. `agents`: `id` (UUID), `user_id` (FK users), `status` (ENUM: NEW, PROFILE_INCOMPLETE, KYC_INCOMPLETE, BANK_DETAILS_INCOMPLETE, PENDING_APPROVAL, APPROVED, REJECTED, SUSPENDED), `rejection_reason` (TEXT), `approved_at`, `created_at`, `updated_at`.
3. `agent_profiles`: `id` (UUID), `agent_id` (FK agents), `full_name` (VARCHAR), `area_location` (VARCHAR), `age` (INT), `gender` (VARCHAR), `work_platform` (VARCHAR: Swiggy, Zomato, Rapido, Zepto, Blinkit, Individual, etc.), `profile_photo_url` (VARCHAR), `created_at`, `updated_at`.
4. `kyc_documents`: `id` (UUID), `agent_id` (FK agents), `aadhaar_number_encrypted` (TEXT), `aadhaar_last4` (VARCHAR(4)), `pan_number_encrypted` (TEXT), `pan_masked` (VARCHAR(10)), `aadhaar_doc_key` (VARCHAR), `pan_doc_key` (VARCHAR), `status` (ENUM: NOT_SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED), `rejection_reason` (TEXT), `submitted_at`, `reviewed_at`, `created_at`, `updated_at`.
5. `bank_accounts`: `id` (UUID), `agent_id` (FK agents), `account_number_encrypted` (TEXT), `account_last4` (VARCHAR(4)), `ifsc_code` (VARCHAR(11)), `upi_id` (VARCHAR), `phonepe_number` (VARCHAR), `is_verified` (BOOL), `created_at`, `updated_at`.
6. `properties`: `id` (UUID), `agent_id` (FK agents), `title` (VARCHAR), `description` (TEXT), `price` (DECIMAL(12,2)), `category` (ENUM: RESIDENTIAL_RENT, RESIDENTIAL_SALE, COMMERCIAL_RENT, COMMERCIAL_SALE, BUSINESS), `specifications` (JSONB), `location` (VARCHAR), `status` (ENUM: DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED), `rejection_reason` (TEXT), `submitted_at`, `reviewed_at`, `created_at`, `updated_at`.
7. `property_images`: `id` (UUID), `property_id` (FK properties), `image_key` (VARCHAR), `is_primary` (BOOL), `display_order` (INT), `created_at`.
8. `property_verifications`: `id` (UUID), `property_id` (FK properties), `verifier_id` (UUID), `status` (VARCHAR), `notes` (TEXT), `verified_at`.
9. `earnings`: `id` (UUID), `agent_id` (FK agents), `property_id` (FK properties, NULLABLE), `title` (VARCHAR), `amount` (DECIMAL(12,2)), `status` (ENUM: PENDING, PAID), `earned_date` (TIMESTAMPTZ), `created_at`.
10. `payments`: `id` (UUID), `agent_id` (FK agents), `earning_id` (FK earnings, NULLABLE), `amount` (DECIMAL(12,2)), `transaction_id` (VARCHAR, INDEX), `payment_method` (VARCHAR), `status` (ENUM: IN_TRANSIT, COMPLETED, FAILED), `payment_proof_key` (VARCHAR), `paid_at` (TIMESTAMPTZ), `created_at`.
11. `notifications`: `id` (UUID), `agent_id` (FK agents), `title` (VARCHAR), `message` (TEXT), `type` (VARCHAR), `data` (JSONB), `is_read` (BOOL, DEFAULT false), `created_at`.
12. `refresh_tokens`: `id` (UUID), `user_id` (FK users), `token_hash` (VARCHAR), `device_info` (VARCHAR), `expires_at` (TIMESTAMPTZ), `revoked` (BOOL, DEFAULT false), `created_at`.
13. `audit_logs`: `id` (UUID), `actor_id` (UUID), `action` (VARCHAR), `entity_type` (VARCHAR), `entity_id` (UUID), `metadata` (JSONB), `ip_address` (VARCHAR), `created_at`.

---

## 4. API Endpoints Specification

### Authentication
- `POST /api/v1/auth/send-otp` (Rate-limited, body: `{ mobileNumber }`)
- `POST /api/v1/auth/verify-otp` (Body: `{ mobileNumber, otp, deviceId }` -> returns `{ accessToken, refreshToken, agentState, user }`)
- `POST /api/v1/auth/refresh` (Body: `{ refreshToken }` -> returns `{ accessToken, refreshToken }`)
- `POST /api/v1/auth/logout` (Bearer Auth)

### Agent & Onboarding
- `GET /api/v1/agent/profile`
- `PUT /api/v1/agent/profile` (Full Name, Area, Age, Gender, Work Platform)
- `GET /api/v1/agent/kyc`
- `POST /api/v1/agent/kyc` (Aadhaar, PAN, doc keys)
- `GET /api/v1/agent/bank-details`
- `POST /api/v1/agent/bank-details`

### Properties
- `GET /api/v1/properties` (Filters: status, page, limit)
- `POST /api/v1/properties` (Create draft/submit)
- `GET /api/v1/properties/:id`
- `PUT /api/v1/properties/:id`
- `DELETE /api/v1/properties/:id`
- `POST /api/v1/properties/:id/submit`

### Earnings & Payments
- `GET /api/v1/earnings` (Summary & list)
- `GET /api/v1/payments` (History & proofs)
- `GET /api/v1/payments/:id`

### File Storage Presigned URLs
- `POST /api/v1/uploads/presigned-url` (Body: `{ bucketType: 'KYC'|'PROPERTY'|'PAYMENT_PROOF', filename, mimeType }`)
- `GET /api/v1/uploads/secure-view-url` (Authenticated presigned GET for sensitive KYC & Payment Proofs)

### Notifications & Live Sync
- `GET /api/v1/notifications`
- `PUT /api/v1/notifications/:id/read`
- `PUT /api/v1/notifications/read-all`
- `WebSocket /ws` (Socket.io event namespace for agent notifications, status transitions)

---

## 5. Mobile UI & UX Plan

- **Theme & Branding**: Navy Blue (`#0B192C`), Emerald Green (`#10B981`), Warm Amber Accent (`#F59E0B`), Clean white cards with dark slate typography (`#0F172A`).
- **Human Agent Branding**: Official human professional agent iconography and custom vector assets (NO robots).
- **Navigation Flow**:
  1. `Splash`: Auto-check refresh token & agent state via Riverpod `authProvider`.
  2. `Login / OTP`: 6-digit OTP input with resend cooldown timer & masked mobile verification.
  3. `State Router`: Redirects automatically based on agent onboarding status:
     - `PROFILE_INCOMPLETE` -> Onboarding Profile Screen
     - `KYC_INCOMPLETE` -> Onboarding KYC Screen
     - `BANK_DETAILS_INCOMPLETE` -> Onboarding Bank Screen
     - `PENDING_APPROVAL` -> Verification Lock Screen (with real-time socket listener)
     - `REJECTED` -> Rejection notice screen with edit & resubmit capability
     - `SUSPENDED` -> Account lock notice
     - `APPROVED` -> Full Home Dashboard & Bottom Nav
  4. `Home Dashboard`: Total earnings card, Pending earnings card, Quick Actions (+ Add Property), Status badges, Activity feed.
  5. `Property Module`: Tabbed list (All, Drafts, Under Review, Approved, Rejected), Add Property step-by-step wizard, Multi-image picker, preview & image compression.
  6. `Earnings & Payments`: Interactive breakdown, payment receipts, presigned secure proof viewer dialog.
  7. `Profile & Settings`: Personal info edit, masked document viewer, support details, secure logout.

---

## 6. Implementation Strategy & Execution Plan

We will proceed in clean, verifiable steps:
1. **Infrastructure & Backend Foundation**: Project scaffolding, NestJS modules, TypeORM database entities, Migrations, JWT Auth, OTP Provider system, MinIO storage manager.
2. **Mobile Core Scaffolding**: Flutter project structure, Clean Architecture layers, GoRouter navigation, Dio client with token refresh interceptor, Riverpod providers, Theme system.
3. **Authentication & Onboarding**: Backend endpoints + Mobile Auth flow + KYC/Bank submission + MinIO private document upload.
4. **Approval & Admin Adapter**: Agent state transitions, Admin APIs, WebSocket gateway.
5. **Properties Module**: Backend property CRUD, image management, Mobile Property wizard, image compression, verification pipeline.
6. **Earnings, Payments & Proof Access**: Financial ledger, Admin payout recording endpoint, Mobile earnings dashboard, encrypted proof viewer.
7. **Notifications & Realtime Sync**: Socket.io client integration in Flutter, FCM setup instructions, event listeners.
8. **Deployment & Quality Assurance**: Comprehensive automated test suite, Docker Compose container configs, Nginx reverse proxy specs, Security audit verification, Android build scripts.

---

## 7. Risks & Mitigation

| Risk | Impact | Mitigation Strategy |
|---|---|---|
| Exposure of sensitive KYC/Bank data | High | Server-side AES encryption for sensitive fields, MinIO private buckets, pre-signed temporary URLs only, zero logging of raw Aadhaar/PAN. |
| Weak or missing network outdoors | Medium | Offline draft saving in local storage, Dio auto-retry logic, socket automatic reconnect exponentially backoff. |
| Existing Admin System incompatibilities | Medium | Abstract `AdminIntegrationModule` with clean adapter interfaces enabling drop-in linkage without touching mobile app code. |
