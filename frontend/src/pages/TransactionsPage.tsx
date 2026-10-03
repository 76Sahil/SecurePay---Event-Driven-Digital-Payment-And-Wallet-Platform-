import { useEffect, useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router'
import type { Transaction } from '../types/transaction'
import { getTransactions } from '../services/transactionService'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'

function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filterType, setFilterType] = useState<string>('ALL')

    const loadTransactions = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const data = await getTransactions()
            setTransactions(data)
        } catch (err) {
            setError(
                err instanceof Error && err.message
                    ? err.message
                    : 'Unable to load transactions. Please try again.',
            )
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        void loadTransactions()
    }, [loadTransactions])

    const filteredTransactions = useMemo(() => {
        if (filterType === 'ALL') return transactions
        if (filterType === 'CREDIT') {
            return transactions.filter((t) =>
                ['TOP_UP', 'DEPOSIT', 'CREDIT', 'TRANSFER_IN'].includes(t.type),
            )
        }
        if (filterType === 'DEBIT') {
            return transactions.filter(
                (t) => !['TOP_UP', 'DEPOSIT', 'CREDIT', 'TRANSFER_IN'].includes(t.type),
            )
        }
        return transactions.filter((t) => t.type.toUpperCase() === filterType)
    }, [transactions, filterType])

    if (isLoading) {
        return (
            <section className="sp-page">
                <LoadingState message="Loading your transaction history..." />
            </section>
        )
    }

    if (error) {
        return (
            <section className="sp-page">
                <ErrorState
                    title="Could Not Load Transactions"
                    message={error}
                    onRetry={() => void loadTransactions()}
                />
            </section>
        )
    }

    return (
        <div className="sp-page transactions-view">
            <header className="sp-page-header">
                <div>
                    <span className="sp-badge sp-badge-neutral">History & Ledger</span>
                    <h1 className="sp-page-title">Transactions</h1>
                    <p className="sp-page-subtitle">
                        Complete ledger history of your digital payments, top-ups, and peer transfers.
                    </p>
                </div>
                <div className="sp-header-actions">
                    <Link to="/customer/add-money" className="sp-btn sp-btn-secondary sp-btn-sm">
                        + Top Up
                    </Link>
                    <Link to="/customer/send-money" className="sp-btn sp-btn-primary sp-btn-sm">
                        ↗ Send Money
                    </Link>
                </div>
            </header>

            {transactions.length === 0 ? (
                <div className="sp-card">
                    <EmptyState
                        icon="📑"
                        title="No transactions yet"
                        description="Your wallet history is currently empty. Make your first top-up or transfer to see it logged here."
                        actionText="+ Add Money"
                        actionTo="/customer/add-money"
                    />
                </div>
            ) : (
                <>
                    {/* Filters Toolbar */}
                    <div className="sp-toolbar">
                        <div className="sp-filter-tabs">
                            <button
                                type="button"
                                className={`sp-tab-btn ${filterType === 'ALL' ? 'active' : ''}`}
                                onClick={() => setFilterType('ALL')}
                            >
                                All ({transactions.length})
                            </button>
                            <button
                                type="button"
                                className={`sp-tab-btn ${filterType === 'CREDIT' ? 'active' : ''}`}
                                onClick={() => setFilterType('CREDIT')}
                            >
                                Credits / Top-Ups
                            </button>
                            <button
                                type="button"
                                className={`sp-tab-btn ${filterType === 'DEBIT' ? 'active' : ''}`}
                                onClick={() => setFilterType('DEBIT')}
                            >
                                Debits / Transfers
                            </button>
                        </div>
                    </div>

                    {filteredTransactions.length === 0 ? (
                        <div className="sp-card sp-card-p-sm">
                            <p className="sp-text-muted">No transactions match the selected filter.</p>
                        </div>
                    ) : (
                        <div className="sp-card sp-card-flush">
                            <div className="sp-table-wrapper">
                                <table className="sp-table">
                                    <thead>
                                        <tr>
                                            <th>Description</th>
                                            <th>Type</th>
                                            <th>Reference</th>
                                            <th>Date & Time</th>
                                            <th>Status</th>
                                            <th className="sp-text-right">Amount</th>
                                            <th className="sp-text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTransactions.map((tx) => {
                                            const isCredit = ['TOP_UP', 'DEPOSIT', 'CREDIT', 'TRANSFER_IN'].includes(tx.type)
                                            const formattedDate = new Date(tx.createdAt).toLocaleString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })

                                            return (
                                                <tr key={tx.id}>
                                                    <td>
                                                        <div className="sp-tx-cell-desc">
                                                            <span className={`sp-tx-icon-sm ${isCredit ? 'sp-tx-icon--credit' : 'sp-tx-icon--debit'}`}>
                                                                {isCredit ? '↓' : '↑'}
                                                            </span>
                                                            <strong>{tx.description || tx.type}</strong>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="sp-badge sp-badge-neutral">{tx.type}</span>
                                                    </td>
                                                    <td>
                                                        <code className="sp-code">{tx.reference}</code>
                                                    </td>
                                                    <td className="sp-text-muted">{formattedDate}</td>
                                                    <td>
                                                        <span className={`sp-badge sp-badge-${tx.status.toLowerCase() === 'success' ? 'success' : tx.status.toLowerCase() === 'pending' ? 'warning' : 'danger'}`}>
                                                            {tx.status}
                                                        </span>
                                                    </td>
                                                    <td className="sp-text-right">
                                                        <span className={`sp-tx-amount-table ${isCredit ? 'sp-tx-amount--credit' : 'sp-tx-amount--debit'}`}>
                                                            {isCredit ? '+' : '-'} {tx.currency}{' '}
                                                            {tx.amount.toLocaleString('en-IN', {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            })}
                                                        </span>
                                                    </td>
                                                    <td className="sp-text-right">
                                                        <Link
                                                            to={`/customer/transactions/${tx.id}`}
                                                            className="sp-btn sp-btn-ghost sp-btn-sm"
                                                        >
                                                            Receipt
                                                        </Link>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default TransactionsPage