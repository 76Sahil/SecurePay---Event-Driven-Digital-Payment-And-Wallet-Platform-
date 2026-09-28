import type {
    PaymentInitiationRequest,
    PaymentInitiationResponse,
} from '../types/payment'

export async function initiatePayment(
    request: PaymentInitiationRequest,
): Promise<PaymentInitiationResponse> {
    return Promise.resolve({
        paymentId: 'payment-demo-001',
        reference: 'SP-PAY-10001',
        amount: request.amount,
        currency: request.currency,
        status: 'CREATED',
    })
}