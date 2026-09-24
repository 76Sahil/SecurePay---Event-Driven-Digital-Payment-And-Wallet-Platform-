import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

type RegisterFormData = {
    fullName: string
    email: string
    password: string
    confirmPassword: string
}

function RegisterPage() {
    const [formData, setFormData] = useState<RegisterFormData>({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    })

    const [errors, setErrors] = useState<string[]>([])
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

    function validateForm(): string[] {
        const validationErrors: string[] = []

        if (!formData.fullName.trim()) {
            validationErrors.push('Full name is required.')
        }

        if (!formData.email.trim()) {
            validationErrors.push('Email is required.')
        }

        if (!formData.password) {
            validationErrors.push('Password is required.')
        }

        if (!formData.confirmPassword) {
            validationErrors.push('Please confirm your password.')
        }

        if (
            formData.password &&
            formData.confirmPassword &&
            formData.password !== formData.confirmPassword
        ) {
            validationErrors.push('Passwords do not match.')
        }

        return validationErrors
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const validationErrors = validateForm()

        setErrors(validationErrors)

        if (validationErrors.length > 0) {
            return
        }

        setIsSubmitting(true)

        // Backend registration will be connected later.
        setTimeout(() => {
            setIsSubmitting(false)
        }, 500)
    }

    return (
        <section>
            <h1>Create your SecurePay account</h1>

            <form onSubmit={handleSubmit} noValidate>
                <div>
                    <label htmlFor="fullName">Full name</label>
                    <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={handleChange}
                        autoComplete="name"
                    />
                </div>

                <div>
                    <label htmlFor="email">Email address</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                    />
                </div>

                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                    />
                </div>

                <div>
                    <label htmlFor="confirmPassword">Confirm password</label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                    />
                </div>

                {errors.length > 0 && (
                    <div role="alert">
                        {errors.map((error) => (
                            <p key={error}>{error}</p>
                        ))}
                    </div>
                )}

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating account...' : 'Create account'}
                </button>
            </form>
        </section>
    )
}

export default RegisterPage