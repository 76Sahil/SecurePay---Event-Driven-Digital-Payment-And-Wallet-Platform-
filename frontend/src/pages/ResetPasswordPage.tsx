import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import type { FormEvent } from 'react'

const API_BASE_URL = 'http://localhost:8080'

function ResetPasswordPage() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')

    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!token) {
            setError('Missing password reset token. Please request a new reset link.')
            return
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long.')
            return
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.')
            return
        }

        setError('')
        setIsSubmitting(true)

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: token.trim(),
                    newPassword,
                }),
            })

            const data = await response.json().catch(() => null)

            if (!response.ok) {
                throw new Error(data?.message || 'Failed to reset password. The link may have expired or already been used.')
            }

            setIsSuccess(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to reset password.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!token) {
        return (
            <section className="auth-page">
                <div className="auth-card">
                    <div className="auth-card__header">
                        <p className="auth-card__brand">SecurePay</p>
                        <h1>Invalid Reset Link</h1>
                        <p className="auth-card__description">
                            No reset token was found in the link. Please request a new password reset link.
                        </p>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <Link
                            to="/forgot-password"
                            className="auth-submit"
                            style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
                        >
                            Request New Reset Link
                        </Link>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="auth-page">
            <div className="auth-card">
                <div className="auth-card__header">
                    <p className="auth-card__brand">SecurePay</p>
                    <h1>Set new password</h1>
                    <p className="auth-card__description">
                        Create a strong password for your SecurePay account.
                    </p>
                </div>

                {isSuccess ? (
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
                            Password Reset Complete
                        </h3>

                        <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.5, marginBottom: '24px' }}>
                            Your password has been securely updated. You can now log in to your account with your new credentials.
                        </p>

                        <Link
                            to="/login"
                            className="auth-submit"
                            style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
                        >
                            Continue to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} noValidate>
                        {error && (
                            <div style={{
                                padding: '10px 14px',
                                borderRadius: '8px',
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                color: '#b91c1c',
                                fontSize: '13px',
                                marginBottom: '16px'
                            }} role="alert">
                                {error}
                            </div>
                        )}

                        <div className="form-field">
                            <label htmlFor="newPassword">New Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => {
                                        setNewPassword(e.target.value)
                                        setError('')
                                    }}
                                    placeholder="At least 8 characters"
                                    disabled={isSubmitting}
                                    style={{ paddingRight: '40px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#64748b',
                                        fontSize: '12px'
                                    }}
                                >
                                    {showNewPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        <div className="form-field">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value)
                                        setError('')
                                    }}
                                    placeholder="Re-enter password"
                                    disabled={isSubmitting}
                                    style={{ paddingRight: '40px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#64748b',
                                        fontSize: '12px'
                                    }}
                                >
                                    {showConfirmPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Updating Password...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                {!isSuccess && (
                    <p className="auth-card__footer">
                        Remember your credentials?{' '}
                        <Link to="/login">Back to login</Link>
                    </p>
                )}
            </div>
        </section>
    )
}

export default ResetPasswordPage
