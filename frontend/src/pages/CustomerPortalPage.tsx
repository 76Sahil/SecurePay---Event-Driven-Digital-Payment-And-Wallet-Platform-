
import { useCallback, useContext, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { AuthContext } from '../context/AuthContext'
import { apiRequest } from '../services/api'

type WalletResponse = {
    walletId: number
    userId: number
    balance: number
    createdAt: string
}

type TransactionResponse = {
    id: number
    type: 'TOP_UP' | 'TRANSFER_IN' | 'TRANSFER_OUT'
    status: 'PENDING' | 'SUCCESS' | 'FAILED'
    amount: number
    createdAt: string
}

type TransferResponse = {
    message: string
}

function formatAmount(amount: number) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
    }).format(amount)
}

function formatDate(date: string) {
    return new Date(date).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
    })
}

function CustomerPortalPage() {
    const auth = useContext(AuthContext)
    const accessToken = auth?.accessToken ?? null

    const [wallet, setWallet] = useState<WalletResponse | null>(null)
    const [transactions, setTransactions] = useState<TransactionResponse[]>([])

    const [amount, setAmount] = useState('')
    const [recipientEmail, setRecipientEmail] = useState('')
    const [transferAmount, setTransferAmount] = useState('')

    const [isLoading, setIsLoading] = useState(true)
    const [isAddingMoney, setIsAddingMoney] = useState(false)
    const [isTransferring, setIsTransferring] = useState(false)

    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [refreshKey, setRefreshKey] = useState(0)

    const loadDashboard = useCallback(async () => {
        if (!accessToken) {
            setError('Your session is unavailable. Please sign in again.')
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const [walletData, transactionData] = await Promise.all([
                apiRequest<WalletResponse>(
                    '/wallet/me',
                    {},
                    accessToken,
                ),
                apiRequest<TransactionResponse[]>(
                    '/transactions/me',
                    {},
                    accessToken,
                ),
            ])

            setWallet(walletData)
            setTransactions(transactionData)
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to load your wallet. Please try again.',
            )
        } finally {
            setIsLoading(false)
        }
    }, [accessToken])

    useEffect(() => {
        void loadDashboard()
    }, [loadDashboard, refreshKey])

    async function handleAddMoney(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError('')
        setSuccess('')

        const parsedAmount = Number(amount)

        if (
            !Number.isFinite(parsedAmount) ||
            parsedAmount <= 0 ||
            Math.round(parsedAmount * 100) !== parsedAmount * 100
        ) {
            setError(
                'Enter a valid amount greater than zero, with at most two decimal places.',
            )
            return
        }

        if (!accessToken) {
            setError('Your session is unavailable. Please sign in again.')
            return
        }

        setIsAddingMoney(true)

        try {
            await apiRequest<WalletResponse>(
                '/wallet/add-money',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        amount: parsedAmount,
                    }),
                },
                accessToken,
            )

            setAmount('')
            setSuccess('Money added successfully.')
            setRefreshKey((current) => current + 1)
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to add money. Please try again.',
            )
        } finally {
            setIsAddingMoney(false)
        }
    }

    async function handleTransfer(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError('')
        setSuccess('')

        const normalizedEmail = recipientEmail.trim()
        const parsedAmount = Number(transferAmount)

        if (
            !normalizedEmail ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
        ) {
            setError('Please enter a valid recipient email address.')
            return
        }

        if (
            !Number.isFinite(parsedAmount) ||
            parsedAmount <= 0 ||
            Math.round(parsedAmount * 100) !== parsedAmount * 100
        ) {
            setError(
                'Enter a valid transfer amount greater than zero, with at most two decimal places.',
            )
            return
        }

        if (
            auth?.user?.email &&
            normalizedEmail.toLowerCase() === auth.user.email.toLowerCase()
        ) {
            setError('You cannot transfer money to your own account.')
            return
        }

        if (!accessToken) {
            setError('Your session is unavailable. Please sign in again.')
            return
        }

        setIsTransferring(true)

        try {
            const response = await apiRequest<TransferResponse>(
                '/transactions/transfer',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        recipientEmail: normalizedEmail,
                        amount: parsedAmount,
                    }),
                },
                accessToken,
            )

            setRecipientEmail('')
            setTransferAmount('')
            setSuccess(response.message || 'Transfer completed successfully.')
            setRefreshKey((current) => current + 1)
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Transfer failed. Please check the recipient and balance.',
            )
        } finally {
            setIsTransferring(false)
        }
    }

    return (
        <section>
            <h1>Customer Portal</h1>
            <p>Welcome to your SecurePay wallet.</p>

            {error && (
                <p role="alert" className="form-error">
                    {error}
                </p>
            )}

            {success && (
                <p role="status" className="form-success">
                    {success}
                </p>
            )}

            <section aria-labelledby="wallet-heading">
                <h2 id="wallet-heading">My Wallet</h2>

                {isLoading ? (
                    <p>Loading wallet...</p>
                ) : wallet ? (
                    <div>
                        <p>
                            <strong>Available balance:</strong>{' '}
                            {formatAmount(wallet.balance)}
                        </p>
                        <p>
                            <strong>Wallet ID:</strong> {wallet.walletId}
                        </p>
                        <p>
                            <strong>Created:</strong>{' '}
                            {formatDate(wallet.createdAt)}
                        </p>
                    </div>
                ) : (
                    <p>Wallet details are unavailable.</p>
                )}
            </section>

            <hr />

            <section aria-labelledby="add-money-heading">
                <h2 id="add-money-heading">Add Money</h2>
                <p>
                    Add demo funds to your SecurePay wallet for testing.
                    This is not a real payment.
                </p>

                <form onSubmit={handleAddMoney}>
                    <div className="form-field">
                        <label htmlFor="amount">Amount (INR)</label>
                        <input
                            id="amount"
                            name="amount"
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="Enter amount"
                            value={amount}
                            onChange={(event) => setAmount(event.target.value)}
                            required
                            disabled={isAddingMoney}
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={isAddingMoney || !accessToken}
                    >
                        {isAddingMoney ? 'Adding money...' : 'Add Money'}
                    </button>
                </form>
            </section>

            <hr />

            <section aria-labelledby="transfer-heading">
                <h2 id="transfer-heading">Send Money</h2>
                <p>
                    Transfer demo wallet funds to another registered SecurePay user.
                </p>

                <form onSubmit={handleTransfer}>
                    <div className="form-field">
                        <label htmlFor="recipientEmail">
                            Recipient email
                        </label>
                        <input
                            id="recipientEmail"
                            name="recipientEmail"
                            type="email"
                            placeholder="recipient@example.com"
                            value={recipientEmail}
                            onChange={(event) =>
                                setRecipientEmail(event.target.value)
                            }
                            autoComplete="email"
                            required
                            disabled={isTransferring}
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="transferAmount">
                            Transfer amount (INR)
                        </label>
                        <input
                            id="transferAmount"
                            name="transferAmount"
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="Enter amount"
                            value={transferAmount}
                            onChange={(event) =>
                                setTransferAmount(event.target.value)
                            }
                            required
                            disabled={isTransferring}
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={isTransferring || !accessToken}
                    >
                        {isTransferring ? 'Transferring...' : 'Send Money'}
                    </button>
                </form>
            </section>

            <hr />

            <section aria-labelledby="transactions-heading">
                <h2 id="transactions-heading">Transaction History</h2>

                {isLoading ? (
                    <p>Loading transactions...</p>
                ) : transactions.length === 0 ? (
                    <p>No transactions yet.</p>
                ) : (
                    <table>
                        <thead>
                        <tr>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                        </thead>
                        <tbody>
                        {transactions.map((transaction) => (
                            <tr key={transaction.id}>
                                <td>
                                    {transaction.type.replaceAll('_', ' ')}
                                </td>
                                <td>{formatAmount(transaction.amount)}</td>
                                <td>{transaction.status}</td>
                                <td>{formatDate(transaction.createdAt)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </section>

            <button
                type="button"
                onClick={() => setRefreshKey((current) => current + 1)}
                disabled={isLoading}
            >
                Refresh Wallet & Transactions
            </button>
        </section>
    )
}

export default CustomerPortalPage