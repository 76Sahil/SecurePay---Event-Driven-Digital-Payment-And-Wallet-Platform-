import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import type {
    Card,
    CardManagementAction,
} from '../types/card'
import {
    getCardById,
    manageCard,
} from '../services/cardService'

function CardDetailsPage() {
    const { cardId } = useParams<{ cardId: string }>()

    const [card, setCard] = useState<Card | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [isManaging, setIsManaging] = useState(false)
    const [managementError, setManagementError] =
        useState<string | null>(null)

    useEffect(() => {
        async function loadCard() {
            if (!cardId) {
                setCard(null)
                setError('Card identifier is missing.')
                setIsLoading(false)
                return
            }

            try {
                setIsLoading(true)
                setError(null)

                const data = await getCardById(cardId)
                setCard(data)
            } catch {
                setError('Unable to load card details.')
            } finally {
                setIsLoading(false)
            }
        }

        void loadCard()
    }, [cardId])

    const getStatusClass = (status: Card['status']) => {
        return `card-status card-status-${status.toLowerCase()}`
    }

    const getTypeLabel = (type: Card['type']) => {
        return type.replace('_', ' ')
    }

    const handleCardManagement = async (
        action: CardManagementAction,
    ) => {
        if (!card) {
            return
        }

        const actionLabel =
            action === 'BLOCK'
                ? 'block'
                : 'unblock'

        const confirmed = window.confirm(
            `Are you sure you want to ${actionLabel} this card?`,
        )

        if (!confirmed) {
            return
        }

        try {
            setIsManaging(true)
            setManagementError(null)

            const response = await manageCard(
                card.id,
                action,
            )

            setCard((currentCard) => {
                if (!currentCard) {
                    return currentCard
                }

                return {
                    ...currentCard,
                    status: response.status,
                }
            })
        } catch {
            setManagementError(
                `Unable to ${actionLabel} the card. Please try again.`,
            )
        } finally {
            setIsManaging(false)
        }
    }

    if (isLoading) {
        return (
            <div className="card-details-page">
                <div className="cards-card cards-state">
                    <p>Loading card details...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="card-details-page">
                <div className="cards-card cards-state cards-error">
                    <p>{error}</p>

                    <Link to="/customer/cards">
                        Back to Cards
                    </Link>
                </div>
            </div>
        )
    }

    if (!card) {
        return (
            <div className="card-details-page">
                <div className="cards-card cards-state">
                    <h2>Card unavailable</h2>

                    <p>
                        The requested card could not be found.
                    </p>

                    <Link to="/customer/cards">
                        Back to Cards
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="card-details-page">
            <div className="card-details-header">
                <div>
                    <Link
                        to="/customer/cards"
                        className="card-details-back"
                    >
                        ← Back to Cards
                    </Link>

                    <h1>Card Details</h1>

                    <p>
                        View your card information and security status.
                    </p>
                </div>
            </div>

            <div className="card-details-grid">
                <section className="card-details-preview">
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
                </section>

                <section className="cards-card card-details-information">
                    <div className="card-details-section-header">
                        <div>
                            <h2>Card Information</h2>

                            <p>
                                Basic information associated
                                with this card.
                            </p>
                        </div>

                        <span
                            className={getStatusClass(
                                card.status,
                            )}
                        >
                            {card.status}
                        </span>
                    </div>

                    <div className="card-details-fields">
                        <div className="card-details-field">
                            <span>Card Type</span>

                            <strong>
                                {getTypeLabel(card.type)}
                            </strong>
                        </div>

                        <div className="card-details-field">
                            <span>Cardholder</span>

                            <strong>
                                {card.cardholderName}
                            </strong>
                        </div>

                        <div className="card-details-field">
                            <span>Card Number</span>

                            <strong>
                                {card.maskedNumber}
                            </strong>
                        </div>

                        <div className="card-details-field">
                            <span>Expiry</span>

                            <strong>
                                {String(
                                    card.expiryMonth,
                                ).padStart(2, '0')}
                                /
                                {card.expiryYear}
                            </strong>
                        </div>

                        <div className="card-details-field">
                            <span>Currency</span>

                            <strong>
                                {card.currency}
                            </strong>
                        </div>

                        <div className="card-details-field">
                            <span>Status</span>

                            <strong>
                                {card.status}
                            </strong>
                        </div>
                    </div>
                </section>
            </div>

            {/* Card management actions */}
            <section className="cards-card card-management-section">
                <div>
                    <h2>Card Controls</h2>

                    <p>
                        Manage the availability of this card.
                        Blocking a card prevents it from being
                        used until it is unblocked.
                    </p>
                </div>

                {managementError && (
                    <p className="card-management-error">
                        {managementError}
                    </p>
                )}

                {card.status === 'ACTIVE' && (
                    <button
                        type="button"
                        className="card-management-button card-management-button-danger"
                        onClick={() =>
                            handleCardManagement('BLOCK')
                        }
                        disabled={isManaging}
                    >
                        {isManaging
                            ? 'Blocking Card...'
                            : 'Block Card'}
                    </button>
                )}

                {card.status === 'BLOCKED' && (
                    <button
                        type="button"
                        className="card-management-button"
                        onClick={() =>
                            handleCardManagement('UNBLOCK')
                        }
                        disabled={isManaging}
                    >
                        {isManaging
                            ? 'Unblocking Card...'
                            : 'Unblock Card'}
                    </button>
                )}
            </section>

            {/* Sensitive information notice */}
            <section className="cards-card card-security-notice">
                <div>
                    <h2>Card Security</h2>

                    <p>
                        Sensitive card information such as the
                        full card number, CVV, and PIN is never
                        displayed here.
                    </p>
                </div>
            </section>
        </div>
    )
}

export default CardDetailsPage