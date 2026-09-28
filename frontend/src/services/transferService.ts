import type {
    TransferInitiationRequest,
    TransferInitiationResponse,
} from '../types/transfer'

export async function initiateTransfer(
    request: TransferInitiationRequest,
): Promise<TransferInitiationResponse> {
    return Promise.resolve({
        transactionId: 'transaction-demo-001',
        reference: 'SP-TXN-20001',
        beneficiaryId: request.beneficiaryId,
        amount: request.amount,
        currency: request.currency,
        status: 'CREATED',
    })
}