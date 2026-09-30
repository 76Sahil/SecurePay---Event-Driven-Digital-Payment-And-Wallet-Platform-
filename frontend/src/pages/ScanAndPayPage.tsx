import { useState } from 'react'
import { Link } from 'react-router'
import type { FormEvent } from 'react'

function ScanAndPayPage() {
    const [upiId, setUpiId] = useState('')
    const [amount, setAmount] = useState('')
    const [showManualPayment, setShowManualPayment] = useState(false)

    function handleContinue(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!upiId || !amount) {
            return
        }

        alert(
            `Payment request created for ${upiId} - ₹${amount}`,
        )
    }

    return (
        <section className="page-section">
            <div className="page-section__header">
                <div>
                    <p className="page-section__eyebrow">
                        CUSTOMER PORTAL
                    </p>

                    <h1>Scan & Pay</h1>

                    <p>
                        Scan a merchant QR code or enter a UPI ID to
                        make a payment.
                    </p>
                </div>
            </div>

            <div className="scan-pay-layout">
                <div className="scan-pay-card">
                    <div className="scan-pay-card__header">
                        <h2>Scan QR Code</h2>
                        <p>
                            Position the merchant QR code inside the
                            scanner area.
                        </p>
                    </div>

                    <div className="scan-pay-qr">
                        <div className="scan-pay-qr__corner scan-pay-qr__corner--top-left" />
                        <div className="scan-pay-qr__corner scan-pay-qr__corner--top-right" />
                        <div className="scan-pay-qr__corner scan-pay-qr__corner--bottom-left" />
                        <div className="scan-pay-qr__corner scan-pay-qr__corner--bottom-right" />

                        <div className="scan-pay-qr__icon">
                            ▦
                        </div>

                        <span>QR Scanner</span>
                        <small>
                            Camera integration will be enabled
                            with the backend/payment flow.
                        </small>
                    </div>

                    <button
                        type="button"
                        className="scan-pay-secondary-button"
                        onClick={() =>
                            setShowManualPayment((current) => !current)
                        }
                    >
                        {showManualPayment
                            ? 'Hide Manual Payment'
                            : 'Enter UPI ID Instead'}
                    </button>
                </div>

                <div className="scan-pay-card">
                    <div className="scan-pay-card__header">
                        <h2>Pay with UPI ID</h2>
                        <p>
                            Enter the merchant's UPI ID and payment
                            amount.
                        </p>
                    </div>

                    <form
                        className="scan-pay-form"
                        onSubmit={handleContinue}
                    >
                        <label htmlFor="upiId">
                            UPI ID
                        </label>

                        <input
                            id="upiId"
                            type="text"
                            value={upiId}
                            onChange={(event) =>
                                setUpiId(event.target.value)
                            }
                            placeholder="merchant@upi"
                        />

                        <label htmlFor="paymentAmount">
                            Amount
                        </label>

                        <input
                            id="paymentAmount"
                            type="number"
                            min="1"
                            value={amount}
                            onChange={(event) =>
                                setAmount(event.target.value)
                            }
                            placeholder="Enter amount"
                        />

                        <button
                            type="submit"
                            className="scan-pay-primary-button"
                        >
                            Continue to Pay
                        </button>
                    </form>
                </div>
            </div>

            <div className="scan-pay-info-card">
                <div>
                    <strong>Secure payments</strong>

                    <p>
                        Always verify the merchant name and amount
                        before confirming a payment.
                    </p>
                </div>

                <Link
                    to="/customer/transactions"
                    className="scan-pay-history-link"
                >
                    View Transactions →
                </Link>
            </div>
        </section>
    )
}

export default ScanAndPayPage