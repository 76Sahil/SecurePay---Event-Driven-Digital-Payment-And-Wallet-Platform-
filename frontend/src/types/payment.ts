export type PaymentStatus =
    | 'CREATED'
    | 'PENDING'
    | 'PROCESSING'
    | 'SUCCESS'
    | 'FAILED'
    | 'CANCELLED'

export type PaymentInitiationRequest = {
    amount: number
    currency: string
}

export type PaymentInitiationResponse = {
    paymentId: string
    reference: string
    amount: number
    currency: string
    status: PaymentStatus
}