import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import type { Transaction } from '../types/transaction'
import { getTransactionById } from '../services/transactionService'

function TransactionDetailsPage() {
    const { transactionId } = useParams<{ transactionId: string }>()

    const [transaction, setTransaction] = useState<Transaction | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadTransaction() {
            if (!transactionId) {
                setError('Transaction ID is missing.')
                setIsLoading(false)
                return
            }

            try {
                setIsLoading(true)
                setError(null)

                const data = await getTransactionById(transactionId)

                if (!data) {
                    setError('Transaction not found.')
                    return
                }

                setTransaction(data)
            } catch {
                setError('Unable to load transaction details.')
            } finally {
                setIsLoading(false)
            }
        }

        void loadTransaction()
    }, [transactionId])

    const formatAmount = (amount: number, direction: Transaction['direction']) => {
        const sign = direction === 'CREDIT' ? '+' : '-'

        return `${sign} ₹${amount.toLocaleString('en-IN')}`
    }

    const formatDateTime = (date: string) => {
        return new Date(date).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const formatLabel = (value: string) => {
        return value
            .toLowerCase()
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (character) => character.toUpperCase())
    }

    if (isLoading) {
        return (
            <div className="transaction-details-page">
                <div className="transaction-details-card transaction-details-state">
                    <p>Loading transaction details...</p>
                </div>
            </div>
        )
    }

    if (error || !transaction) {
        return (
            <div className="transaction-details-page">
                <div className="transaction-details-card transaction-details-state">
                    <h2>Transaction unavailable</h2>
                    <p>{error ?? 'Transaction details could not be loaded.'}</p>

                    <Link
                        to="/customer/transactions"
                        className="transaction-details-back-button"
                    >
                        Back to Transactions
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="transaction-details-page">
            <div className="transaction-details-header">
                <div>
                    <Link
                        to="/customer/transactions"
                        className="transaction-details-back-link"
                    >
                        ← Back to Transactions
                    </Link>

                    <h1>Transaction Details</h1>
                    <p>Review the details of this wallet transaction.</p>
                </div>
            </div>

            <div className="transaction-details-card">
                <div className="transaction-details-summary">
                    <div
                        className={`transaction-details-icon ${
                            transaction.direction === 'CREDIT'
                                ? 'transaction-details-icon-credit'
                                : 'transaction-details-icon-debit'
                        }`}
                    >
                        {transaction.direction === 'CREDIT' ? '↓' : '↑'}
                    </div>

                    <div>
                        <span className="transaction-details-summary-label">
                            {formatLabel(transaction.type)}
                        </span>

                        <h2
                            className={
                                transaction.direction === 'CREDIT'
                                    ? 'transaction-details-amount transaction-details-amount-credit'
                                    : 'transaction-details-amount transaction-details-amount-debit'
                            }
                        >
                            {formatAmount(
                                transaction.amount,
                                transaction.direction,
                            )}
                        </h2>

                        <span className="transaction-details-currency">
                            {transaction.currency}
                        </span>
                    </div>
                </div>

                <div className="transaction-details-status-row">
                    <span>Status</span>

                    <span
                        className={`transaction-status transaction-status-${transaction.status.toLowerCase()}`}
                    >
                        {formatLabel(transaction.status)}
                    </span>
                </div>
            </div>

            <div className="transaction-details-card">
                <h3>Transaction Information</h3>

                <div className="transaction-details-grid">
                    <div className="transaction-detail-item">
                        <span>Transaction Reference</span>
                        <strong>{transaction.reference}</strong>
                    </div>

                    <div className="transaction-detail-item">
                        <span>Transaction ID</span>
                        <strong>{transaction.id}</strong>
                    </div>

                    <div className="transaction-detail-item">
                        <span>Type</span>
                        <strong>{formatLabel(transaction.type)}</strong>
                    </div>

                    <div className="transaction-detail-item">
                        <span>Direction</span>
                        <strong>{formatLabel(transaction.direction)}</strong>
                    </div>

                    <div className="transaction-detail-item">
                        <span>Date & Time</span>
                        <strong>{formatDateTime(transaction.createdAt)}</strong>
                    </div>

                    <div className="transaction-detail-item">
                        <span>Description</span>
                        <strong>{transaction.description}</strong>
                    </div>
                </div>
            </div>

            {(transaction.beneficiaryName || transaction.paymentId) && (
                <div className="transaction-details-card">
                    <h3>Related Information</h3>

                    <div className="transaction-details-grid">
                        {transaction.beneficiaryName && (
                            <div className="transaction-detail-item">
                                <span>Beneficiary</span>
                                <strong>{transaction.beneficiaryName}</strong>
                            </div>
                        )}

                        {transaction.beneficiaryId && (
                            <div className="transaction-detail-item">
                                <span>Beneficiary ID</span>
                                <strong>{transaction.beneficiaryId}</strong>
                            </div>
                        )}

                        {transaction.paymentId && (
                            <div className="transaction-detail-item">
                                <span>Payment ID</span>
                                <strong>{transaction.paymentId}</strong>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default TransactionDetailsPage