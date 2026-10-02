
import { useEffect, useState } from 'react'
import type { Wallet } from '../types'
import type { Transaction } from '../types/transaction'
import { getMyWallet, topUpWallet } from '../services/walletService'
import { getTransactions } from '../services/transactionService'

function WalletPage() {
    const [wallet, setWallet] = useState<Wallet | null>(null)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [topUpAmount, setTopUpAmount] = useState('1000')
    const [isLoading, setIsLoading] = useState(true)
    const [isTopUpLoading, setIsTopUpLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [topUpMessage, setTopUpMessage] = useState<string | null>(null)
    const [topUpError, setTopUpError] = useState<string | null>(null)

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

    async function handleTopUp() {
        const amount = Number(topUpAmount)

        if (
            !Number.isFinite(amount) ||
            amount < 1 ||
            amount > 100000 ||
            Math.round(amount * 100) !== amount * 100
        ) {
            setTopUpError(
                'Enter an amount between INR 1 and INR 100000, with up to 2 decimal places.',
            )
            setTopUpMessage(null)
            return
        }

        try {
            setIsTopUpLoading(true)
            setTopUpError(null)
            setTopUpMessage(null)

            await topUpWallet(amount)
            await loadWalletData()

            setTopUpMessage('Demo top-up completed successfully!')
        } catch (err) {
            setTopUpError(
                err instanceof Error ? err.message : 'Top-up failed.',
            )
        } finally {
            setIsTopUpLoading(false)
        }
    }

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
                        Manage your SecurePay wallet and monitor your balance.
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
                <h2>Add Demo Funds</h2>
                <p>
                    Simulated top-up for project demonstration only.
                    This does not transfer real money.
                </p>

                <input
                    type="number"
                    min="1"
                    max="100000"
                    step="0.01"
                    value={topUpAmount}
                    onChange={(event) => setTopUpAmount(event.target.value)}
                    placeholder="Enter amount in INR"
                    disabled={isTopUpLoading}
                />

                <button
                    type="button"
                    onClick={handleTopUp}
                    disabled={isTopUpLoading}
                >
                    {isTopUpLoading ? 'Processing...' : 'Add Funds'}
                </button>

                {topUpMessage && <p role="status">{topUpMessage}</p>}
                {topUpError && <p role="alert">{topUpError}</p>}
            </section>

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