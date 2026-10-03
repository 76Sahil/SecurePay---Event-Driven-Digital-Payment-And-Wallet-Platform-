import type { CustomerDashboardSummary } from '../types'
import { getMyWallet } from './walletService'
import { getTransactions } from './transactionService'

export async function getCustomerDashboardSummary(): Promise<CustomerDashboardSummary> {
    const [wallet, transactions] = await Promise.all([
        getMyWallet(),
        getTransactions(),
    ])

    return {
        wallet,
        recentTransactions: transactions.slice(0, 5),
        totalTransactions: transactions.length,
    }
}
