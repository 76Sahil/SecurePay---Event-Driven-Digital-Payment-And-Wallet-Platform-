export type WalletStatus =
    | 'ACTIVE'
    | 'SUSPENDED'
    | 'CLOSED'

export type Wallet = {
    id: string
    userId: string
    balance: number
    currency: string
    status: WalletStatus
}