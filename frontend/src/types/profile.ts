export type CustomerProfile = {
    id: string
    fullName: string
    email: string
    phone: string
    accountType: 'CUSTOMER'
    memberSince: string
    mfaEnabled: boolean
    trustedDevices: number
    accountStatus: 'ACTIVE' | 'LOCKED'
}