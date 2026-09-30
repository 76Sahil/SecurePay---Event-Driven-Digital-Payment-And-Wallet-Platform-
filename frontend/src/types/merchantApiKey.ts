export type MerchantApiKeyEnvironment = 'TEST' | 'LIVE'

export type MerchantApiKeyStatus = 'ACTIVE' | 'REVOKED'

export type MerchantApiKey = {
    id: string
    name: string
    prefix: string
    environment: MerchantApiKeyEnvironment
    scopes: string[]
    status: MerchantApiKeyStatus
    createdAt: string
    lastUsedAt?: string
}