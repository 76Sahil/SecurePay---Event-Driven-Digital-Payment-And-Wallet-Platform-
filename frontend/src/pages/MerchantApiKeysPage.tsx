import { useEffect, useState } from 'react'
import type {
    MerchantApiKey,
    MerchantApiKeyStatus,
} from '../types/merchantApiKey'
import { getMerchantApiKeys } from '../services/merchantApiKeyService'

function MerchantApiKeysPage() {
    const [apiKeys, setApiKeys] = useState<MerchantApiKey[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadApiKeys() {
            try {
                const result = await getMerchantApiKeys()
                setApiKeys(result)
            } catch {
                setError('Unable to load API keys.')
            } finally {
                setIsLoading(false)
            }
        }

        void loadApiKeys()
    }, [])

    function formatDate(date?: string) {
        if (!date) {
            return 'Never'
        }

        return new Intl.DateTimeFormat('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(date))
    }

    function getStatusClass(status: MerchantApiKeyStatus) {
        return `api-key-status api-key-status--${status.toLowerCase()}`
    }

    function handleRevoke(keyId: string) {
        const confirmed = window.confirm(
            'Are you sure you want to revoke this API key?',
        )

        if (!confirmed) {
            return
        }

        setApiKeys((currentKeys) =>
            currentKeys.map((key) =>
                key.id === keyId
                    ? {
                        ...key,
                        status: 'REVOKED',
                    }
                    : key,
            ),
        )
    }

    if (isLoading) {
        return (
            <section className="page-section">
                <p className="page-state">
                    Loading API keys...
                </p>
            </section>
        )
    }

    if (error) {
        return (
            <section className="page-section">
                <div className="page-state page-state--error">
                    {error}
                </div>
            </section>
        )
    }

    return (
        <section className="page-section">
            <div className="page-section__header">
                <div>
                    <p className="page-section__eyebrow">
                        MERCHANT PORTAL
                    </p>

                    <h1>API Keys</h1>

                    <p>
                        Manage API credentials used by your
                        merchant integrations.
                    </p>
                </div>

                <button
                    type="button"
                    className="api-key-create-button"
                    onClick={() =>
                        window.alert(
                            'API key creation will be connected to the backend later.',
                        )
                    }
                >
                    + Create API Key
                </button>
            </div>

            <div className="api-key-security-banner">
                <div className="api-key-security-banner__icon">
                    ◈
                </div>

                <div>
                    <strong>
                        Keep your API credentials secure
                    </strong>

                    <p>
                        Never expose secret API keys in frontend
                        code or public repositories.
                    </p>
                </div>
            </div>

            <div className="api-key-list">
                {apiKeys.map((apiKey) => (
                    <article
                        key={apiKey.id}
                        className="api-key-card"
                    >
                        <div className="api-key-card__header">
                            <div>
                                <h2>{apiKey.name}</h2>

                                <div className="api-key-prefix">
                                    <code>{apiKey.prefix}••••••••</code>
                                </div>
                            </div>

                            <span
                                className={getStatusClass(
                                    apiKey.status,
                                )}
                            >
                                {apiKey.status}
                            </span>
                        </div>

                        <div className="api-key-meta-grid">
                            <div className="api-key-meta">
                                <span>Environment</span>

                                <strong>
                                    {apiKey.environment}
                                </strong>
                            </div>

                            <div className="api-key-meta">
                                <span>Created</span>

                                <strong>
                                    {formatDate(
                                        apiKey.createdAt,
                                    )}
                                </strong>
                            </div>

                            <div className="api-key-meta">
                                <span>Last Used</span>

                                <strong>
                                    {formatDate(
                                        apiKey.lastUsedAt,
                                    )}
                                </strong>
                            </div>
                        </div>

                        <div className="api-key-scopes">
                            <span>Scopes</span>

                            <div>
                                {apiKey.scopes.map((scope) => (
                                    <span
                                        key={scope}
                                        className="api-key-scope"
                                    >
                                        {scope}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {apiKey.status === 'ACTIVE' && (
                            <div className="api-key-card__actions">
                                <button
                                    type="button"
                                    className="api-key-revoke-button"
                                    onClick={() =>
                                        handleRevoke(apiKey.id)
                                    }
                                >
                                    Revoke Key
                                </button>
                            </div>
                        )}
                    </article>
                ))}
            </div>
        </section>
    )
}

export default MerchantApiKeysPage