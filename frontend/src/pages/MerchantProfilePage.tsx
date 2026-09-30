import { useEffect, useState } from 'react'
import { getMerchantProfile } from '../services/merchantProfileService'
import type { MerchantProfile } from '../types/merchantProfile'

function MerchantProfilePage() {
    const [profile, setProfile] = useState<MerchantProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadProfile() {
            try {
                const data = await getMerchantProfile()
                setProfile(data)
            } catch {
                setError('Unable to load merchant profile.')
            } finally {
                setIsLoading(false)
            }
        }

        loadProfile()
    }, [])

    if (isLoading) {
        return (
            <div className="page-container">
                <div className="page-header">
                    <span className="page-eyebrow">MERCHANT PORTAL</span>
                    <h1>Profile</h1>
                    <p>View your merchant account information.</p>
                </div>

                <div className="profile-card">
                    <p>Loading profile...</p>
                </div>
            </div>
        )
    }

    if (error || !profile) {
        return (
            <div className="page-container">
                <div className="page-header">
                    <span className="page-eyebrow">MERCHANT PORTAL</span>
                    <h1>Profile</h1>
                </div>

                <div className="profile-card">
                    <p>{error ?? 'Merchant profile not found.'}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <span className="page-eyebrow">MERCHANT PORTAL</span>
                <h1>Profile</h1>
                <p>View your merchant account information.</p>
            </div>

            <section className="profile-card">
                <div className="profile-card-header">
                    <div>
                        <h2>{profile.businessName}</h2>
                        <p>{profile.legalName}</p>
                    </div>

                    <span
                        className={`profile-status ${profile.accountStatus.toLowerCase()}`}
                    >
                        {profile.accountStatus}
                    </span>
                </div>

                <div className="profile-details-grid">
                    <div className="profile-detail">
                        <span>Merchant ID</span>
                        <strong>{profile.id}</strong>
                    </div>

                    <div className="profile-detail">
                        <span>Email</span>
                        <strong>{profile.email}</strong>
                    </div>

                    <div className="profile-detail">
                        <span>Phone</span>
                        <strong>{profile.phone}</strong>
                    </div>

                    <div className="profile-detail">
                        <span>Merchant Type</span>
                        <strong>{profile.merchantType}</strong>
                    </div>

                    <div className="profile-detail">
                        <span>Member Since</span>
                        <strong>{profile.memberSince}</strong>
                    </div>

                    <div className="profile-detail">
                        <span>Settlement Currency</span>
                        <strong>{profile.settlementCurrency}</strong>
                    </div>
                </div>
            </section>

            <section className="profile-card">
                <div className="profile-card-header">
                    <div>
                        <h2>Verification</h2>
                        <p>Current merchant verification status.</p>
                    </div>

                    <span
                        className={`profile-status ${profile.verificationStatus.toLowerCase()}`}
                    >
                        {profile.verificationStatus}
                    </span>
                </div>

                <div className="profile-security-note">
                    <strong>Merchant verification</strong>

                    <p>
                        Verification status will be managed by the SecurePay
                        backend once merchant onboarding is connected.
                    </p>
                </div>
            </section>
        </div>
    )
}

export default MerchantProfilePage