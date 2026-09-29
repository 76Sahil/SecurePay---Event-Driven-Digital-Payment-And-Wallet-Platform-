export type MerchantPaymentStatus =
    | 'SUCCESS'
    | 'PENDING'
    | 'FAILED'
    | 'REFUNDED'

export type MerchantPaymentSummary = {
    id: string
    reference: string
    customerName: string
    amount: number
    status: MerchantPaymentStatus
    createdAt: string
}

export type MerchantDashboardSummary = {
    currency: string
    totalRevenue: number
    successfulPayments: number
    pendingPayments: number
    refunds: number
    recentPayments: MerchantPaymentSummary[]
}