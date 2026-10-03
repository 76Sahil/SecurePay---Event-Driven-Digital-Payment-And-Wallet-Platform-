type ErrorStateProps = {
    title?: string
    message: string
    onRetry?: () => void
}

function ErrorState({
    title = 'Unable to Load Data',
    message,
    onRetry,
}: ErrorStateProps) {
    return (
        <div className="sp-state-card sp-state-error" role="alert">
            <div className="sp-state-icon sp-state-icon--error" aria-hidden="true">
                !
            </div>
            <h3 className="sp-state-title">{title}</h3>
            <p className="sp-state-message">{message}</p>
            {onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="sp-btn sp-btn-secondary sp-state-retry-btn"
                >
                    ↻ Try Again
                </button>
            )}
        </div>
    )
}

export default ErrorState
