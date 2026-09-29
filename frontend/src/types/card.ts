export type CardType =
    | 'VIRTUAL'
    | 'PHYSICAL'
    | 'DEBIT'
    | 'CREDIT'

export type CardStatus =
    | 'ACTIVE'
    | 'BLOCKED'
    | 'EXPIRED'
    | 'PENDING'

export type Card = {
    id: string
    maskedNumber: string
    cardholderName: string
    type: CardType
    status: CardStatus
    expiryMonth: number
    expiryYear: number
    currency: string
}