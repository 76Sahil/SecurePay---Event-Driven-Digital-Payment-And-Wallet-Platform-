import { useEffect, useState } from 'react'
import { getMerchantRevenue } from '../services/merchantRevenueService'
import type {
    MerchantRevenueData,
    MerchantRevenueEntry,
} from '../types/merchantRevenue'

function formatDate(value: string) {
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value))
}

function formatAmount(entry: MerchantRevenueEntry) {
    const prefix = entry.type === 'REFUND' ? '-' : ''

    return `${prefix}${entry.currency} ${entry.amount.toLocaleString('en-IN')}`
}

function MerchantRevenuePage() {
    const [revenue, setRevenue] = useState<MerchantRevenueData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadRevenue() {
            try {
                const data = await getMerchantRevenue()
                setRevenue(data)
            } catch {
                setError('Unable to load revenue information.')
            } finally {
                setIsLoading(false)
            }
        }

        loadRevenue()
    }, [])

    if (isLoading) {
        return (
            <div className="page-container">
                <div className="page-header">
                    <span className="page-eyebrow">MERCHANT PORTAL</span>
                    <h1>Revenue</h1>
                    <p>Monitor merchant revenue and recent financial activity.</p>
                </div>

                <div className="merchant-revenue-state">
                    <p>Loading revenue...</p>
                </div>
            </div>
        )
    }

    if (error || !revenue) {
        return (
            <div className="page-container">
                <div className="page-header">
                    <span className="page-eyebrow">MERCHANT PORTAL</span>
                    <h1>Revenue</h1>
                    <p>Monitor merchant revenue and recent financial activity.</p>
                </div>

                <div className="merchant-revenue-state merchant-revenue-state--error">
                    <p>{error ?? 'Revenue information not found.'}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <span className="page-eyebrow">MERCHANT PORTAL</span>
                <h1>Revenue</h1>
                <p>Monitor merchant revenue and recent financial activity.</p>
            </div>

            <section className="merchant-revenue-summary-grid">
                <div className="merchant-revenue-summary-card">
                    <span>Total Revenue</span>
                    <strong>
                        {revenue.summary.currency}{' '}
                        {revenue.summary.totalRevenue.toLocaleString('en-IN')}
                    </strong>
                    <small>This month</small>
                </div>

                <div className="merchant-revenue-summary-card">
                    <span>Net Revenue</span>
                    <strong>
                        {revenue.summary.currency}{' '}
                        {revenue.summary.netRevenue.toLocaleString('en-IN')}
                    </strong>
                    <small>After refunds</small>
                </div>

                <div className="merchant-revenue-summary-card">
                    <span>Successful Payments</span>
                    <strong>{revenue.summary.successfulPayments}</strong>
                    <small>Completed payments</small>
                </div>

                <div className="merchant-revenue-summary-card">
                    <span>Refunds</span>
                    <strong>
                        {revenue.summary.currency}{' '}
                        {revenue.summary.refunds.toLocaleString('en-IN')}
                    </strong>
                    <small>Total refunded</small>
                </div>
            </section>

            <section className="merchant-revenue-card">
                <div className="merchant-revenue-card__header">
                    <div>
                        <h2>Recent Activity</h2>
                        <p>Latest payment and refund activity.</p>
                    </div>

                    <span className="merchant-revenue-period">
                        {revenue.period.replace('_', ' ')}
                    </span>
                </div>

                <div className="merchant-revenue-table-wrapper">
                    <table className="merchant-revenue-table">
                        <thead>
                        <tr>
                            <th>Reference</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Amount</th>
                            <th>Date</th>
                        </tr>
                        </thead>

                        <tbody>
                        {revenue.recentActivity.map((entry) => (
                            <tr key={entry.id}>
                                <td>
                                    <strong>{entry.reference}</strong>
                                </td>

                                <td>
                                        <span
                                            className={`merchant-revenue-type ${entry.type.toLowerCase()}`}
                                        >
                                            {entry.type}
                                        </span>
                                </td>

                                <td>
                                        <span
                                            className={`merchant-revenue-status ${entry.status.toLowerCase()}`}
                                        >
                                            {entry.status}
                                        </span>
                                </td>

                                <td>
                                    <strong
                                        className={
                                            entry.type === 'REFUND'
                                                ? 'merchant-revenue-negative'
                                                : ''
                                        }
                                    >
                                        {formatAmount(entry)}
                                    </strong>
                                </td>

                                <td>{formatDate(entry.createdAt)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    )
}

export default MerchantRevenuePage