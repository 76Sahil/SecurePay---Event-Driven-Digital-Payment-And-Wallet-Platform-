import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type {
    BillCategory,
    BillProvider,
} from '../types/billPayment'
import { getBillProviders } from '../services/billPaymentService'

const billCategories: {
    value: BillCategory
    label: string
    icon: string
}[] = [
    {
        value: 'ELECTRICITY',
        label: 'Electricity',
        icon: '⚡',
    },
    {
        value: 'MOBILE',
        label: 'Mobile',
        icon: '◉',
    },
    {
        value: 'INTERNET',
        label: 'Internet',
        icon: '◎',
    },
    {
        value: 'WATER',
        label: 'Water',
        icon: '◌',
    },
    {
        value: 'DTH',
        label: 'DTH',
        icon: '▣',
    },
]

function PayBillsPage() {
    const [providers, setProviders] = useState<BillProvider[]>([])
    const [selectedCategory, setSelectedCategory] =
        useState<BillCategory>('ELECTRICITY')

    const [providerId, setProviderId] = useState('')
    const [customerNumber, setCustomerNumber] = useState('')
    const [amount, setAmount] = useState('')

    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadProviders() {
            const result = await getBillProviders()
            setProviders(result)
            setIsLoading(false)
        }

        void loadProviders()
    }, [])

    const filteredProviders = providers.filter(
        (provider) => provider.category === selectedCategory,
    )

    function handleCategoryChange(category: BillCategory) {
        setSelectedCategory(category)
        setProviderId('')
    }

    function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault()

        if (!providerId || !customerNumber || !amount) {
            return
        }

        alert(
            `Bill payment request created for ₹${amount}.`,
        )
    }

    if (isLoading) {
        return (
            <section className="page-section">
                <p className="page-state">
                    Loading bill providers...
                </p>
            </section>
        )
    }

    return (
        <section className="page-section">
            <div className="page-section__header">
                <div>
                    <p className="page-section__eyebrow">
                        CUSTOMER PORTAL
                    </p>

                    <h1>Pay Bills</h1>

                    <p>
                        Pay your utility and subscription bills
                        securely from your SecurePay wallet.
                    </p>
                </div>
            </div>

            <div className="bill-category-grid">
                {billCategories.map((category) => (
                    <button
                        key={category.value}
                        type="button"
                        className={`bill-category-card ${
                            selectedCategory === category.value
                                ? 'bill-category-card--active'
                                : ''
                        }`}
                        onClick={() =>
                            handleCategoryChange(
                                category.value,
                            )
                        }
                    >
                        <span className="bill-category-card__icon">
                            {category.icon}
                        </span>

                        <strong>{category.label}</strong>
                    </button>
                ))}
            </div>

            <div className="bill-payment-card">
                <div className="bill-payment-card__header">
                    <h2>
                        {
                            billCategories.find(
                                (category) =>
                                    category.value ===
                                    selectedCategory,
                            )?.label
                        }{' '}
                        Payment
                    </h2>

                    <p>
                        Enter the required details to continue.
                    </p>
                </div>

                <form
                    className="bill-payment-form"
                    onSubmit={handleSubmit}
                >
                    <div className="bill-payment-form__field">
                        <label htmlFor="billProvider">
                            Provider
                        </label>

                        <select
                            id="billProvider"
                            value={providerId}
                            onChange={(event) =>
                                setProviderId(
                                    event.target.value,
                                )
                            }
                        >
                            <option value="">
                                Select provider
                            </option>

                            {filteredProviders.map(
                                (provider) => (
                                    <option
                                        key={provider.id}
                                        value={provider.id}
                                    >
                                        {provider.name}
                                    </option>
                                ),
                            )}
                        </select>
                    </div>

                    <div className="bill-payment-form__field">
                        <label htmlFor="customerNumber">
                            Consumer / Customer Number
                        </label>

                        <input
                            id="customerNumber"
                            type="text"
                            value={customerNumber}
                            onChange={(event) =>
                                setCustomerNumber(
                                    event.target.value,
                                )
                            }
                            placeholder="Enter customer number"
                        />
                    </div>

                    <div className="bill-payment-form__field">
                        <label htmlFor="billAmount">
                            Amount
                        </label>

                        <input
                            id="billAmount"
                            type="number"
                            min="1"
                            value={amount}
                            onChange={(event) =>
                                setAmount(event.target.value)
                            }
                            placeholder="Enter amount"
                        />
                    </div>

                    <button
                        type="submit"
                        className="bill-payment-submit"
                    >
                        Continue to Payment
                    </button>
                </form>
            </div>

            <div className="bill-payment-info">
                <strong>Secure bill payments</strong>

                <p>
                    Verify the provider and customer number
                    before confirming your payment.
                </p>
            </div>
        </section>
    )
}

export default PayBillsPage