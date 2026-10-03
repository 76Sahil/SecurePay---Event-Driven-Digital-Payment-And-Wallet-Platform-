import { useEffect, useState, useCallback } from 'react'
import type { ChangeEvent } from 'react'
import { Link } from 'react-router'
import type { Beneficiary } from '../types/beneficiary'
import type { TransferInitiationResponse } from '../types/transfer'
import type { Wallet } from '../types'
import { getBeneficiaries } from '../services/beneficiaryService'
import { getMyWallet } from '../services/walletService'
import { initiateTransfer } from '../services/transferService'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'

function SendMoneyPage() {
    const [wallet, setWallet] = useState<Wallet | null>(null)
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
    const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState('')
    const [amount, setAmount] = useState('')

    const [isLoading, setIsLoading] = useState(true)
    const [isInitiatingTransfer, setIsInitiatingTransfer] = useState(false)

    const [error, setError] = useState<string | null>(null)
    const [amountError, setAmountError] = useState<string | null>(null)
    const [showReview, setShowReview] = useState(false)

    const [transferResult, setTransferResult] =
        useState<TransferInitiationResponse | null>(null)

    const loadData = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)

            const [walletData, beneficiariesData] = await Promise.all([
                getMyWallet(),
                getBeneficiaries(),
            ])

            setWallet(walletData)
            setBeneficiaries(beneficiariesData)

            const firstActive = beneficiariesData.find(
                (b) => b.status === 'ACTIVE',
            )
            if (firstActive) {
                setSelectedBeneficiaryId(firstActive.id)
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to load transfer details. Please try again.',
            )
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        void loadData()
    }, [loadData])

    const selectedBeneficiary = beneficiaries.find(
        (b) => b.id === selectedBeneficiaryId,
    )

    const numericAmount = Number(amount)
    const availableBalance = wallet?.balance ?? 0

    function handleBeneficiaryChange(event: ChangeEvent<HTMLSelectElement>) {
        setSelectedBeneficiaryId(event.target.value)
        setError(null)
        setAmountError(null)
        setShowReview(false)
        setTransferResult(null)
    }

    function handleAmountChange(event: ChangeEvent<HTMLInputElement>) {
        setAmount(event.target.value)
        setAmountError(null)
        setError(null)
        setShowReview(false)
        setTransferResult(null)
    }

    function validateForm(): boolean {
        if (!selectedBeneficiary) {
            setError('Please select a registered beneficiary.')
            return false
        }

        if (selectedBeneficiary.status !== 'ACTIVE') {
            setError('The selected beneficiary is not active.')
            return false
        }

        if (!selectedBeneficiary.recipientEmail) {
            setError(
                'This beneficiary does not have a registered email on file.',
            )
            return false
        }

        if (!amount.trim()) {
            setAmountError('Please enter a transfer amount.')
            return false
        }

        if (!Number.isFinite(numericAmount) || isNaN(numericAmount)) {
            setAmountError('Please enter a valid numeric amount.')
            return false
        }

        if (numericAmount < 1) {
            setAmountError('Minimum transfer amount is ₹1.00.')
            return false
        }

        if (numericAmount > 100000) {
            setAmountError('Maximum transfer amount is ₹1,00,000 per transaction.')
            return false
        }

        if (!/^\d+(\.\d{1,2})?$/.test(amount.trim())) {
            setAmountError('Amount can have at most 2 decimal places.')
            return false
        }

        if (numericAmount > availableBalance) {
            setAmountError(
                `Insufficient balance. You currently have ₹${availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })} available.`,
            )
            return false
        }

        return true
    }

    function handleReviewTransfer() {
        setError(null)
        setAmountError(null)
        setTransferResult(null)

        if (!validateForm()) {
            return
        }

        setShowReview(true)
    }

    async function handleConfirmTransfer() {
        setError(null)

        if (!validateForm() || !selectedBeneficiary) {
            setShowReview(false)
            return
        }

        try {
            setIsInitiatingTransfer(true)

            const response = await initiateTransfer({
                recipientEmail: selectedBeneficiary.recipientEmail
                    .trim()
                    .toLowerCase(),
                amount: numericAmount,
            })

            setTransferResult(response)
            setShowReview(false)

            // Update wallet balance if returned from backend
            if (response.senderBalance !== undefined && wallet) {
                setWallet({
                    ...wallet,
                    balance: response.senderBalance,
                })
            }
        } catch (err: unknown) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Transfer failed. Please try again.',
            )
            setShowReview(false)
        } finally {
            setIsInitiatingTransfer(false)
        }
    }

    function handleNewTransfer() {
        setAmount('')
        setAmountError(null)
        setError(null)
        setShowReview(false)
        setTransferResult(null)
    }

    if (isLoading) {
        return (
            <div className="sp-page">
                <LoadingState message="Loading your transfer details..." />
            </div>
        )
    }

    if (error && !wallet) {
        return (
            <div className="sp-page">
                <ErrorState
                    title="Unable to load transfer"
                    message={error}
                    onRetry={() => void loadData()}
                />
            </div>
        )
    }

    const activeBeneficiaries = beneficiaries.filter((b) => b.status === 'ACTIVE')

    return (
        <div className="sp-page send-money-page">
            <header className="sp-page-header">
                <div>
                    <span className="sp-badge sp-badge-neutral">Customer Portal</span>
                    <h1 className="sp-page-title">Send Money</h1>
                    <p className="sp-page-subtitle">
                        Transfer funds instantly to registered SecurePay beneficiaries with verified idempotency protection.
                    </p>
                </div>
                <div className="sp-header-actions">
                    <Link to="/customer/beneficiaries" className="sp-btn sp-btn-secondary sp-btn-sm">
                        👥 Manage Beneficiaries
                    </Link>
                </div>
            </header>

            {/* Success Result View */}
            {transferResult && (
                <section className="sp-card sp-transfer-result">
                    <div className="sp-transfer-result__icon">✓</div>
                    <h2 className="sp-transfer-result__title">
                        {transferResult.status === 'SUCCESS' ? 'Transfer Completed Successfully' : `Transfer ${transferResult.status}`}
                    </h2>
                    <p className="sp-transfer-result__message">
                        {transferResult.message || 'Your transfer request was processed successfully.'}
                    </p>

                    <div className="sp-transfer-result__amount-box">
                        <span className="sp-transfer-result__label">Amount Sent</span>
                        <span className="sp-transfer-result__amount">
                            ₹{numericAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>

                    <div className="sp-transfer-summary-list">
                        <div className="sp-transfer-summary-row">
                            <span>Recipient Name</span>
                            <strong>{selectedBeneficiary?.name || 'SecurePay Recipient'}</strong>
                        </div>
                        <div className="sp-transfer-summary-row">
                            <span>Recipient Email</span>
                            <strong>{selectedBeneficiary?.recipientEmail || transferResult.recipientEmail}</strong>
                        </div>
                        <div className="sp-transfer-summary-row">
                            <span>Bank / Account</span>
                            <strong>{selectedBeneficiary?.bankName} ({selectedBeneficiary?.accountIdentifier})</strong>
                        </div>
                        <div className="sp-transfer-summary-row">
                            <span>Reference / TXN ID</span>
                            <strong>{transferResult.reference || `TXN-${transferResult.transactionId}`}</strong>
                        </div>
                        {transferResult.senderBalance !== undefined && (
                            <div className="sp-transfer-summary-row">
                                <span>Remaining Wallet Balance</span>
                                <strong style={{ color: '#107e3e' }}>
                                    ₹{Number(transferResult.senderBalance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </strong>
                            </div>
                        )}
                    </div>

                    <div className="sp-transfer-result__actions">
                        <button
                            type="button"
                            className="sp-btn sp-btn-primary"
                            onClick={handleNewTransfer}
                        >
                            Make Another Transfer
                        </button>
                        <Link to="/customer/transactions" className="sp-btn sp-btn-secondary">
                            View Transaction History
                        </Link>
                    </div>
                </section>
            )}

            {/* Review Step Modal / Card */}
            {showReview && !transferResult && selectedBeneficiary && (
                <section className="sp-card sp-transfer-review">
                    <div className="sp-card-header">
                        <div>
                            <span className="sp-badge sp-badge-neutral">Step 2 of 2</span>
                            <h2 className="sp-card-title">Review Transfer Details</h2>
                            <p className="sp-card-subtitle">
                                Confirm the recipient and amount before finalizing the transfer.
                            </p>
                        </div>
                    </div>

                    <div className="sp-transfer-summary-list" style={{ marginTop: '20px' }}>
                        <div className="sp-transfer-summary-row">
                            <span>Recipient</span>
                            <strong>{selectedBeneficiary.name}</strong>
                        </div>
                        <div className="sp-transfer-summary-row">
                            <span>Bank Name</span>
                            <strong>{selectedBeneficiary.bankName}</strong>
                        </div>
                        <div className="sp-transfer-summary-row">
                            <span>Account Identifier</span>
                            <strong>{selectedBeneficiary.accountIdentifier}</strong>
                        </div>
                        <div className="sp-transfer-summary-row">
                            <span>Registered Email</span>
                            <strong>{selectedBeneficiary.recipientEmail}</strong>
                        </div>
                        <div className="sp-transfer-summary-row">
                            <span>Transfer Amount</span>
                            <strong style={{ fontSize: '18px', color: '#142d5a' }}>
                                ₹{numericAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </strong>
                        </div>
                        <div className="sp-transfer-summary-row">
                            <span>Current Available Balance</span>
                            <strong>₹{availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                        </div>
                        <div className="sp-transfer-summary-row">
                            <span>Balance After Transfer</span>
                            <strong style={{ color: '#357ae8' }}>
                                ₹{(availableBalance - numericAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </strong>
                        </div>
                    </div>

                    <div className="sp-alert sp-alert-info" style={{ marginTop: '20px' }}>
                        ℹ Double-entry ledger settlement will execute atomically. This transaction is protected with a unique idempotency key.
                    </div>

                    {error && (
                        <div className="sp-alert sp-alert-error" style={{ marginTop: '16px' }} role="alert">
                            {error}
                        </div>
                    )}

                    <div className="sp-transfer-actions" style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            className="sp-btn sp-btn-secondary"
                            onClick={() => setShowReview(false)}
                            disabled={isInitiatingTransfer}
                        >
                            ← Edit Details
                        </button>
                        <button
                            type="button"
                            className="sp-btn sp-btn-primary"
                            onClick={handleConfirmTransfer}
                            disabled={isInitiatingTransfer}
                        >
                            {isInitiatingTransfer ? 'Processing Transfer...' : '✓ Confirm & Send ₹' + numericAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </button>
                    </div>
                </section>
            )}

            {/* Transfer Input Form */}
            {!showReview && !transferResult && (
                <div className="sp-grid-2col" style={{ alignItems: 'start' }}>
                    <section className="sp-card">
                        <div className="sp-card-header">
                            <div>
                                <h2 className="sp-card-title">Transfer Funds</h2>
                                <p className="sp-card-subtitle">
                                    Send money to your registered SecurePay beneficiaries.
                                </p>
                            </div>
                        </div>

                        {error && (
                            <div className="sp-alert sp-alert-error" role="alert" style={{ marginTop: '16px' }}>
                                {error}
                            </div>
                        )}

                        {activeBeneficiaries.length === 0 ? (
                            <div style={{ marginTop: '20px' }}>
                                <EmptyState
                                    title="No Active Beneficiaries"
                                    description="You must add and activate at least one beneficiary to send money."
                                    actionText="+ Add Beneficiary"
                                    actionTo="/customer/beneficiaries"
                                />
                            </div>
                        ) : (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    handleReviewTransfer()
                                }}
                                style={{ marginTop: '20px' }}
                                noValidate
                            >
                                <div className="sp-form-group">
                                    <label htmlFor="beneficiary-select" className="sp-form-label">
                                        Select Beneficiary <span style={{ color: '#d93025' }}>*</span>
                                    </label>
                                    <select
                                        id="beneficiary-select"
                                        value={selectedBeneficiaryId}
                                        onChange={handleBeneficiaryChange}
                                        className="sp-form-select"
                                        disabled={isInitiatingTransfer}
                                    >
                                        <option value="">-- Choose a recipient --</option>
                                        {activeBeneficiaries.map((b) => (
                                            <option key={b.id} value={b.id}>
                                                {b.name} — {b.bankName} ({b.accountIdentifier})
                                            </option>
                                        ))}
                                    </select>
                                    {selectedBeneficiary && (
                                        <div className="sp-form-hint" style={{ marginTop: '6px' }}>
                                            Recipient email: <strong>{selectedBeneficiary.recipientEmail}</strong>
                                        </div>
                                    )}
                                </div>

                                <div className="sp-form-group" style={{ marginTop: '20px' }}>
                                    <label htmlFor="transfer-amount" className="sp-form-label">
                                        Transfer Amount (INR) <span style={{ color: '#d93025' }}>*</span>
                                    </label>
                                    <div className="sp-input-group">
                                        <span className="sp-input-prefix">₹</span>
                                        <input
                                            id="transfer-amount"
                                            type="number"
                                            step="0.01"
                                            min="1"
                                            max="100000"
                                            value={amount}
                                            onChange={handleAmountChange}
                                            placeholder="0.00"
                                            className="sp-form-input sp-input-with-prefix"
                                            disabled={isInitiatingTransfer}
                                        />
                                    </div>
                                    <div className="sp-form-hint" style={{ marginTop: '6px' }}>
                                        Minimum ₹1.00 • Maximum ₹1,00,000.00 per transfer
                                    </div>
                                    {amountError && (
                                        <p className="sp-form-error" role="alert">
                                            {amountError}
                                        </p>
                                    )}
                                </div>

                                <div className="sp-form-actions" style={{ marginTop: '28px' }}>
                                    <button
                                        type="submit"
                                        className="sp-btn sp-btn-primary sp-btn-full"
                                        disabled={isInitiatingTransfer || !selectedBeneficiaryId || !amount}
                                    >
                                        Review Transfer →
                                    </button>
                                </div>
                            </form>
                        )}
                    </section>

                    {/* Balance & Security Guidance Sidecard */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="sp-card sp-balance-summary-card">
                            <span className="sp-balance-summary-card__label">Available to Send</span>
                            <div className="sp-balance-summary-card__amount">
                                <span className="sp-balance-summary-card__currency">{wallet?.currency || 'INR'}</span>
                                <span className="sp-balance-summary-card__value">
                                    {availableBalance.toLocaleString('en-IN', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </span>
                            </div>
                            <div className="sp-balance-summary-card__footer">
                                <Link to="/customer/add-money" className="sp-btn sp-btn-secondary sp-btn-sm">
                                    + Add Money to Wallet
                                </Link>
                            </div>
                        </div>

                        <div className="sp-card">
                            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#142d5a', margin: '0 0 10px' }}>
                                🛡 Transfer Security Guarantee
                            </h3>
                            <ul style={{ margin: 0, paddingLeft: '18px', color: '#556885', fontSize: '13px', lineHeight: '1.6' }}>
                                <li><strong>Idempotent:</strong> Duplicate submissions are automatically rejected.</li>
                                <li><strong>Atomic:</strong> Double-entry debit and credit occur together or abort.</li>
                                <li><strong>Risk Scored:</strong> Real-time engine flags anomalous transfer activity.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SendMoneyPage