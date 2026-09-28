import { useEffect, useState } from 'react'
import type { Wallet } from '../types'
import { getCustomerDashboardSummary } from '../services/dashboardService'

function WalletPage() {
    const [wallet, setWallet] = useState<Wallet | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadWallet() {
            try {
                setIsLoading(true)
                setError(null)

                const dashboard =
                    await getCustomerDashboardSummary()

                setWallet(dashboard.wallet)
            } catch {
                setError(
                    'Unable to load your wallet.',
                )
            } finally {
                setIsLoading(false)
            }
        }

        loadWallet()
    }, [])

    if (isLoading) {
        return (
            <section className="dashboard-state">
                <p>Loading your wallet...</p>
            </section>
        )
    }

    if (error) {
        return (
            <section className="dashboard-state dashboard-state--error">
                <p>{error}</p>
            </section>
        )
    }

    if (!wallet) {
        return (
            <section className="dashboard-state">
                <p>No wallet information available.</p>
            </section>
        )
    }

    return (
        <section className="wallet-page">
            <header className="wallet-page__header">
                <div>
                    <p className="customer-dashboard__eyebrow">
                        Customer Portal
                    </p>

                    <h1>Wallet</h1>

                    <p className="wallet-page__description">
                        Manage your SecurePay wallet and
                        monitor your available balance.
                    </p>
                </div>
            </header>

            <section className="wallet-balance-card">
                <div className="wallet-balance-card__content">
                    <p className="wallet-balance-card__label">
                        Available Balance
                    </p>

                    <h2>
                        {wallet.currency}{' '}
                        {wallet.balance.toLocaleString(
                            'en-IN',
                        )}
                    </h2>

                    <p className="wallet-balance-card__status">
                        <span>●</span>
                        Wallet {wallet.status.toLowerCase()}
                    </p>
                </div>

                <div className="wallet-balance-card__icon">
                    ₹
                </div>
            </section>

            <section className="wallet-details-grid">
                <article className="wallet-detail-card">
                    <p className="wallet-detail-card__label">
                        Wallet Status
                    </p>

                    <p className="wallet-detail-card__value">
                        {wallet.status}
                    </p>

                    <p className="wallet-detail-card__description">
                        Your wallet is currently available
                        for transactions.
                    </p>
                </article>

                <article className="wallet-detail-card">
                    <p className="wallet-detail-card__label">
                        Currency
                    </p>

                    <p className="wallet-detail-card__value">
                        {wallet.currency}
                    </p>

                    <p className="wallet-detail-card__description">
                        Primary currency used by your wallet.
                    </p>
                </article>

                <article className="wallet-detail-card">
                    <p className="wallet-detail-card__label">
                        Wallet ID
                    </p>

                    <p className="wallet-detail-card__value wallet-detail-card__value--small">
                        {wallet.id}
                    </p>

                    <p className="wallet-detail-card__description">
                        Unique identifier for your wallet.
                    </p>
                </article>
            </section>

            <section className="wallet-actions">
                <div className="dashboard-section-heading">
                    <div>
                        <h2>Wallet Actions</h2>

                        <p>
                            Choose an action to manage your
                            wallet.
                        </p>
                    </div>
                </div>

                <div className="wallet-actions__grid">
                    <button
                        type="button"
                        className="wallet-action-card"
                    >
                        <span className="wallet-action-card__icon">
                            +
                        </span>

                        <span>
                            <strong>Add Money</strong>
                            <small>
                                Add funds to your wallet
                            </small>
                        </span>
                    </button>

                    <button
                        type="button"
                        className="wallet-action-card"
                    >
                        <span className="wallet-action-card__icon">
                            ↗
                        </span>

                        <span>
                            <strong>Send Money</strong>
                            <small>
                                Transfer money securely
                            </small>
                        </span>
                    </button>
                </div>
            </section>
        </section>
    )
}

export default WalletPage