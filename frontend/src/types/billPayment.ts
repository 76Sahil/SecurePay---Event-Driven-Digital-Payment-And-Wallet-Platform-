export type BillCategory =
    | 'ELECTRICITY'
    | 'MOBILE'
    | 'INTERNET'
    | 'WATER'
    | 'DTH'

export type BillProvider = {
    id: string
    name: string
    category: BillCategory
}

export type BillPaymentForm = {
    category: BillCategory
    providerId: string
    customerNumber: string
    amount: number
}