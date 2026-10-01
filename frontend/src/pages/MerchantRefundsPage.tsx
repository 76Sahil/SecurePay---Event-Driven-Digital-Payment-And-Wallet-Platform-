import { useEffect, useState } from 'react'
import { getMerchantRefunds } from '../services/merchantRefundService'
import type { MerchantRefund } from '../types/merchantRefund'

function formatDate(value: string) {
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value))
}

function MerchantRefundsPage() {
    const [refunds, setRefunds] = useState<MerchantRefund[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadRefunds() {
            try {
                const data = await getMerchantRefunds()
                setRefunds(data)
            } catch {
                setError('Unable to load refund records.')
            } finally {
                setIsLoading(false)
            }
        }

        loadRefunds()
    }, [])

    if (isLoading) {
        return (
            <div className="page-container">
                <div className="page-header">
                    <span className="page-eyebrow">MERCHANT PORTAL</span>
                    <h1>Refunds</h1>
                    <p>View and track merchant refund activity.</p>
                </div>

                <div className="merchant-refunds-state">
                    <p>Loading refunds...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="page-container">
                <div className="page-header">
                    <span className="page-eyebrow">MERCHANT PORTAL</span>
                    <h1>Refunds</h1>
                    <p>View and track merchant refund activity.</p>
                </div>

                <div className="merchant-refunds-state merchant-refunds-state--error">
                    <p>{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <span className="page-eyebrow">MERCHANT PORTAL</span>
                <h1>Refunds</h1>
                <p>View and track merchant refund activity.</p>
            </div>

            <section className="merchant-refunds-card">
                <div className="merchant-refunds-card__header">
                    <div>
                        <h2>Refund History</h2>
                        <p>{refunds.length} refund records</p>
                    </div>
                </div>

                {refunds.length === 0 ? (
                    <div className="merchant-refunds-state">
                        <p>No refund records found.</p>
                    </div>
                ) : (
                    <div className="merchant-refunds-table-wrapper">
                        <table className="merchant-refunds-table">
                            <thead>
                            <tr>
                                <th>Refund</th>
                                <th>Payment</th>
                                <th>Customer</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>Amount</th>
                                <th>Date</th>
                            </tr>
                            </thead>

                            <tbody>
                            {refunds.map((refund) => (
                                <tr key={refund.id}>
                                    <td>
                                        <div className="merchant-refund-identity">
                                            <strong>{refund.reference}</strong>
                                            <span>{refund.id}</span>
                                        </div>
                                    </td>

                                    <td>{refund.paymentReference}</td>

                                    <td>{refund.customerName}</td>

                                    <td>{refund.reason}</td>

                                    <td>
                                            <span
                                                className={`merchant-refund-status ${refund.status.toLowerCase()}`}
                                            >
                                                {refund.status}
                                            </span>
                                    </td>

                                    <td>
                                        <strong>
                                            {refund.currency}{' '}
                                            {refund.amount.toLocaleString('en-IN')}
                                        </strong>
                                    </td>

                                    <td>{formatDate(refund.createdAt)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    )
}

export default MerchantRefundsPage