# SecurePay — Security Architecture & Viva Defense Guide

This document prepares you to explain and defend every architectural, cryptographic, and financial engineering decision in SecurePay during technical reviews, professor evaluations, and final degree viva presentations.

---

## 1. Executive Summary & Architectural Talking Points

When an examiner asks: *"What makes SecurePay different from an ordinary full-stack CRUD college project?"*

**Your Answer:**
> "SecurePay is not a CRUD application. It is an enterprise-inspired financial transaction engine designed around three non-negotiable core pillars:
> 1. **Financial Invariance:** Built on an immutable double-entry ledger where money can never be magically created or destroyed ($\sum \text{Debits} = \sum \text{Credits}$).
> 2. **Concurrency Correctness:** Uses deterministic lock acquisition to mathematically eliminate deadlocks, combined with pessimistic write locking to prevent race-condition overdrafts.
> 3. **Defensive Security & Resilience:** Enforces Keycloak RS256 token verification, SHA-256 merchant key hashing, constant-time HMAC webhook verification, Transactional Outbox guaranteed delivery, and distributed Saga rollback compensation."

---

## 2. Core Viva Defense Topics

### Question 1: How do you prevent race conditions and overdrafts when two transfers occur at the exact same millisecond?

**The Threat:**
A customer has \$100. Simultaneously, two web requests arrive:
- Request 1: Send \$100 to Alice.
- Request 2: Send \$100 to Bob.
Without proper concurrency control, both threads read `balance = 100`, both pass the balance check (`100 >= 100`), and both deduct \$100, leaving the balance at -\$100 or corrupting the database state.

**SecurePay Defense:**
- We enforce **Pessimistic Write Locking** at the database engine level using Spring Data JPA's `@Lock(LockModeType.PESSIMISTIC_WRITE)`:
  ```sql
  SELECT * FROM wallets WHERE id = ? FOR UPDATE;
  ```
- When Thread 1 executes `FOR UPDATE`, the PostgreSQL row-level lock blocks Thread 2 until Thread 1 commits.
- When Thread 2 subsequently acquires the lock, it reads the updated balance (\$0.00), fails the balance validation check, and throws `InsufficientBalanceException`.
- Why **Pessimistic Locking** over **Optimistic Locking** (`@Version`)? In high-velocity financial systems, optimistic locking causes excessive retry exceptions and thread starvation under high contention. Pessimistic locking guarantees strict sequential processing.

---

### Question 2: How do you prevent database deadlocks during simultaneous bilateral transfers?

**The Threat:**
- User A sends \$50 to User B on Thread 1.
- User B sends \$20 to User A on Thread 2.
- Thread 1 acquires lock on Wallet A, waits for lock on Wallet B.
- Thread 2 acquires lock on Wallet B, waits for lock on Wallet A.
- This creates a **circular wait condition**, causing PostgreSQL to abort one of the transactions with a `DeadlockDetectedException`.

**SecurePay Defense:**
- We implement **Deterministic Ascending Order Lock Acquisition**:
  ```java
  Long firstLockId = Math.min(senderWallet.getId(), receiverWallet.getId());
  Long secondLockId = Math.max(senderWallet.getId(), receiverWallet.getId());

  Wallet firstWallet = walletRepository.findByIdForUpdate(firstLockId).orElseThrow(...);
  Wallet secondWallet = walletRepository.findByIdForUpdate(secondLockId).orElseThrow(...);
  ```
- Regardless of whether A transfers to B or B transfers to A, both threads request lock on `min(idA, idB)` first, followed by `max(idA, idB)`.
- Because all concurrent transactions request locks in the identical linear order, cyclic dependency graphs cannot form. Deadlock is mathematically prevented.

---

### Question 3: How does your Double-Entry Ledger ensure auditability and prevent balance tampering?

**The Threat:**
In naive applications, a transaction only updates a single `balance` column (`UPDATE wallets SET balance = balance - 50`). If an attacker or rogue administrator modifies the balance directly in the database, there is no historical proof of what transpired.

**SecurePay Defense:**
- We enforce an **Immutable Double-Entry Ledger** (`com.securepay.ledger`):
  1. Every transfer records two atomic ledger entries: one `DEBIT` and one `CREDIT`.
  2. The sum of all debits must equal the sum of all credits for every transaction.
  3. The table `ledger_entries` is strictly **insert-only**. No `UPDATE` or `DELETE` operations are permitted.
  4. Any reversal is recorded as a new offsetting compensating entry.
  5. The balance of any wallet can be independently audited by computing:
     $$\text{Audited Balance} = \sum \text{Credits} - \sum \text{Debits}$$

---

### Question 4: How do you handle API Replay Attacks and duplicate payment submissions?

**The Threat:**
A network blip or an impatient user clicking "Pay" three times sends identical HTTP POST requests with the same payload.

**SecurePay Defense:**
- We enforce **Idempotency Keys**:
  - The client includes an `Idempotency-Key: <UUID>` HTTP header.
  - The database enforces a `UNIQUE` constraint on the idempotency key in `wallet_transactions` and `payment_orders`.
  - When the first request arrives, it processes normally and records the key.
  - If a duplicate request arrives with the same key:
    - The repository query detects the existing record.
    - It returns the original transaction response without executing financial deductions a second time.
    - If a concurrent duplicate attempt hits the database simultaneously, the database unique index raises a constraint violation which our global exception handler cleanly returns as HTTP 409 Conflict.

---

### Question 5: How does Keycloak authenticate requests, and why use RS256 instead of HS256?

**The Explanation:**
- **Keycloak** acts as the centralized OpenID Connect Identity Provider.
- **Asymmetric Signing (RS256):**
  - Keycloak holds a private RSA key used to sign JSON Web Tokens (JWTs).
  - SecurePay backend only holds Keycloak's **public key**, retrieved dynamically from Keycloak's JWKS (JSON Web Key Set) endpoint (`/realms/securepay/protocol/openid-connect/certs`).
- **Why RS256 is superior to HS256:**
  - With symmetric HS256, both Keycloak and the backend must share the same secret key. If the backend is compromised, an attacker can forge valid tokens for any user or admin.
  - With asymmetric RS256, even if someone obtains the backend server code, they cannot forge tokens because the private signing key resides strictly within Keycloak.
- **Role-Based Access Control (RBAC):**
  - Our custom `KeycloakJwtAuthenticationConverter` extracts realm roles (`ROLE_CUSTOMER`, `ROLE_MERCHANT`, `ROLE_ADMIN`) and passes them to Spring Security.
  - Endpoints are protected via `@PreAuthorize("hasRole('ADMIN')")`.

---

### Question 6: Why use the Saga Pattern instead of Two-Phase Commit (2PC / XA)?

**The Comparison:**
- **Two-Phase Commit (2PC):**
  - Requires all participating nodes (database, external gateway, third-party notification service) to hold distributed locks across the network until the coordinator commits.
  - In distributed systems and fintech, 2PC is a performance bottleneck, creates single points of failure, and cannot be used with external third-party payment APIs (e.g. Razorpay or Stripe don't support XA transactions).
- **SecurePay Orchestrated Saga:**
  - Each step is an isolated local ACID transaction.
  - `PaymentSagaOrchestrator` manages execution state:
    1. `CREATE_ORDER` $\to$ 2. `EVALUATE_RISK` $\to$ 3. `DEBIT_WALLET` $\to$ 4. `CAPTURE_GATEWAY` $\to$ 5. `DISBURSE_MERCHANT`.
  - If step 4 (Gateway) fails:
    - The orchestrator catches the failure and triggers compensating transactions in reverse order.
    - Compensating Step: Refunds the debited wallet balance and generates compensating ledger entries.
    - The saga reaches state `COMPENSATED`, guaranteeing **eventual consistency** without holding distributed locks.

---

### Question 7: What is the Transactional Outbox Pattern and what problem does it solve?

**The Dual-Write Problem:**
If your code does:
```java
// Step 1: Update Database
walletRepository.save(wallet);
// Step 2: Publish Event to Message Broker / Webhook / SSE
eventPublisher.send(event);
```
If the server crashes between Step 1 and Step 2, the money is moved in the DB, but the event is lost forever! If you reverse the order, the event is sent, but the DB might fail to commit, causing a phantom notification.

**SecurePay Solution:**
- In the same atomic database transaction that updates the wallet and ledger, we insert an event into the `outbox_events` table (`status = 'PENDING'`).
- A dedicated scheduled relay (`OutboxEventRelay`) queries pending events, dispatches them to downstream consumers (SSE emitters, notification pipelines), and updates `status = 'PROCESSED'`.
- This guarantees **at-least-once delivery** with zero risk of inconsistent dual-writes.

---

### Question 8: How are Merchant API Keys secured against database leakage?

**The Threat:**
If an attacker or insider gains read access to the database dump, storing plaintext API keys allows them to impersonate any merchant.

**SecurePay Defense:**
- **One-Way Cryptographic Hashing:**
  - When generated, a cryptographically secure random key is created (`sp_test_<YOUR_MERCHANT_API_KEY>`).
  - The raw secret is returned to the merchant **only once**.
  - The database saves only the **SHA-256 hash** of the key:
    $$\text{hash} = \text{SHA-256}(\text{raw\_key})$$
  - For identification purposes, only a truncated key prefix (e.g., `sp_test_abc...`) is stored in plaintext.
  - When an incoming merchant request provides `X-API-Key`, SecurePay computes the SHA-256 hash and compares it against the stored hash.

---

### Question 9: How does SecurePay verify incoming Webhooks and protect against timing attacks?

**The Threat:**
1. **Forgery:** A malicious actor sends a fake webhook claiming payment succeeded.
2. **Timing Attacks:** If you verify signatures using standard string comparison `hashA.equals(hashB)`, Java exits early on the first mismatched character. An attacker measuring millisecond response times can deduce the secret character by character.

**SecurePay Defense:**
- **HMAC-SHA256 Verification:**
  - SecurePay calculates the HMAC digest over the raw payload using the shared webhook secret.
  - Comparison is performed using `MessageDigest.isEqual(computed, received)`:
    ```java
    byte[] a = computedSignature.getBytes(StandardCharsets.UTF_8);
    byte[] b = receivedSignature.getBytes(StandardCharsets.UTF_8);
    return MessageDigest.isEqual(a, b); // Constant-time comparison
    ```
  - This ensures the execution duration is strictly identical regardless of where mismatched bytes occur, neutralizing timing attacks.

---

### Question 10: How does the Rule-Based Risk and Fraud Engine work?

**The Functionality:**
- Located in `com.securepay.risk.RiskEngineService`.
- Every sensitive transaction undergoes real-time risk assessment before processing:
  1. **Velocity Check:** Measures the number of transactions originating from the user within the last 15 minutes.
  2. **High Amount Threshold:** Evaluates whether the requested amount exceeds the user's KYC tier limit.
  3. **Suspicious IP / Anomaly Detection:** Flags geographic anomalies or unverified devices.
- Scores are mapped into risk levels: `LOW` (allow), `MEDIUM` (step-up authentication required), `HIGH` (flagged for audit and blocked).

---

## 3. OWASP Top 10 Fintech Compliance Checklist

| OWASP Vulnerability | SecurePay Architectural Defense |
| :--- | :--- |
| **A01: Broken Access Control** | Method-level security (`@PreAuthorize`), token subject verification ensuring users only access their own wallets (`user_id == token.sub`). |
| **A02: Cryptographic Failures** | Asymmetric RS256 token verification, SHA-256 merchant key hashing, HMAC-SHA256 webhook signatures, TLS communication. |
| **A03: Injection** | Spring Data JPA parameter binding eliminates SQL injection; Liquibase/Flyway structured DDL prevents injection in schema migrations. |
| **A04: Insecure Design** | Double-entry ledger invariants, deterministic lock ordering, Transactional Outbox pattern, Saga compensation rollback. |
| **A05: Security Misconfiguration** | Production Docker container runs as non-root user (`securepay`), Actuator endpoints restricted, CORS explicitly whitelist-scoped. |
| **A06: Vulnerable Dependencies** | Eclipse Temurin 21 runtime, Spring Boot 3.4+, React 19, zero deprecated library dependencies. |
| **A07: Identification & Authentication Failures** | Centralized Keycloak IdP, MFA capability, JWT signature expiration validation (`exp`), brute-force login lockout at Keycloak layer. |
| **A08: Software and Data Integrity Failures** | Constant-time HMAC signature verification on webhooks and payment gateway callbacks. |
| **A09: Security Logging & Monitoring** | Dedicated `security_audit_logs` table, Spring Boot Actuator health/metrics, and real-time administrative SSE alert stream. |
| **A10: Server-Side Request Forgery (SSRF)** | Gateway webhooks use strict URL whitelisting and isolated adapter abstractions. |
