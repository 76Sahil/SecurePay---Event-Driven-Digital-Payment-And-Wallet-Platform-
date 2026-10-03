import type {
    PaymentInitiationRequest,
    PaymentInitiationResponse,
} from '../types/payment'
import { topUpWallet } from './walletService'

export async function initiatePayment(
    request: PaymentInitiationRequest,
): Promise<PaymentInitiationResponse> {
    if (request.currency !== 'INR') {
        throw new Error('Only INR wallet top-ups are supported.')
    }

    const result = await topUpWallet(request.amount)
    const transactionId = String(result.transactionId)

    return {
        paymentId: transactionId,
        reference: `SP-TXN-${transactionId}`,
        amount: Number(result.amount),
        currency: String(result.currency),
        status: result.status as PaymentInitiationResponse['status'],
    }
}
