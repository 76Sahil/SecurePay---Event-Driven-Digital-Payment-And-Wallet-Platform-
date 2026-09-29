import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import type { MerchantPayment } from '../types/merchantPayment'
import { getMerchantPaymentById } from '../services/merchantPaymentService'

function MerchantPaymentDetailsPage() {
    const { paymentId } = useParams<{ paymentId: string }>()

    const [payment, setPayment] = useState<MerchantPayment | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadPayment() {
            if (!paymentId) {
                setError('Payment not found.')
                setIsLoading(false)
                return
            }

            try {
                const result = await getMerchantPaymentById(paymentId)

                if (!result) {
                    setError('Payment not found.')
                    return
                }

                setPayment(result)
            } catch {
                setError('Unable to load payment details.')
            } finally {
                setIsLoading(false)
            }
        }

        void loadPayment()
    }, [paymentId])

    function formatAmount(amount: number, currency: string) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency,
            maximumFractionDigits: 0,
        }).format(amount)
    }

    function formatDate(date: string) {
        return new Intl.DateTimeFormat('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(date))
    }

    function formatPaymentMethod(method: MerchantPayment['method']) {
        return method.replace('_', ' ')
    }

    if (isLoading) {
        return (
            <section className="page-section">
                <p className="page-state">Loading payment details...</p>
            </section>
        )
    }

    if (error || !payment) {
        return (
            <section className="page-section">
                <Link
                    to="/merchant/payments"
                    className="details-back-link"
                >
                    ← Back to Payments
                </Link>

                <div className="page-state page-state--error">
                    {error ?? 'Payment not found.'}
                </div>
            </section>
        )
    }

    return (
        <section className="page-section">
            <Link
                to="/merchant/payments"
                className="details-back-link"
            >
                ← Back to Payments
            </Link>

            <div className="page-section__header">
                <div>
                    <p className="page-section__eyebrow">
                        MERCHANT PORTAL
                    </p>

                    <h1>Payment Details</h1>

                    <p>
                        View complete information about this payment.
                    </p>
                </div>

                <span
                    className={`transaction-status transaction-status--${payment.status.toLowerCase()}`}
                >
                    {payment.status}
                </span>
            </div>

            <div className="payment-details-card">
                <div className="payment-details-card__amount">
                    <span>Payment Amount</span>

                    <strong>
                        {formatAmount(
                            payment.amount,
                            payment.currency,
                        )}
                    </strong>
                </div>

                <div className="payment-details-grid">
                    <div className="payment-detail">
                        <span>Payment Reference</span>
                        <strong>{payment.reference}</strong>
                    </div>

                    <div className="payment-detail">
                        <span>Payment ID</span>
                        <strong>{payment.id}</strong>
                    </div>

                    <div className="payment-detail">
                        <span>Customer</span>

                        <strong>{payment.customerName}</strong>

                        <small>{payment.customerEmail}</small>
                    </div>

                    <div className="payment-detail">
                        <span>Payment Method</span>

                        <strong>
                            {formatPaymentMethod(payment.method)}
                        </strong>
                    </div>

                    <div className="payment-detail">
                        <span>Status</span>
                        <strong>{payment.status}</strong>
                    </div>

                    <div className="payment-detail">
                        <span>Created At</span>
                        <strong>{formatDate(payment.createdAt)}</strong>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default MerchantPaymentDetailsPage