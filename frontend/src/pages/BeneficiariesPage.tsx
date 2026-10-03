import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router'
import type { Beneficiary } from '../types/beneficiary'
import { getBeneficiaries } from '../services/beneficiaryService'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'

function BeneficiariesPage() {
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadBeneficiaries = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const data = await getBeneficiaries()
            setBeneficiaries(data)
        } catch (err) {
            setError(
                err instanceof Error && err.message
                    ? err.message
                    : 'Unable to load beneficiaries. Please try again.',
            )
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        void loadBeneficiaries()
    }, [loadBeneficiaries])

    if (isLoading) {
        return (
            <section className="sp-page">
                <LoadingState message="Loading your registered beneficiaries..." />
            </section>
        )
    }

    if (error) {
        return (
            <section className="sp-page">
                <ErrorState
                    title="Could Not Load Beneficiaries"
                    message={error}
                    onRetry={() => void loadBeneficiaries()}
                />
            </section>
        )
    }

    const activeList = beneficiaries.filter((b) => b.status === 'ACTIVE')
    const otherList = beneficiaries.filter((b) => b.status !== 'ACTIVE')

    return (
        <div className="sp-page beneficiaries-view">
            <header className="sp-page-header">
                <div>
                    <span className="sp-badge sp-badge-neutral">Transfers & Contacts</span>
                    <h1 className="sp-page-title">Beneficiaries</h1>
                    <p className="sp-page-subtitle">
                        Manage registered accounts and contacts for rapid peer-to-peer transfers.
                    </p>
                </div>
                <div className="sp-header-actions">
                    <Link to="/customer/beneficiaries/add" className="sp-btn sp-btn-primary">
                        + Add Beneficiary
                    </Link>
                </div>
            </header>

            {beneficiaries.length === 0 ? (
                <div className="sp-card">
                    <EmptyState
                        icon="👥"
                        title="No beneficiaries found"
                        description="Save friends, colleagues, or vendors to send money without having to enter their full banking details every time."
                        actionText="+ Add First Beneficiary"
                        actionTo="/customer/beneficiaries/add"
                    />
                </div>
            ) : (
                <>
                    {/* Active Beneficiaries */}
                    <section className="sp-section">
                        <div className="sp-section-heading">
                            <h2 className="sp-section-title">
                                Active Beneficiaries ({activeList.length})
                            </h2>
                            <p className="sp-section-subtitle">
                                Verified accounts ready for instant wallet transfers
                            </p>
                        </div>

                        {activeList.length === 0 ? (
                            <div className="sp-card sp-card-p-sm">
                                <p className="sp-text-muted">No active beneficiaries at this moment.</p>
                            </div>
                        ) : (
                            <div className="sp-beneficiary-grid">
                                {activeList.map((beneficiary) => (
                                    <article key={beneficiary.id} className="sp-beneficiary-card">
                                        <div className="sp-beneficiary-card__header">
                                            <div className="sp-beneficiary-avatar">
                                                {beneficiary.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="sp-beneficiary-info">
                                                <h3 className="sp-beneficiary-name">{beneficiary.name}</h3>
                                                <p className="sp-beneficiary-bank">{beneficiary.bankName}</p>
                                            </div>
                                            <span className="sp-badge sp-badge-success">
                                                Active
                                            </span>
                                        </div>

                                        <div className="sp-beneficiary-card__details">
                                            <div className="sp-detail-row">
                                                <span className="sp-detail-label">Account</span>
                                                <span className="sp-detail-val">{beneficiary.accountIdentifier}</span>
                                            </div>
                                            {beneficiary.recipientEmail && (
                                                <div className="sp-detail-row">
                                                    <span className="sp-detail-label">Email</span>
                                                    <span className="sp-detail-val sp-text-truncate">
                                                        {beneficiary.recipientEmail}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="sp-beneficiary-card__actions">
                                            <Link
                                                to="/customer/send-money"
                                                className="sp-btn sp-btn-primary sp-btn-sm"
                                            >
                                                Send Money
                                            </Link>
                                            <Link
                                                to={`/customer/beneficiaries/${beneficiary.id}`}
                                                className="sp-btn sp-btn-ghost sp-btn-sm"
                                            >
                                                Details
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Pending or other beneficiaries if any */}
                    {otherList.length > 0 && (
                        <section className="sp-section">
                            <div className="sp-section-heading">
                                <h2 className="sp-section-title">
                                    Other Accounts ({otherList.length})
                                </h2>
                                <p className="sp-section-subtitle">
                                    Beneficiaries under verification or suspended
                                </p>
                            </div>

                            <div className="sp-beneficiary-grid">
                                {otherList.map((beneficiary) => (
                                    <article key={beneficiary.id} className="sp-beneficiary-card sp-beneficiary-card--inactive">
                                        <div className="sp-beneficiary-card__header">
                                            <div className="sp-beneficiary-avatar sp-beneficiary-avatar--muted">
                                                {beneficiary.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="sp-beneficiary-info">
                                                <h3 className="sp-beneficiary-name">{beneficiary.name}</h3>
                                                <p className="sp-beneficiary-bank">{beneficiary.bankName}</p>
                                            </div>
                                            <span className={`sp-badge sp-badge-${beneficiary.status.toLowerCase() === 'pending' ? 'warning' : 'danger'}`}>
                                                {beneficiary.status}
                                            </span>
                                        </div>

                                        <div className="sp-beneficiary-card__details">
                                            <div className="sp-detail-row">
                                                <span className="sp-detail-label">Account</span>
                                                <span className="sp-detail-val">{beneficiary.accountIdentifier}</span>
                                            </div>
                                        </div>

                                        <div className="sp-beneficiary-card__actions">
                                            <Link
                                                to={`/customer/beneficiaries/${beneficiary.id}`}
                                                className="sp-btn sp-btn-secondary sp-btn-sm"
                                            >
                                                View Status
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    )
}

export default BeneficiariesPage