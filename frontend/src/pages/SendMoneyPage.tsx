
import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { Beneficiary } from '../types/beneficiary'
import type { TransferInitiationResponse } from '../types/transfer'
import { getBeneficiaries } from '../services/beneficiaryService'
import { initiateTransfer } from '../services/transferService'

function SendMoneyPage() {
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
    const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState('')
    const [amount, setAmount] = useState('')
    const [note, setNote] = useState('')

    const [isLoadingBeneficiaries, setIsLoadingBeneficiaries] = useState(true)
    const [isInitiatingTransfer, setIsInitiatingTransfer] = useState(false)

    const [error, setError] = useState<string | null>(null)
    const [amountError, setAmountError] = useState<string | null>(null)
    const [showReview, setShowReview] = useState(false)

    const [transferResult, setTransferResult] =
        useState<TransferInitiationResponse | null>(null)

    useEffect(() => {
        async function loadBeneficiaries() {
            try {
                setError(null)
                const data = await getBeneficiaries()
                setBeneficiaries(data)

                const firstActive = data.find(
                    (beneficiary) => beneficiary.status === 'ACTIVE',
                )

                if (firstActive) {
                    setSelectedBeneficiaryId(firstActive.id)
                }
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Unable to load your beneficiaries.',
                )
            } finally {
                setIsLoadingBeneficiaries(false)
            }
        }

        void loadBeneficiaries()
    }, [])

    const selectedBeneficiary = beneficiaries.find(
        (beneficiary) => beneficiary.id === selectedBeneficiaryId,
    )

    const numericAmount = Number(amount)
    const transferSucceeded = transferResult?.status === 'SUCCESS'

    function resetResult() {
        setShowReview(false)
        setTransferResult(null)
        setError(null)
    }

    function handleBeneficiaryChange(
        event: ChangeEvent<HTMLSelectElement>,
    ) {
        setSelectedBeneficiaryId(event.target.value)
        resetResult()
    }

    function handleAmountChange(
        event: ChangeEvent<HTMLInputElement>,
    ) {
        setAmount(event.target.value)
        setAmountError(null)
        resetResult()
    }

    function handleNoteChange(
        event: ChangeEvent<HTMLTextAreaElement>,
    ) {
        setNote(event.target.value)
        resetResult()
    }

    function validateForm(): boolean {
        if (!selectedBeneficiary) {
            setError('Please select a registered beneficiary.')
            return false
        }

        if (selectedBeneficiary.status !== 'ACTIVE') {
            setError('This beneficiary is not active.')
            return false
        }

        if (!selectedBeneficiary.recipientEmail) {
            setError(
                'This beneficiary is missing its registered customer email. Please add the customer again.',
            )
            return false
        }

        if (!amount.trim()) {
            setAmountError('Please enter a transfer amount.')
            return false
        }

        if (!Number.isFinite(numericAmount)) {
            setAmountError('Please enter a valid amount.')
            return false
        }

        if (numericAmount < 1 || numericAmount > 100000) {
            setAmountError(
                'Transfer amount must be between ₹1 and ₹1,00,000.',
            )
            return false
        }

        if (!/^\d+(\.\d{1,2})?$/.test(amount.trim())) {
            setAmountError(
                'Amount can have a maximum of 2 decimal places.',
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
                amount: Number(amount),
            })

            setTransferResult(response)
            setShowReview(false)
        } catch (err: unknown) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Transfer failed. Please try again.',
            )
        } finally {
            setIsInitiatingTransfer(false)
        }
    }

    function handleNewTransfer() {
        setAmount('')
        setNote('')
        setAmountError(null)
        setError(null)
        setShowReview(false)
        setTransferResult(null)
    }

    return (
        <section className="send-money-page">
            <header className="send-money-page__header">
                <div>
                    <p className="customer-dashboard__eyebrow">
                        Customer Portal
                    </p>

                    <h1>Send Money</h1>

                    <p className="send-money-page__description">
                        Transfer money securely to another registered
                        SecurePay customer.
                    </p>
                </div>
            </header>

            <section className="send-money-card">
                <div className="send-money-card__header">
                    <h2>Recipient Details</h2>

                    <p>
                        Select a beneficiary from your registered
                        SecurePay contacts.
                    </p>
                </div>

                <div className="send-money-form">
                    <div className="send-money-form__field">
                        <label
                            htmlFor="beneficiary"
                            className="send-money-form__label"
                        >
                            Select Beneficiary
                        </label>

                        <select
                            id="beneficiary"
                            name="beneficiary"
                            value={selectedBeneficiaryId}
                            onChange={handleBeneficiaryChange}
                            className="send-money-form__amount"
                            disabled={
                                isLoadingBeneficiaries ||
                                isInitiatingTransfer ||
                                showReview
                            }
                        >
                            <option value="">
                                {isLoadingBeneficiaries
                                    ? 'Loading beneficiaries...'
                                    : 'Choose a beneficiary'}
                            </option>

                            {beneficiaries
                                .filter(
                                    (beneficiary) =>
                                        beneficiary.status === 'ACTIVE',
                                )
                                .map((beneficiary) => (
                                    <option
                                        key={beneficiary.id}
                                        value={beneficiary.id}
                                    >
                                        {beneficiary.name} —{' '}
                                        {beneficiary.bankName} (
                                        {beneficiary.accountIdentifier})
                                    </option>
                                ))}
                        </select>

                        {selectedBeneficiary && (
                            <p className="send-money-form__hint">
                                {selectedBeneficiary.bankName} ·{' '}
                                {selectedBeneficiary.accountIdentifier}
                            </p>
                        )}

                        {!isLoadingBeneficiaries &&
                            beneficiaries.filter(
                                (beneficiary) =>
                                    beneficiary.status === 'ACTIVE',
                            ).length === 0 && (
                                <p className="send-money-form__hint">
                                    No active beneficiaries found. Add a
                                    registered SecurePay customer as a
                                    beneficiary first.
                                </p>
                            )}
                    </div>

                    <div className="send-money-form__field">
                        <label
                            htmlFor="transfer-amount"
                            className="send-money-form__label"
                        >
                            Transfer Amount
                        </label>

                        <div className="send-money-form__amount-wrapper">
                            <span className="send-money-form__currency">
                                ₹
                            </span>

                            <input
                                id="transfer-amount"
                                name="transfer-amount"
                                type="number"
                                min="1"
                                max="100000"
                                step="0.01"
                                value={amount}
                                onChange={handleAmountChange}
                                placeholder="0.00"
                                className="send-money-form__amount"
                                disabled={
                                    isInitiatingTransfer || showReview
                                }
                            />
                        </div>

                        <p className="send-money-form__hint">
                            Minimum ₹1 and maximum ₹1,00,000 per transfer.
                        </p>

                        {amountError && (
                            <p
                                className="send-money-form__error"
                                role="alert"
                            >
                                {amountError}
                            </p>
                        )}
                    </div>

                    <div className="send-money-form__field">
                        <label
                            htmlFor="transfer-note"
                            className="send-money-form__label"
                        >
                            Note
                            <span>Optional</span>
                        </label>

                        <textarea
                            id="transfer-note"
                            name="transfer-note"
                            value={note}
                            onChange={handleNoteChange}
                            placeholder="Add a note for this transfer"
                            rows={4}
                            className="send-money-form__textarea"
                            disabled={isInitiatingTransfer || showReview}
                        />

                        <p className="send-money-form__hint">
                            Note is for review only and is not currently
                            saved by the backend.
                        </p>
                    </div>
                </div>

                {error && (
                    <div
                        className="send-money-page__error"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                <div className="send-money-card__actions">
                    {!showReview && !transferResult && (
                        <button
                            type="button"
                            className="send-money-card__review-button"
                            onClick={handleReviewTransfer}
                            disabled={
                                isInitiatingTransfer ||
                                isLoadingBeneficiaries ||
                                beneficiaries.filter(
                                    (beneficiary) =>
                                        beneficiary.status === 'ACTIVE',
                                ).length === 0
                            }
                        >
                            Review Transfer
                        </button>
                    )}

                    {showReview && !transferResult && (
                        <button
                            type="button"
                            className="send-money-card__review-button"
                            onClick={() => setShowReview(false)}
                            disabled={isInitiatingTransfer}
                        >
                            Edit Transfer
                        </button>
                    )}
                </div>
            </section>

            {showReview && !transferResult && selectedBeneficiary && (
                <section className="transfer-review-card">
                    <div className="transfer-review-card__header">
                        <div>
                            <p className="customer-dashboard__eyebrow">
                                Transfer Review
                            </p>

                            <h2>Review your transfer</h2>

                            <p>
                                Verify the beneficiary and amount before
                                confirming the transfer.
                            </p>
                        </div>
                    </div>

                    <div className="transfer-review-card__details">
                        <div>
                            <span>Beneficiary</span>
                            <strong>{selectedBeneficiary.name}</strong>
                        </div>

                        <div>
                            <span>Bank</span>
                            <strong>{selectedBeneficiary.bankName}</strong>
                        </div>

                        <div>
                            <span>Account</span>
                            <strong>
                                {selectedBeneficiary.accountIdentifier}
                            </strong>
                        </div>

                        <div>
                            <span>Registered Email</span>
                            <strong>
                                {selectedBeneficiary.recipientEmail}
                            </strong>
                        </div>

                        <div>
                            <span>Amount</span>
                            <strong>
                                ₹
                                {numericAmount.toLocaleString('en-IN', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </strong>
                        </div>

                        <div>
                            <span>Note</span>
                            <strong>{note.trim() || 'No note added'}</strong>
                        </div>
                    </div>

                    <div className="transfer-review-card__notice">
                        <span>ⓘ</span>
                        <p>
                            This transfer moves funds between SecurePay
                            customer wallets. Confirm that the recipient
                            and amount are correct.
                        </p>
                    </div>

                    <div className="transfer-review-card__actions">
                        <button
                            type="button"
                            className="transfer-review-card__confirm"
                            onClick={handleConfirmTransfer}
                            disabled={isInitiatingTransfer}
                        >
                            {isInitiatingTransfer
                                ? 'Processing Transfer...'
                                : 'Confirm Transfer'}
                        </button>
                    </div>
                </section>
            )}

            {transferResult && (
                <section className="transfer-result-card">
                    <div className="transfer-result-card__header">
                        <p className="customer-dashboard__eyebrow">
                            Transfer Status
                        </p>

                        <h2>
                            {transferSucceeded
                                ? 'Transfer Successful'
                                : 'Transfer Response Received'}
                        </h2>

                        <p>
                            {transferResult.message ||
                                (transferSucceeded
                                    ? 'The backend reported that the transfer succeeded.'
                                    : 'Check the transaction status below.')}
                        </p>
                    </div>

                    <div className="transfer-result-card__details">
                        <div>
                            <span>Recipient Email</span>
                            <strong>
                                {transferResult.recipientEmail ||
                                    selectedBeneficiary?.recipientEmail}
                            </strong>
                        </div>

                        <div>
                            <span>Amount</span>
                            <strong>
                                {transferResult.currency || 'INR'}{' '}
                                {transferResult.amount.toLocaleString(
                                    'en-IN',
                                    {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    },
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Status</span>
                            <strong>{transferResult.status}</strong>
                        </div>

                        <div>
                            <span>Transaction ID</span>
                            <strong>{transferResult.transactionId}</strong>
                        </div>

                        {transferResult.senderBalance !== undefined && (
                            <div>
                                <span>Updated Wallet Balance</span>
                                <strong>
                                    ₹
                                    {transferResult.senderBalance.toLocaleString(
                                        'en-IN',
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        },
                                    )}
                                </strong>
                            </div>
                        )}
                    </div>

                    <div className="transfer-result-card__actions">
                        <button
                            type="button"
                            className="send-money-card__review-button"
                            onClick={handleNewTransfer}
                        >
                            Make Another Transfer
                        </button>
                    </div>
                </section>
            )}
        </section>
    )
}

export default SendMoneyPage