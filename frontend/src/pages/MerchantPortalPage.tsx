
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { apiRequest } from '../services/api'

type Wallet = {
    walletId: number
    balance: number
    createdAt: string
}

type Transaction = {
    id: number
    type: string
    status: string
    amount: number
    createdAt: string
}

function MerchantPortalPage() {
    const { user, accessToken, logout } = useAuth()

    const [wallet, setWallet] = useState<Wallet | null>(null)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const loadDashboard = useCallback(async () => {
        if (!accessToken) {
            setError('Authentication required. Please sign in again.')
            setLoading(false)
            return
        }

        setLoading(true)
        setError('')

        try {
            const [walletData, transactionData] = await Promise.all([
                apiRequest<Wallet>(
                    '/wallet/me',
                    {},
                    accessToken
                ),
                apiRequest<Transaction[]>(
                    '/transactions/me',
                    {},
                    accessToken
                ),
            ])

            setWallet(walletData)
            setTransactions(transactionData)
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to load merchant dashboard.'
            )
        } finally {
            setLoading(false)
        }
    }, [accessToken])

    useEffect(() => {
        void loadDashboard()
    }, [loadDashboard])

    const formatAmount = (amount: number) =>
        new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount)

    return (
        <main style={{ maxWidth: 1100, margin: '40px auto', padding: 24 }}>
            <header
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 16,
                }}
            >
                <div>
                    <h1>Merchant Portal</h1>
                    <p>Welcome, {user?.fullName ?? 'Merchant'}</p>
                    <p>{user?.email}</p>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={() => void loadDashboard()}>
                        Refresh
                    </button>
                    <button onClick={logout}>Logout</button>
                </div>
            </header>

            <hr />

            {loading ? (
                <p>Loading merchant dashboard...</p>
            ) : error ? (
                <section>
                    <p role="alert">{error}</p>
                    <button onClick={() => void loadDashboard()}>
                        Try Again
                    </button>
                </section>
            ) : (
                <>
                    <section
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: 16,
                            margin: '24px 0',
                        }}
                    >
                        <article
                            style={{
                                border: '1px solid #ddd',
                                borderRadius: 10,
                                padding: 20,
                            }}
                        >
                            <h3>Wallet Balance</h3>
                            <h2>
                                {formatAmount(wallet?.balance ?? 0)}
                            </h2>
                        </article>

                        <article
                            style={{
                                border: '1px solid #ddd',
                                borderRadius: 10,
                                padding: 20,
                            }}
                        >
                            <h3>Wallet ID</h3>
                            <h2>{wallet?.walletId ?? '—'}</h2>
                        </article>

                        <article
                            style={{
                                border: '1px solid #ddd',
                                borderRadius: 10,
                                padding: 20,
                            }}
                        >
                            <h3>Total Transactions</h3>
                            <h2>{transactions.length}</h2>
                        </article>
                    </section>

                    <section>
                        <h2>Recent Transactions</h2>

                        {transactions.length === 0 ? (
                            <p>No transactions found yet.</p>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table
                                    style={{
                                        width: '100%',
                                        borderCollapse: 'collapse',
                                    }}
                                >
                                    <thead>
                                    <tr>
                                        <th style={{ padding: 12, textAlign: 'left' }}>ID</th>
                                        <th style={{ padding: 12, textAlign: 'left' }}>Type</th>
                                        <th style={{ padding: 12, textAlign: 'left' }}>Amount</th>
                                        <th style={{ padding: 12, textAlign: 'left' }}>Status</th>
                                        <th style={{ padding: 12, textAlign: 'left' }}>Date</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {transactions.map((transaction) => (
                                        <tr key={transaction.id}>
                                            <td style={{ padding: 12 }}>
                                                {transaction.id}
                                            </td>
                                            <td style={{ padding: 12 }}>
                                                {transaction.type}
                                            </td>
                                            <td style={{ padding: 12 }}>
                                                {formatAmount(transaction.amount)}
                                            </td>
                                            <td style={{ padding: 12 }}>
                                                {transaction.status}
                                            </td>
                                            <td style={{ padding: 12 }}>
                                                {new Date(
                                                    transaction.createdAt
                                                ).toLocaleString('en-IN')}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </>
            )}
        </main>
    )
}

export default MerchantPortalPage