
export type CustomerProfile = {
    id: string
    fullName: string
    email: string
    phone: string | null
    accountType: 'CUSTOMER' | 'MERCHANT'
    memberSince: string
    mfaEnabled: boolean | null
    trustedDevices: number | null
    accountStatus: 'ACTIVE' | 'LOCKED'
}