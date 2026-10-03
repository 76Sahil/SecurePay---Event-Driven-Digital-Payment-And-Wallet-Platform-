import type {
    Card,
    CardManagementAction,
    CardManagementResponse,
} from '../types/card'

export async function getCards(): Promise<Card[]> {
    return Promise.resolve([])
}

export async function getCardById(
    _cardId: string,
): Promise<Card | null> {
    return Promise.resolve(null)
}

export async function manageCard(
    cardId: string,
    action: CardManagementAction,
): Promise<CardManagementResponse> {
    return Promise.resolve({
        cardId,
        status: action === 'BLOCK' ? 'BLOCKED' : 'ACTIVE',
        action,
    })
}

export async function addCard(
    _cardholderName: string,
    _cardNumber: string,
    _expiryMonth: number,
    _expiryYear: number,
    _type: Card['type'],
): Promise<Card> {
    throw new Error('Card issuing and management is currently not supported in SecurePay.')
}