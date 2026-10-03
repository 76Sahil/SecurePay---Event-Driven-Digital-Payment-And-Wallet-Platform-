# SecurePay — API Reference & Integration Guide

This document provides a comprehensive specification of all REST endpoints, headers, JSON payloads, and response structures in the SecurePay platform.

---

## 1. Global Conventions

### Base URL
- **Local Development:** `http://localhost:8080/api`
- **Docker Compose Full:** `http://localhost:8080/api` (or via Nginx on `http://localhost:3000/api`)

### Common Headers
| Header | Description | Required |
| :--- | :--- | :--- |
| `Authorization` | Keycloak JWT bearer token: `Bearer <token>` | Yes (for protected endpoints) |
| `X-API-Key` | Merchant API Key: `sp_test_<YOUR_MERCHANT_API_KEY>` | Yes (for merchant-authenticated APIs) |
| `Idempotency-Key` | Client-generated UUID to prevent duplicate operations | Recommended for financial transactions |
| `Content-Type` | `application/json` | Yes (for POST/PUT requests) |

---

## 2. Authentication & User Management

### 2.1 Get Current User Profile
**GET** `/users/profile`  
*Requires Authorization Header (`ROLE_CUSTOMER` or `ROLE_MERCHANT`)*

#### Request:
```bash
curl -X GET http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer <CUSTOMER_JWT_TOKEN>"
```

#### Response (200 OK):
```json
{
  "id": 1,
  "keycloakId": "d7b98d1a-4710-4c7b-9689-d4ff5a7e6b01",
  "email": "customer@example.com",
  "fullName": "Alice Johnson",
  "kycStatus": "VERIFIED",
  "createdAt": "2026-10-01T10:00:00Z"
}
```

---

### 2.2 Submit KYC Verification
**POST** `/users/kyc`  
*Requires Authorization Header (`ROLE_CUSTOMER`)*

#### Request:
```bash
curl -X POST http://localhost:8080/api/users/kyc \
  -H "Authorization: Bearer <CUSTOMER_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "PASSPORT",
    "documentNumber": "A12345678",
    "nationalId": "123-45-6789"
  }'
```

#### Response (200 OK):
```json
{
  "userId": 1,
  "kycStatus": "PENDING_REVIEW",
  "submittedAt": "2026-10-03T18:00:00Z",
  "message": "KYC documentation submitted successfully for compliance verification."
}
```

---

## 3. Customer Wallet Operations

### 3.1 Get Wallet Balance
**GET** `/wallets/me`  
*Requires Authorization Header (`ROLE_CUSTOMER`)*

#### Request:
```bash
curl -X GET http://localhost:8080/api/wallets/me \
  -H "Authorization: Bearer <CUSTOMER_JWT_TOKEN>"
```

#### Response (200 OK):
```json
{
  "walletId": 1,
  "currency": "USD",
  "balance": 2500.00,
  "status": "ACTIVE"
}
```

---

### 3.2 Sandbox Add Money (Deposit)
**POST** `/wallets/deposit`  
*Requires Authorization Header (`ROLE_CUSTOMER`)*

#### Request:
```bash
curl -X POST http://localhost:8080/api/wallets/deposit \
  -H "Authorization: Bearer <CUSTOMER_JWT_TOKEN>" \
  -H "Idempotency-Key: e82f1b40-271d-4076-9d3e-97621c1729b1" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500.00,
    "paymentMethod": "SANDBOX_SIMULATED_CARD"
  }'
```

#### Response (200 OK):
```json
{
  "transactionId": "TXN_DEP_99214",
  "amount": 500.00,
  "currency": "USD",
  "status": "COMPLETED",
  "newBalance": 3000.00,
  "timestamp": "2026-10-03T18:05:00Z"
}
```

---

### 3.3 Peer-to-Peer Wallet Transfer
**POST** `/wallets/transfer`  
*Requires Authorization Header (`ROLE_CUSTOMER`)*

#### Request:
```bash
curl -X POST http://localhost:8080/api/wallets/transfer \
  -H "Authorization: Bearer <CUSTOMER_JWT_TOKEN>" \
  -H "Idempotency-Key: c9d78901-382f-4889-a2e1-456789abcdef" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverEmail": "bob@example.com",
    "amount": 150.00,
    "note": "Dinner bill split"
  }'
```

#### Response (200 OK):
```json
{
  "transactionId": "TXN_TRF_10283",
  "senderWalletId": 1,
  "receiverWalletId": 2,
  "amount": 150.00,
  "status": "SUCCESS",
  "createdAt": "2026-10-03T18:10:00Z"
}
```

---

## 4. Beneficiary Management

### 4.1 Add Beneficiary
**POST** `/beneficiaries`  
*Requires Authorization Header (`ROLE_CUSTOMER`)*

#### Request:
```bash
curl -X POST http://localhost:8080/api/beneficiaries \
  -H "Authorization: Bearer <CUSTOMER_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "nickname": "Bob Work",
    "beneficiaryEmail": "bob@example.com",
    "routingType": "SECUREPAY_INTERNAL"
  }'
```

#### Response (201 Created):
```json
{
  "id": 10,
  "nickname": "Bob Work",
  "beneficiaryEmail": "bob@example.com",
  "status": "ACTIVE"
}
```

---

## 5. Merchant Management & API Keys

### 5.1 Register as Merchant
**POST** `/merchants/register`  
*Requires Authorization Header (`ROLE_MERCHANT`)*

#### Request:
```bash
curl -X POST http://localhost:8080/api/merchants/register \
  -H "Authorization: Bearer <MERCHANT_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Acme Electronics Ltd",
    "webhookUrl": "https://api.acme.com/webhooks/securepay",
    "contactEmail": "finance@acme.com"
  }'
```

#### Response (201 Created):
```json
{
  "merchantId": 5,
  "businessName": "Acme Electronics Ltd",
  "status": "ACTIVE",
  "webhookUrl": "https://api.acme.com/webhooks/securepay"
}
```

---

### 5.2 Generate Merchant API Key
**POST** `/merchants/{id}/keys`  
*Requires Authorization Header (`ROLE_MERCHANT`)*

#### Request:
```bash
curl -X POST http://localhost:8080/api/merchants/5/keys \
  -H "Authorization: Bearer <MERCHANT_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "keyName": "Production Backend Integration"
  }'
```

#### Response (201 Created):
```json
{
  "keyId": 12,
  "keyName": "Production Backend Integration",
  "keyPrefix": "sp_test_a8f9",
  "secretKey": "sp_test_<YOUR_MERCHANT_API_KEY>",
  "warning": "Save this secret key now. You will not be able to see it again."
}
```

---

## 6. Payment Orders, Checkout & Refunds

### 6.1 Create Payment Order
**POST** `/payments/orders`  
*Requires Merchant Header (`X-API-Key: sp_test_<YOUR_MERCHANT_API_KEY>`)*

#### Request:
```bash
curl -X POST http://localhost:8080/api/payments/orders \
  -H "X-API-Key: sp_test_<YOUR_MERCHANT_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 99.99,
    "currency": "USD",
    "description": "Order #4891: Noise Cancelling Headphones",
    "customerEmail": "customer@example.com"
  }'
```

#### Response (201 Created):
```json
{
  "orderId": "ORD_20261003_9941",
  "merchantId": 5,
  "amount": 99.99,
  "currency": "USD",
  "status": "PENDING",
  "checkoutUrl": "http://localhost:3000/checkout?orderId=ORD_20261003_9941"
}
```

---

### 6.2 Process Refund
**POST** `/payments/{orderId}/refund`  
*Requires Merchant Header (`X-API-Key: sp_test_<YOUR_MERCHANT_API_KEY>`)*

#### Request:
```bash
curl -X POST http://localhost:8080/api/payments/ORD_20261003_9941/refund \
  -H "X-API-Key: sp_test_<YOUR_MERCHANT_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 99.99,
    "reason": "Customer returned item in original packaging"
  }'
```

#### Response (200 OK):
```json
{
  "refundId": "REF_881923",
  "orderId": "ORD_20261003_9941",
  "amount": 99.99,
  "status": "PROCESSED",
  "createdAt": "2026-10-03T18:30:00Z"
}
```

---

## 7. Distributed Saga Orchestration

### 7.1 Execute Orchestrated Checkout Saga
**POST** `/sagas/checkout`  
*Executes multi-step orchestrated transaction: Validation $\to$ Risk Scoring $\to$ Wallet Lock/Debit $\to$ Gateway Capture $\to$ Settlement*

#### Request:
```bash
curl -X POST http://localhost:8080/api/sagas/checkout \
  -H "Authorization: Bearer <CUSTOMER_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "merchantId": 5,
    "amount": 120.00,
    "currency": "USD",
    "description": "Laptop Stand and Wireless Mouse"
  }'
```

#### Response (200 OK - Successful Execution):
```json
{
  "sagaId": "SAGA_a7f18b32",
  "status": "COMPLETED",
  "currentStep": "DISBURSE_MERCHANT",
  "stepsExecuted": [
    "CREATE_ORDER",
    "EVALUATE_RISK",
    "DEBIT_WALLET",
    "CAPTURE_GATEWAY",
    "DISBURSE_MERCHANT"
  ],
  "completedAt": "2026-10-03T18:35:02Z"
}
```

#### Response (200 OK - Compensated Rollback Execution):
```json
{
  "sagaId": "SAGA_b9921c44",
  "status": "COMPENSATED",
  "currentStep": "COMPENSATED",
  "failureReason": "Gateway card payment declined by issuer",
  "compensationStepsExecuted": [
    "REFUND_WALLET",
    "CANCEL_ORDER"
  ],
  "completedAt": "2026-10-03T18:35:05Z"
}
```

---

## 8. Real-Time Server-Sent Events (SSE)

### 8.1 Customer Event Stream
**GET** `/realtime/stream?userId={id}`  
*Streams live JSON events: balance adjustments, incoming peer transfers, payment receipts.*

```bash
curl -N http://localhost:8080/api/realtime/stream?userId=1
```

```text
event: balance_update
data: {"walletId":1,"newBalance":2850.00,"delta":-150.00,"event":"TRANSFER_OUT"}

event: notification
data: {"id":14,"title":"Payment Sent","message":"You sent $150.00 to Bob"}
```

---

### 8.2 Admin Security Telemetry Feed
**GET** `/realtime/admin/feed`  
*Streams live security audit telemetry, fraud score warnings, and lock contention metrics to admin console.*

```bash
curl -N http://localhost:8080/api/realtime/admin/feed \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"
```

```text
event: security_alert
data: {"level":"HIGH","eventType":"SUSPICIOUS_VELOCITY","userId":92,"detail":"5 transfers in 60 seconds"}
```

---

## 9. Observability & Health Endpoints

### 9.1 Spring Boot Actuator Health Check
**GET** `/actuator/health`

#### Request:
```bash
curl http://localhost:8080/actuator/health
```

#### Response (200 OK):
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "PostgreSQL",
        "validationQuery": "isValid()"
      }
    },
    "diskSpace": {
      "status": "UP"
    },
    "ping": {
      "status": "UP"
    }
  }
}
```
