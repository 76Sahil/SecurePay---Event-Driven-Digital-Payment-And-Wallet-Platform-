import type {
    Card,
    CardManagementAction,
    CardManagementResponse,
} from '../types/card'

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

export async function manageCard(
    cardId: string,
    action: CardManagementAction,
): Promise<CardManagementResponse> {
    const card = mockCards.find((item) => item.id === cardId)

    if (!card) {
        throw new Error('Card not found.')
    }

    if (action === 'BLOCK') {
        card.status = 'BLOCKED'
    }

    if (action === 'UNBLOCK') {
        card.status = 'ACTIVE'
    }

    return Promise.resolve({
        cardId: card.id,
        status: card.status,
        action,
    })
}