
export type TransferStatus =
    | 'CREATED'
    | 'PENDING'
    | 'PROCESSING'
    | 'SUCCESS'
    | 'FAILED'
    | 'CANCELLED'
    | 'REVIEW'
    | 'BLOCKED'

export type TransferInitiationRequest = {
    recipientEmail: string
    amount: number
}

export type TransferInitiationResponse = {
    reference?: string
    transactionId: string | number
    recipientTransactionId?: string | number
    recipientName?: string
    recipientEmail?: string
    amount: number
    currency: string
    status: TransferStatus
    senderBalance?: number
    recipientBalance?: number
    message?: string
}