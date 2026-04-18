import { beforeEach, describe, expect, it } from 'bun:test'
import { clearAuthSession, getAccessToken, isAuthenticated, saveAuthSession } from './auth'

describe('auth session helpers', () => {
    beforeEach(() => {
        const store = new Map<string, string>()

        Object.defineProperty(globalThis, 'sessionStorage', {
            value: {
                getItem: (key: string) => store.get(key) ?? null,
                setItem: (key: string, value: string) => {
                    store.set(key, value)
                },
                removeItem: (key: string) => {
                    store.delete(key)
                },
            },
            configurable: true,
        })

        clearAuthSession()
    })

    it('marks the session as authenticated after login', () => {
        saveAuthSession({
            access_token: 'token-123',
            refresh_token: 'refresh-123',
            user: {
                id: '1',
                nome: 'Claudio',
                email: 'claudio@email.com',
            },
        })

        expect(isAuthenticated()).toBe(true)
        expect(getAccessToken()).toBe('token-123')
    })

    it('supports cookie-based login responses without exposed tokens', () => {
        saveAuthSession({
            user: {
                id: '1',
                nome: 'Claudio',
                email: 'claudio@email.com',
            },
        })

        expect(isAuthenticated()).toBe(true)
        expect(getAccessToken()).toBeNull()
    })

    it('clears the stored auth session on logout', () => {
        saveAuthSession({
            access_token: 'token-123',
            refresh_token: 'refresh-123',
            user: {
                id: '1',
                nome: 'Claudio',
                email: 'claudio@email.com',
            },
        })

        clearAuthSession()

        expect(isAuthenticated()).toBe(false)
        expect(getAccessToken()).toBeNull()
    })
})
