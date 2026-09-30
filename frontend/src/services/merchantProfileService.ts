import type { MerchantProfile } from '../types/merchantProfile'

const mockMerchantProfile: MerchantProfile = {
    id: 'MER-10001',
    businessName: 'SecurePay Demo Store',
    legalName: 'SecurePay Demo Store Pvt. Ltd.',
    email: 'merchant@securepay.com',
    phone: '+91 98765 43210',
    merchantType: 'BUSINESS',
    memberSince: 'September 2026',
    accountStatus: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    settlementCurrency: 'INR',
}

export async function getMerchantProfile(): Promise<MerchantProfile> {
    return Promise.resolve(mockMerchantProfile)
}