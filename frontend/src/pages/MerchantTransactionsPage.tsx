import { useEffect, useState } from 'react'
import type {
    MerchantTransaction,
    MerchantTransactionStatus,
    MerchantTransactionType,
} from '../types/merchantTransaction'
import { getMerchantTransactions } from '../services/merchantTransactionService'

function MerchantTransactionsPage() {
    const [transactions, setTransactions] = useState<
        MerchantTransaction[]
    >([])

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadTransactions() {
            try {
                const result = await getMerchantTransactions()
                setTransactions(result)
            } catch {
                setError('Unable to load merchant transactions.')
            } finally {
                setIsLoading(false)
            }
        }

        void loadTransactions()
    }, [])

    function formatAmount(
        amount: number,
        currency: string,
    ) {
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

    function formatTransactionType(
        type: MerchantTransactionType,
    ) {
        return type.replace('_', ' ')
    }

    function getStatusClass(
        status: MerchantTransactionStatus,
    ) {
        return `transaction-status transaction-status--${status.toLowerCase()}`
    }

    if (isLoading) {
        return (
            <section className="page-section">
                <p className="page-state">
                    Loading transactions...
                </p>
            </section>
        )
    }

    if (error) {
        return (
            <section className="page-section">
                <div className="page-state page-state--error">
                    {error}
                </div>
            </section>
        )
    }

    if (transactions.length === 0) {
        return (
            <section className="page-section">
                <div className="page-section__header">
                    <div>
                        <p className="page-section__eyebrow">
                            MERCHANT PORTAL
                        </p>

                        <h1>Transactions</h1>

                        <p>
                            View all financial activity associated
                            with your merchant account.
                        </p>
                    </div>
                </div>

                <div className="page-state">
                    No transactions found.
                </div>
            </section>
        )
    }

    return (
        <section className="page-section">
            <div className="page-section__header">
                <div>
                    <p className="page-section__eyebrow">
                        MERCHANT PORTAL
                    </p>

                    <h1>Transactions</h1>

                    <p>
                        View all financial activity associated
                        with your merchant account.
                    </p>
                </div>
            </div>

            <div className="transactions-card">
                <div className="merchant-transactions-table-wrapper">
                    <table className="merchant-transactions-table">
                        <thead>
                        <tr>
                            <th>TRANSACTION</th>
                            <th>CUSTOMER</th>
                            <th>TYPE</th>
                            <th>DATE</th>
                            <th>STATUS</th>
                            <th>AMOUNT</th>
                        </tr>
                        </thead>

                        <tbody>
                        {transactions.map(
                            (transaction) => (
                                <tr
                                    key={transaction.id}
                                >
                                    <td>
                                        <div className="transaction-info">
                                            <div className="transaction-icon transaction-icon-credit">
                                                ₹
                                            </div>

                                            <div>
                                                <strong>
                                                    {
                                                        transaction.reference
                                                    }
                                                </strong>

                                                <span>
                                                        {
                                                            transaction.id
                                                        }
                                                    </span>
                                            </div>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="merchant-payment-customer">
                                            <strong>
                                                {
                                                    transaction.customerName
                                                }
                                            </strong>
                                        </div>
                                    </td>

                                    <td>
                                        {formatTransactionType(
                                            transaction.type,
                                        )}
                                    </td>

                                    <td>
                                        {formatDate(
                                            transaction.createdAt,
                                        )}
                                    </td>

                                    <td>
                                            <span
                                                className={getStatusClass(
                                                    transaction.status,
                                                )}
                                            >
                                                {
                                                    transaction.status
                                                }
                                            </span>
                                    </td>

                                    <td>
                                        <strong className="merchant-payment-amount">
                                            {formatAmount(
                                                transaction.amount,
                                                transaction.currency,
                                            )}
                                        </strong>
                                    </td>
                                </tr>
                            ),
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    )
}

export default MerchantTransactionsPage