export type TransactionType =
    | 'TOP_UP'
    | 'TRANSFER'
    | 'REFUND'

export type TransactionStatus =
    | 'PENDING'
    | 'PROCESSING'
    | 'SUCCESS'
    | 'FAILED'
    | 'CANCELLED'
    | 'REVIEW'
    | 'BLOCKED'

export type TransactionDirection =
    | 'CREDIT'
    | 'DEBIT'

export type Transaction = {
    id: string
    reference: string

    type: TransactionType
    direction: TransactionDirection
    status: TransactionStatus

    amount: number
    currency: string

    description: string

    beneficiaryId?: string
    beneficiaryName?: string

    paymentId?: string

    createdAt: string
    updatedAt?: string
}