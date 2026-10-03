import { Link } from 'react-router'

function HomePage() {
    return (
        <div className="landing-page">
            {/* 1. Hero Section */}
            <section className="landing-hero">
                <div className="landing-hero__badge">
                    <span>⚡ Event-Driven Financial Architecture</span>
                </div>
                <h1 className="landing-hero__title">
                    Secure Event-Driven Digital Payments, Wallet & Merchant Platform
                </h1>
                <p className="landing-hero__subtitle">
                    A resilient fintech infrastructure combining double-entry digital wallets,
                    instant peer-to-peer transfers, merchant payment gateway APIs, and real-time risk scoring.
                </p>
                <div className="landing-hero__actions">
                    <Link to="/register" className="sp-btn sp-btn-primary sp-btn-lg">
                        Create Free Account →
                    </Link>
                    <Link to="/login" className="sp-btn sp-btn-secondary sp-btn-lg">
                        Sign In to Portal
                    </Link>
                </div>
            </section>

            {/* 2. Platform Core Capabilities */}
            <section className="landing-section">
                <div className="landing-section__header">
                    <span className="sp-badge sp-badge-neutral">Core Capabilities</span>
                    <h2 className="landing-section__title">Built for Reliability & Speed</h2>
                    <p className="landing-section__subtitle">
                        Implemented platform services designed for strict transactional consistency and transparency.
                    </p>
                </div>

                <div className="landing-grid-3col">
                    <div className="landing-feature-card">
                        <div className="landing-feature-card__icon">👛</div>
                        <h3>Digital Wallet</h3>
                        <p>
                            Double-entry ledger accounting ensures exact balance conservation for every debit and credit with zero discrepancies.
                        </p>
                    </div>

                    <div className="landing-feature-card">
                        <div className="landing-feature-card__icon">↗</div>
                        <h3>Send & Receive Money</h3>
                        <p>
                            Direct peer-to-peer transfers to registered beneficiaries backed by cryptographic idempotency key protection.
                        </p>
                    </div>

                    <div className="landing-feature-card">
                        <div className="landing-feature-card__icon">💳</div>
                        <h3>Merchant Payments</h3>
                        <p>
                            Developer-friendly payment gateway with API keys, hosted checkout, refund processing, and automated webhook delivery.
                        </p>
                    </div>

                    <div className="landing-feature-card">
                        <div className="landing-feature-card__icon">📜</div>
                        <h3>Transaction Tracking</h3>
                        <p>
                            Complete ledger audit trails with unique transaction references, status indicators, and full lifecycle histories.
                        </p>
                    </div>

                    <div className="landing-feature-card">
                        <div className="landing-feature-card__icon">🛡</div>
                        <h3>Risk & Fraud Scoring</h3>
                        <p>
                            Integrated real-time risk engine that analyzes transaction amounts, account statuses, and velocity thresholds before execution.
                        </p>
                    </div>

                    <div className="landing-feature-card">
                        <div className="landing-feature-card__icon">🔄</div>
                        <h3>Event-Driven Outbox</h3>
                        <p>
                            Kafka event streaming with transactional outbox pattern guarantees reliable at-least-once notification and saga execution.
                        </p>
                    </div>
                </div>
            </section>

            {/* 3. Real Security Architecture */}
            <section className="landing-section landing-section--shaded">
                <div className="landing-section__header">
                    <span className="sp-badge sp-badge-success">Security Architecture</span>
                    <h2 className="landing-section__title">Security Implemented at Every Layer</h2>
                    <p className="landing-section__subtitle">
                        Technical security controls actively implemented and verified across the SecurePay stack.
                    </p>
                </div>

                <div className="landing-grid-2col">
                    <div className="landing-security-item">
                        <div className="landing-security-item__bullet">✓</div>
                        <div>
                            <h4>Keycloak OAuth2 / OpenID Connect</h4>
                            <p>Federated identity management with RS256 JWT tokens and cryptographically signed user sessions.</p>
                        </div>
                    </div>

                    <div className="landing-security-item">
                        <div className="landing-security-item__bullet">✓</div>
                        <div>
                            <h4>Role-Based Access Control (RBAC)</h4>
                            <p>Hard isolation between Customer, Merchant, and Administrator operations enforced at the Spring Security filter chain.</p>
                        </div>
                    </div>

                    <div className="landing-security-item">
                        <div className="landing-security-item__bullet">✓</div>
                        <div>
                            <h4>Idempotency Protection</h4>
                            <p>Unique UUID idempotency keys on payment operations prevent duplicate transfers and accidental duplicate charges.</p>
                        </div>
                    </div>

                    <div className="landing-security-item">
                        <div className="landing-security-item__bullet">✓</div>
                        <div>
                            <h4>Constant-Time Webhook Verification</h4>
                            <p>HMAC-SHA256 signature verification with constant-time byte comparisons to eliminate timing attack vectors.</p>
                        </div>
                    </div>

                    <div className="landing-security-item">
                        <div className="landing-security-item__bullet">✓</div>
                        <div>
                            <h4>Distributed Payment Saga</h4>
                            <p>Orchestrated multi-step payment saga with automatic compensating transactions on downstream failure.</p>
                        </div>
                    </div>

                    <div className="landing-security-item">
                        <div className="landing-security-item__bullet">✓</div>
                        <div>
                            <h4>Immutable Audit Logging</h4>
                            <p>Structured audit event logs capturing all authorization events, financial mutations, and administrative overrides.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. How It Works */}
            <section className="landing-section">
                <div className="landing-section__header">
                    <span className="sp-badge sp-badge-neutral">Step by Step</span>
                    <h2 className="landing-section__title">How SecurePay Works</h2>
                    <p className="landing-section__subtitle">
                        From registration to instant settlements in five streamlined steps.
                    </p>
                </div>

                <div className="landing-steps-grid">
                    <div className="landing-step">
                        <div className="landing-step__number">1</div>
                        <h4>Create Account</h4>
                        <p>Sign up in seconds as a Customer or Merchant with Keycloak authentication.</p>
                    </div>

                    <div className="landing-step">
                        <div className="landing-step__number">2</div>
                        <h4>Secure Wallet</h4>
                        <p>Your digital wallet is automatically initialized with zero balance and ledger tracking.</p>
                    </div>

                    <div className="landing-step">
                        <div className="landing-step__number">3</div>
                        <h4>Add Money</h4>
                        <p>Top up your wallet balance instantly using simulated payment gateway methods.</p>
                    </div>

                    <div className="landing-step">
                        <div className="landing-step__number">4</div>
                        <h4>Send & Receive</h4>
                        <p>Transfer funds to registered recipients or process customer payments with real-time settlement.</p>
                    </div>

                    <div className="landing-step">
                        <div className="landing-step__number">5</div>
                        <h4>Track Ledger</h4>
                        <p>Monitor your verified balance, audit trail, and webhook events with complete transparency.</p>
                    </div>
                </div>
            </section>

            {/* 5. Final CTA */}
            <section className="landing-cta-banner">
                <h2 className="landing-cta-banner__title">
                    Ready to Experience Modern Digital Payments?
                </h2>
                <p className="landing-cta-banner__subtitle">
                    Explore our digital wallet, peer-to-peer transfers, and merchant payment workflows.
                </p>
                <div className="landing-cta-banner__actions">
                    <Link to="/register" className="sp-btn sp-btn-primary sp-btn-lg">
                        Create Your SecurePay Account
                    </Link>
                    <Link to="/login" className="sp-btn sp-btn-secondary sp-btn-lg">
                        Sign In Now
                    </Link>
                </div>
            </section>
        </div>
    )
}

export default HomePage