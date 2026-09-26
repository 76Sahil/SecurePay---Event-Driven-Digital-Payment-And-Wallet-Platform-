import { Link } from 'react-router'
import { useState } from 'react'
import type { FormEvent } from 'react'

function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!email.trim()) {
            setError('Email is required.')
            return
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address.')
            return
        }

        setError('')
        setIsSubmitting(true)

        // Password recovery will be connected later.
        setTimeout(() => {
            setIsSubmitting(false)
        }, 500)
    }

    return (
        <section className="auth-page">
            <div className="auth-card">
                <div className="auth-card__header">
                    <p className="auth-card__brand">SecurePay</p>

                    <h1>Reset your password</h1>

                    <p className="auth-card__description">
                        Enter your email address and we'll help you
                        recover access to your account.
                    </p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-field">
                        <label htmlFor="email">Email address</label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            autoComplete="email"
                            aria-invalid={Boolean(error)}
                            aria-describedby={
                                error
                                    ? 'forgot-password-error'
                                    : undefined
                            }
                        />

                        {error && (
                            <p
                                id="forgot-password-error"
                                role="alert"
                            >
                                {error}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? 'Submitting...'
                            : 'Continue'}
                    </button>
                </form>

                <p className="auth-card__footer">
                    Remember your password?{' '}
                    <Link to="/login">Back to login</Link>
                </p>
            </div>
        </section>
    )
}

export default ForgotPasswordPage