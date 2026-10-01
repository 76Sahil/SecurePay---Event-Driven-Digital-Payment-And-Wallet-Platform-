export type MerchantRevenuePeriod = 'TODAY' | 'THIS_MONTH' | 'THIS_YEAR'

export type MerchantRevenueSummary = {
    currency: string
    totalRevenue: number
    successfulPayments: number
    pendingPayments: number
    refunds: number
    netRevenue: number
}

export type MerchantRevenueEntry = {
    id: string
    reference: string
    type: 'PAYMENT' | 'REFUND'
    amount: number
    currency: string
    status: 'SUCCESS' | 'PENDING'
    createdAt: string
}

export type MerchantRevenueData = {
    period: MerchantRevenuePeriod
    summary: MerchantRevenueSummary
    recentActivity: MerchantRevenueEntry[]
}