import { Link } from 'react-router'
import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

type RegisterFormData = {
    fullName: string
    email: string
    password: string
    confirmPassword: string
}

type RegisterFormErrors = {
    fullName?: string
    email?: string
    password?: string
    confirmPassword?: string
}

function RegisterPage() {
    const [formData, setFormData] = useState<RegisterFormData>({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    })

    const [errors, setErrors] = useState<RegisterFormErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    function handleChange(
        event: ChangeEvent<HTMLInputElement>,
    ) {
        const { name, value } = event.target

        setFormData((current) => ({
            ...current,
            [name]: value,
        }))
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
            validationErrors.password =
                'Password must be at least 8 characters.'
        }

        if (!formData.confirmPassword) {
            validationErrors.confirmPassword =
                'Please confirm your password.'
        }

        if (
            formData.password &&
            formData.confirmPassword &&
            formData.password !== formData.confirmPassword
        ) {
            validationErrors.confirmPassword =
                'Passwords do not match.'
        }

        return validationErrors
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const validationErrors = validateForm()

        setErrors(validationErrors)

        if (Object.keys(validationErrors).length > 0) {
            return
        }

        setIsSubmitting(true)

        // Backend registration will be connected later.
        setTimeout(() => {
            setIsSubmitting(false)
        }, 500)
    }

    return (
        <section className="auth-page">
            <div className="auth-card">
                <div className="auth-card__header">
                    <p className="auth-card__brand">SecurePay</p>

                    <h1>Create your SecurePay account</h1>

                    <p className="auth-card__description">
                        Create your account to securely manage payments
                        and your wallet.
                    </p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-field">
                        <label htmlFor="fullName">Full name</label>

                        <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            value={formData.fullName}
                            onChange={handleChange}
                            autoComplete="name"
                            aria-invalid={Boolean(errors.fullName)}
                            aria-describedby={
                                errors.fullName
                                    ? 'fullName-error'
                                    : undefined
                            }
                        />

                        {errors.fullName && (
                            <p id="fullName-error" role="alert">
                                {errors.fullName}
                            </p>
                        )}
                    </div>

                    <div className="form-field">
                        <label htmlFor="email">Email address</label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                            aria-invalid={Boolean(errors.email)}
                            aria-describedby={
                                errors.email
                                    ? 'email-error'
                                    : undefined
                            }
                        />

                        {errors.email && (
                            <p id="email-error" role="alert">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div className="form-field">
                        <label htmlFor="password">Password</label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="new-password"
                            aria-invalid={Boolean(errors.password)}
                            aria-describedby={
                                errors.password
                                    ? 'password-error'
                                    : undefined
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
                            aria-invalid={Boolean(
                                errors.confirmPassword,
                            )}
                            aria-describedby={
                                errors.confirmPassword
                                    ? 'confirmPassword-error'
                                    : undefined
                            }
                        />

                        {errors.confirmPassword && (
                            <p
                                id="confirmPassword-error"
                                role="alert"
                            >
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

                <p className="auth-card__footer">
                    Already have an account?{' '}
                    <Link to="/login">Log in</Link>
                </p>
            </div>
        </section>
    )
}

export default RegisterPage