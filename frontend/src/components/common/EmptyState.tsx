import { Link } from 'react-router'

type EmptyStateProps = {
    icon?: string
    title: string
    description: string
    actionText?: string
    actionTo?: string
    onAction?: () => void
}

function EmptyState({
    icon = '✦',
    title,
    description,
    actionText,
    actionTo,
    onAction,
}: EmptyStateProps) {
    return (
        <div className="sp-state-card sp-state-empty">
            <div className="sp-state-icon sp-state-icon--empty" aria-hidden="true">
                {icon}
            </div>
            <h3 className="sp-state-title">{title}</h3>
            <p className="sp-state-message">{description}</p>
            {actionText && actionTo && (
                <Link to={actionTo} className="sp-btn sp-btn-primary sp-state-action-btn">
                    {actionText}
                </Link>
            )}
            {actionText && !actionTo && onAction && (
                <button
                    type="button"
                    onClick={onAction}
                    className="sp-btn sp-btn-primary sp-state-action-btn"
                >
                    {actionText}
                </button>
            )}
        </div>
    )
}

export default EmptyState
