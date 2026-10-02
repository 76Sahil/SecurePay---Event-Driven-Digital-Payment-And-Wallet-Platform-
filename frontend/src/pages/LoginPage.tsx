
import { Link, useNavigate } from 'react-router'
import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useAuth } from '../context/useAuth'

type LoginFormData = {
    email: string
    password: string
}

type LoginFormErrors = {
    email?: string
    password?: string
}

type UserRole = 'CUSTOMER' | 'MERCHANT' | 'ADMIN'

type KeycloakTokenResponse = {
    access_token: string
    refresh_token?: string
    expires_in: number
    token_type: string
}

type KeycloakTokenClaims = {
    sub?: string
    email?: string
    preferred_username?: string
    realm_access?: {
        roles?: string[]
    }
}

function LoginPage() {
    const navigate = useNavigate()
    const { login } = useAuth()

    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
    })

    const [errors, setErrors] = useState<LoginFormErrors>({})
    const [serverError, setServerError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target

        setFormData((current) => ({
            ...current,
            [name]: value,
        }))

        setServerError('')
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

    function getUserRole(claims: KeycloakTokenClaims): UserRole {
        const roles = claims.realm_access?.roles ?? []

        if (roles.includes('ADMIN')) {
            return 'ADMIN'
        }

        if (roles.includes('MERCHANT')) {
            return 'MERCHANT'
        }

        return 'CUSTOMER'
    }

    function getPortalPath(role: UserRole): string {
        switch (role) {
            case 'ADMIN':
                return '/admin'
            case 'MERCHANT':
                return '/merchant'
            default:
                return '/customer'
        }
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const validationErrors = validateForm()
        setErrors(validationErrors)
        setServerError('')

        if (Object.keys(validationErrors).length > 0) {
            return
        }

        setIsSubmitting(true)

        try {
            const body = new URLSearchParams({
                grant_type: 'password',
                client_id: 'securepay-frontend',
                username: formData.email.trim(),
                password: formData.password,
                scope: 'openid profile email',
            })

            const response = await fetch(
                'http://localhost:8082/realms/securepay/protocol/openid-connect/token',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body,
                },
            )

            const result = await response.json()

            if (!response.ok) {
                if (result.error === 'invalid_grant') {
                    throw new Error(
                        'Invalid email or password. Please check your credentials and try again.',
                    )
                }

                if (result.error === 'unauthorized_client') {
                    throw new Error(
                        'Keycloak login is not enabled for this client. Please check the client settings.',
                    )
                }

                throw new Error(
                    result.error_description ||
                    'Login failed. Please try again.',
                )
            }

            const tokenData = result as KeycloakTokenResponse

            if (!tokenData.access_token) {
                throw new Error('Keycloak did not return an access token.')
            }

            const payload = tokenData.access_token.split('.')[1]

            if (!payload) {
                throw new Error('Invalid authentication token received.')
            }

            const normalizedPayload = payload
                .replace(/-/g, '+')
                .replace(/_/g, '/')

            const decodedClaims = JSON.parse(
                window.atob(
                    normalizedPayload.padEnd(
                        Math.ceil(normalizedPayload.length / 4) * 4,
                        '=',
                    ),
                ),
            ) as KeycloakTokenClaims

            const email = (
                decodedClaims.email ||
                decodedClaims.preferred_username ||
                formData.email
            ).trim().toLowerCase()

            const role = getUserRole(decodedClaims)

            sessionStorage.setItem(
                'securepay_access_token',
                tokenData.access_token,
            )

            if (tokenData.refresh_token) {
                sessionStorage.setItem(
                    'securepay_refresh_token',
                    tokenData.refresh_token,
                )
            }

            login({
                id: decodedClaims.sub || email,
                email,
                role,
            })

            navigate(getPortalPath(role))
        } catch (error) {
            setServerError(
                error instanceof TypeError
                    ? 'Unable to connect to Keycloak. Make sure Keycloak is running and the client allows requests from this frontend.'
                    : error instanceof Error
                        ? error.message
                        : 'An unexpected error occurred during login.',
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
                                errors.email ? 'login-email-error' : undefined
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
                            <label htmlFor="password">Password</label>

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

                    {serverError && (
                        <p role="alert" className="auth-error">
                            {serverError}
                        </p>
                    )}

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