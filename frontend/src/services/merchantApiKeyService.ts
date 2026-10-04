import type { MerchantApiKey } from '../types/merchantApiKey'

const API_BASE_URL = 'http://localhost:8080'

export async function getMerchantApiKeys(): Promise<MerchantApiKey[]> {
    const token = sessionStorage.getItem('securepay_access_token')
    if (!token) {
        throw new Error('Please log in to view API keys.')
    }

    const response = await fetch(`${API_BASE_URL}/api/merchant/api-keys`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Session expired. Please log in again.')
        }
        if (response.status === 403) {
            throw new Error('Access denied. Merchant role required.')
        }
        const errorBody = await response.json().catch(() => null)
        throw new Error(errorBody?.message || 'Unable to load API keys.')
    }

    return await response.json()
}

export async function createMerchantApiKey(
    name: string,
    environment: 'TEST' | 'LIVE',
    scopes: string[],
): Promise<MerchantApiKey & { secretKey?: string }> {
    const token = sessionStorage.getItem('securepay_access_token')
    if (!token) {
        throw new Error('Please log in to generate an API key.')
    }

    const response = await fetch(`${API_BASE_URL}/api/merchant/api-keys`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, environment, scopes }),
    })

    if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        throw new Error(errorBody?.message || 'Failed to create API key.')
    }

    return await response.json()
}

export async function revokeMerchantApiKey(keyId: string): Promise<void> {
    const token = sessionStorage.getItem('securepay_access_token')
    if (!token) {
        throw new Error('Please log in to revoke an API key.')
    }

    const response = await fetch(`${API_BASE_URL}/api/merchant/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        throw new Error(errorBody?.message || 'Failed to revoke API key.')
    }
}