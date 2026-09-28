import { createContext } from 'react'

export type UserRole = 'CUSTOMER' | 'MERCHANT' | 'ADMIN'

export type AuthUser = {
    id: string
    email: string
    role: UserRole
}

export type AuthContextValue = {
    isAuthenticated: boolean
    isLoading: boolean
    user: AuthUser | null
    login: (user: AuthUser) => void
    logout: () => void
}

export const AuthContext = createContext<
    AuthContextValue | undefined
>(undefined)