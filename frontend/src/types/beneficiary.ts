export type BeneficiaryStatus =
    | 'ACTIVE'
    | 'BLOCKED'
    | 'PENDING'

export type Beneficiary = {
    id: string
    name: string
    accountIdentifier: string
    bankName: string
    status: BeneficiaryStatus
}