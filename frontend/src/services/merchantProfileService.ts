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

const API_BASE_URL = 'http://localhost:8080'

export async function getMerchantProfile(): Promise<MerchantProfile> {
    const token = sessionStorage.getItem('securepay_access_token')
    if (!token) {
        return Promise.resolve(mockMerchantProfile)
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/merchant/profile`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })

        if (response.ok) {
            return await response.json()
        }
    } catch {
        // Fallback to mock profile for offline / demo viewing
    }

    return Promise.resolve(mockMerchantProfile)
}