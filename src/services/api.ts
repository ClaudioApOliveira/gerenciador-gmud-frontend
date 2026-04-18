import axios from 'axios'
import { clearAuthSession, getAccessToken, saveAuthSession, type LoginResult } from './auth'

const rawApiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
const API_URL = rawApiUrl.endsWith('/api/v1') ? rawApiUrl : `${rawApiUrl.replace(/\/$/, '')}/api/v1`

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    timeout: 10000,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
})

api.interceptors.request.use((config) => {
    const token = getAccessToken()

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            clearAuthSession()
            console.warn('Sessão não autorizada ou expirada.')

            if (typeof globalThis.window !== 'undefined' && globalThis.window.location.pathname !== '/login') {
                globalThis.window.location.href = '/login'
            }
        }

        throw error
    },
)

export const authApi = {
    login: async (payload: { email: string; senha: string }) => {
        const response = await api.post<LoginResult | null>('/auth/login', payload)
        const sessionData = response.data && typeof response.data === 'object' ? response.data : null

        saveAuthSession(sessionData)
        return response
    },
    logout: async () => {
        try {
            await api.post('/auth/logout')
        } finally {
            clearAuthSession()
        }
    },
    refresh: () => api.post('/auth/refresh'),
    me: () => api.get('/auth/me'),
}
