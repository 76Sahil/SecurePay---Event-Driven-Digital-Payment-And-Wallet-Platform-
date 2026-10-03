# SecurePay — Secure Event-Driven Digital Payment, Wallet and Merchant Platform

SecurePay is a production-inspired fintech and digital payment platform built as an engineering-driven college major project. It features customer wallet operations, peer-to-peer money transfers, merchant payment processing, Keycloak OAuth2/OIDC identity management, rule-based fraud detection, and an asynchronous event-driven architecture designed to evolve gracefully from a clean modular monolith to distributed services with distributed transaction patterns (Saga).

---

## 🏛️ Architecture Overview

SecurePay is architected as a **Domain-Oriented Modular Monolith** evolving toward an event-driven architecture:

```
[ Frontend: React 19 + TypeScript + Vite ]
                   │
                   ▼ (REST / OAuth2 JWT)
┌────────────────────────────────────────────────────────┐
│                   SecurePay Backend                    │
│                                                        │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────┐  │
│  │     auth     │   │     user     │   │   wallet   │  │
│  └──────────────┘   └──────────────┘   └────────────┘  │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────┐  │
│  │ beneficiary  │   │ transaction  │   │  payment   │  │
│  └──────────────┘   └──────────────┘   └────────────┘  │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────┐  │
│  │   merchant   │   │  fraud/risk  │   │   audit    │  │
│  └──────────────┘   └──────────────┘   └────────────┘  │
└────────────────────────────────────────────────────────┘
          │                              │
          ▼                              ▼
  [ PostgreSQL 18 ]             [ Keycloak 26 (OIDC) ]
  (Ledger & State)              (Identity & Tokens)
```

---

## ⚙️ Prerequisites

Ensure the following tools are installed on your workstation:

- **Java Development Kit (JDK):** Java 21 LTS (Eclipse Temurin 21 recommended)
- **Build Tool:** Apache Maven 3.9+ (or use included `mvnw` wrapper)
- **Node.js & npm:** Node.js v20+ LTS (npm 10+)
- **Container Runtime:** Docker Desktop 26+ with Docker Compose v2+

---

## 🚀 Quick Start Guide

### 1. Clone & Set Up Environment Variables
```bash
git clone https://github.com/76Sahil/SecurePay---Event-Driven-Digital-Payment-And-Wallet-Platform-.git
cd SecurePay

# Copy the example environment file
cp .env.example .env
```

### 2. Start Supporting Infrastructure (PostgreSQL & Keycloak)
Use Docker Compose to launch local PostgreSQL and Keycloak instances:
```bash
docker compose up -d
```

Verify that services are running and healthy:
```bash
docker compose ps
```
- **PostgreSQL:** `localhost:5432` (or host port configured in `.env`)
- **Keycloak Admin Console:** `http://localhost:8082` (admin / admin)
- **Keycloak Realm Endpoint:** `http://localhost:8082/realms/securepay`

### 3. Build & Run the Backend
```bash
cd backend
mvn clean compile
mvn spring-boot:run
```
The Spring Boot backend will start on **`http://localhost:8080`**.
Verify system health:
```bash
curl http://localhost:8080/api/health
# Response: {"status":"UP"}
```

### 4. Build & Run the Frontend
In a separate terminal window:
```bash
cd frontend
npm install
npm run dev
```
The React SPA will be accessible at **`http://localhost:5173`**.

---

## 🧪 Testing

### Backend Automated Test Suite
SecurePay includes an isolated in-memory test configuration (H2 in PostgreSQL mode) ensuring tests run independently and reliably:
```bash
cd backend
mvn test
```

### Frontend Typecheck & Production Build
```bash
cd frontend
npm run build
```

---

## 🔐 Security Principles
- **OAuth2 & OIDC Authentication:** Centralized identity provider (Keycloak) issues signed JWT access tokens.
- **Resource Server Validation:** The Spring Boot backend acts as an OAuth2 Resource Server, validating token authenticity and claims via Keycloak JWKS.
- **Financial Correctness:** Pessimistic database locking (`@Lock(LockModeType.PESSIMISTIC_WRITE)`) on wallet balances prevents race conditions and overdrafts during concurrent transfers.
- **Credential Hygiene:** No plaintext secrets or passwords in source control; all sensitive variables are injected via environment properties.

---

## 📁 Repository Structure
```text
SecurePay/
├── .github/              # CI/CD Workflows (Milestone 36)
├── backend/              # Spring Boot Java 21 Modular Monolith
│   ├── src/main/java/    # Domain-oriented backend source
│   ├── src/main/resources# Application configuration & migrations
│   └── src/test/java/    # JUnit 5 & Mockito test suite
├── frontend/             # React 19 + TypeScript + Vite SPA
│   ├── src/pages/        # Customer, Merchant, and Admin portals
│   ├── src/services/     # Centralized API service layer
│   └── src/types/        # Domain TypeScript definitions
├── docker-compose.yml    # Local development orchestration
├── .env.example          # Environment variables template
└── README.md             # Project documentation
```
