import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import type { Card } from '../types/card'
import { getCards } from '../services/cardService'

function CardsPage() {
    const [cards, setCards] = useState<Card[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadCards() {
            try {
                setIsLoading(true)
                setError(null)

                const data = await getCards()
                setCards(data)
            } catch {
                setError('Unable to load cards.')
            } finally {
                setIsLoading(false)
            }
        }

        void loadCards()
    }, [])

    const getStatusClass = (status: Card['status']) => {
        return `card-status card-status-${status.toLowerCase()}`
    }

    const getTypeLabel = (type: Card['type']) => {
        return type.replace('_', ' ')
    }

    return (
        <div className="cards-page">
            <div className="cards-header">
                <div>
                    <h1>Cards</h1>

                    <p>
                        Manage your SecurePay cards and card security
                        settings.
                    </p>
                </div>

                <Link
                    to="/customer/cards/add"
                    className="card-add-primary-button"
                >
                    + Add Card
                </Link>
            </div>

            {isLoading && (
                <div className="cards-card cards-state">
                    <p>Loading cards...</p>
                </div>
            )}

            {!isLoading && error && (
                <div className="cards-card cards-state cards-error">
                    <p>{error}</p>
                </div>
            )}

            {!isLoading && !error && cards.length === 0 && (
                <div className="cards-card cards-state">
                    <p>No cards available.</p>
                </div>
            )}

            {!isLoading && !error && cards.length > 0 && (
                <div className="cards-list">
                    {cards.map((card) => (
                        <Link
                            key={card.id}
                            to={`/customer/cards/${card.id}`}
                            className="card-item-link"
                        >
                            <div className="card-item">
                                <div className="card-visual">
                                    <div className="card-visual-top">
                                        <span>SecurePay</span>

                                        <span className="card-type">
                                            {getTypeLabel(card.type)}
                                        </span>
                                    </div>

                                    <div className="card-number">
                                        {card.maskedNumber}
                                    </div>

                                    <div className="card-visual-bottom">
                                        <div>
                                            <span className="card-label">
                                                CARDHOLDER
                                            </span>

                                            <strong>
                                                {card.cardholderName}
                                            </strong>
                                        </div>

                                        <div>
                                            <span className="card-label">
                                                VALID THRU
                                            </span>

                                            <strong>
                                                {String(
                                                    card.expiryMonth,
                                                ).padStart(2, '0')}
                                                /
                                                {String(
                                                    card.expiryYear,
                                                ).slice(-2)}
                                            </strong>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-item-details">
                                    <div>
                                        <h3>
                                            {getTypeLabel(card.type)} Card
                                        </h3>

                                        <p>{card.currency}</p>
                                    </div>

                                    <span
                                        className={getStatusClass(
                                            card.status,
                                        )}
                                    >
                                        {card.status}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

export default CardsPage