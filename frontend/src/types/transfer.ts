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
    beneficiaryId: string
    amount: number
    currency: string
    note?: string
}

export type TransferInitiationResponse = {
    transactionId: string
    reference: string
    beneficiaryId: string
    amount: number
    currency: string
    status: TransferStatus
}