import type { CustomerProfile } from '../types/profile'

const mockCustomerProfile: CustomerProfile = {
    id: 'CUS-10001',
    fullName: 'Sahil Paliwal',
    email: 'customer@securepay.com',
    phone: '+91 98765 43210',
    accountType: 'CUSTOMER',
    memberSince: 'September 2026',
    mfaEnabled: true,
    trustedDevices: 2,
    accountStatus: 'ACTIVE',
}

export async function getCustomerProfile(): Promise<CustomerProfile> {
    return Promise.resolve(mockCustomerProfile)
}