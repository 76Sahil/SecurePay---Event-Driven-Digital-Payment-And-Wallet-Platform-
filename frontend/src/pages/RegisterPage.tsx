import { Link, useSearchParams } from 'react-router'
import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

type RegisterRole = 'CUSTOMER' | 'MERCHANT'

type RegisterFormData = {
    fullName: string
    email: string
    password: string
    confirmPassword: string
    role: RegisterRole | ''
}

type RegisterFormErrors = {
    fullName?: string
    email?: string
    password?: string
    confirmPassword?: string
    role?: string
}

function RegisterPage() {
    const [searchParams] = useSearchParams()
    const initialRole: RegisterRole = searchParams.get('role')?.toUpperCase() === 'MERCHANT' ? 'MERCHANT' : 'CUSTOMER'

    const [formData, setFormData] = useState<RegisterFormData>({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: initialRole,
    })

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [errors, setErrors] = useState<RegisterFormErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [serverMessage, setServerMessage] = useState('')
    const [isSuccess, setIsSuccess] = useState(false)

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target

        setFormData((current) => ({
            ...current,
            [name]: value,
        }))

        setErrors((current) => ({
            ...current,
            [name]: undefined,
        }))

        setServerMessage('')
    }

    function handleRoleSelect(role: RegisterRole) {
        setFormData((current) => ({
            ...current,
            role,
        }))

        setErrors((current) => ({
            ...current,
            role: undefined,
        }))

        setServerMessage('')
    }

    function validateForm(): RegisterFormErrors {
        const validationErrors: RegisterFormErrors = {}

        if (!formData.fullName.trim()) {
            validationErrors.fullName = 'Full name is required.'
        }

        if (!formData.email.trim()) {
            validationErrors.email = 'Email address is required.'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            validationErrors.email = 'Please enter a valid email address.'
        }

        if (!formData.password) {
            validationErrors.password = 'Password is required.'
        } else if (formData.password.length < 8) {
            validationErrors.password = 'Password must be at least 8 characters long.'
        }

        if (!formData.confirmPassword) {
            validationErrors.confirmPassword = 'Please confirm your password.'
        } else if (formData.password !== formData.confirmPassword) {
            validationErrors.confirmPassword = 'Passwords do not match.'
        }

        if (!formData.role) {
            validationErrors.role = 'Please select an account type.'
        }

        return validationErrors
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setServerMessage('')
        setIsSuccess(false)

        const validationErrors = validateForm()
        setErrors(validationErrors)

        if (Object.keys(validationErrors).length > 0) {
            return
        }

        setIsSubmitting(true)

        try {
            const response = await fetch(
                'http://localhost:8080/api/auth/register',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        fullName: formData.fullName.trim(),
                        email: formData.email.trim().toLowerCase(),
                        accountType: formData.role,
                        password: formData.password,
                    }),
                },
            )

            const responseText = await response.text()
            let data: { message?: string } = {}

            try {
                data = responseText ? JSON.parse(responseText) : {}
            } catch {
                data = {}
            }

            if (!response.ok) {
                if (response.status === 409) {
                    throw new Error('An account with this email address already exists.')
                }

                throw new Error(
                    data.message ||
                    `Registration failed (${response.status}). Please check your input and try again.`,
                )
            }

            setIsSuccess(true)
            setServerMessage(
                data.message ||
                'Your SecurePay account has been registered successfully.',
            )

            setFormData({
                fullName: '',
                email: '',
                password: '',
                confirmPassword: '',
                role: 'CUSTOMER',
            })
            setErrors({})
        } catch (error) {
            setIsSuccess(false)
            setServerMessage(
                error instanceof TypeError
                    ? 'Unable to connect to the SecurePay backend server. Please verify the backend is running.'
                    : error instanceof Error
                        ? error.message
                        : 'Something went wrong during registration. Please try again.',
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section className="sp-auth-container">
            <div className="sp-auth-split-wrapper">
                {/* Left: SecurePay Branding and Account Benefits */}
                <div className="sp-auth-brand-col">
                    <span className="sp-auth-brand-badge">
                        <span>●</span> Instant Account Creation
                    </span>
                    <h1 className="sp-auth-brand-title">
                        Join SecurePay for enterprise-grade payments.
                    </h1>
                    <p className="sp-auth-brand-subtitle">
                        Create your account in seconds to access instant digital wallet transfers,
                        automated bill settlement, and developer-first merchant payment tools.
                    </p>

                    <ul className="sp-auth-feature-list">
                        <li className="sp-auth-feature-item">
                            <span className="sp-auth-feature-check">✓</span>
                            <span>Dedicated Customer Wallet or Merchant Gateway profile</span>
                        </li>
                        <li className="sp-auth-feature-item">
                            <span className="sp-auth-feature-check">✓</span>
                            <span>Double-entry ledger with zero-loss audit trails</span>
                        </li>
                        <li className="sp-auth-feature-item">
                            <span className="sp-auth-feature-check">✓</span>
                            <span>Real-time webhook events and developer sandbox keys</span>
                        </li>
                        <li className="sp-auth-feature-item">
                            <span className="sp-auth-feature-check">✓</span>
                            <span>End-to-end TLS encryption and Keycloak RBAC security</span>
                        </li>
                    </ul>
                </div>

                {/* Right: Registration Form Card (460-480px) */}
                <div className="sp-auth-form-col">
                    <div className="sp-auth-card sp-auth-card--wide">
                        <div style={{ marginBottom: '20px' }}>
                            <h2 className="sp-auth-card-title">
                                {formData.role === 'MERCHANT' ? 'Create Merchant Account' : 'Create Customer Account'}
                            </h2>
                            <p className="sp-auth-card-desc">
                                {formData.role === 'MERCHANT'
                                    ? 'Register your business to accept digital payments and access developer APIs.'
                                    : 'Choose your account type and fill in your details to get started.'}
                            </p>
                        </div>

                        {isSuccess ? (
                            <div className="sp-register-success-box" style={{ textAlign: 'center', padding: '16px 0' }}>
                                <div style={{ fontSize: '44px', marginBottom: '12px' }}>🎉</div>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                                    Registration Successful!
                                </h3>
                                <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
                                    {serverMessage}
                                    <br />
                                    <small style={{ color: '#64748b' }}>
                                        (You can now sign in with your credentials.)
                                    </small>
                                </p>
                                <Link to="/login" className="sp-btn-auth-submit" style={{ textDecoration: 'none' }}>
                                    Proceed to Sign In →
                                </Link>
                            </div>
                        ) : (
                            <>
                                {serverMessage && (
                                    <div className="sp-alert sp-alert-error" role="alert" style={{ marginBottom: '18px' }}>
                                        {serverMessage}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} noValidate>
                                    {/* Account Type Selector */}
                                    <div className="sp-form-group">
                                        <label className="sp-form-label">
                                            Select Account Type <span style={{ color: '#d93025' }}>*</span>
                                        </label>
                                        <div className="sp-role-select-grid">
                                            <div
                                                className={`sp-role-card ${formData.role === 'CUSTOMER' ? 'sp-role-card--active' : ''}`}
                                                onClick={() => handleRoleSelect('CUSTOMER')}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault()
                                                        handleRoleSelect('CUSTOMER')
                                                    }
                                                }}
                                            >
                                                <div className="sp-role-card__header">
                                                    <span className="sp-role-card__radio">
                                                        {formData.role === 'CUSTOMER' ? '●' : '○'}
                                                    </span>
                                                    <strong>Customer</strong>
                                                </div>
                                                <p className="sp-role-card__desc">
                                                    Personal wallet, peer transfers & bills
                                                </p>
                                            </div>

                                            <div
                                                className={`sp-role-card ${formData.role === 'MERCHANT' ? 'sp-role-card--active' : ''}`}
                                                onClick={() => handleRoleSelect('MERCHANT')}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault()
                                                        handleRoleSelect('MERCHANT')
                                                    }
                                                }}
                                            >
                                                <div className="sp-role-card__header">
                                                    <span className="sp-role-card__radio">
                                                        {formData.role === 'MERCHANT' ? '●' : '○'}
                                                    </span>
                                                    <strong>Merchant</strong>
                                                </div>
                                                <p className="sp-role-card__desc">
                                                    Checkout gateway, API keys & webhooks
                                                </p>
                                            </div>
                                        </div>
                                        {errors.role && (
                                            <p className="sp-form-error" role="alert">
                                                {errors.role}
                                            </p>
                                        )}
                                    </div>

                                    {/* Full Name */}
                                    <div className="sp-form-group" style={{ marginTop: '16px' }}>
                                        <label htmlFor="reg-fullname" className="sp-form-label">
                                            Full Name <span style={{ color: '#d93025' }}>*</span>
                                        </label>
                                        <input
                                            id="reg-fullname"
                                            name="fullName"
                                            type="text"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            autoComplete="name"
                                            placeholder="Sahil Gupta"
                                            className="sp-form-input"
                                            aria-invalid={Boolean(errors.fullName)}
                                            disabled={isSubmitting}
                                        />
                                        {errors.fullName && (
                                            <p className="sp-form-error" role="alert">
                                                {errors.fullName}
                                            </p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div className="sp-form-group" style={{ marginTop: '16px' }}>
                                        <label htmlFor="reg-email" className="sp-form-label">
                                            Email Address <span style={{ color: '#d93025' }}>*</span>
                                        </label>
                                        <input
                                            id="reg-email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            autoComplete="email"
                                            placeholder="name@example.com"
                                            className="sp-form-input"
                                            aria-invalid={Boolean(errors.email)}
                                            disabled={isSubmitting}
                                        />
                                        {errors.email && (
                                            <p className="sp-form-error" role="alert">
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    {/* Password */}
                                    <div className="sp-form-group" style={{ marginTop: '16px' }}>
                                        <label htmlFor="reg-password" className="sp-form-label">
                                            Password <span style={{ color: '#d93025' }}>*</span>
                                        </label>
                                        <div className="sp-password-input-wrapper">
                                            <input
                                                id="reg-password"
                                                name="password"
                                                type={showPassword ? 'text' : 'password'}
                                                value={formData.password}
                                                onChange={handleChange}
                                                autoComplete="new-password"
                                                placeholder="Min 8 characters"
                                                className="sp-form-input"
                                                aria-invalid={Boolean(errors.password)}
                                                disabled={isSubmitting}
                                            />
                                            <button
                                                type="button"
                                                className="sp-password-toggle-btn"
                                                onClick={() => setShowPassword((p) => !p)}
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            >
                                                {showPassword ? 'Hide' : 'Show'}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p className="sp-form-error" role="alert">
                                                {errors.password}
                                            </p>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="sp-form-group" style={{ marginTop: '16px' }}>
                                        <label htmlFor="reg-confirmpassword" className="sp-form-label">
                                            Confirm Password <span style={{ color: '#d93025' }}>*</span>
                                        </label>
                                        <div className="sp-password-input-wrapper">
                                            <input
                                                id="reg-confirmpassword"
                                                name="confirmPassword"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                autoComplete="new-password"
                                                placeholder="Repeat password"
                                                className="sp-form-input"
                                                aria-invalid={Boolean(errors.confirmPassword)}
                                                disabled={isSubmitting}
                                            />
                                            <button
                                                type="button"
                                                className="sp-password-toggle-btn"
                                                onClick={() => setShowConfirmPassword((p) => !p)}
                                                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                            >
                                                {showConfirmPassword ? 'Hide' : 'Show'}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && (
                                            <p className="sp-form-error" role="alert">
                                                {errors.confirmPassword}
                                            </p>
                                        )}
                                    </div>

                                    <div style={{ marginTop: '24px' }}>
                                        <button
                                            type="submit"
                                            className="sp-btn-auth-submit"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                                    <span className="sp-spinner-icon" /> Creating Account...
                                                </span>
                                            ) : formData.role === 'MERCHANT' ? (
                                                'Create Merchant Account →'
                                            ) : (
                                                'Create Account →'
                                            )}
                                        </button>
                                    </div>
                                </form>

                                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                        Already registered?{' '}
                                        <Link to="/login" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
                                            Sign in here
                                        </Link>
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default RegisterPage