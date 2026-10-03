# SecurePay Customer Portal Backend Integration

This integration keeps the existing customer portal layout and styling. The main customer money-flow pages now use the Spring Boot API and PostgreSQL-backed records.

## Connected to backend

- Customer dashboard: reads the authenticated customer's wallet and real transaction history.
- Wallet: reads the current balance and routes the existing Add Money / Send Money buttons to their existing pages.
- Add Money: calls `POST /api/wallet/transactions/top-up`. This is a simulated demo top-up, not a real payment gateway.
- Send Money: keeps the existing beneficiary selection and Review / Confirm flow, then calls `POST /api/wallet/transactions/transfer` using the registered recipient email stored with the beneficiary.
- Transaction history and details: read from `GET /api/wallet/transactions`.
- Beneficiaries: list, details, and add operations are persisted through `/api/beneficiaries`. Only the last four digits of the entered account number are stored. A registered SecurePay customer email is required so a selected beneficiary can map to an actual SecurePay wallet.
- Profile: reads `GET /api/auth/profile`.

## Demo limitations

- Wallet top-ups add demo balance in the database; they do not charge a bank account or card.
- Transfers move balances between SecurePay customer wallets; they are not external bank transfers.
- The six-digit beneficiary verification field remains a front-end demo step and is not real MFA verification.
- Cards, external QR/UPI settlement, bill-provider settlement, persisted notifications, trusted-device management, and security-event history do not have corresponding backend domain APIs in the current project. Their existing UI remains present; these features should not be represented as live external banking functionality until their backend integrations are implemented.

## New backend API

- `GET /api/beneficiaries`
- `GET /api/beneficiaries/{id}`
- `POST /api/beneficiaries`
- `POST /api/wallet/transactions/transfer`

The database uses `spring.jpa.hibernate.ddl-auto=update`, so the new `beneficiaries` table is created/updated when the backend starts.
