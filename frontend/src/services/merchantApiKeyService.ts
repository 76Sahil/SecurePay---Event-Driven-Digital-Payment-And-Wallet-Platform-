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

export async function getMerchantApiKeys(): Promise<
    MerchantApiKey[]
> {
    return Promise.resolve(mockMerchantApiKeys)
}