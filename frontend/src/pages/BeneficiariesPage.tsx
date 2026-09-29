import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import type { Beneficiary } from '../types/beneficiary'
import { getBeneficiaries } from '../services/beneficiaryService'

function BeneficiariesPage() {
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadBeneficiaries() {
            try {
                setIsLoading(true)
                setError(null)

                const data = await getBeneficiaries()
                setBeneficiaries(data)
            } catch {
                setError('Unable to load beneficiaries.')
            } finally {
                setIsLoading(false)
            }
        }

        void loadBeneficiaries()
    }, [])

    const activeBeneficiaries = beneficiaries.filter(
        (beneficiary) => beneficiary.status === 'ACTIVE',
    )

    const blockedBeneficiaries = beneficiaries.filter(
        (beneficiary) => beneficiary.status === 'BLOCKED',
    )

    const getStatusClass = (status: Beneficiary['status']) => {
        return `beneficiary-status beneficiary-status-${status.toLowerCase()}`
    }

    const renderBeneficiary = (beneficiary: Beneficiary) => (
        <Link
            to={`/customer/beneficiaries/${beneficiary.id}`}
            className="beneficiary-card-link"
        >
            <div className="beneficiary-card">
                <div className="beneficiary-card-main">
                    <div className="beneficiary-avatar">
                        {beneficiary.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="beneficiary-info">
                        <h3>{beneficiary.name}</h3>
                        <p>{beneficiary.bankName}</p>
                        <span>{beneficiary.accountIdentifier}</span>
                    </div>
                </div>

                <div className="beneficiary-card-meta">
                    <span
                        className={getStatusClass(beneficiary.status)}
                    >
                        {beneficiary.status}
                    </span>

                    <span className="beneficiary-id">
                        ID: {beneficiary.id}
                    </span>
                </div>
            </div>
        </Link>
    )

    return (
        <div className="beneficiaries-page">
            <div className="beneficiaries-header">
                <div>
                    <h1>Beneficiaries</h1>
                    <p>
                        Manage the people and accounts you send money to.
                    </p>
                </div>
            </div>

            {isLoading && (
                <div className="beneficiaries-card beneficiaries-state">
                    <p>Loading beneficiaries...</p>
                </div>
            )}

            {!isLoading && error && (
                <div className="beneficiaries-card beneficiaries-state beneficiaries-error">
                    <p>{error}</p>
                </div>
            )}

            {!isLoading && !error && (
                <>
                    <section>
                        <div className="beneficiaries-section-header">
                            <div>
                                <h2>Active Beneficiaries</h2>
                                <p>
                                    These beneficiaries are available for
                                    transfers.
                                </p>
                            </div>

                            <span className="beneficiary-count">
                                {activeBeneficiaries.length}
                            </span>
                        </div>

                        {activeBeneficiaries.length > 0 ? (
                            <div className="beneficiaries-list">
                                {activeBeneficiaries.map(renderBeneficiary)}
                            </div>
                        ) : (
                            <div className="beneficiaries-card beneficiaries-state">
                                <p>No active beneficiaries found.</p>
                            </div>
                        )}
                    </section>

                    {blockedBeneficiaries.length > 0 && (
                        <section>
                            <div className="beneficiaries-section-header">
                                <div>
                                    <h2>Blocked Beneficiaries</h2>
                                    <p>
                                        These beneficiaries cannot currently
                                        receive transfers.
                                    </p>
                                </div>

                                <span className="beneficiary-count beneficiary-count-blocked">
                                    {blockedBeneficiaries.length}
                                </span>
                            </div>

                            <div className="beneficiaries-list">
                                {blockedBeneficiaries.map(renderBeneficiary)}
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    )
}

export default BeneficiariesPage