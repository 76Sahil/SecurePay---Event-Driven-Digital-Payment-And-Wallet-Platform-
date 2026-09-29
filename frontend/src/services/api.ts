
const API_BASE_URL = '/api'

export async function apiRequest<T>(
    path: string,
    options: RequestInit = {},
    accessToken?: string,
): Promise<T> {
    const headers = new Headers(options.headers)

    if (options.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
    }

    if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`)
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => null)

        throw new Error(
            errorData?.message ??
            errorData?.error ??
            `Request failed with status ${response.status}`,
        )
    }

    return response.json() as Promise<T>
}