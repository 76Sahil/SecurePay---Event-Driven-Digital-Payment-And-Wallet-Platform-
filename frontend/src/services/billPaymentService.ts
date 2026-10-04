import type { BillProvider } from '../types/billPayment'

const SUPPORTED_BILL_PROVIDERS: BillProvider[] = [
    {
        id: 'electricity-maha',
        name: 'Maharashtra Electricity',
        category: 'ELECTRICITY',
    },
    {
        id: 'mobile-jio',
        name: 'Jio',
        category: 'MOBILE',
    },
    {
        id: 'mobile-airtel',
        name: 'Airtel',
        category: 'MOBILE',
    },
    {
        id: 'internet-airtel',
        name: 'Airtel Xstream Fiber',
        category: 'INTERNET',
    },
    {
        id: 'water-city',
        name: 'City Water Services',
        category: 'WATER',
    },
    {
        id: 'dth-tata',
        name: 'Tata Play',
        category: 'DTH',
    },
]

export async function getBillProviders(): Promise<BillProvider[]> {
    return Promise.resolve(SUPPORTED_BILL_PROVIDERS)
}