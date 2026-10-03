# SecurePay — Secure Event-Driven Digital Payment, Wallet & Merchant Platform

[![Java 21](https://img.shields.io/badge/Java-21%20LTS-orange.svg)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4+-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-blue.svg)](https://www.postgresql.org/)
[![Keycloak](https://img.shields.io/badge/Keycloak-26%20OIDC-red.svg)](https://www.keycloak.org/)
[![Docker](https://img.shields.io/badge/Docker-Multi--Container-2496ED.svg)](https://www.docker.com/)
[![CI/CD](https://img.shields.io/badge/GitHub%20Actions-Passing-brightgreen.svg)](.github/workflows/ci.yml)

SecurePay is a production-inspired fintech and digital payment platform built as an engineering-driven college major project. It simulates modern financial architectures (such as Stripe, Razorpay, and PayPal), featuring customer wallet operations, peer-to-peer transfers, merchant checkout and invoicing, Keycloak OAuth2/OIDC identity management, rule-based fraud detection, double-entry bookkeeping, Transactional Outbox event delivery, and distributed Saga compensation workflows.

---

## 📚 Core Documentation Index

- **[Architecture & System Design Guide](docs/ARCHITECTURE.md):** In-depth domain breakdown, double-entry ledger invariants, deterministic deadlock prevention, Transactional Outbox, and Saga orchestration.
- **[Security Architecture & Viva Defense Guide](docs/SECURITY_DEFENSE.md):** Comprehensive examiner defense preparation covering race conditions, RS256 token verification, SHA-256 API key hashing, constant-time HMAC webhook verification, and OWASP Top 10 fintech defenses.
- **[REST API Reference](docs/API_REFERENCE.md):** Complete catalog of endpoints, cURL commands, JSON request/response structures, and SSE streams.

---

## 🏛️ High-Level System Architecture

SecurePay is built as a **Domain-Oriented Modular Monolith** with clear bounded contexts, transactional integrity, and evolution toward distributed microservices:

```
[ Frontend: React 19 + TypeScript + Vite SPA ]
                      │
                      ▼ (REST / OAuth2 JWT / SSE)
┌─────────────────────────────────────────────────────────────────┐
│                    SecurePay Core Backend                       │
│                                                                 │
│  ┌───────────────────────┐   ┌───────────────────────────────┐  │
│  │   auth & user domain  │   │  wallet & concurrency domain  │  │
│  │   (Keycloak RS256)    │   │  (Pessimistic Order Locking)  │  │
│  └───────────────────────┘   └───────────────────────────────┘  │
│  ┌───────────────────────┐   ┌───────────────────────────────┐  │
│  │ double-entry ledger   │   │  merchant & api key domain    │  │
│  │ (Immutable Debits/Cr) │   │  (SHA-256 Hashed Keys)        │  │
│  └───────────────────────┘   └───────────────────────────────┘  │
│  ┌───────────────────────┐   ┌───────────────────────────────┐  │
│  │ payment & checkout    │   │  gateway adapter (dual-mode)  │  │
│  │ (Invoicing & Refunds) │   │  (Simulated & Razorpay HMAC)  │  │
│  └───────────────────────┘   └───────────────────────────────┘  │
│  ┌───────────────────────┐   ┌───────────────────────────────┐  │
│  │ distributed saga      │   │  transactional outbox relay   │  │
│  │ (Rollback Compensate) │   │  (At-Least-Once Delivery)     │  │
│  └───────────────────────┘   └───────────────────────────────┘  │
│  ┌───────────────────────┐   ┌───────────────────────────────┐  │
│  │ fraud risk engine     │   │  real-time sse & observability│  │
│  │ (Velocity/Risk Score) │   │  (Spring Boot Actuator)       │  │
│  └───────────────────────┘   └───────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
              │                                      │
              ▼                                      ▼
      [ PostgreSQL 18 ]                    [ Keycloak 26 (IAM) ]
      (Flyway V1 - V11)                    (OIDC Token Issuer)
```

---

## 🛡️ Enterprise Engineering Highlights

1. **Deadlock-Free P2P Transfers:** Uses deterministic ascending ID lock ordering (`min(idA, idB)` then `max(idA, idB)`) with `@Lock(LockModeType.PESSIMISTIC_WRITE)`, mathematically eliminating circular wait deadlocks.
2. **Double-Entry Ledger:** Every financial movement creates immutable debit and credit ledger rows satisfying $\sum \text{Debits} = \sum \text{Credits}$.
3. **Idempotency Engine:** Prevents duplicate debits on network retries using client-supplied `Idempotency-Key` headers backed by unique database indexes.
4. **Distributed Saga Orchestrator:** Manages multi-step checkout workflows with automatic compensating transactions (rollback refunds) if external payment gateways fail.
5. **Transactional Outbox Pattern:** Combines business updates and event queuing in a single atomic database transaction, ensuring at-least-once message delivery without dual-write inconsistencies.
6. **Defense in Depth:**
   - Centralized Keycloak OIDC authentication with asymmetric RS256 token verification.
   - Merchant API keys stored exclusively as SHA-256 cryptographic hashes.
   - Constant-time HMAC-SHA256 signature verification on webhooks to thwart timing attacks.

---

## ⚙️ Prerequisites

- **Java Development Kit (JDK):** Java 21 LTS (Eclipse Temurin recommended)
- **Apache Maven:** 3.9+ (or use the included Maven wrapper)
- **Node.js & npm:** Node.js v20+ LTS (npm 10+)
- **Container Runtime:** Docker Desktop 26+ with Docker Compose v2+

---

## 🚀 Quick Start Guide

### Option A: Complete Docker Compose Orchestration (Production Simulation)

Run the entire platform (PostgreSQL, Keycloak, Backend, and Frontend Nginx) with a single command:

```bash
docker compose -f docker-compose.full.yml up --build -d
```

- **Frontend Application:** `http://localhost:3000`
- **Backend API:** `http://localhost:8080/api`
- **Actuator Health:** `http://localhost:8080/actuator/health`
- **Keycloak Admin:** `http://localhost:8082` (admin / admin)

---

### Option B: Local Development Setup

#### 1. Start Infrastructure (PostgreSQL & Keycloak)
```bash
docker compose up -d
```

#### 2. Run Backend (Spring Boot)
```bash
cd backend
mvn clean compile
mvn spring-boot:run
```
Backend runs on **`http://localhost:8080`**.

#### 3. Run Frontend (React Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on **`http://localhost:5173`**.

---

## 🧪 Testing & Verification

### Run Backend Test Suite (JUnit 5 + Mockito)
SecurePay includes 68 automated unit, domain, and integration tests running against an in-memory H2 database in PostgreSQL mode:
```bash
cd backend
mvn clean test
```
*Result: 68 tests run, 0 failures, 0 errors, 0 skipped.*

### Run Frontend Typecheck & Build
```bash
cd frontend
npm run build
```
*Result: 100% clean TypeScript build into `dist/`.*

---

## 📁 Repository Structure

```text
SecurePay/
├── .github/
│   └── workflows/ci.yml       # GitHub Actions CI/CD Pipeline
├── backend/
│   ├── Dockerfile             # Multi-stage production container
│   ├── pom.xml                # Maven dependencies (Spring Boot 3.4+)
│   └── src/
│       ├── main/java/com/securepay/
│       │   ├── auth/          # Keycloak JWT converter & SecurityConfig
│       │   ├── user/          # User entity, KYC status, profile
│       │   ├── wallet/        # Wallets, P2P transfers, deadlock prevention
│       │   ├── ledger/        # Immutable double-entry ledger entries
│       │   ├── merchant/      # Merchant registration & hashed API keys
│       │   ├── payment/       # Payment orders, checkout, refunds
│       │   ├── gateway/       # Dual-mode gateway & HMAC webhook verifier
│       │   ├── outbox/        # Transactional outbox event relay
│       │   ├── saga/          # Orchestrated payment saga & compensations
│       │   ├── risk/          # Rule-based fraud scoring engine
│       │   ├── audit/         # Non-repudiation security audit logs
│       │   ├── notification/  # Multi-channel notification dispatch
│       │   └── realtime/      # Server-Sent Events (SSE) emitters
│       ├── main/resources/
│       │   ├── application.properties
│       │   └── db/migration/  # Flyway V1 through V11 migrations
│       └── test/              # 68 comprehensive backend tests
├── frontend/
│   ├── Dockerfile             # Multi-stage Node 20 build + Nginx Alpine
│   ├── nginx.conf             # Production Nginx reverse proxy configuration
│   ├── package.json           # React 19, TypeScript, React Router
│   └── src/                   # Frontend SPA implementation
├── docs/
│   ├── ARCHITECTURE.md        # Comprehensive system design specification
│   ├── SECURITY_DEFENSE.md    # Viva presentation and defense Q&A guide
│   └── API_REFERENCE.md       # Complete REST API reference with cURL examples
├── docker-compose.yml         # Dev database & Keycloak service
├── docker-compose.full.yml    # Full-stack production orchestration
└── README.md                  # Project overview and quick start
```
