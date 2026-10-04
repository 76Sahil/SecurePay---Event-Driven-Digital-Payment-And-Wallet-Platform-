import { Link } from 'react-router'
import { useState } from 'react'
import type { FormEvent } from 'react'

const API_BASE_URL = 'http://localhost:8080'

function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!email.trim()) {
            setError('Email is required.')
            return
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setError('Please enter a valid email address.')
            return
        }

        setError('')
        setIsSubmitting(true)

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email.trim().toLowerCase() }),
            })

            if (!response.ok) {
                const data = await response.json().catch(() => null)
                throw new Error(data?.message || 'Unable to process password reset request.')
            }

            setIsSubmitted(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to request password reset. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section className="auth-page">
            <div className="auth-card">
                <div className="auth-card__header">
                    <p className="auth-card__brand">SecurePay</p>

                    <h1>Reset your password</h1>

                    <p className="auth-card__description">
                        Enter your registered email address and we'll send you a secure link to reset your password.
                    </p>
                </div>

                {isSubmitted ? (
                    <div style={{ textAlign: 'center', padding: '12px 0' }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            background: '#ecfdf5',
                            color: '#10b981',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '28px',
                            margin: '0 auto 16px auto',
                            border: '1px solid #a7f3d0'
                        }}>
                            ✓
                        </div>

                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: '0 0 8px 0' }}>
                            Reset Link Sent
                        </h3>

                        <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.5, marginBottom: '24px' }}>
                            If an account is associated with <strong>{email}</strong>, a secure password reset link has been delivered. Please check your inbox.
                        </p>

                        <div style={{
                            padding: '12px 14px',
                            background: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            fontSize: '12px',
                            color: '#64748b',
                            marginBottom: '24px',
                            textAlign: 'left'
                        }}>
                            <strong>Notice:</strong> For development environments, emails are captured locally in Mailpit (<a href="http://localhost:8025" target="_blank" rel="noreferrer" style={{ color: '#0284c7' }}>localhost:8025</a>).
                        </div>

                        <Link
                            to="/login"
                            className="auth-submit"
                            style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
                        >
                            Return to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="form-field">
                            <label htmlFor="email">Email address</label>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={email}
                                onChange={(event) => {
                                    setEmail(event.target.value)
                                    setError('')
                                }}
                                autoComplete="email"
                                placeholder="name@example.com"
                                disabled={isSubmitting}
                                aria-invalid={Boolean(error)}
                                aria-describedby={error ? 'forgot-password-error' : undefined}
                            />

                            {error && (
                                <p id="forgot-password-error" role="alert" style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px' }}>
                                    {error}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Sending Reset Link...' : 'Send Reset Link'}
                        </button>
                    </form>
                )}

                {!isSubmitted && (
                    <p className="auth-card__footer">
                        Remember your password?{' '}
                        <Link to="/login">Back to login</Link>
                    </p>
                )}
            </div>
        </section>
    )
}

export default ForgotPasswordPage