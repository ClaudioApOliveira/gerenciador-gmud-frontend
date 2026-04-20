import { beforeEach, describe, expect, it } from 'bun:test'
import { canEditGmuds, clearAuthSession, getAccessToken, getCurrentUserRole, isAuthenticated, saveAuthSession } from './auth'

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

    it('allows admin and manager to edit GMUDs', () => {
        saveAuthSession({
            user: {
                id: '1',
                nome: 'Administrador',
                email: 'admin@empresa.com',
                role: 'admin',
            },
        })

        expect(getCurrentUserRole()).toBe('admin')
        expect(canEditGmuds()).toBe(true)

        saveAuthSession({
            user: {
                id: '2',
                nome: 'Gerente',
                email: 'manager@empresa.com',
                role: 'manager',
            },
        })

        expect(getCurrentUserRole()).toBe('manager')
        expect(canEditGmuds()).toBe(true)
    })

    it('reads the role even when login response comes wrapped in data', () => {
        saveAuthSession({
            data: {
                access_token: 'token-123',
                refresh_token: 'refresh-123',
                user: {
                    id: '2',
                    nome: 'Gerente',
                    email: 'manager@empresa.com',
                    role: 'manager',
                },
            },
        } as never)

        expect(getCurrentUserRole()).toBe('manager')
        expect(canEditGmuds()).toBe(true)
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
