import { useEffect, useState } from 'react'
import type { CustomerDashboardSummary } from '../types'
import { getCustomerDashboardSummary } from '../services/dashboardService'
import DashboardStatCard from '../components/dashboard/DashboardStatCard'
import QuickAction from '../components/dashboard/QuickAction'

function CustomerPortalPage() {
    const [dashboard, setDashboard] =
        useState<CustomerDashboardSummary | null>(null)

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadDashboard() {
            try {
                setIsLoading(true)
                setError(null)

                const data =
                    await getCustomerDashboardSummary()

                setDashboard(data)
            } catch {
                setError(
                    'Unable to load your dashboard.',
                )
            } finally {
                setIsLoading(false)
            }
        }

        loadDashboard()
    }, [])

    if (isLoading) {
        return (
            <section className="dashboard-state">
                <p>Loading your dashboard...</p>
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

    if (!dashboard) {
        return (
            <section className="dashboard-state">
                <p>No dashboard data available.</p>
            </section>
        )
    }

    const { wallet, recentTransactions } = dashboard

    const totalTransactions = recentTransactions.length

    return (
        <section className="customer-dashboard">
            <header className="customer-dashboard__header">
                <div>
                    <p className="customer-dashboard__eyebrow">
                        Customer Portal
                    </p>

                    <h1>Dashboard</h1>

                    <p className="customer-dashboard__description">
                        Manage your wallet and monitor your
                        recent transactions.
                    </p>
                </div>
            </header>

            <section className="dashboard-stat-grid">
                <DashboardStatCard
                    label="Available Balance"
                    value={`${wallet.currency} ${wallet.balance.toLocaleString('en-IN')}`}
                    description="Current wallet balance"
                    accent="blue"
                    icon="₹"
                />

                <DashboardStatCard
                    label="Total Transactions"
                    value={String(totalTransactions)}
                    description="Recent wallet activity"
                    accent="green"
                    icon="↗"
                />

                <DashboardStatCard
                    label="Security Score"
                    value="94 / 100"
                    description="Account security"
                    accent="purple"
                    icon="✓"
                />

                <DashboardStatCard
                    label="Notifications"
                    value="3"
                    description="New notifications"
                    accent="red"
                    icon="!"
                />
            </section>

            <section className="quick-actions-section">
                <div className="dashboard-section-heading">
                    <div>
                        <h2>Quick Actions</h2>
                        <p>
                            Frequently used wallet actions.
                        </p>
                    </div>
                </div>

                <div className="quick-actions-grid">
                    <QuickAction
                        label="Add Money"
                        description="Add funds to your wallet"
                        icon="+"
                        to="/customer/add-money"
                    />

                    <QuickAction
                        label="Send Money"
                        description="Transfer money securely"
                        icon="↗"
                        to="/customer/send-money"
                    />

                    <QuickAction
                        label="Scan & Pay"
                        description="Pay using a QR code"
                        icon="⌗"
                        to="/customer/scan-pay"
                    />

                    <QuickAction
                        label="Pay Bills"
                        description="Manage your bill payments"
                        icon="▤"
                        to="/customer/pay-bills"
                    />
                </div>
            </section>

            <section className="dashboard-lower-grid">
                <article className="balance-overview-card">
                    <div className="dashboard-section-heading">
                        <div>
                            <h2>Balance Overview</h2>
                            <p>
                                Current wallet distribution.
                            </p>
                        </div>
                    </div>

                    <div className="balance-overview">
                        <div className="balance-overview__circle">
                            <div>
                                <strong>
                                    {wallet.currency}{' '}
                                    {wallet.balance.toLocaleString(
                                        'en-IN',
                                    )}
                                </strong>
                                <span>Total Balance</span>
                            </div>
                        </div>

                        <div className="balance-overview__legend">
                            <div>
                                <span>
                                    <i className="legend-dot legend-dot--blue" />
                                    Available Balance
                                </span>
                                <strong>
                                    {wallet.currency}{' '}
                                    {wallet.balance.toLocaleString(
                                        'en-IN',
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    <i className="legend-dot legend-dot--green" />
                                    Hold Balance
                                </span>
                                <strong>
                                    {wallet.currency} 0
                                </strong>
                            </div>

                            <div>
                                <span>
                                    <i className="legend-dot legend-dot--purple" />
                                    Pending Balance
                                </span>
                                <strong>
                                    {wallet.currency} 0
                                </strong>
                            </div>

                            <div>
                                <span>
                                    <i className="legend-dot legend-dot--orange" />
                                    Rewards
                                </span>
                                <strong>
                                    {wallet.currency} 1,250
                                </strong>
                            </div>
                        </div>
                    </div>
                </article>

                <section className="transactions-section">
                    <div className="transactions-section__header">
                        <div>
                            <h2>Recent Transactions</h2>

                            <p>
                                Your latest wallet activity.
                            </p>
                        </div>

                        <a
                            href="/customer/transactions"
                            className="dashboard-view-all"
                        >
                            View All
                        </a>
                    </div>

                    <div className="transactions-card">
                        {recentTransactions.length === 0 ? (
                            <p className="transactions-empty">
                                No transactions found.
                            </p>
                        ) : (
                            <div className="transaction-list">
                                {recentTransactions.map(
                                    (transaction) => (
                                        <article
                                            key={transaction.id}
                                            className="transaction-item"
                                        >
                                            <div className="transaction-item__info">
                                                <p className="transaction-item__description">
                                                    {
                                                        transaction.description
                                                    }
                                                </p>

                                                <p className="transaction-item__reference">
                                                    {
                                                        transaction.reference
                                                    }
                                                </p>
                                            </div>

                                            <div className="transaction-item__amount">
                                                <p>
                                                    {
                                                        transaction.currency
                                                    }{' '}
                                                    {transaction.amount.toLocaleString(
                                                        'en-IN',
                                                    )}
                                                </p>

                                                <span
                                                    className={`transaction-status transaction-status--${transaction.status.toLowerCase()}`}
                                                >
                                                    {
                                                        transaction.status
                                                    }
                                                </span>
                                            </div>
                                        </article>
                                    ),
                                )}
                            </div>
                        )}
                    </div>
                </section>
            </section>

            <section className="security-banner">
                <div className="security-banner__icon">
                    ✓
                </div>

                <div className="security-banner__content">
                    <h2>Your account is secure</h2>

                    <p>
                        Enable Two-Factor Authentication for
                        additional account protection.
                    </p>

                    <button type="button">
                        Enable 2FA
                    </button>
                </div>

                <div className="security-banner__illustration">
                    🔐
                </div>
            </section>
        </section>
    )
}

export default CustomerPortalPage