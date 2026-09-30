export type MerchantProfile = {
    id: string
    businessName: string
    legalName: string
    email: string
    phone: string
    merchantType: 'BUSINESS'
    memberSince: string
    accountStatus: 'ACTIVE' | 'SUSPENDED'
    verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED'
    settlementCurrency: string
}