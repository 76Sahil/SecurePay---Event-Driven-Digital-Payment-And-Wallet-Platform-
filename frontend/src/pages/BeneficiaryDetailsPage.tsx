import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import type { Beneficiary } from '../types/beneficiary'
import { getBeneficiaryById } from '../services/beneficiaryService'

function BeneficiaryDetailsPage() {
    const { beneficiaryId } = useParams<{ beneficiaryId: string }>()

    const [beneficiary, setBeneficiary] = useState<Beneficiary | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadBeneficiary() {
            if (!beneficiaryId) {
                setError('Beneficiary ID is missing.')
                setIsLoading(false)
                return
            }

            try {
                setIsLoading(true)
                setError(null)

                const data = await getBeneficiaryById(beneficiaryId)

                if (!data) {
                    setError('Beneficiary not found.')
                    return
                }

                setBeneficiary(data)
            } catch {
                setError('Unable to load beneficiary details.')
            } finally {
                setIsLoading(false)
            }
        }

        void loadBeneficiary()
    }, [beneficiaryId])

    const formatStatus = (status: Beneficiary['status']) => {
        return (
            status.charAt(0).toUpperCase() +
            status.slice(1).toLowerCase()
        )
    }

    const isTransferEligible = beneficiary?.status === 'ACTIVE'

    if (isLoading) {
        return (
            <div className="beneficiary-details-page">
                <div className="beneficiary-details-card beneficiary-details-state">
                    <p>Loading beneficiary details...</p>
                </div>
            </div>
        )
    }

    if (error || !beneficiary) {
        return (
            <div className="beneficiary-details-page">
                <div className="beneficiary-details-card beneficiary-details-state">
                    <h2>Beneficiary unavailable</h2>

                    <p>
                        {error ??
                            'Beneficiary details could not be loaded.'}
                    </p>

                    <Link
                        to="/customer/beneficiaries"
                        className="beneficiary-details-back-button"
                    >
                        Back to Beneficiaries
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="beneficiary-details-page">
            <div className="beneficiary-details-header">
                <div>
                    <Link
                        to="/customer/beneficiaries"
                        className="beneficiary-details-back-link"
                    >
                        ← Back to Beneficiaries
                    </Link>

                    <h1>Beneficiary Details</h1>

                    <p>
                        Review the details and transfer eligibility of this
                        beneficiary.
                    </p>
                </div>
            </div>

            <div className="beneficiary-details-card">
                <div className="beneficiary-details-summary">
                    <div className="beneficiary-details-avatar">
                        {beneficiary.name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                        <span className="beneficiary-details-label">
                            Beneficiary
                        </span>

                        <h2>{beneficiary.name}</h2>

                        <p>{beneficiary.bankName}</p>
                    </div>
                </div>

                <div className="beneficiary-details-status-row">
                    <span>Status</span>

                    <span
                        className={`beneficiary-status beneficiary-status-${beneficiary.status.toLowerCase()}`}
                    >
                        {formatStatus(beneficiary.status)}
                    </span>
                </div>
            </div>

            <div className="beneficiary-details-card">
                <h3>Beneficiary Information</h3>

                <div className="beneficiary-details-grid">
                    <div className="beneficiary-detail-item">
                        <span>Name</span>
                        <strong>{beneficiary.name}</strong>
                    </div>

                    <div className="beneficiary-detail-item">
                        <span>Bank</span>
                        <strong>{beneficiary.bankName}</strong>
                    </div>

                    <div className="beneficiary-detail-item">
                        <span>Account</span>
                        <strong>{beneficiary.accountIdentifier}</strong>
                    </div>

                    <div className="beneficiary-detail-item">
                        <span>Beneficiary ID</span>
                        <strong>{beneficiary.id}</strong>
                    </div>
                </div>
            </div>

            <div className="beneficiary-details-card">
                <h3>Transfer Eligibility</h3>

                <div
                    className={`beneficiary-eligibility ${
                        isTransferEligible
                            ? 'beneficiary-eligibility-active'
                            : 'beneficiary-eligibility-blocked'
                    }`}
                >
                    <div className="beneficiary-eligibility-icon">
                        {isTransferEligible ? '✓' : '!'}
                    </div>

                    <div>
                        <strong>
                            {isTransferEligible
                                ? 'Available for transfers'
                                : 'Transfers are blocked'}
                        </strong>

                        <p>
                            {isTransferEligible
                                ? 'This beneficiary is currently active. A transfer will still be subject to backend authorization and risk checks.'
                                : 'Transfers to this beneficiary are currently unavailable.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BeneficiaryDetailsPage