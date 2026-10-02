
import { Link } from 'react-router'
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
    const [formData, setFormData] = useState<RegisterFormData>({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
    })

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

    function handleRoleChange(event: ChangeEvent<HTMLInputElement>) {
        const role = event.target.value as RegisterRole

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
            validationErrors.email = 'Email is required.'
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        ) {
            validationErrors.email = 'Please enter a valid email address.'
        }

        if (!formData.password) {
            validationErrors.password = 'Password is required.'
        } else if (formData.password.length < 8) {
            validationErrors.password = 'Password must be at least 8 characters.'
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
                        email: formData.email.trim(),
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
                    throw new Error('An account with this email already exists.')
                }

                throw new Error(
                    data.message ||
                    `Registration failed (${response.status}). Please try again.`,
                )
            }

            setIsSuccess(true)
            setServerMessage(
                data.message ||
                'Registration successful. Please verify your email.',
            )

            setFormData({
                fullName: '',
                email: '',
                password: '',
                confirmPassword: '',
                role: '',
            })

            setErrors({})
        } catch (error) {
            setIsSuccess(false)

            setServerMessage(
                error instanceof TypeError
                    ? 'Unable to connect to the server. Please check whether the backend is running.'
                    : error instanceof Error
                        ? error.message
                        : 'Something went wrong. Please try again.',
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section className="auth-page">
            <div className="auth-card">
                <div className="auth-card__header">
                    <p className="auth-card__brand">
                        SecurePay
                    </p>

                    <h1>
                        Create your SecurePay account
                    </h1>

                    <p className="auth-card__description">
                        Create your account to securely
                        manage payments and your wallet.
                    </p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-field">
                        <label htmlFor="fullName">
                            Full name
                        </label>

                        <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            value={formData.fullName}
                            onChange={handleChange}
                            autoComplete="name"
                            aria-invalid={Boolean(errors.fullName)}
                            aria-describedby={
                                errors.fullName ? 'fullName-error' : undefined
                            }
                        />

                        {errors.fullName && (
                            <p id="fullName-error" role="alert">
                                {errors.fullName}
                            </p>
                        )}
                    </div>

                    <div className="form-field">
                        <label htmlFor="email">
                            Email address
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                            aria-invalid={Boolean(errors.email)}
                            aria-describedby={
                                errors.email ? 'email-error' : undefined
                            }
                        />

                        {errors.email && (
                            <p id="email-error" role="alert">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div className="form-field">
                        <label>
                            Account type
                        </label>

                        <div
                            className="register-role-options"
                            role="radiogroup"
                            aria-label="Account type"
                            aria-describedby={
                                errors.role ? 'role-error' : undefined
                            }
                        >
                            <label className="register-role-option">
                                <input
                                    type="radio"
                                    name="role"
                                    value="CUSTOMER"
                                    checked={formData.role === 'CUSTOMER'}
                                    onChange={handleRoleChange}
                                />

                                <span>
                                    <strong>Customer</strong>
                                    <small>
                                        Manage your wallet, payments and transactions.
                                    </small>
                                </span>
                            </label>

                            <label className="register-role-option">
                                <input
                                    type="radio"
                                    name="role"
                                    value="MERCHANT"
                                    checked={formData.role === 'MERCHANT'}
                                    onChange={handleRoleChange}
                                />

                                <span>
                                    <strong>Merchant</strong>
                                    <small>
                                        Manage your business payments and transactions.
                                    </small>
                                </span>
                            </label>
                        </div>

                        {errors.role && (
                            <p id="role-error" role="alert">
                                {errors.role}
                            </p>
                        )}
                    </div>

                    <div className="form-field">
                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="new-password"
                            aria-invalid={Boolean(errors.password)}
                            aria-describedby={
                                errors.password ? 'password-error' : undefined
                            }
                        />

                        {errors.password && (
                            <p id="password-error" role="alert">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <div className="form-field">
                        <label htmlFor="confirmPassword">
                            Confirm password
                        </label>

                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            autoComplete="new-password"
                            aria-invalid={Boolean(errors.confirmPassword)}
                            aria-describedby={
                                errors.confirmPassword
                                    ? 'confirmPassword-error'
                                    : undefined
                            }
                        />

                        {errors.confirmPassword && (
                            <p id="confirmPassword-error" role="alert">
                                {errors.confirmPassword}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? 'Creating account...'
                            : 'Create account'}
                    </button>
                </form>

                {serverMessage && (
                    <p
                        role="status"
                        aria-live="polite"
                        style={{
                            color: isSuccess ? 'green' : 'red',
                            marginTop: '12px',
                        }}
                    >
                        {serverMessage}
                    </p>
                )}

                <p className="auth-card__footer">
                    Already have an account?{' '}
                    <Link to="/login">
                        Log in
                    </Link>
                </p>
            </div>
        </section>
    )
}

export default RegisterPage