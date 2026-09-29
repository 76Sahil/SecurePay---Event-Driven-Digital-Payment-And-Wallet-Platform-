import { useEffect, useState } from 'react'
import type {
    MerchantPayment,
    MerchantPaymentStatus,
} from '../types/merchantPayment'
import { getMerchantPayments } from '../services/merchantPaymentService'

function MerchantPaymentsPage() {
    const [payments, setPayments] = useState<MerchantPayment[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadPayments() {
            try {
                setIsLoading(true)
                setError(null)

                const data = await getMerchantPayments()

                setPayments(data)
            } catch {
                setError('Unable to load merchant payments.')
            } finally {
                setIsLoading(false)
            }
        }

        void loadPayments()
    }, [])

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
    }

    function formatPaymentMethod(
        method: MerchantPayment['method'],
    ) {
        return method.replace('_', ' ')
    }

    function getStatusClass(status: MerchantPaymentStatus) {
        return `transaction-status transaction-status-${status.toLowerCase()}`
    }

    return (
        <div className="transactions-page">
            <div className="transactions-header">
                <div>
                    <p className="customer-dashboard__eyebrow">
                        Merchant Portal
                    </p>

                    <h1>Payments</h1>

                    <p>
                        View and track payments received from your
                        customers.
                    </p>
                </div>
            </div>

            {isLoading && (
                <div className="transactions-card transactions-state">
                    <p>Loading payments...</p>
                </div>
            )}

            {!isLoading && error && (
                <div className="transactions-card transactions-state transactions-error">
                    <p>{error}</p>
                </div>
            )}

            {!isLoading && !error && payments.length === 0 && (
                <div className="transactions-card transactions-state">
                    <h3>No payments yet</h3>

                    <p>
                        Payments received by your business will
                        appear here.
                    </p>
                </div>
            )}

            {!isLoading && !error && payments.length > 0 && (
                <div className="transactions-card">
                    <div className="transactions-table-wrapper">
                        <table className="transactions-table">
                            <thead>
                            <tr>
                                <th>Payment</th>
                                <th>Customer</th>
                                <th>Method</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th className="transaction-amount-header">
                                    Amount
                                </th>
                            </tr>
                            </thead>

                            <tbody>
                            {payments.map((payment) => (
                                <tr key={payment.id}>
                                    <td>
                                        <div className="transaction-info">
                                            <div className="transaction-icon transaction-icon-credit">
                                                ₹
                                            </div>

                                            <div>
                                                <strong>
                                                    {payment.reference}
                                                </strong>

                                                <span>
                                                        {payment.id}
                                                    </span>
                                            </div>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="merchant-payment-customer">
                                            <strong>
                                                {payment.customerName}
                                            </strong>

                                            <span>
            {payment.customerEmail}
        </span>
                                        </div>
                                    </td>

                                    <td>
                                            <span className="transaction-type">
                                                {formatPaymentMethod(
                                                    payment.method,
                                                )}
                                            </span>
                                    </td>

                                    <td>
                                            <span className="transaction-date">
                                                {formatDate(
                                                    payment.createdAt,
                                                )}
                                            </span>
                                    </td>

                                    <td>
                                            <span
                                                className={getStatusClass(
                                                    payment.status,
                                                )}
                                            >
                                                {payment.status}
                                            </span>
                                    </td>

                                    <td className="transaction-amount transaction-amount-credit">
                                        {payment.currency}{' '}
                                        {payment.amount.toLocaleString(
                                            'en-IN',
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MerchantPaymentsPage