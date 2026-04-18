import { api } from './api'

export class ApiService {
    static async get<TResponse>(url: string, params?: object): Promise<TResponse> {
        const response = await api.get<TResponse>(url, { params })
        return response.data
    }

    static async post<TResponse, TRequest = TResponse>(url: string, data: TRequest): Promise<TResponse> {
        const response = await api.post<TResponse>(url, data)
        return response.data
    }

    static async put<TResponse, TRequest = TResponse>(url: string, data: TRequest): Promise<TResponse> {
        const response = await api.put<TResponse>(url, data)
        return response.data
    }

    static async delete<TResponse>(url: string): Promise<TResponse> {
        const response = await api.delete<TResponse>(url)
        return response.data
    }
}