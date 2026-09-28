import type { Transaction } from './transaction'
import type { Wallet } from './wallet'

export type CustomerDashboardSummary = {
    wallet: Wallet
    recentTransactions: Transaction[]
}