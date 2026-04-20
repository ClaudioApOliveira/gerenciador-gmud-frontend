import { UserRole } from './userService'

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

type SessionEnvelope = LoginResult & {
    data?: LoginResult | (Partial<AuthUser> & { user?: AuthUser })
    id?: string
    nome?: string
    email?: string
    role?: string | null
}

function normalizeRole(role?: string | null) {
    return typeof role === 'string' ? role.trim().toLowerCase() : ''
}

function normalizeUser(source?: Partial<AuthUser> | null) {
    if (!source) {
        return undefined
    }

    const hasUserData = Boolean(source.id || source.nome || source.email || source.role)

    if (!hasUserData) {
        return undefined
    }

    return {
        id: source.id ?? '',
        nome: source.nome ?? '',
        email: source.email ?? '',
        role: normalizeRole(source.role),
    }
}

function getSessionSource(session?: LoginResult | null): SessionEnvelope | null {
    if (!session || typeof session !== 'object') {
        return null
    }

    const envelope = session as SessionEnvelope

    if (envelope.data && typeof envelope.data === 'object') {
        return {
            ...envelope,
            ...envelope.data,
        }
    }

    return envelope
}

function getStorage(): StorageLike | null {
    if (typeof globalThis === 'undefined' || !('sessionStorage' in globalThis)) {
        return null
    }

    return globalThis.sessionStorage as StorageLike
}

export function saveAuthSession(session?: LoginResult | null) {
    const sessionSource = getSessionSource(session)
    const userFromEnvelope = normalizeUser(sessionSource?.user)
    const userFromRoot = normalizeUser(sessionSource)

    const normalizedSession: LoginResult = {
        authenticated: true,
        access_token: sessionSource?.access_token,
        refresh_token: sessionSource?.refresh_token,
        user: userFromEnvelope ?? userFromRoot,
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

export function getCurrentUser() {
    const sessionSource = getSessionSource(getAuthSession())

    return normalizeUser(sessionSource?.user) ?? normalizeUser(sessionSource) ?? null
}

export function getCurrentUserRole() {
    const currentRole = normalizeRole(getCurrentUser()?.role)

    return [UserRole.Admin, UserRole.Manager, UserRole.Common].includes(
        currentRole as (typeof UserRole)[keyof typeof UserRole],
    )
        ? currentRole
        : ''
}

export function canEditGmuds() {
    const currentRole = getCurrentUserRole()

    return currentRole === UserRole.Admin || currentRole === UserRole.Manager
}

export function clearAuthSession() {
    getStorage()?.removeItem(AUTH_STORAGE_KEY)
}
