
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
        throw new Error(errorBody?.message || 'Unable to load your wallet.')
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

export type WalletTopUpResponse = {
    transactionId: string | number
    amount: number | string
    currency: string
    status: string
    balance: number | string
    message?: string
}

export async function topUpWallet(amount: number): Promise<WalletTopUpResponse> {
    const token = sessionStorage.getItem('securepay_access_token')

    if (!token) {
        throw new Error('Please log in to top up your wallet.')
    }

    const response = await fetch(
        `${API_BASE_URL}/api/wallet/transactions/top-up`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount }),
        },
    )

    const data = await response.json().catch(() => null)

    if (!response.ok) {
        throw new Error(data?.message || 'Unable to top up your wallet.')
    }

    return data as WalletTopUpResponse
}

export async function transferWallet(
    recipientEmail: string,
    amount: number,
): Promise<void> {
    const token = sessionStorage.getItem('securepay_access_token')

    if (!token) {
        throw new Error('Please log in to transfer money.')
    }

    const response = await fetch(
        `${API_BASE_URL}/api/wallet/transactions/transfer`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                recipientEmail: recipientEmail.trim(),
                amount,
            }),
        },
    )

    const data = await response.json().catch(() => null)

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Your session has expired. Please log in again.')
        }

        throw new Error(data?.message || 'Money transfer failed.')
    }
}