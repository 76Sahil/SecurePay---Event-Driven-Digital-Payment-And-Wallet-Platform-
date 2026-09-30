import { useEffect, useState } from 'react'
import type { CustomerProfile } from '../types/profile'
import { getCustomerProfile } from '../services/profileService'

function ProfilePage() {
    const [profile, setProfile] = useState<CustomerProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadProfile() {
            try {
                const result = await getCustomerProfile()
                setProfile(result)
            } catch {
                setError('Unable to load profile information.')
            } finally {
                setIsLoading(false)
            }
        }

        void loadProfile()
    }, [])

    if (isLoading) {
        return (
            <section className="page-section">
                <p className="page-state">Loading profile...</p>
            </section>
        )
    }

    if (error || !profile) {
        return (
            <section className="page-section">
                <div className="page-state page-state--error">
                    {error ?? 'Profile not found.'}
                </div>
            </section>
        )
    }

    return (
        <section className="page-section">
            <div className="page-section__header">
                <div>
                    <p className="page-section__eyebrow">
                        CUSTOMER PORTAL
                    </p>

                    <h1>Profile</h1>

                    <p>
                        Manage your personal and account information.
                    </p>
                </div>
            </div>

            <div className="profile-header-card">
                <div className="profile-avatar">
                    {profile.fullName.charAt(0).toUpperCase()}
                </div>

                <div className="profile-header-info">
                    <h2>{profile.fullName}</h2>

                    <p>{profile.email}</p>

                    <span className="profile-account-badge">
                        Customer Account
                    </span>
                </div>
            </div>

            <div className="profile-section-card">
                <div className="profile-section-card__header">
                    <div>
                        <h2>Personal Information</h2>
                        <p>Your registered contact information.</p>
                    </div>
                </div>

                <div className="profile-details-grid">
                    <div className="profile-detail">
                        <span>Full Name</span>
                        <strong>{profile.fullName}</strong>
                    </div>

                    <div className="profile-detail">
                        <span>Email Address</span>
                        <strong>{profile.email}</strong>
                    </div>

                    <div className="profile-detail">
                        <span>Phone Number</span>
                        <strong>{profile.phone}</strong>
                    </div>
                </div>
            </div>

            <div className="profile-section-card">
                <div className="profile-section-card__header">
                    <div>
                        <h2>Account Information</h2>
                        <p>Overview of your SecurePay account.</p>
                    </div>
                </div>

                <div className="profile-details-grid">
                    <div className="profile-detail">
                        <span>Customer ID</span>
                        <strong>{profile.id}</strong>
                    </div>

                    <div className="profile-detail">
                        <span>Account Type</span>
                        <strong>{profile.accountType}</strong>
                    </div>

                    <div className="profile-detail">
                        <span>Member Since</span>
                        <strong>{profile.memberSince}</strong>
                    </div>

                    <div className="profile-detail">
                        <span>Account Status</span>
                        <strong className="profile-status-active">
                            {profile.accountStatus}
                        </strong>
                    </div>
                </div>
            </div>

            <div className="profile-section-card">
                <div className="profile-section-card__header">
                    <div>
                        <h2>Security Overview</h2>
                        <p>Current account protection status.</p>
                    </div>
                </div>

                <div className="profile-security-list">
                    <div className="profile-security-item">
                        <div>
                            <strong>Multi-Factor Authentication</strong>
                            <span>
                                Additional verification is enabled.
                            </span>
                        </div>

                        <span className="profile-security-enabled">
                            Enabled
                        </span>
                    </div>

                    <div className="profile-security-item">
                        <div>
                            <strong>Trusted Devices</strong>
                            <span>
                                Devices currently trusted for your account.
                            </span>
                        </div>

                        <strong>
                            {profile.trustedDevices}
                        </strong>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ProfilePage