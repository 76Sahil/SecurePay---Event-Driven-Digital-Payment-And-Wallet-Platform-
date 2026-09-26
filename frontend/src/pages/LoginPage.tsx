import { Link } from 'react-router'
import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

type LoginFormData = {
    email: string
    password: string
}

type LoginFormErrors = {
    email?: string
    password?: string
}

function LoginPage() {
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
    })

    const [errors, setErrors] = useState<LoginFormErrors>({})
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

    function validateForm(): LoginFormErrors {
        const validationErrors: LoginFormErrors = {}

        if (!formData.email.trim()) {
            validationErrors.email = 'Email is required.'
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        ) {
            validationErrors.email =
                'Please enter a valid email address.'
        }

        if (!formData.password) {
            validationErrors.password = 'Password is required.'
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

        // Real authentication will be connected later.
        setTimeout(() => {
            setIsSubmitting(false)
        }, 500)
    }

    return (
        <section className="auth-page">
            <div className="auth-card">
                <div className="auth-card__header">
                    <p className="auth-card__brand">SecurePay</p>

                    <h1>Welcome back</h1>

                    <p className="auth-card__description">
                        Sign in to securely access your SecurePay account.
                    </p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
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
                                    ? 'login-email-error'
                                    : undefined
                            }
                        />

                        {errors.email && (
                            <p
                                id="login-email-error"
                                role="alert"
                            >
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div className="form-field">
                        <div className="form-field__label-row">
                            <label htmlFor="password">
                                Password
                            </label>

                            <Link
                                to="/forgot-password"
                                className="form-field__link"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                            aria-invalid={Boolean(errors.password)}
                            aria-describedby={
                                errors.password
                                    ? 'login-password-error'
                                    : undefined
                            }
                        />

                        {errors.password && (
                            <p
                                id="login-password-error"
                                role="alert"
                            >
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? 'Signing in...'
                            : 'Sign in'}
                    </button>
                </form>

                <p className="auth-card__footer">
                    Don't have an account?{' '}
                    <Link to="/register">Create an account</Link>
                </p>
            </div>
        </section>
    )
}

export default LoginPage