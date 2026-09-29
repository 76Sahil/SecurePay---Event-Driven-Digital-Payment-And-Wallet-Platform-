import type { Card } from '../types/card'

const mockCards: Card[] = [
    {
        id: 'card-demo-001',
        maskedNumber: '•••• •••• •••• 4821',
        cardholderName: 'Sahil Paliwal',
        type: 'DEBIT',
        status: 'ACTIVE',
        expiryMonth: 12,
        expiryYear: 2029,
        currency: 'INR',
    },
    {
        id: 'card-demo-002',
        maskedNumber: '•••• •••• •••• 1937',
        cardholderName: 'Sahil Paliwal',
        type: 'DEBIT',
        status: 'BLOCKED',
        expiryMonth: 8,
        expiryYear: 2028,
        currency: 'INR',
    },
]

export async function getCards(): Promise<Card[]> {
    return Promise.resolve(mockCards)
}

export async function getCardById(
    cardId: string,
): Promise<Card | null> {
    const card = mockCards.find((item) => item.id === cardId)

    return Promise.resolve(card ?? null)
}