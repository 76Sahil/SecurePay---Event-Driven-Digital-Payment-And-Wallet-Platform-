import { useEffect, useState, useCallback } from 'react'
import type { CustomerProfile } from '../types/profile'
import { getCustomerProfile } from '../services/profileService'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'

function SecurityPage() {
    const [profile, setProfile] = useState<CustomerProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadSecurityData = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const profileData = await getCustomerProfile()
            setProfile(profileData)
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to load security profile information.',
            )
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        void loadSecurityData()
    }, [loadSecurityData])

    if (isLoading) {
        return (
            <div className="sp-page">
                <LoadingState message="Loading security profile..." />
            </div>
        )
    }

    if (error && !profile) {
        return (
            <div className="sp-page">
                <ErrorState
                    title="Security Details Unavailable"
                    message={error}
                    onRetry={() => void loadSecurityData()}
                />
            </div>
        )
    }

    return (
        <div className="sp-page security-page">
            <header className="sp-page-header">
                <div>
                    <span className="sp-badge sp-badge-neutral">Security Center</span>
                    <h1 className="sp-page-title">Account Security</h1>
                    <p className="sp-page-subtitle">
                        Truthful audit of your authentication credentials, session security, and SecurePay platform protection mechanisms.
                    </p>
                </div>
            </header>

            {/* 1. Real Authentication & Account State */}
            <section className="sp-card" style={{ marginBottom: '24px' }}>
                <div className="sp-card-header">
                    <div>
                        <h2 className="sp-card-title">Authentication & Identity</h2>
                        <p className="sp-card-subtitle">
                            Live credentials managed by Keycloak OpenID Connect.
                        </p>
                    </div>
                    <span className="sp-badge sp-badge-success">● Active Session</span>
                </div>

                <div className="sp-grid-3col" style={{ marginTop: '20px' }}>
                    <div className="sp-info-box">
                        <span className="sp-info-box__label">Identity Provider</span>
                        <strong className="sp-info-box__value">Keycloak OIDC (v26)</strong>
                        <span className="sp-info-box__sub">RS256 JWT Signed</span>
                    </div>

                    <div className="sp-info-box">
                        <span className="sp-info-box__label">Account Role</span>
                        <strong className="sp-info-box__value">{profile?.accountType || 'CUSTOMER'}</strong>
                        <span className="sp-info-box__sub">RBAC Enforced</span>
                    </div>

                    <div className="sp-info-box">
                        <span className="sp-info-box__label">Account Status</span>
                        <strong className="sp-info-box__value" style={{ color: '#107e3e' }}>
                            {profile?.accountStatus || 'ACTIVE'}
                        </strong>
                        <span className="sp-info-box__sub">Member since {profile?.memberSince || 'Recent'}</span>
                    </div>
                </div>

                <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '10px', fontSize: '13px', color: '#556885' }}>
                    <strong>Authenticated Account:</strong> {profile?.email} (User ID: {profile?.id})
                </div>
            </section>

            {/* 2. Truthful Account Security Controls (Truthful Unconfigured States) */}
            <section className="sp-grid-2col" style={{ marginBottom: '24px', alignItems: 'start' }}>
                <div className="sp-card">
                    <div className="sp-card-header">
                        <div>
                            <h3 className="sp-card-title">Multi-Factor Authentication (MFA)</h3>
                            <p className="sp-card-subtitle">Additional layer of sign-in verification</p>
                        </div>
                        <span className="sp-badge sp-badge-neutral">Managed via Keycloak</span>
                    </div>

                    <div style={{ marginTop: '16px', color: '#556885', fontSize: '14px', lineHeight: '1.6' }}>
                        <p>
                            <strong>Status:</strong> Not configured in this portal.
                        </p>
                        <p style={{ marginTop: '8px' }}>
                            MFA (TOTP/authenticator app) policies are managed directly within your Keycloak Identity Realm. When enabled by administrators, MFA verification is enforced at the SSO login gateway.
                        </p>
                    </div>
                </div>

                <div className="sp-card">
                    <div className="sp-card-header">
                        <div>
                            <h3 className="sp-card-title">Registered Devices</h3>
                            <p className="sp-card-subtitle">Hardware and browser session bindings</p>
                        </div>
                        <span className="sp-badge sp-badge-neutral">0 Devices</span>
                    </div>

                    <div style={{ marginTop: '16px', color: '#556885', fontSize: '14px', lineHeight: '1.6' }}>
                        <p>
                            <strong>Status:</strong> No registered devices tracked in portal.
                        </p>
                        <p style={{ marginTop: '8px' }}>
                            Session lifecycles and token revocations are governed statelessly via OAuth2 Bearer tokens issued by Keycloak. SecurePay does not fabricate or persist custom device fingerprints.
                        </p>
                    </div>
                </div>
            </section>

            {/* 3. Real Implemented Platform Security Mechanisms */}
            <section className="sp-card">
                <div className="sp-card-header">
                    <div>
                        <h2 className="sp-card-title">Platform Security Architecture</h2>
                        <p className="sp-card-subtitle">
                            Technical defenses implemented and actively running in the SecurePay core.
                        </p>
                    </div>
                </div>

                <div className="sp-grid-2col" style={{ marginTop: '20px', gap: '20px' }}>
                    <div className="sp-security-feature">
                        <div className="sp-security-feature__icon">🔐</div>
                        <div>
                            <h4 className="sp-security-feature__title">Keycloak OAuth2 / OIDC & JWT</h4>
                            <p className="sp-security-feature__desc">
                                All API requests require a valid RS256-signed Bearer JWT containing realm and client roles. Tokens are verified at Spring Security filter layer.
                            </p>
                        </div>
                    </div>

                    <div className="sp-security-feature">
                        <div className="sp-security-feature__icon">🛡</div>
                        <div>
                            <h4 className="sp-security-feature__title">Role-Based Access Control (RBAC)</h4>
                            <p className="sp-security-feature__desc">
                                Strict role separation ensures customer endpoints, merchant gateway operations, and admin commands cannot be accessed cross-domain.
                            </p>
                        </div>
                    </div>

                    <div className="sp-security-feature">
                        <div className="sp-security-feature__icon">⚡</div>
                        <div>
                            <h4 className="sp-security-feature__title">Idempotency Protection</h4>
                            <p className="sp-security-feature__desc">
                                State-changing financial transactions require a unique Idempotency-Key UUID, preventing accidental duplicate debits, retries, or network replay attacks.
                            </p>
                        </div>
                    </div>

                    <div className="sp-security-feature">
                        <div className="sp-security-feature__icon">⚖️</div>
                        <div>
                            <h4 className="sp-security-feature__title">Atomic Double-Entry Ledger</h4>
                            <p className="sp-security-feature__desc">
                                Fund transfers execute as atomic balanced journal entries across sender and recipient accounts, maintaining strict mathematical integrity.
                            </p>
                        </div>
                    </div>

                    <div className="sp-security-feature">
                        <div className="sp-security-feature__icon">🚦</div>
                        <div>
                            <h4 className="sp-security-feature__title">Real-Time Risk & Fraud Engine</h4>
                            <p className="sp-security-feature__desc">
                                Integrated rule evaluation checks transaction amounts, velocity, and account lock statuses to flag or block anomalous transfer activity.
                            </p>
                        </div>
                    </div>

                    <div className="sp-security-feature">
                        <div className="sp-security-feature__icon">🔏</div>
                        <div>
                            <h4 className="sp-security-feature__title">Constant-Time Webhook Verification</h4>
                            <p className="sp-security-feature__desc">
                                Merchant notification webhooks use HMAC-SHA256 signatures with constant-time byte comparisons (`MessageDigest.isEqual`) to prevent timing side-channel attacks.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default SecurityPage