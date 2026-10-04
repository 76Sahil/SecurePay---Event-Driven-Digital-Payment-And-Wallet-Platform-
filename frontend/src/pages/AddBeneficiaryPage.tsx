import { useState } from 'react'
import { Link } from 'react-router'
import { addBeneficiary } from '../services/beneficiaryService'

type FormData = {
    name: string
    recipientEmail: string
    bankName: string
    accountNumber: string
    confirmAccountNumber: string
}

type Step = 'FORM' | 'REVIEW' | 'MFA' | 'SUCCESS'

function AddBeneficiaryPage() {
    const [step, setStep] = useState<Step>('FORM')

    const [formData, setFormData] = useState<FormData>({
        name: '',
        recipientEmail: '',
        bankName: '',
        accountNumber: '',
        confirmAccountNumber: '',
    })

    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [verificationCode, setVerificationCode] = useState('')
    const [createdBeneficiaryId, setCreatedBeneficiaryId] = useState('')

    const updateField = (
        field: keyof FormData,
        value: string,
    ) => {
        setFormData((current) => ({
            ...current,
            [field]: value,
        }))

        setError('')
    }

    const validateForm = (): boolean => {
        if (!formData.name.trim()) {
            setError('Please enter the beneficiary name.')
            return false
        }

        if (!formData.recipientEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.recipientEmail.trim())) {
            setError('Enter the registered email address of a SecurePay customer or merchant.')
            return false
        }

        if (!formData.bankName.trim()) {
            setError('Please enter the bank name.')
            return false
        }

        if (!/^\d{9,18}$/.test(formData.accountNumber)) {
            setError('Account number must contain 9 to 18 digits.')
            return false
        }

        if (!formData.confirmAccountNumber) {
            setError('Please confirm the account number.')
            return false
        }

        if (
            formData.accountNumber !==
            formData.confirmAccountNumber
        ) {
            setError('Account numbers do not match.')
            return false
        }

        return true
    }

    const handleContinueToReview = () => {
        const isValid = validateForm()

        if (!isValid) {
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
            const beneficiary = await addBeneficiary(
                formData.name.trim(),
                formData.bankName.trim(),
                formData.accountNumber,
                formData.recipientEmail.trim().toLowerCase(),
            )

            setCreatedBeneficiaryId(beneficiary.id)
            setStep('SUCCESS')
        } catch (err) {
            setError(
                err instanceof Error && err.message
                    ? err.message
                    : 'Unable to add beneficiary. Please try again.',
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    if (step === 'SUCCESS') {
        return (
            <div className="beneficiary-details-page">
                <div className="beneficiary-details-card beneficiary-details-state">
                    <div className="beneficiary-eligibility beneficiary-eligibility-active">
                        <div className="beneficiary-eligibility-icon">
                            ✓
                        </div>

                        <div>
                            <strong>
                                Beneficiary added successfully
                            </strong>

                            <p>
                                The beneficiary has been saved and is ready for SecurePay wallet transfers.
                            </p>
                        </div>
                    </div>

                    <div className="beneficiary-details-actions">
                        <Link
                            to={`/customer/beneficiaries/${createdBeneficiaryId}`}
                            className="beneficiary-details-back-button"
                        >
                            View Beneficiary
                        </Link>

                        <Link
                            to="/customer/beneficiaries"
                            className="beneficiary-details-back-link"
                        >
                            Back to Beneficiaries
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="beneficiary-details-page">
            <div className="beneficiary-details-header">
                <div>
                    <Link
                        to="/customer/beneficiaries"
                        className="beneficiary-details-back-link"
                    >
                        ← Back to Beneficiaries
                    </Link>

                    <h1>Add Beneficiary</h1>

                    <p>
                        Add a new beneficiary for future transfers.
                    </p>
                </div>
            </div>

            <div className="beneficiary-details-card">
                <div className="beneficiary-add-step-indicator">
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
                        <h3>Beneficiary Information</h3>

                        <div className="beneficiary-form">
                            <label>
                                Beneficiary Name

                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(event) =>
                                        updateField(
                                            'name',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Enter full name"
                                />
                            </label>

                            <label>
                                Registered SecurePay Email

                                <input
                                    type="email"
                                    autoComplete="email"
                                    value={formData.recipientEmail}
                                    onChange={(event) => updateField('recipientEmail', event.target.value)}
                                    placeholder="recipient@example.com"
                                />
                            </label>

                            <label>
                                Bank Name

                                <input
                                    type="text"
                                    value={formData.bankName}
                                    onChange={(event) =>
                                        updateField(
                                            'bankName',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Enter bank name"
                                />
                            </label>

                            <label>
                                Account Number

                                <input
                                    type="password"
                                    inputMode="numeric"
                                    value={formData.accountNumber}
                                    onChange={(event) =>
                                        updateField(
                                            'accountNumber',
                                            event.target.value.replace(
                                                /\D/g,
                                                '',
                                            ),
                                        )
                                    }
                                    placeholder="Enter account number"
                                />
                            </label>

                            <label>
                                Confirm Account Number

                                <input
                                    type="password"
                                    inputMode="numeric"
                                    value={
                                        formData.confirmAccountNumber
                                    }
                                    onChange={(event) =>
                                        updateField(
                                            'confirmAccountNumber',
                                            event.target.value.replace(
                                                /\D/g,
                                                '',
                                            ),
                                        )
                                    }
                                    placeholder="Re-enter account number"
                                />
                            </label>

                            {error && (
                                <p className="beneficiaries-error">
                                    {error}
                                </p>
                            )}

                            <button
                                type="button"
                                className="beneficiary-primary-button"
                                onClick={handleContinueToReview}
                            >
                                Review Beneficiary
                            </button>
                        </div>
                    </>
                )}

                {step === 'REVIEW' && (
                    <>
                        <h3>Review Beneficiary</h3>

                        <div className="beneficiary-review">
                            <div>
                                <span>Name</span>
                                <strong>{formData.name}</strong>
                            </div>

                            <div>
                                <span>Registered Email</span>
                                <strong>{formData.recipientEmail}</strong>
                            </div>

                            <div>
                                <span>Bank</span>
                                <strong>{formData.bankName}</strong>
                            </div>

                            <div>
                                <span>Account</span>
                                <strong>
                                    ••••{' '}
                                    {formData.accountNumber.slice(-4)}
                                </strong>
                            </div>
                        </div>

                        <div className="beneficiary-review-warning">
                            <strong>Security check</strong>

                            <p>
                                Adding a beneficiary is a sensitive
                                action. You will need to complete an
                                additional verification step.
                            </p>
                        </div>

                        {error && (
                            <p className="beneficiaries-error">
                                {error}
                            </p>
                        )}

                        <div className="beneficiary-form-actions">
                            <button
                                type="button"
                                className="beneficiary-secondary-button"
                                onClick={() => setStep('FORM')}
                            >
                                Back
                            </button>

                            <button
                                type="button"
                                className="beneficiary-primary-button"
                                onClick={handleContinueToMfa}
                            >
                                Continue to Verification
                            </button>
                        </div>
                    </>
                )}

                {step === 'MFA' && (
                    <>
                        <h3>Security Verification</h3>

                        <p>
                            Enter the 6-digit verification code to
                            confirm this sensitive action.
                        </p>

                        <div className="beneficiary-form">
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

                            <p className="beneficiary-demo-note">
                                Demo mode: use any 6-digit code.
                                Real MFA will be connected to
                                Keycloak later.
                            </p>

                            {error && (
                                <p className="beneficiaries-error">
                                    {error}
                                </p>
                            )}

                            <div className="beneficiary-form-actions">
                                <button
                                    type="button"
                                    className="beneficiary-secondary-button"
                                    onClick={() =>
                                        setStep('REVIEW')
                                    }
                                    disabled={isSubmitting}
                                >
                                    Back
                                </button>

                                <button
                                    type="button"
                                    className="beneficiary-primary-button"
                                    onClick={handleVerification}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting
                                        ? 'Adding...'
                                        : 'Verify & Add'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default AddBeneficiaryPage