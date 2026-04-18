const AUTH_STORAGE_KEY = 'gmud-auth-session'

type StorageLike = {
    getItem: (key: string) => string | null
    setItem: (key: string, value: string) => void
    removeItem: (key: string) => void
}

export type AuthUser = {
    id: string
    nome: string
    email: string
    role?: string | null
}

export type LoginResult = {
    access_token?: string
    refresh_token?: string
    user?: AuthUser
    authenticated?: boolean
}

function getStorage(): StorageLike | null {
    if (typeof globalThis === 'undefined' || !('sessionStorage' in globalThis)) {
        return null
    }

    return globalThis.sessionStorage as StorageLike
}

export function saveAuthSession(session?: LoginResult | null) {
    const normalizedSession: LoginResult = {
        authenticated: true,
        ...(session ?? {}),
    }

    getStorage()?.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalizedSession))
}

export function getAuthSession(): LoginResult | null {
    const rawValue = getStorage()?.getItem(AUTH_STORAGE_KEY)

    if (!rawValue) {
        return null
    }

    try {
        return JSON.parse(rawValue) as LoginResult
    } catch {
        clearAuthSession()
        return null
    }
}

export function getAccessToken() {
    return getAuthSession()?.access_token ?? null
}

export function isAuthenticated() {
    const session = getAuthSession()

    return Boolean(
        session?.authenticated || session?.access_token || session?.refresh_token || session?.user,
    )
}

export function clearAuthSession() {
    getStorage()?.removeItem(AUTH_STORAGE_KEY)
}
