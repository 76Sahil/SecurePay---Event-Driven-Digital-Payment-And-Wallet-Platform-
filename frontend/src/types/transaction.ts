export type TransactionType =
    | 'TOP_UP'
    | 'TRANSFER'
    | 'REFUND'

export type TransactionStatus =
    | 'PENDING'
    | 'SUCCESS'
    | 'FAILED'
    | 'CANCELLED'

export type Transaction = {
    id: string
    reference: string
    type: TransactionType
    amount: number
    currency: string
    status: TransactionStatus
    createdAt: string
    description: string
}