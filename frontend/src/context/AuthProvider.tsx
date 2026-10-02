
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
    AuthContext,
    type AuthContextValue,
    type AuthUser,
    type UserRole,
} from './AuthContext'

type AuthProviderProps = {
    children: ReactNode
}

type TokenClaims = {
    sub?: string
    email?: string
    preferred_username?: string
    exp?: number
    realm_access?: {
        roles?: string[]
    }
}

function getUserFromToken(token: string): AuthUser | null {
    try {
        const parts = token.split('.')

        if (parts.length !== 3) {
            return null
        }

        const payload = parts[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/')

        const claims = JSON.parse(
            window.atob(
                payload.padEnd(
                    Math.ceil(payload.length / 4) * 4,
                    '=',
                ),
            ),
        ) as TokenClaims

        if (!claims.sub || !claims.exp || claims.exp <= Date.now() / 1000) {
            return null
        }

        const roles = claims.realm_access?.roles ?? []

        let role: UserRole = 'CUSTOMER'

        if (roles.includes('ADMIN')) {
            role = 'ADMIN'
        } else if (roles.includes('MERCHANT')) {
            role = 'MERCHANT'
        }

        const email = (
            claims.email ||
            claims.preferred_username ||
            ''
        ).trim().toLowerCase()

        if (!email) {
            return null
        }

        return {
            id: claims.sub,
            email,
            role,
        }
    } catch {
        return null
    }
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const token = sessionStorage.getItem('securepay_access_token')

        if (token) {
            const restoredUser = getUserFromToken(token)

            if (restoredUser) {
                setUser(restoredUser)
            } else {
                sessionStorage.removeItem('securepay_access_token')
                sessionStorage.removeItem('securepay_refresh_token')
            }
        }

        setIsLoading(false)
    }, [])

    const login = (authenticatedUser: AuthUser) => {
        setUser(authenticatedUser)
    }

    const logout = () => {
        sessionStorage.removeItem('securepay_access_token')
        sessionStorage.removeItem('securepay_refresh_token')
        setUser(null)
    }

    const value: AuthContextValue = {
        isAuthenticated: user !== null,
        isLoading,
        user,
        login,
        logout,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}