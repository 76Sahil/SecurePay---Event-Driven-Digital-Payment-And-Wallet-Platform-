
import type { Wallet } from '../types'

const API_BASE_URL = 'http://localhost:8080'

export async function getMyWallet(): Promise<Wallet> {
    const token = sessionStorage.getItem('securepay_access_token')

    if (!token) {
        throw new Error('Please log in to view your wallet.')
    }

    const response = await fetch(`${API_BASE_URL}/api/wallet/me`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Your session has expired. Please log in again.')
        }

        const errorBody = await response.json().catch(() => null)

        throw new Error(
            errorBody?.message || 'Unable to load your wallet.',
        )
    }

    const data = await response.json()

    return {
        id: String(data.id),
        userId: String(data.userId),
        balance: Number(data.balance),
        currency: String(data.currency),
        status: data.status,
    }
}