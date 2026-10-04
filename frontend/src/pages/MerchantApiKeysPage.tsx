import { useEffect, useState } from 'react'
import type {
    MerchantApiKey,
    MerchantApiKeyStatus,
} from '../types/merchantApiKey'
import {
    getMerchantApiKeys,
    createMerchantApiKey,
    revokeMerchantApiKey,
} from '../services/merchantApiKeyService'

function MerchantApiKeysPage() {
    const [apiKeys, setApiKeys] = useState<MerchantApiKey[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Create Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [createError, setCreateError] = useState<string | null>(null)
    const [newKeyName, setNewKeyName] = useState('')
    const [newKeyEnv, setNewKeyEnv] = useState<'TEST' | 'LIVE'>('TEST')
    const [newKeyScopes, setNewKeyScopes] = useState<string[]>([
        'payments:read',
        'payments:create',
    ])

    // Created Key State (Secret only displayed once)
    const [createdSecret, setCreatedSecret] = useState<string | null>(null)
    const [hasCopied, setHasCopied] = useState(false)

    // Revoke state
    const [revokingId, setRevokingId] = useState<string | null>(null)

    useEffect(() => {
        void loadApiKeys()
    }, [])

    async function loadApiKeys() {
        try {
            setIsLoading(true)
            setError(null)
            const result = await getMerchantApiKeys()
            setApiKeys(result)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to load API keys.')
        } finally {
            setIsLoading(false)
        }
    }

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

    function openCreateModal() {
        setNewKeyName('')
        setNewKeyEnv('TEST')
        setNewKeyScopes(['payments:read', 'payments:create'])
        setCreateError(null)
        setCreatedSecret(null)
        setHasCopied(false)
        setIsModalOpen(true)
    }

    function closeModal() {
        setIsModalOpen(false)
        setCreatedSecret(null)
        setHasCopied(false)
        setCreateError(null)
    }

    async function handleCreateSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!newKeyName.trim()) {
            setCreateError('Please enter a name for the API key.')
            return
        }

        try {
            setIsCreating(true)
            setCreateError(null)
            const res = await createMerchantApiKey(
                newKeyName.trim(),
                newKeyEnv,
                newKeyScopes,
            )

            // Reveal secret in modal once
            setCreatedSecret(res.secretKey || null)

            // Update list with the new key record
            setApiKeys((current) => [res, ...current])
        } catch (err) {
            setCreateError(
                err instanceof Error ? err.message : 'Failed to generate API key.',
            )
        } finally {
            setIsCreating(false)
        }
    }

    async function handleCopyKey() {
        if (!createdSecret) return
        try {
            await navigator.clipboard.writeText(createdSecret)
            setHasCopied(true)
            setTimeout(() => setHasCopied(false), 3000)
        } catch {
            // Fallback copy if navigator.clipboard is unavailable
            const textArea = document.createElement('textarea')
            textArea.value = createdSecret
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            setHasCopied(true)
            setTimeout(() => setHasCopied(false), 3000)
        }
    }

    async function handleRevoke(keyId: string, keyName: string) {
        const confirmed = window.confirm(
            `Are you sure you want to revoke API key "${keyName}"? Applications using this key will immediately lose access.`,
        )

        if (!confirmed) {
            return
        }

        try {
            setRevokingId(keyId)
            await revokeMerchantApiKey(keyId)
            setApiKeys((currentKeys) =>
                currentKeys.map((key) =>
                    key.id === keyId ? { ...key, status: 'REVOKED' } : key,
                ),
            )
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to revoke API key.')
        } finally {
            setRevokingId(null)
        }
    }

    function toggleScope(scope: string) {
        setNewKeyScopes((prev) =>
            prev.includes(scope)
                ? prev.filter((s) => s !== scope)
                : [...prev, scope],
        )
    }

    if (isLoading) {
        return (
            <section className="page-section">
                <p className="page-state">Loading API keys...</p>
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
                    <p className="page-section__eyebrow">MERCHANT PORTAL</p>
                    <h1>API Keys</h1>
                    <p>
                        Manage API credentials used by your merchant integrations.
                    </p>
                </div>

                <button
                    type="button"
                    className="api-key-create-button"
                    onClick={openCreateModal}
                >
                    + Create API Key
                </button>
            </div>

            <div className="api-key-security-banner">
                <div className="api-key-security-banner__icon">◈</div>
                <div>
                    <strong>Keep your API credentials secure</strong>
                    <p>
                        Never expose secret API keys in frontend client code or public
                        repositories.
                    </p>
                </div>
            </div>

            {apiKeys.length === 0 ? (
                <div className="api-key-empty-card">
                    <div style={{ fontSize: '36px' }}>🔑</div>
                    <h3>No API keys generated yet</h3>
                    <p>
                        Generate an API key to securely process transactions and integrate
                        SecurePay into your backend.
                    </p>
                    <button
                        type="button"
                        className="api-key-create-button"
                        onClick={openCreateModal}
                    >
                        + Create Your First API Key
                    </button>
                </div>
            ) : (
                <div className="api-key-list">
                    {apiKeys.map((apiKey) => (
                        <article key={apiKey.id} className="api-key-card">
                            <div className="api-key-card__header">
                                <div>
                                    <h2>{apiKey.name}</h2>
                                    <div className="api-key-prefix">
                                        <code>{apiKey.prefix}••••••••</code>
                                    </div>
                                </div>

                                <span className={getStatusClass(apiKey.status)}>
                                    {apiKey.status}
                                </span>
                            </div>

                            <div className="api-key-meta-grid">
                                <div className="api-key-meta">
                                    <span>Environment</span>
                                    <strong>{apiKey.environment}</strong>
                                </div>

                                <div className="api-key-meta">
                                    <span>Created</span>
                                    <strong>{formatDate(apiKey.createdAt)}</strong>
                                </div>

                                <div className="api-key-meta">
                                    <span>Last Used</span>
                                    <strong>{formatDate(apiKey.lastUsedAt)}</strong>
                                </div>
                            </div>

                            <div className="api-key-scopes">
                                <span>Scopes</span>
                                <div>
                                    {apiKey.scopes.map((scope) => (
                                        <span key={scope} className="api-key-scope">
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
                                        disabled={revokingId === apiKey.id}
                                        onClick={() => handleRevoke(apiKey.id, apiKey.name)}
                                    >
                                        {revokingId === apiKey.id
                                            ? 'Revoking...'
                                            : 'Revoke Key'}
                                    </button>
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            )}

            {/* In-App API Key Modal */}
            {isModalOpen && (
                <div className="api-key-modal-backdrop" onClick={closeModal}>
                    <div
                        className="api-key-modal"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="api-key-modal__header">
                            <h2 className="api-key-modal__title">
                                {createdSecret ? 'API Key Created' : 'Create Merchant API Key'}
                            </h2>
                            <button
                                type="button"
                                className="api-key-modal__close"
                                onClick={closeModal}
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>

                        {createdSecret ? (
                            /* Success View: Display Plaintext Secret ONCE */
                            <div>
                                <p style={{ fontSize: '13.5px', color: '#334155', margin: '0 0 12px 0' }}>
                                    Your secret API key has been created. Copy and store this key in a
                                    safe place now.
                                </p>

                                <div className="api-key-secret-box">
                                    <span className="api-key-secret-code">{createdSecret}</span>
                                    <button
                                        type="button"
                                        className={`api-key-copy-button ${hasCopied ? 'api-key-copy-button--copied' : ''}`}
                                        onClick={handleCopyKey}
                                    >
                                        {hasCopied ? '✓ Copied' : 'Copy Key'}
                                    </button>
                                </div>

                                <div className="api-key-warning-box">
                                    <span style={{ fontSize: '16px' }}>⚠️</span>
                                    <div>
                                        <strong>Save this key now.</strong>
                                        <div>
                                            For security reasons, you will not be able to view the full
                                            secret key again. If you lose this key, you will need to
                                            generate a new one.
                                        </div>
                                    </div>
                                </div>

                                <div className="api-key-modal__footer">
                                    <button
                                        type="button"
                                        className="sp-btn sp-btn-primary"
                                        style={{ padding: '9px 18px', fontSize: '13px', borderRadius: '8px' }}
                                        onClick={closeModal}
                                    >
                                        I Have Saved My Key
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Creation Form View */
                            <form onSubmit={handleCreateSubmit}>
                                <div className="api-key-modal__body">
                                    {createError && (
                                        <div
                                            className="page-state--error"
                                            style={{ marginBottom: '16px', padding: '10px 14px', fontSize: '13px' }}
                                        >
                                            {createError}
                                        </div>
                                    )}

                                    <div className="api-key-form-group">
                                        <label className="api-key-form-label" htmlFor="apiKeyName">
                                            Key Name / Description <span style={{ color: '#ef4444' }}>*</span>
                                        </label>
                                        <input
                                            id="apiKeyName"
                                            type="text"
                                            className="api-key-form-input"
                                            placeholder="e.g. Primary Store Checkout"
                                            value={newKeyName}
                                            onChange={(e) => setNewKeyName(e.target.value)}
                                            disabled={isCreating}
                                            autoFocus
                                        />
                                    </div>

                                    <div className="api-key-form-group">
                                        <label className="api-key-form-label">Environment</label>
                                        <div className="api-key-env-options">
                                            <div
                                                className={`api-key-env-option ${newKeyEnv === 'TEST' ? 'api-key-env-option--selected' : ''}`}
                                                onClick={() => setNewKeyEnv('TEST')}
                                            >
                                                <span>{newKeyEnv === 'TEST' ? '●' : '○'}</span>
                                                <div>
                                                    <div>TEST (Sandbox)</div>
                                                    <small style={{ color: '#64748b', fontWeight: 400 }}>
                                                        sp_test_...
                                                    </small>
                                                </div>
                                            </div>

                                            <div
                                                className={`api-key-env-option ${newKeyEnv === 'LIVE' ? 'api-key-env-option--selected' : ''}`}
                                                onClick={() => setNewKeyEnv('LIVE')}
                                            >
                                                <span>{newKeyEnv === 'LIVE' ? '●' : '○'}</span>
                                                <div>
                                                    <div>LIVE (Production)</div>
                                                    <small style={{ color: '#64748b', fontWeight: 400 }}>
                                                        sp_live_...
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="api-key-form-group" style={{ marginBottom: 0 }}>
                                        <label className="api-key-form-label">Permissions (Scopes)</label>
                                        <div className="api-key-scopes-checkboxes">
                                            <label className="api-key-scope-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={newKeyScopes.includes('payments:read')}
                                                    onChange={() => toggleScope('payments:read')}
                                                />
                                                <span>payments:read — View transactions & balance</span>
                                            </label>

                                            <label className="api-key-scope-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={newKeyScopes.includes('payments:create')}
                                                    onChange={() => toggleScope('payments:create')}
                                                />
                                                <span>payments:create — Process checkout & charge payments</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="api-key-modal__footer">
                                    <button
                                        type="button"
                                        className="sp-btn sp-btn-secondary"
                                        style={{ padding: '9px 16px', fontSize: '13px', borderRadius: '8px' }}
                                        onClick={closeModal}
                                        disabled={isCreating}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="sp-btn sp-btn-primary"
                                        style={{ padding: '9px 18px', fontSize: '13px', borderRadius: '8px' }}
                                        disabled={isCreating}
                                    >
                                        {isCreating ? 'Generating Key...' : 'Generate API Key'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </section>
    )
}

export default MerchantApiKeysPage