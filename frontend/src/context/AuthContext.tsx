
import { createContext } from 'react'

export type UserRole = 'CUSTOMER' | 'MERCHANT' | 'ADMIN'

export type AuthUser = {
    id: string
    fullName: string
    email: string
    role: UserRole
}

export type AuthContextValue = {
    isAuthenticated: boolean
    isLoading: boolean
    user: AuthUser | null
    accessToken: string | null
    login: (user: AuthUser, accessToken: string) => void
    logout: () => void
}

export const AuthContext = createContext<
    AuthContextValue | undefined
>(undefined)