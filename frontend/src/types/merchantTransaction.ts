export type MerchantTransactionType =
    | 'PAYMENT'
    | 'REFUND'
    | 'PAYOUT'

export type MerchantTransactionStatus =
    | 'SUCCESS'
    | 'PENDING'
    | 'FAILED'
    | 'REVERSED'

export type MerchantTransaction = {
    id: string
    reference: string
    customerName: string
    type: MerchantTransactionType
    amount: number
    currency: string
    status: MerchantTransactionStatus
    createdAt: string
}