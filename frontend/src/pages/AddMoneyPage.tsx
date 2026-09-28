import { useState } from 'react'
import type { PaymentInitiationResponse } from '../types/payment'
import { initiatePayment } from '../services/paymentService'
import type { ChangeEvent } from 'react'

const QUICK_AMOUNTS = [500, 1000, 2000, 5000]

function AddMoneyPage() {
    const [amount, setAmount] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [payment, setPayment] =
        useState<PaymentInitiationResponse | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    function handleAmountChange(
        event: ChangeEvent<HTMLInputElement>,
    ) {
        setAmount(event.target.value)
        setError(null)
        setPayment(null)
    }

    function handleQuickAmount(selectedAmount: number) {
        setAmount(String(selectedAmount))
        setError(null)
        setPayment(null)
    }

    function validateAmount(): number | null {
        const numericAmount = Number(amount)

        if (!amount.trim()) {
            setError('Please enter an amount.')
            return null
        }

        if (!Number.isFinite(numericAmount)) {
            setError('Please enter a valid amount.')
            return null
        }

        if (numericAmount <= 0) {
            setError('Amount must be greater than zero.')
            return null
        }

        if (numericAmount < 1) {
            setError('Minimum amount is INR 1.')
            return null
        }

        return numericAmount
    }

    async function handleContinue() {
        const numericAmount = validateAmount()

        if (numericAmount === null) {
            return
        }

        try {
            setIsSubmitting(true)
            setError(null)
            setPayment(null)

            const response = await initiatePayment({
                amount: numericAmount,
                currency: 'INR',
            })

            setPayment(response)
        } catch {
            setError('Unable to initiate the payment. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const numericAmount = Number(amount)
    const isValidAmount =
        Number.isFinite(numericAmount) && numericAmount > 0

    return (
        <section className="add-money-page">
            <header className="add-money-page__header">
                <div>
                    <p className="customer-dashboard__eyebrow">
                        Customer Portal
                    </p>

                    <h1>Add Money</h1>

                    <p className="add-money-page__description">
                        Add funds securely to your SecurePay wallet.
                    </p>
                </div>
            </header>

            <section className="add-money-layout">
                <article className="add-money-card">
                    <div className="add-money-card__header">
                        <h2>Enter Amount</h2>

                        <p>
                            Choose how much you want to add to your wallet.
                        </p>
                    </div>

                    <div className="add-money-form">
                        <label
                            htmlFor="amount"
                            className="add-money-form__label"
                        >
                            Amount
                        </label>

                        <div className="add-money-form__input-wrapper">
                            <span className="add-money-form__currency">
                                ₹
                            </span>

                            <input
                                id="amount"
                                name="amount"
                                type="number"
                                min="1"
                                step="1"
                                value={amount}
                                onChange={handleAmountChange}
                                placeholder="0"
                                disabled={isSubmitting}
                                className="add-money-form__input"
                            />
                        </div>

                        {error && (
                            <p
                                className="add-money-form__error"
                                role="alert"
                            >
                                {error}
                            </p>
                        )}

                        <div className="add-money-form__quick">
                            <p>Quick Amount</p>

                            <div className="add-money-form__quick-grid">
                                {QUICK_AMOUNTS.map((quickAmount) => (
                                    <button
                                        key={quickAmount}
                                        type="button"
                                        onClick={() =>
                                            handleQuickAmount(quickAmount)
                                        }
                                        disabled={isSubmitting}
                                        className="add-money-form__quick-button"
                                    >
                                        ₹{quickAmount.toLocaleString('en-IN')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </article>

                <article className="payment-summary-card">
                    <div className="payment-summary-card__header">
                        <h2>Payment Summary</h2>

                        <p>
                            Review your payment before continuing.
                        </p>
                    </div>

                    <div className="payment-summary-card__rows">
                        <div>
                            <span>Amount</span>

                            <strong>
                                ₹
                                {isValidAmount
                                    ? numericAmount.toLocaleString('en-IN')
                                    : '0'}
                            </strong>
                        </div>

                        <div>
                            <span>Processing Fee</span>
                            <strong>₹0</strong>
                        </div>

                        <div className="payment-summary-card__total">
                            <span>Total</span>

                            <strong>
                                ₹
                                {isValidAmount
                                    ? numericAmount.toLocaleString('en-IN')
                                    : '0'}
                            </strong>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="payment-summary-card__button"
                        onClick={handleContinue}
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? 'Preparing Payment...'
                            : 'Continue to Payment'}
                    </button>
                </article>
            </section>

            {payment && (
                <section className="payment-created-banner">
                    <div>
                        <p className="payment-created-banner__eyebrow">
                            Payment Created
                        </p>

                        <h2>
                            Your payment is ready to continue.
                        </h2>

                        <p>
                            Reference: {payment.reference}
                        </p>
                    </div>

                    <span className="payment-created-banner__status">
                        {payment.status}
                    </span>
                </section>
            )}
        </section>
    )
}

export default AddMoneyPage