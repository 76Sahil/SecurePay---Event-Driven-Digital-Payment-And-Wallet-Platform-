import { useState } from 'react'
import { Link } from 'react-router'
import type { CardType } from '../types/card'
import { addCard } from '../services/cardService'

type Step = 'FORM' | 'REVIEW' | 'MFA' | 'SUCCESS'

type CardFormData = {
    cardholderName: string
    cardNumber: string
    expiryMonth: string
    expiryYear: string
    cvv: string
    type: CardType
}

function AddCardPage() {
    const [step, setStep] = useState<Step>('FORM')

    const [formData, setFormData] = useState<CardFormData>({
        cardholderName: '',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        type: 'DEBIT',
    })

    const [verificationCode, setVerificationCode] = useState('')
    const [createdCardId, setCreatedCardId] = useState('')
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const updateField = <K extends keyof CardFormData>(
        field: K,
        value: CardFormData[K],
    ) => {
        setFormData((current) => ({
            ...current,
            [field]: value,
        }))

        setError('')
    }

    const validateForm = (): boolean => {
        if (!formData.cardholderName.trim()) {
            setError('Please enter the cardholder name.')
            return false
        }

        const cleanCardNumber = formData.cardNumber.replace(/\s/g, '')

        if (!/^\d{16}$/.test(cleanCardNumber)) {
            setError('Card number must contain 16 digits.')
            return false
        }

        const month = Number(formData.expiryMonth)

        if (!/^\d{1,2}$/.test(formData.expiryMonth)) {
            setError('Please enter a valid expiry month.')
            return false
        }

        if (month < 1 || month > 12) {
            setError('Expiry month must be between 01 and 12.')
            return false
        }

        if (!/^\d{4}$/.test(formData.expiryYear)) {
            setError('Please enter a valid 4-digit expiry year.')
            return false
        }

        const year = Number(formData.expiryYear)
        const currentYear = new Date().getFullYear()

        if (year < currentYear) {
            setError('Card expiry year cannot be in the past.')
            return false
        }

        if (!/^\d{3}$/.test(formData.cvv)) {
            setError('CVV must contain 3 digits.')
            return false
        }

        return true
    }

    const handleContinueToReview = () => {
        if (!validateForm()) {
            return
        }

        setError('')
        setStep('REVIEW')
    }

    const handleContinueToMfa = () => {
        setError('')
        setStep('MFA')
    }

    const handleVerification = async () => {
        if (verificationCode.length !== 6) {
            setError('Enter the 6-digit verification code.')
            return
        }

        setIsSubmitting(true)
        setError('')

        try {
            const card = await addCard(
                formData.cardholderName.trim(),
                formData.cardNumber.replace(/\s/g, ''),
                Number(formData.expiryMonth),
                Number(formData.expiryYear),
                formData.type,
            )

            setCreatedCardId(card.id)

            setFormData((current) => ({
                ...current,
                cardNumber: '',
                cvv: '',
            }))

            setVerificationCode('')
            setStep('SUCCESS')
        } catch {
            setError('Unable to add card. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (step === 'SUCCESS') {
        return (
            <div className="card-details-page">
                <div className="cards-card cards-state">
                    <div className="card-success-message">
                        <div className="card-success-icon">
                            ✓
                        </div>

                        <h2>Card added successfully</h2>

                        <p>
                            Your card has been added and is currently
                            pending verification.
                        </p>
                    </div>

                    <div className="card-add-success-actions">
                        <Link
                            to={`/customer/cards/${createdCardId}`}
                            className="card-add-primary-button"
                        >
                            View Card
                        </Link>

                        <Link
                            to="/customer/cards"
                            className="card-add-secondary-button"
                        >
                            Back to Cards
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="card-details-page">
            <div className="card-details-header">
                <div>
                    <Link
                        to="/customer/cards"
                        className="card-details-back"
                    >
                        ← Back to Cards
                    </Link>

                    <h1>Add Card</h1>

                    <p>
                        Add a card to your SecurePay account.
                    </p>
                </div>
            </div>

            <div className="cards-card card-add-container">
                <div className="card-add-step-indicator">
                    <span
                        className={
                            step === 'FORM' ? 'active' : ''
                        }
                    >
                        1. Details
                    </span>

                    <span
                        className={
                            step === 'REVIEW' ? 'active' : ''
                        }
                    >
                        2. Review
                    </span>

                    <span
                        className={
                            step === 'MFA' ? 'active' : ''
                        }
                    >
                        3. Verify
                    </span>
                </div>

                {step === 'FORM' && (
                    <>
                        <div className="card-add-section-heading">
                            <h2>Card Information</h2>

                            <p>
                                Enter your card details securely.
                            </p>
                        </div>

                        <div className="card-add-form">
                            <label>
                                Cardholder Name

                                <input
                                    type="text"
                                    value={formData.cardholderName}
                                    onChange={(event) =>
                                        updateField(
                                            'cardholderName',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Enter cardholder name"
                                />
                            </label>

                            <label>
                                Card Type

                                <select
                                    value={formData.type}
                                    onChange={(event) =>
                                        updateField(
                                            'type',
                                            event.target.value as CardType,
                                        )
                                    }
                                >
                                    <option value="DEBIT">
                                        Debit
                                    </option>

                                    <option value="CREDIT">
                                        Credit
                                    </option>

                                    <option value="VIRTUAL">
                                        Virtual
                                    </option>

                                    <option value="PHYSICAL">
                                        Physical
                                    </option>
                                </select>
                            </label>

                            <label>
                                Card Number

                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={19}
                                    value={formData.cardNumber}
                                    onChange={(event) => {
                                        const digits =
                                            event.target.value.replace(
                                                /\D/g,
                                                '',
                                            )

                                        const formatted =
                                            digits
                                                .slice(0, 16)
                                                .replace(
                                                    /(.{4})/g,
                                                    '$1 ',
                                                )
                                                .trim()

                                        updateField(
                                            'cardNumber',
                                            formatted,
                                        )
                                    }}
                                    placeholder="1234 5678 9012 3456"
                                />
                            </label>

                            <div className="card-add-row">
                                <label>
                                    Expiry Month

                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={2}
                                        value={formData.expiryMonth}
                                        onChange={(event) =>
                                            updateField(
                                                'expiryMonth',
                                                event.target.value.replace(
                                                    /\D/g,
                                                    '',
                                                ),
                                            )
                                        }
                                        placeholder="MM"
                                    />
                                </label>

                                <label>
                                    Expiry Year

                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={4}
                                        value={formData.expiryYear}
                                        onChange={(event) =>
                                            updateField(
                                                'expiryYear',
                                                event.target.value.replace(
                                                    /\D/g,
                                                    '',
                                                ),
                                            )
                                        }
                                        placeholder="YYYY"
                                    />
                                </label>

                                <label>
                                    CVV

                                    <input
                                        type="password"
                                        inputMode="numeric"
                                        maxLength={3}
                                        value={formData.cvv}
                                        onChange={(event) =>
                                            updateField(
                                                'cvv',
                                                event.target.value.replace(
                                                    /\D/g,
                                                    '',
                                                ),
                                            )
                                        }
                                        placeholder="•••"
                                    />
                                </label>
                            </div>

                            <div className="card-add-security-note">
                                <strong>Card security</strong>

                                <p>
                                    Your full card number and CVV are
                                    never stored in SecurePay's card
                                    display data.
                                </p>
                            </div>

                            {error && (
                                <p className="cards-error">
                                    {error}
                                </p>
                            )}

                            <button
                                type="button"
                                className="card-add-primary-button"
                                onClick={handleContinueToReview}
                            >
                                Review Card
                            </button>
                        </div>
                    </>
                )}

                {step === 'REVIEW' && (
                    <>
                        <div className="card-add-section-heading">
                            <h2>Review Card</h2>

                            <p>
                                Check the details before continuing.
                            </p>
                        </div>

                        <div className="card-review">
                            <div>
                                <span>Cardholder</span>

                                <strong>
                                    {formData.cardholderName}
                                </strong>
                            </div>

                            <div>
                                <span>Card Type</span>

                                <strong>
                                    {formData.type}
                                </strong>
                            </div>

                            <div>
                                <span>Card Number</span>

                                <strong>
                                    •••• •••• ••••{' '}
                                    {formData.cardNumber
                                        .replace(/\s/g, '')
                                        .slice(-4)}
                                </strong>
                            </div>

                            <div>
                                <span>Expiry</span>

                                <strong>
                                    {formData.expiryMonth.padStart(
                                        2,
                                        '0',
                                    )}
                                    /
                                    {formData.expiryYear}
                                </strong>
                            </div>
                        </div>

                        <div className="card-add-security-note">
                            <strong>
                                Additional verification required
                            </strong>

                            <p>
                                Adding a card is a sensitive action.
                                A security verification step is required
                                before the card is created.
                            </p>
                        </div>

                        {error && (
                            <p className="cards-error">
                                {error}
                            </p>
                        )}

                        <div className="card-add-actions">
                            <button
                                type="button"
                                className="card-add-secondary-button"
                                onClick={() => setStep('FORM')}
                            >
                                Back
                            </button>

                            <button
                                type="button"
                                className="card-add-primary-button"
                                onClick={handleContinueToMfa}
                            >
                                Continue to Verification
                            </button>
                        </div>
                    </>
                )}

                {step === 'MFA' && (
                    <>
                        <div className="card-add-section-heading">
                            <h2>Security Verification</h2>

                            <p>
                                Enter the 6-digit verification code
                                to confirm this sensitive action.
                            </p>
                        </div>

                        <div className="card-add-form">
                            <label>
                                Verification Code

                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={verificationCode}
                                    onChange={(event) => {
                                        setVerificationCode(
                                            event.target.value.replace(
                                                /\D/g,
                                                '',
                                            ),
                                        )

                                        setError('')
                                    }}
                                    placeholder="000000"
                                />
                            </label>

                            <p className="card-add-demo-note">
                                Demo mode: use any 6-digit code.
                                Real MFA will be connected to
                                Keycloak later.
                            </p>

                            {error && (
                                <p className="cards-error">
                                    {error}
                                </p>
                            )}

                            <div className="card-add-actions">
                                <button
                                    type="button"
                                    className="card-add-secondary-button"
                                    onClick={() =>
                                        setStep('REVIEW')
                                    }
                                    disabled={isSubmitting}
                                >
                                    Back
                                </button>

                                <button
                                    type="button"
                                    className="card-add-primary-button"
                                    onClick={handleVerification}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting
                                        ? 'Adding Card...'
                                        : 'Verify & Add Card'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default AddCardPage