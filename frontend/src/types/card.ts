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

export type CardManagementAction =
    | 'BLOCK'
    | 'UNBLOCK'

export type CardManagementResponse = {
    cardId: string
    status: CardStatus
    action: CardManagementAction
}

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