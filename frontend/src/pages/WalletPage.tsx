import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router'
import type { Wallet } from '../types'
import type { Transaction } from '../types/transaction'
import { getMyWallet } from '../services/walletService'
import { getTransactions } from '../services/transactionService'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'

function WalletPage() {
    const [wallet, setWallet] = useState<Wallet | null>(null)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadWalletData = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const [walletData, transactionData] = await Promise.all([
                getMyWallet(),
                getTransactions(),
            ])
            setWallet(walletData)
            setTransactions(transactionData)
        } catch (err) {
            setError(
                err instanceof Error && err.message
                    ? err.message
                    : 'Unable to load wallet information. Please try again.',
            )
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        void loadWalletData()
    }, [loadWalletData])

    if (isLoading) {
        return (
            <section className="sp-page">
                <LoadingState message="Loading your wallet and balance..." />
            </section>
        )
    }

    if (error || !wallet) {
        return (
            <section className="sp-page">
                <ErrorState
                    title="Wallet Unavailable"
                    message={error ?? 'Could not retrieve your wallet.'}
                    onRetry={() => void loadWalletData()}
                />
            </section>
        )
    }

    return (
        <div className="sp-page wallet-view">
            <header className="sp-page-header">
                <div>
                    <span className="sp-badge sp-badge-neutral">Digital Wallet</span>
                    <h1 className="sp-page-title">Wallet & Balances</h1>
                    <p className="sp-page-subtitle">
                        Manage your funds, add money via gateway, and review your ledger balance.
                    </p>
                </div>
                <div className="sp-header-actions">
                    <Link to="/customer/add-money" className="sp-btn sp-btn-primary">
                        + Add Money
                    </Link>
                    <Link to="/customer/send-money" className="sp-btn sp-btn-secondary">
                        ↗ Send Money
                    </Link>
                </div>
            </header>

            {/* Primary Balance Section */}
            <section className="sp-balance-hero">
                <div className="sp-balance-hero__top">
                    <div>
                        <span className="sp-balance-hero__label">Active Available Balance</span>
                        <div className="sp-balance-hero__amount">
                            <span className="sp-balance-hero__currency">{wallet.currency}</span>
                            <span className="sp-balance-hero__value">
                                {wallet.balance.toLocaleString('en-IN', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </span>
                        </div>
                    </div>
                    <div className="sp-balance-hero__badge-group">
                        <span className={`sp-badge sp-badge-${wallet.status.toLowerCase() === 'active' ? 'success' : 'warning'}`}>
                            ● {wallet.status}
                        </span>
                        <span className="sp-balance-hero__id">
                            Wallet ID: #{wallet.id}
                        </span>
                    </div>
                </div>

                <div className="sp-balance-hero__actions">
                    <Link to="/customer/add-money" className="sp-btn sp-btn-primary">
                        + Add Money
                    </Link>
                    <Link to="/customer/send-money" className="sp-btn sp-btn-secondary">
                        ↗ Send Money
                    </Link>
                </div>
            </section>

            {/* Wallet Quick Stats */}
            <div className="sp-stats-grid">
                <div className="sp-card sp-stat-card">
                    <span className="sp-stat-label">Currency</span>
                    <strong className="sp-stat-value">{wallet.currency} (Indian Rupee)</strong>
                    <span className="sp-stat-sub">Settlement in INR</span>
                </div>
                <div className="sp-card sp-stat-card">
                    <span className="sp-stat-label">Wallet Status</span>
                    <strong className="sp-stat-value sp-text-success">{wallet.status}</strong>
                    <span className="sp-stat-sub">Verified & Unlocked</span>
                </div>
                <div className="sp-card sp-stat-card">
                    <span className="sp-stat-label">Transactions Recorded</span>
                    <strong className="sp-stat-value">{transactions.length}</strong>
                    <span className="sp-stat-sub">Double-entry ledger audited</span>
                </div>
            </div>

            {/* Transaction History Section */}
            <section className="sp-section">
                <div className="sp-section-header-row">
                    <div>
                        <h2 className="sp-section-title">Wallet Activity</h2>
                        <p className="sp-section-subtitle">
                            Every transaction is recorded with double-entry idempotency
                        </p>
                    </div>
                    {transactions.length > 0 && (
                        <Link to="/customer/transactions" className="sp-link">
                            View All Transactions →
                        </Link>
                    )}
                </div>

                <div className="sp-card">
                    {transactions.length === 0 ? (
                        <EmptyState
                            icon="💳"
                            title="No transactions yet"
                            description="You have no recorded wallet transactions. Top up your balance to start sending money."
                            actionText="+ Add Money"
                            actionTo="/customer/add-money"
                        />
                    ) : (
                        <div className="sp-tx-list">
                            {transactions.map((tx) => {
                                const isCredit = ['TOP_UP', 'DEPOSIT', 'CREDIT', 'TRANSFER_IN'].includes(tx.type)
                                const formattedDate = new Date(tx.createdAt).toLocaleString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })

                                return (
                                    <div key={tx.id} className="sp-tx-item">
                                        <div className="sp-tx-item__left">
                                            <div className={`sp-tx-icon ${isCredit ? 'sp-tx-icon--credit' : 'sp-tx-icon--debit'}`}>
                                                {isCredit ? '↓' : '↑'}
                                            </div>
                                            <div>
                                                <p className="sp-tx-desc">{tx.description || tx.type}</p>
                                                <div className="sp-tx-meta">
                                                    <span>{formattedDate}</span>
                                                    <span>•</span>
                                                    <span className="sp-tx-ref">{tx.reference}</span>
                                                    <span>•</span>
                                                    <span>{tx.type}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="sp-tx-item__right">
                                            <span className={`sp-tx-amount ${isCredit ? 'sp-tx-amount--credit' : 'sp-tx-amount--debit'}`}>
                                                {isCredit ? '+' : '-'} {tx.currency}{' '}
                                                {tx.amount.toLocaleString('en-IN', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </span>
                                            <span className={`sp-badge sp-badge-${tx.status.toLowerCase() === 'success' ? 'success' : tx.status.toLowerCase() === 'pending' ? 'warning' : 'danger'}`}>
                                                {tx.status}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}

export default WalletPage