
import { useState } from 'react'
import type { ReactNode } from 'react'
import {
    AuthContext,
    type AuthContextValue,
    type AuthUser,
} from './AuthContext'

type AuthProviderProps = {
    children: ReactNode
}

export function AuthProvider({
                                 children,
                             }: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [accessToken, setAccessToken] = useState<string | null>(
        null,
    )
    const [isLoading] = useState(false)

    const login = (
        authenticatedUser: AuthUser,
        token: string,
    ) => {
        setUser(authenticatedUser)
        setAccessToken(token)
    }

    const logout = () => {
        setUser(null)
        setAccessToken(null)
    }

    const value: AuthContextValue = {
        isAuthenticated: user !== null && accessToken !== null,
        isLoading,
        user,
        accessToken,
        login,
        logout,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}