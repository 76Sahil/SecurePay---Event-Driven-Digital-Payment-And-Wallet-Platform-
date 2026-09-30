export type AdminUserRole = 'CUSTOMER' | 'MERCHANT' | 'ADMIN'

export type AdminUserAccountStatus =
    | 'ACTIVE'
    | 'LOCKED'
    | 'SUSPENDED'

export type AdminUserVerificationStatus =
    | 'VERIFIED'
    | 'PENDING'
    | 'NOT_REQUIRED'

export type AdminUser = {
    id: string
    name: string
    email: string
    role: AdminUserRole
    accountStatus: AdminUserAccountStatus
    verificationStatus: AdminUserVerificationStatus
    lastLoginAt: string
    createdAt: string
}