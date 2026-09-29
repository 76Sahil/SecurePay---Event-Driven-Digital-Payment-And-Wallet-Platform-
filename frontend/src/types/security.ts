export type SecurityStatus =
    | 'SECURE'
    | 'ATTENTION_REQUIRED'

export type MfaStatus =
    | 'ENABLED'
    | 'DISABLED'

export type SecurityActivityType =
    | 'LOGIN_SUCCESS'
    | 'LOGIN_FAILED'
    | 'NEW_DEVICE'
    | 'PASSWORD_CHANGED'
    | 'MFA_ENABLED'
    | 'MFA_DISABLED'

export type SecurityActivityStatus =
    | 'SUCCESS'
    | 'FAILED'
    | 'WARNING'

export type SecurityActivity = {
    id: string
    type: SecurityActivityType
    status: SecurityActivityStatus
    title: string
    description: string
    createdAt: string
    deviceName?: string
    location?: string
}

export type TrustedDeviceStatus =
    | 'TRUSTED'
    | 'CURRENT'
    | 'REVOKED'

export type TrustedDevice = {
    id: string
    name: string
    type: string
    browser: string
    location: string
    lastActiveAt: string
    status: TrustedDeviceStatus
}

export type SecurityOverview = {
    status: SecurityStatus
    securityScore: number
    mfaStatus: MfaStatus
    trustedDeviceCount: number
    recentActivityCount: number
}