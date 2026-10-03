import type { MerchantApiKey } from '../types/merchantApiKey'

const mockMerchantApiKeys: MerchantApiKey[] = [
    {
        id: 'key-001',
        name: 'Checkout Integration',
        prefix: 'sp_test_8K3F',
        environment: 'TEST',
        scopes: [
            'payments:read',
            'payments:create',
        ],
        status: 'ACTIVE',
        createdAt: '2026-09-15T10:30:00Z',
        lastUsedAt: '2026-09-30T09:20:00Z',
    },
    {
        id: 'key-002',
        name: 'Reporting Integration',
        prefix: 'sp_test_4N7Q',
        environment: 'TEST',
        scopes: [
            'payments:read',
            'transactions:read',
        ],
        status: 'ACTIVE',
        createdAt: '2026-09-10T08:15:00Z',
        lastUsedAt: '2026-09-29T16:45:00Z',
    },
    {
        id: 'key-003',
        name: 'Legacy Integration',
        prefix: 'sp_live_2M9P',
        environment: 'LIVE',
        scopes: [
            'payments:read',
        ],
        status: 'REVOKED',
        createdAt: '2026-08-20T11:00:00Z',
    },
]

const API_BASE_URL = 'http://localhost:8080'

export async function getMerchantApiKeys(): Promise<MerchantApiKey[]> {
    const token = sessionStorage.getItem('securepay_access_token')
    if (!token) {
        return Promise.resolve(mockMerchantApiKeys)
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/merchant/api-keys`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })

        if (response.ok) {
            return await response.json()
        }
    } catch {
        // Fallback to mock api keys
    }

    return Promise.resolve(mockMerchantApiKeys)
}

export async function createMerchantApiKey(
    name: string,
    environment: 'TEST' | 'LIVE',
    scopes: string[],
): Promise<MerchantApiKey & { secretKey?: string }> {
    const token = sessionStorage.getItem('securepay_access_token')

    if (token) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/merchant/api-keys`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, environment, scopes }),
            })

            if (response.ok) {
                return await response.json()
            }
        } catch {
            // fallback
        }
    }

    const mockKey: MerchantApiKey = {
        id: 'key-' + Date.now().toString().slice(-4),
        name,
        prefix: environment === 'LIVE' ? 'sp_live_9X1Y' : 'sp_test_7Z2A',
        environment,
        scopes,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
    }
    mockMerchantApiKeys.unshift(mockKey)
    return mockKey
}

export async function revokeMerchantApiKey(keyId: string): Promise<void> {
    const token = sessionStorage.getItem('securepay_access_token')

    if (token) {
        try {
            await fetch(`${API_BASE_URL}/api/merchant/api-keys/${keyId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
        } catch {
            // fallback
        }
    }

    const key = mockMerchantApiKeys.find((k) => k.id === keyId)
    if (key) {
        key.status = 'REVOKED'
    }
}