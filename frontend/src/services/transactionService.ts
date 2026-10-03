
import type { Transaction } from '../types/transaction'

const API_BASE_URL = 'http://localhost:8080'

type ApiTransaction = {
    id: number | string
    type: string
    amount: number | string
    currency: string
    status: string
    description: string | null
    createdAt: string
}

async function fetchTransactions(): Promise<Transaction[]> {
    const token = sessionStorage.getItem('securepay_access_token')

    if (!token) {
        throw new Error('Please log in to view your transactions.')
    }

    const response = await fetch(
        `${API_BASE_URL}/api/wallet/transactions`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        },
    )

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Your session has expired. Please log in again.')
        }

        const errorBody = await response.json().catch(() => null)
        throw new Error(
            errorBody?.message || 'Unable to load transactions.',
        )
    }

    const data: ApiTransaction[] = await response.json()

    return data.map((item) => {
        const type = item.type.toUpperCase()
        const direction =
            ['TOP_UP', 'DEPOSIT', 'CREDIT', 'TRANSFER_IN'].includes(type)
                ? 'CREDIT'
                : 'DEBIT'

        return {
            id: String(item.id),
            reference: `SP-TXN-${item.id}`,
            type,
            direction,
            amount: Number(item.amount),
            currency: item.currency,
            status: item.status,
            description: item.description || type,
            createdAt: item.createdAt,
        } as Transaction
    })
}

export async function getTransactions(): Promise<Transaction[]> {
    return fetchTransactions()
}

export async function getTransactionById(
    transactionId: string,
): Promise<Transaction | null> {
    const transactions = await fetchTransactions()

    return (
        transactions.find((item) => item.id === transactionId) ?? null
    )
}