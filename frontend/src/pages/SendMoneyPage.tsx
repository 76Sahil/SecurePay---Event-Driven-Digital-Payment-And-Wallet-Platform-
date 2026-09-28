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

    const [isLoadingBeneficiaries, setIsLoadingBeneficiaries] =
        useState(true)
    const [isInitiatingTransfer, setIsInitiatingTransfer] =
        useState(false)

    const [error, setError] = useState<string | null>(null)
    const [amountError, setAmountError] = useState<string | null>(null)

    const [showReview, setShowReview] = useState(false)
    const [transferResult, setTransferResult] =
        useState<TransferInitiationResponse | null>(null)

    useEffect(() => {
        async function loadBeneficiaries() {
            try {
                setIsLoadingBeneficiaries(true)
                setError(null)

                const data = await getBeneficiaries()
                setBeneficiaries(data)
            } catch {
                setError(
                    'Unable to load your beneficiaries. Please try again.',
                )
            } finally {
                setIsLoadingBeneficiaries(false)
            }
        }

        loadBeneficiaries()
    }, [])

    function handleAmountChange(
        event: ChangeEvent<HTMLInputElement>,
    ) {
        setAmount(event.target.value)
        setAmountError(null)
        setShowReview(false)
        setTransferResult(null)
    }

    function handleNoteChange(
        event: ChangeEvent<HTMLTextAreaElement>,
    ) {
        setNote(event.target.value)
        setShowReview(false)
        setTransferResult(null)
    }

    function handleBeneficiarySelect(beneficiaryId: string) {
        setSelectedBeneficiaryId(beneficiaryId)
        setError(null)
        setShowReview(false)
        setTransferResult(null)
    }

    function validateAmount(): boolean {
        const numericAmount = Number(amount)

        if (!amount.trim()) {
            setAmountError('Please enter a transfer amount.')
            return false
        }

        if (!Number.isFinite(numericAmount)) {
            setAmountError('Please enter a valid amount.')
            return false
        }

        if (numericAmount <= 0) {
            setAmountError('Amount must be greater than zero.')
            return false
        }

        if (numericAmount < 1) {
            setAmountError('Minimum transfer amount is INR 1.')
            return false
        }

        return true
    }

    function handleReviewTransfer() {
        setError(null)
        setTransferResult(null)

        if (!selectedBeneficiaryId) {
            setError('Please select a beneficiary.')
            return
        }

        const selectedBeneficiary = beneficiaries.find(
            (beneficiary) =>
                beneficiary.id === selectedBeneficiaryId,
        )

        if (!selectedBeneficiary) {
            setError('Selected beneficiary could not be found.')
            return
        }

        if (selectedBeneficiary.status !== 'ACTIVE') {
            setError(
                'This beneficiary is currently unavailable for transfers.',
            )
            return
        }

        if (!validateAmount()) {
            return
        }

        setShowReview(true)
    }

    async function handleConfirmTransfer() {
        setError(null)
        setTransferResult(null)

        if (!selectedBeneficiaryId) {
            setError('Please select a beneficiary.')
            return
        }

        if (!validateAmount()) {
            return
        }

        try {
            setIsInitiatingTransfer(true)

            const response = await initiateTransfer({
                beneficiaryId: selectedBeneficiaryId,
                amount: Number(amount),
                currency: 'INR',
                note: note.trim() || undefined,
            })

            setTransferResult(response)
        } catch {
            setError(
                'Unable to initiate the transfer. Please try again.',
            )
        } finally {
            setIsInitiatingTransfer(false)
        }
    }

    const selectedBeneficiary = beneficiaries.find(
        (beneficiary) =>
            beneficiary.id === selectedBeneficiaryId,
    )

    const numericAmount = Number(amount)

    return (
        <section className="send-money-page">
            <header className="send-money-page__header">
                <div>
                    <p className="customer-dashboard__eyebrow">
                        Customer Portal
                    </p>

                    <h1>Send Money</h1>

                    <p className="send-money-page__description">
                        Transfer money securely to one of your
                        beneficiaries.
                    </p>
                </div>
            </header>

            <section className="send-money-card">
                <div className="send-money-card__header">
                    <h2>Select Beneficiary</h2>

                    <p>
                        Choose the person or account you want to
                        transfer money to.
                    </p>
                </div>

                {isLoadingBeneficiaries ? (
                    <div className="send-money-state">
                        <p>Loading beneficiaries...</p>
                    </div>
                ) : beneficiaries.length === 0 ? (
                    <div className="send-money-state">
                        <p>
                            You don't have any beneficiaries yet.
                        </p>
                    </div>
                ) : (
                    <div className="beneficiary-list">
                        {beneficiaries.map((beneficiary) => {
                            const isSelected =
                                beneficiary.id ===
                                selectedBeneficiaryId

                            const isBlocked =
                                beneficiary.status !== 'ACTIVE'

                            return (
                                <button
                                    key={beneficiary.id}
                                    type="button"
                                    className={`beneficiary-option ${
                                        isSelected
                                            ? 'beneficiary-option--selected'
                                            : ''
                                    } ${
                                        isBlocked
                                            ? 'beneficiary-option--disabled'
                                            : ''
                                    }`}
                                    disabled={
                                        isBlocked ||
                                        isInitiatingTransfer
                                    }
                                    onClick={() =>
                                        handleBeneficiarySelect(
                                            beneficiary.id,
                                        )
                                    }
                                >
                                    <span className="beneficiary-option__radio">
                                        {isSelected ? '✓' : ''}
                                    </span>

                                    <span className="beneficiary-option__content">
                                        <strong>
                                            {beneficiary.name}
                                        </strong>

                                        <span>
                                            {beneficiary.bankName}{' '}
                                            {beneficiary.accountIdentifier}
                                        </span>
                                    </span>

                                    <span
                                        className={`beneficiary-option__status ${
                                            isBlocked
                                                ? 'beneficiary-option__status--blocked'
                                                : ''
                                        }`}
                                    >
                                        {beneficiary.status}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                )}

                <div className="send-money-form">
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
                                step="1"
                                value={amount}
                                onChange={handleAmountChange}
                                placeholder="0"
                                className="send-money-form__amount"
                                disabled={isInitiatingTransfer}
                            />
                        </div>

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
                            disabled={isInitiatingTransfer}
                        />
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
                    <button
                        type="button"
                        className="send-money-card__review-button"
                        onClick={handleReviewTransfer}
                        disabled={isInitiatingTransfer}
                    >
                        Review Transfer
                    </button>
                </div>
            </section>

            {showReview && selectedBeneficiary && !transferResult && (
                <section className="transfer-review-card">
                    <div className="transfer-review-card__header">
                        <div>
                            <p className="customer-dashboard__eyebrow">
                                Transfer Review
                            </p>

                            <h2>Review your transfer</h2>

                            <p>
                                Verify the recipient and amount before
                                continuing.
                            </p>
                        </div>
                    </div>

                    <div className="transfer-review-card__details">
                        <div>
                            <span>Beneficiary</span>

                            <strong>
                                {selectedBeneficiary.name}
                            </strong>
                        </div>

                        <div>
                            <span>Bank Account</span>

                            <strong>
                                {selectedBeneficiary.bankName}{' '}
                                {selectedBeneficiary.accountIdentifier}
                            </strong>
                        </div>

                        <div>
                            <span>Amount</span>

                            <strong>
                                ₹
                                {numericAmount.toLocaleString(
                                    'en-IN',
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Note</span>

                            <strong>
                                {note.trim() || 'No note added'}
                            </strong>
                        </div>
                    </div>

                    <div className="transfer-review-card__notice">
                        <span>ⓘ</span>

                        <p>
                            Review the details carefully before
                            initiating this transfer.
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
                                ? 'Initiating Transfer...'
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

                        <h2>Transfer initiated</h2>

                        <p>
                            Your transfer request has been submitted
                            successfully.
                        </p>
                    </div>

                    <div className="transfer-result-card__details">
                        <div>
                            <span>Reference</span>

                            <strong>
                                {transferResult.reference}
                            </strong>
                        </div>

                        <div>
                            <span>Amount</span>

                            <strong>
                                {transferResult.currency}{' '}
                                {transferResult.amount.toLocaleString(
                                    'en-IN',
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Status</span>

                            <strong>
                                {transferResult.status}
                            </strong>
                        </div>

                        <div>
                            <span>Transaction ID</span>

                            <strong>
                                {transferResult.transactionId}
                            </strong>
                        </div>
                    </div>

                    <div className="transfer-result-card__notice">
                        <span>ⓘ</span>

                        <p>
                            The current demo service returned{' '}
                            <strong>
                                {transferResult.status}
                            </strong>
                            . A successful API response does not
                            automatically mean the money has reached
                            the beneficiary. The backend will
                            eventually determine the authoritative
                            transaction status.
                        </p>
                    </div>
                </section>
            )}
        </section>
    )
}

export default SendMoneyPage