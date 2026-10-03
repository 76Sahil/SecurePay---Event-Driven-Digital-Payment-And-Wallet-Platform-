type LoadingStateProps = {
    message?: string
}

function LoadingState({ message = 'Loading details...' }: LoadingStateProps) {
    return (
        <div className="sp-state-card sp-state-loading" role="status" aria-live="polite">
            <div className="sp-spinner" aria-hidden="true" />
            <p className="sp-state-message">{message}</p>
        </div>
    )
}

export default LoadingState
