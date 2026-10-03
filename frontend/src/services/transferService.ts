
import type {
    TransferInitiationRequest,
    TransferInitiationResponse,
} from '../types/transfer'

export async function initiateTransfer(
    request: TransferInitiationRequest,
): Promise<TransferInitiationResponse> {
    const token = sessionStorage.getItem('securepay_access_token')

    if (!token) {
        throw new Error('Session expired. Please login again.')
    }

    const response = await fetch(
        'http://localhost:8080/api/wallet/transactions/transfer',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                'Idempotency-Key': crypto.randomUUID(),
            },
            body: JSON.stringify({
                recipientEmail: request.recipientEmail.trim().toLowerCase(),
                amount: request.amount,
            }),
        },
    )

    const data = await response.json().catch(() => null)

    if (!response.ok) {
        throw new Error(
            data?.message ||
            data?.error ||
            'Transfer failed. Please check the recipient email and wallet balance.',
        )
    }

    return data as TransferInitiationResponse
}