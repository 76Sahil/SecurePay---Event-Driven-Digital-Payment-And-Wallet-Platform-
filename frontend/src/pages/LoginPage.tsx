
import { Link, useLocation, useNavigate } from 'react-router'
import { useContext, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { AuthContext, type UserRole } from '../context/AuthContext'
import { apiRequest } from '../services/api'

type LoginFormData = {
    email: string
    password: string
}

type LoginFormErrors = {
    email?: string
    password?: string
}

type LoginResponse = {
    id: number
    fullName: string
    email: string
    role: UserRole
    accessToken: string
    tokenType: string
    expiresIn: number
}

type NavigationState = {
    message?: string
}

function LoginPage() {
    const auth = useContext(AuthContext)
    const navigate = useNavigate()
    const location = useLocation()

    const navigationState = location.state as NavigationState | null
    const registrationMessage = navigationState?.message

    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
    })

    const [errors, setErrors] = useState<LoginFormErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [apiError, setApiError] = useState('')

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
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

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const validationErrors = validateForm()
        setErrors(validationErrors)
        setApiError('')

        if (Object.keys(validationErrors).length > 0) {
            return
        }

        if (!auth) {
            setApiError('Authentication is unavailable. Please refresh the page.')
            return
        }

        setIsSubmitting(true)

        try {
            const response = await apiRequest<LoginResponse>(
                '/auth/login',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        email: formData.email.trim(),
                        password: formData.password,
                    }),
                },
            )

            auth.login(
                {
                    id: String(response.id),
                    fullName: response.fullName,
                    email: response.email,
                    role: response.role,
                },
                response.accessToken,
            )

            const dashboardByRole: Record<UserRole, string> = {
                CUSTOMER: '/customer',
                MERCHANT: '/merchant',
                ADMIN: '/admin',
            }

            navigate(dashboardByRole[response.role], {
                replace: true,
            })
        } catch (error) {
            setApiError(
                error instanceof Error
                    ? error.message
                    : 'Login failed. Please check your credentials and try again.',
            )
        } finally {
            setIsSubmitting(false)
        }
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

                {registrationMessage && (
                    <p role="status" className="form-success">
                        {registrationMessage}
                    </p>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    {apiError && (
                        <p role="alert" className="form-error">
                            {apiError}
                        </p>
                    )}

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
                            <p id="login-email-error" role="alert">
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
                            <p id="login-password-error" role="alert">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Signing in...' : 'Sign in'}
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