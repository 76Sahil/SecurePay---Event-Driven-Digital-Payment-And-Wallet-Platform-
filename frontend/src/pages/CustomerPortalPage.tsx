import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../context/useAuth'
import type { CustomerDashboardSummary } from '../types'
import { getCustomerDashboardSummary } from '../services/dashboardService'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'

function CustomerPortalPage() {
    const { user } = useAuth()
    const [dashboard, setDashboard] = useState<CustomerDashboardSummary | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadDashboard = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const data = await getCustomerDashboardSummary()
            setDashboard(data)
        } catch (err) {
            setError(
                err instanceof Error && err.message
                    ? err.message
                    : 'Unable to load your dashboard. Please try again.',
            )
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        void loadDashboard()
    }, [loadDashboard])

    if (isLoading) {
        return (
            <section className="sp-page">
                <LoadingState message="Loading your dashboard & wallet..." />
            </section>
        )
    }

    if (error || !dashboard) {
        return (
            <section className="sp-page">
                <ErrorState
                    title="Dashboard Unavailable"
                    message={error ?? 'Could not retrieve your wallet details.'}
                    onRetry={() => void loadDashboard()}
                />
            </section>
        )
    }

    const { wallet, recentTransactions, totalTransactions } = dashboard
    const displayName = user?.email ? user.email.split('@')[0] : 'Customer'

    return (
        <div className="sp-page customer-dashboard-view">
            {/* 1. Header with greeting and quick access */}
            <header className="sp-page-header">
                <div>
                    <span className="sp-badge sp-badge-neutral">Customer Portal</span>
                    <h1 className="sp-page-title">
                        Welcome back, {displayName}
                    </h1>
                    <p className="sp-page-subtitle">
                        Here is your wallet overview and recent activity.
                    </p>
                </div>
                <div className="sp-header-actions">
                    <Link to="/customer/notifications" className="sp-btn sp-btn-secondary sp-btn-sm">
                        🔔 Notifications
                    </Link>
                    <Link to="/customer/security" className="sp-btn sp-btn-secondary sp-btn-sm">
                        🛡 Security
                    </Link>
                </div>
            </header>

            {/* 2. Primary Hero Balance Card */}
            <section className="sp-balance-hero">
                <div className="sp-balance-hero__top">
                    <div>
                        <span className="sp-balance-hero__label">Available Wallet Balance</span>
                        <div className="sp-balance-hero__amount">
                            <span className="sp-balance-hero__currency">{wallet.currency}</span>
                            <span className="sp-balance-hero__value">
                                {wallet.balance.toLocaleString('en-IN', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </span>
                        </div>
                    </div>
                    <div className="sp-balance-hero__badge-group">
                        <span className={`sp-badge sp-badge-${wallet.status.toLowerCase() === 'active' ? 'success' : 'warning'}`}>
                            ● {wallet.status}
                        </span>
                        <span className="sp-balance-hero__id">
                            Wallet ID: #{wallet.id}
                        </span>
                    </div>
                </div>

                <div className="sp-balance-hero__actions">
                    <Link to="/customer/add-money" className="sp-btn sp-btn-primary">
                        + Add Money
                    </Link>
                    <Link to="/customer/send-money" className="sp-btn sp-btn-secondary">
                        ↗ Send Money
                    </Link>
                    <Link to="/customer/transactions" className="sp-btn sp-btn-ghost">
                        View Statement
                    </Link>
                </div>
            </section>

            {/* 3. Quick Actions Grid */}
            <section className="sp-section">
                <div className="sp-section-heading">
                    <h2 className="sp-section-title">Quick Actions</h2>
                    <p className="sp-section-subtitle">Common transactions and management actions</p>
                </div>

                <div className="sp-quick-actions-grid">
                    <Link to="/customer/add-money" className="sp-action-card">
                        <div className="sp-action-card__icon sp-action-card__icon--blue">⊕</div>
                        <div className="sp-action-card__content">
                            <h3>Add Money</h3>
                            <p>Top up your wallet balance instantly</p>
                        </div>
                        <span className="sp-action-card__arrow">→</span>
                    </Link>

                    <Link to="/customer/send-money" className="sp-action-card">
                        <div className="sp-action-card__icon sp-action-card__icon--green">↗</div>
                        <div className="sp-action-card__content">
                            <h3>Send Money</h3>
                            <p>Transfer funds to registered recipients</p>
                        </div>
                        <span className="sp-action-card__arrow">→</span>
                    </Link>

                    <Link to="/customer/beneficiaries" className="sp-action-card">
                        <div className="sp-action-card__icon sp-action-card__icon--purple">👥</div>
                        <div className="sp-action-card__content">
                            <h3>Beneficiaries</h3>
                            <p>Manage saved transfer contacts</p>
                        </div>
                        <span className="sp-action-card__arrow">→</span>
                    </Link>

                    <Link to="/customer/transactions" className="sp-action-card">
                        <div className="sp-action-card__icon sp-action-card__icon--amber">📑</div>
                        <div className="sp-action-card__content">
                            <h3>Transactions</h3>
                            <p>Track payments and transfer records</p>
                        </div>
                        <span className="sp-action-card__arrow">→</span>
                    </Link>
                </div>
            </section>

            {/* 4. Recent Transactions Section */}
            <section className="sp-section">
                <div className="sp-section-header-row">
                    <div>
                        <h2 className="sp-section-title">Recent Transactions</h2>
                        <p className="sp-section-subtitle">
                            Latest activity ({totalTransactions} total recorded)
                        </p>
                    </div>
                    {recentTransactions.length > 0 && (
                        <Link to="/customer/transactions" className="sp-link">
                            View All Transactions →
                        </Link>
                    )}
                </div>

                <div className="sp-card">
                    {recentTransactions.length === 0 ? (
                        <EmptyState
                            icon="💳"
                            title="No transactions yet"
                            description="Your wallet is active and ready. Add funds or send money to get started."
                            actionText="+ Add Money"
                            actionTo="/customer/add-money"
                        />
                    ) : (
                        <div className="sp-tx-list">
                            {recentTransactions.map((tx) => {
                                const isCredit = ['TOP_UP', 'DEPOSIT', 'CREDIT', 'TRANSFER_IN'].includes(tx.type)
                                const formattedDate = new Date(tx.createdAt).toLocaleString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })

                                return (
                                    <div key={tx.id} className="sp-tx-item">
                                        <div className="sp-tx-item__left">
                                            <div className={`sp-tx-icon ${isCredit ? 'sp-tx-icon--credit' : 'sp-tx-icon--debit'}`}>
                                                {isCredit ? '↓' : '↑'}
                                            </div>
                                            <div>
                                                <p className="sp-tx-desc">{tx.description || tx.type}</p>
                                                <div className="sp-tx-meta">
                                                    <span>{formattedDate}</span>
                                                    <span>•</span>
                                                    <span className="sp-tx-ref">{tx.reference || `TXN-${tx.id}`}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="sp-tx-item__right">
                                            <span className={`sp-tx-amount ${isCredit ? 'sp-tx-amount--credit' : 'sp-tx-amount--debit'}`}>
                                                {isCredit ? '+' : '-'} {tx.currency}{' '}
                                                {tx.amount.toLocaleString('en-IN', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </span>
                                            <span className={`sp-badge sp-badge-${tx.status.toLowerCase() === 'success' ? 'success' : tx.status.toLowerCase() === 'pending' ? 'warning' : 'danger'}`}>
                                                {tx.status}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* 5. Security & Protection Notice */}
            <section className="sp-security-card">
                <div className="sp-security-card__icon">🛡</div>
                <div className="sp-security-card__content">
                    <h3>Protected by SecurePay Engine</h3>
                    <p>
                        Your account is safeguarded with double-entry ledger bookkeeping, real-time risk scoring,
                        and Keycloak OAuth2 authorization.
                    </p>
                </div>
                <Link to="/customer/security" className="sp-btn sp-btn-secondary sp-btn-sm">
                    Security Center
                </Link>
            </section>
        </div>
    )
}

export default CustomerPortalPage