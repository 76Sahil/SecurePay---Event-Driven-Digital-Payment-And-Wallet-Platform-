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

    const [showPassword, setShowPassword] = useState(false)
    const [errors, setErrors] = useState<LoginFormErrors>({})
    const [serverError, setServerError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

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

        setServerError('')
    }

    function validateForm(): LoginFormErrors {
        const validationErrors: LoginFormErrors = {}

        if (!formData.email.trim()) {
            validationErrors.email = 'Email or username is required.'
        } else if (
            formData.email.includes('@') &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        ) {
            validationErrors.email = 'Please enter a valid email address.'
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
                        'Invalid email or password. Please verify your credentials and try again.',
                    )
                }

                if (result.error === 'unauthorized_client') {
                    throw new Error(
                        'Direct access grant is not enabled for this client in Keycloak.',
                    )
                }

                throw new Error(
                    result.error_description ||
                    'Login failed. Please verify your credentials.',
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
                    ? 'Unable to connect to Keycloak authentication server. Please ensure Keycloak is running.'
                    : error instanceof Error
                        ? error.message
                        : 'An unexpected error occurred during sign in.',
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section className="sp-auth-container">
            <div className="sp-card sp-auth-card">
                <div className="sp-auth-header">
                    <div className="sp-auth-logo">
                        <span>S</span>
                    </div>
                    <span className="sp-badge sp-badge-neutral">SecurePay Platform</span>
                    <h1 className="sp-auth-title">Welcome Back</h1>
                    <p className="sp-auth-subtitle">
                        Sign in to securely access your digital wallet, payments, and account services.
                    </p>
                </div>

                {serverError && (
                    <div className="sp-alert sp-alert-error" role="alert" style={{ marginBottom: '20px' }}>
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="sp-form-group">
                        <label htmlFor="login-email" className="sp-form-label">
                            Email or Username <span style={{ color: '#d93025' }}>*</span>
                        </label>
                        <input
                            id="login-email"
                            name="email"
                            type="text"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="username"
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

                    <div className="sp-form-group" style={{ marginTop: '18px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label htmlFor="login-password" className="sp-form-label" style={{ margin: 0 }}>
                                Password <span style={{ color: '#d93025' }}>*</span>
                            </label>
                            <Link to="/forgot-password" className="sp-form-link" style={{ fontSize: '13px' }}>
                                Forgot password?
                            </Link>
                        </div>
                        <div className="sp-password-input-wrapper">
                            <input
                                id="login-password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="current-password"
                                placeholder="••••••••"
                                className="sp-form-input"
                                aria-invalid={Boolean(errors.password)}
                                disabled={isSubmitting}
                            />
                            <button
                                type="button"
                                className="sp-password-toggle-btn"
                                onClick={() => setShowPassword((prev) => !prev)}
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

                    <div style={{ marginTop: '26px' }}>
                        <button
                            type="submit"
                            className="sp-btn sp-btn-primary sp-btn-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="sp-spinner-icon" /> Signing in...
                                </span>
                            ) : (
                                'Sign In →'
                            )}
                        </button>
                    </div>
                </form>

                <div className="sp-auth-footer" style={{ marginTop: '24px', textAlign: 'center' }}>
                    <p style={{ margin: 0, color: '#60708a', fontSize: '14px' }}>
                        Don't have an account yet?{' '}
                        <Link to="/register" style={{ color: '#1a56db', fontWeight: 600 }}>
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    )
}

export default LoginPage