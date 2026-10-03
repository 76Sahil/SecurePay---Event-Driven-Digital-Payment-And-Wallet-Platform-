
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import type { Wallet } from '../types'
import type { Transaction } from '../types/transaction'
import { getMyWallet } from '../services/walletService'
import { getTransactions } from '../services/transactionService'

function WalletPage() {
    const navigate = useNavigate()

    const [wallet, setWallet] = useState<Wallet | null>(null)
    const [transactions, setTransactions] = useState<Transaction[]>([])

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    async function loadWalletData() {
        try {
            setError(null)

            const [walletData, transactionData] = await Promise.all([
                getMyWallet(),
                getTransactions(),
            ])

            setWallet(walletData)
            setTransactions(transactionData)
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to load wallet information.',
            )
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        void loadWalletData()
    }, [])

    if (isLoading) {
        return (
            <section className="dashboard-state">
                <p>Loading your wallet...</p>
            </section>
        )
    }

    if (error && !wallet) {
        return (
            <section className="dashboard-state dashboard-state--error">
                <p>{error}</p>
            </section>
        )
    }

    if (!wallet) {
        return (
            <section className="dashboard-state">
                <p>No wallet information available.</p>
            </section>
        )
    }

    return (
        <section className="wallet-page">
            <header className="wallet-page__header">
                <div>
                    <p className="customer-dashboard__eyebrow">
                        Customer Portal
                    </p>

                    <h1>Wallet</h1>

                    <p className="wallet-page__description">
                        Manage your SecurePay wallet, transfer funds, and
                        monitor your transactions.
                    </p>
                </div>
            </header>

            <section className="wallet-balance-card">
                <div className="wallet-balance-card__content">
                    <p className="wallet-balance-card__label">
                        Available Balance
                    </p>

                    <h2>
                        {wallet.currency}{' '}
                        {wallet.balance.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}
                    </h2>

                    <p className="wallet-balance-card__status">
                        <span>●</span> {wallet.status}
                    </p>
                </div>
            </section>

            <section className="wallet-topup">
                <h2>Quick Actions</h2>

                <button
                    type="button"
                    onClick={() => navigate('/customer/add-money')}
                >
                    Add Money
                </button>

                <button
                    type="button"
                    onClick={() => navigate('/customer/send-money')}
                >
                    Send Money
                </button>
            </section>

            {error && (
                <div className="dashboard-state dashboard-state--error">
                    <p>{error}</p>
                </div>
            )}

            <section className="wallet-transactions">
                <h2>Transaction History</h2>

                {transactions.length === 0 ? (
                    <div className="dashboard-state">
                        <p>No transactions yet.</p>
                    </div>
                ) : (
                    <div className="wallet-transactions__list">
                        {transactions.map((transaction) => (
                            <article
                                className="wallet-transaction"
                                key={transaction.id}
                            >
                                <div>
                                    <h3>
                                        {transaction.description ||
                                            transaction.type}
                                    </h3>

                                    <p>
                                        {new Date(
                                            transaction.createdAt,
                                        ).toLocaleString('en-IN')}
                                    </p>

                                    <p>
                                        {transaction.type} · {transaction.status}
                                    </p>
                                </div>

                                <strong>
                                    {transaction.currency}{' '}
                                    {transaction.amount.toLocaleString(
                                        'en-IN',
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        },
                                    )}
                                </strong>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </section>
    )
}

export default WalletPage