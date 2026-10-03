import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router'
import type { CustomerProfile } from '../types/profile'
import { getCustomerProfile } from '../services/profileService'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'

function ProfilePage() {
    const [profile, setProfile] = useState<CustomerProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadProfile = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const result = await getCustomerProfile()
            setProfile(result)
        } catch (err) {
            setError(
                err instanceof Error && err.message
                    ? err.message
                    : 'Unable to load profile information.',
            )
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        void loadProfile()
    }, [loadProfile])

    if (isLoading) {
        return (
            <section className="sp-page">
                <LoadingState message="Loading your customer profile..." />
            </section>
        )
    }

    if (error || !profile) {
        return (
            <section className="sp-page">
                <ErrorState
                    title="Profile Unavailable"
                    message={error ?? 'Customer profile not found.'}
                    onRetry={() => void loadProfile()}
                />
            </section>
        )
    }

    return (
        <div className="sp-page profile-view">
            <header className="sp-page-header">
                <div>
                    <span className="sp-badge sp-badge-neutral">Account Management</span>
                    <h1 className="sp-page-title">Customer Profile</h1>
                    <p className="sp-page-subtitle">
                        Your verified personal identity and SecurePay account details.
                    </p>
                </div>
                <div className="sp-header-actions">
                    <Link to="/customer/security" className="sp-btn sp-btn-secondary sp-btn-sm">
                        Security Settings
                    </Link>
                </div>
            </header>

            {/* Profile Hero Header Card */}
            <div className="sp-card sp-profile-hero">
                <div className="sp-profile-avatar-lg">
                    {profile.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="sp-profile-hero-info">
                    <h2>{profile.fullName}</h2>
                    <p className="sp-text-muted">{profile.email}</p>
                    <div className="sp-profile-badges">
                        <span className="sp-badge sp-badge-neutral">{profile.accountType} Account</span>
                        <span className={`sp-badge sp-badge-${profile.accountStatus.toLowerCase() === 'active' ? 'success' : 'danger'}`}>
                            ● {profile.accountStatus}
                        </span>
                    </div>
                </div>
            </div>

            {/* Personal Information */}
            <section className="sp-section">
                <div className="sp-card">
                    <div className="sp-card-header">
                        <h2 className="sp-section-title">Personal Information</h2>
                        <p className="sp-section-subtitle">Registered identity and contact details</p>
                    </div>

                    <div className="sp-grid-2">
                        <div className="sp-info-box">
                            <span className="sp-info-label">Full Name</span>
                            <strong className="sp-info-value">{profile.fullName}</strong>
                        </div>
                        <div className="sp-info-box">
                            <span className="sp-info-label">Email Address</span>
                            <strong className="sp-info-value">{profile.email}</strong>
                        </div>
                        <div className="sp-info-box">
                            <span className="sp-info-label">Phone Number</span>
                            <strong className="sp-info-value">{profile.phone || 'Not linked'}</strong>
                        </div>
                        <div className="sp-info-box">
                            <span className="sp-info-label">KYC Verification</span>
                            <strong className="sp-info-value sp-text-success">Verified</strong>
                        </div>
                    </div>
                </div>
            </section>

            {/* Account Information */}
            <section className="sp-section">
                <div className="sp-card">
                    <div className="sp-card-header">
                        <h2 className="sp-section-title">Account Information</h2>
                        <p className="sp-section-subtitle">SecurePay system metadata</p>
                    </div>

                    <div className="sp-grid-2">
                        <div className="sp-info-box">
                            <span className="sp-info-label">Customer ID</span>
                            <strong className="sp-info-value">#{profile.id}</strong>
                        </div>
                        <div className="sp-info-box">
                            <span className="sp-info-label">Member Since</span>
                            <strong className="sp-info-value">{profile.memberSince}</strong>
                        </div>
                        <div className="sp-info-box">
                            <span className="sp-info-label">Account Role</span>
                            <strong className="sp-info-value">{profile.accountType}</strong>
                        </div>
                        <div className="sp-info-box">
                            <span className="sp-info-label">Double-Entry Ledger</span>
                            <strong className="sp-info-value sp-text-success">Active & Audited</strong>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default ProfilePage