export type MerchantRefundStatus =
    | 'SUCCESS'
    | 'PENDING'
    | 'FAILED'

export type MerchantRefund = {
    id: string
    reference: string
    paymentReference: string
    customerName: string
    amount: number
    currency: string
    reason: string
    status: MerchantRefundStatus
    createdAt: string
}