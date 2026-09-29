import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import type { Transaction } from '../types/transaction'
import { getTransactions } from '../services/transactionService'

function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadTransactions() {
            try {
                setIsLoading(true)
                setError(null)

                const data = await getTransactions()
                setTransactions(data)
            } catch {
                setError('Unable to load transactions.')
            } finally {
                setIsLoading(false)
            }
        }

        void loadTransactions()
    }, [])

    const formatAmount = (transaction: Transaction) => {
        const sign = transaction.direction === 'CREDIT' ? '+' : '-'

        return `${sign} ₹${transaction.amount.toLocaleString('en-IN')}`
    }

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
    }

    const getStatusClass = (status: Transaction['status']) => {
        return `transaction-status transaction-status-${status.toLowerCase()}`
    }

    return (
        <div className="transactions-page">
            <div className="transactions-header">
                <div>
                    <h1>Transactions</h1>
                    <p>View and track all your wallet activity.</p>
                </div>
            </div>

            {isLoading && (
                <div className="transactions-card transactions-state">
                    <p>Loading transactions...</p>
                </div>
            )}

            {!isLoading && error && (
                <div className="transactions-card transactions-state transactions-error">
                    <p>{error}</p>
                </div>
            )}

            {!isLoading && !error && transactions.length === 0 && (
                <div className="transactions-card transactions-state">
                    <h3>No transactions yet</h3>
                    <p>Your wallet transactions will appear here.</p>
                </div>
            )}

            {!isLoading && !error && transactions.length > 0 && (
                <div className="transactions-card">
                    <div className="transactions-table-wrapper">
                        <table className="transactions-table">
                            <thead>
                            <tr>
                                <th>Transaction</th>
                                <th>Type</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th className="transaction-amount-header">
                                    Amount
                                </th>
                            </tr>
                            </thead>

                            <tbody>
                            {transactions.map((transaction) => (
                                <tr key={transaction.id}>
                                    <td>
                                        <td>
                                            <Link
                                                to={`/customer/transactions/${transaction.id}`}
                                                className="transaction-details-link"
                                            >
                                                <div className="transaction-info">
                                                    <div
                                                        className={`transaction-icon ${
                                                            transaction.direction === 'CREDIT'
                                                                ? 'transaction-icon-credit'
                                                                : 'transaction-icon-debit'
                                                        }`}
                                                    >
                                                        {transaction.direction === 'CREDIT' ? '↓' : '↑'}
                                                    </div>

                                                    <div>
                                                        <strong>{transaction.description}</strong>

                                                        <span>{transaction.reference}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </td>
                                    </td>

                                    <td>
                                            <span className="transaction-type">
                                                {transaction.type.replace(
                                                    '_',
                                                    ' ',
                                                )}
                                            </span>
                                    </td>

                                    <td>
                                            <span className="transaction-date">
                                                {formatDate(
                                                    transaction.createdAt,
                                                )}
                                            </span>
                                    </td>

                                    <td>
                                            <span
                                                className={getStatusClass(
                                                    transaction.status,
                                                )}
                                            >
                                                {transaction.status.replace(
                                                    '_',
                                                    ' ',
                                                )}
                                            </span>
                                    </td>

                                    <td
                                        className={`transaction-amount ${
                                            transaction.direction ===
                                            'CREDIT'
                                                ? 'transaction-amount-credit'
                                                : 'transaction-amount-debit'
                                        }`}
                                    >
                                        {formatAmount(transaction)}
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

export default TransactionsPage