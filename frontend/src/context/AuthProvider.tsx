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
    const [isLoading] = useState(false)

    const login = (authenticatedUser: AuthUser) => {
        setUser(authenticatedUser)
    }

    const logout = () => {
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