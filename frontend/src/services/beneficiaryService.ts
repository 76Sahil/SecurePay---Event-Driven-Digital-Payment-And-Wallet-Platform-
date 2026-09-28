import type { Beneficiary } from '../types/beneficiary'

const mockBeneficiaries: Beneficiary[] = [
    {
        id: 'beneficiary-demo-001',
        name: 'Rahul Sharma',
        accountIdentifier: '•••• 4821',
        bankName: 'HDFC Bank',
        status: 'ACTIVE',
    },
    {
        id: 'beneficiary-demo-002',
        name: 'Priya Singh',
        accountIdentifier: '•••• 1937',
        bankName: 'ICICI Bank',
        status: 'ACTIVE',
    },
    {
        id: 'beneficiary-demo-003',
        name: 'Amit Verma',
        accountIdentifier: '•••• 7204',
        bankName: 'Axis Bank',
        status: 'BLOCKED',
    },
]

export async function getBeneficiaries(): Promise<Beneficiary[]> {
    return Promise.resolve(mockBeneficiaries)
}