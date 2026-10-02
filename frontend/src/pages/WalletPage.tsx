
import { useEffect, useState } from 'react'
import type { Wallet } from '../types'
import { getMyWallet } from '../services/walletService'

function WalletPage() {
    const [wallet, setWallet] = useState<Wallet | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadWallet() {
            try {
                setIsLoading(true)
                setError(null)

                const walletData = await getMyWallet()
                setWallet(walletData)
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Unable to load your wallet.',
                )
            } finally {
                setIsLoading(false)
            }
        }

        loadWallet()
    }, [])

    if (isLoading) {
        return (
            <section className="dashboard-state">
                <p>Loading your wallet...</p>
            </section>
        )
    }

    if (error) {
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
                        Manage your SecurePay wallet and
                        monitor your available balance.
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
        </section>
    )
}

export default WalletPage