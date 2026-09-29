import { useEffect, useState } from 'react'
import type { MerchantDashboardSummary } from '../types/merchantDashboard'
import { getMerchantDashboardSummary } from '../services/merchantDashboardService'
import DashboardStatCard from '../components/dashboard/DashboardStatCard'

function MerchantPortalPage() {
    const [dashboard, setDashboard] =
        useState<MerchantDashboardSummary | null>(null)

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadDashboard() {
            try {
                setIsLoading(true)
                setError(null)

                const data =
                    await getMerchantDashboardSummary()

                setDashboard(data)
            } catch {
                setError(
                    'Unable to load the merchant dashboard.',
                )
            } finally {
                setIsLoading(false)
            }
        }

        void loadDashboard()
    }, [])

    if (isLoading) {
        return (
            <section className="dashboard-state">
                <p>Loading merchant dashboard...</p>
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

    return (
        <section className="customer-dashboard">
            <header className="customer-dashboard__header">
                <div>
                    <p className="customer-dashboard__eyebrow">
                        Merchant Portal
                    </p>

                    <h1>Dashboard</h1>

                    <p className="customer-dashboard__description">
                        Monitor your business payments, revenue,
                        and merchant activity.
                    </p>
                </div>
            </header>

            <section className="dashboard-stat-grid">
                <DashboardStatCard
                    label="Total Revenue"
                    value={`${dashboard.currency} ${dashboard.totalRevenue.toLocaleString('en-IN')}`}
                    description="Total processed revenue"
                    accent="blue"
                    icon="₹"
                />

                <DashboardStatCard
                    label="Successful Payments"
                    value={String(dashboard.successfulPayments)}
                    description="Successfully completed payments"
                    accent="green"
                    icon="✓"
                />

                <DashboardStatCard
                    label="Pending Payments"
                    value={String(dashboard.pendingPayments)}
                    description="Payments awaiting completion"
                    accent="purple"
                    icon="↻"
                />

                <DashboardStatCard
                    label="Refunds"
                    value={`${dashboard.currency} ${dashboard.refunds.toLocaleString('en-IN')}`}
                    description="Total refunded amount"
                    accent="red"
                    icon="↩"
                />
            </section>

            <section className="transactions-section">
                <div className="transactions-section__header">
                    <div>
                        <h2>Recent Payments</h2>

                        <p>
                            Latest payments received by your business.
                        </p>
                    </div>
                </div>

                <div className="transactions-card">
                    {dashboard.recentPayments.length === 0 ? (
                        <p className="transactions-empty">
                            No payments found.
                        </p>
                    ) : (
                        <div className="transaction-list">
                            {dashboard.recentPayments.map(
                                (payment) => (
                                    <article
                                        key={payment.id}
                                        className="transaction-item"
                                    >
                                        <div className="transaction-item__info">
                                            <p className="transaction-item__description">
                                                {payment.customerName}
                                            </p>

                                            <p className="transaction-item__reference">
                                                {payment.reference}
                                            </p>
                                        </div>

                                        <div className="transaction-item__amount">
                                            <p>
                                                {dashboard.currency}{' '}
                                                {payment.amount.toLocaleString(
                                                    'en-IN',
                                                )}
                                            </p>

                                            <span
                                                className={`transaction-status transaction-status--${payment.status.toLowerCase()}`}
                                            >
                                                {payment.status}
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
    )
}

export default MerchantPortalPage