export type MerchantPaymentStatus =
    | 'SUCCESS'
    | 'PENDING'
    | 'FAILED'
    | 'REFUNDED'

export type MerchantPaymentMethod =
    | 'UPI'
    | 'CARD'
    | 'NET_BANKING'
    | 'WALLET'

export type MerchantPayment = {
    id: string
    reference: string
    customerName: string
    customerEmail: string
    amount: number
    currency: string
    method: MerchantPaymentMethod
    status: MerchantPaymentStatus
    createdAt: string
}