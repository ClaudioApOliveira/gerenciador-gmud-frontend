import { ApiService } from './apiService'

export const UserRole = {
    Admin: 'admin',
    Manager: 'manager',
    Common: 'common',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export interface UserApiResponse {
    id: string
    nome: string
    email: string
    role: UserRole
    ativo: boolean
    criado_em: string
    atualizado_em: string
    user_id_inclusao: string
    user_id_alteracao: string
    audit?: {
        id?: string
        criado_em?: string
        atualizado_em?: string
        user_id_inclusao?: string
        user_id_alteracao?: string
    }
}

export interface UserFormData {
    nome: string
    email: string
    senha: string
    role: UserRole
}

export type UserCreatePayload = {
    nome: string
    email: string
    senha: string
    role?: UserRole | null
}

export type UserUpdatePayload = Partial<
    Omit<UserCreatePayload, 'senha'> & {
        senha?: string
        ativo: boolean
    }
>

type UserResponseEnvelope = {
    data?: unknown
    items?: unknown
    users?: unknown
    result?: unknown
}

type UserPageEnvelope = {
    items?: unknown
}

function isUserLike(value: unknown): value is UserApiResponse {
    return Boolean(value && typeof value === 'object' && 'nome' in value && 'email' in value)
}

function hydrateUserResponse(user: UserApiResponse): UserApiResponse {
    return {
        ...user,
        id: user.id || user.audit?.id || '',
        role: user.role || UserRole.Common,
        ativo: typeof user.ativo === 'boolean' ? user.ativo : true,
        criado_em: user.criado_em || user.audit?.criado_em || '',
        atualizado_em: user.atualizado_em || user.audit?.atualizado_em || '',
        user_id_inclusao: user.user_id_inclusao || user.audit?.user_id_inclusao || '',
        user_id_alteracao: user.user_id_alteracao || user.audit?.user_id_alteracao || '',
    }
}

function extractUserListPayload(payload: unknown) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return payload
    }

    const envelope = payload as UserResponseEnvelope
    return envelope.data ?? envelope.items ?? envelope.users ?? envelope.result ?? payload
}

export function mapFormToCreateUserPayload(formData: UserFormData): UserCreatePayload {
    return {
        nome: formData.nome.trim(),
        email: formData.email.trim().toLowerCase(),
        senha: formData.senha,
        role: formData.role,
    }
}

export function normalizeUsersListResponse(payload: unknown): UserApiResponse[] {
    const listPayload = extractUserListPayload(payload)

    if (Array.isArray(listPayload)) {
        return listPayload.filter(isUserLike).map(hydrateUserResponse)
    }

    if (listPayload && typeof listPayload === 'object') {
        const pageEnvelope = listPayload as UserPageEnvelope

        if (Array.isArray(pageEnvelope.items)) {
            return pageEnvelope.items.filter(isUserLike).map(hydrateUserResponse)
        }
    }

    return []
}

export function normalizeSingleUserResponse(payload: unknown): UserApiResponse | null {
    if (!payload) {
        return null
    }

    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
        const envelope = payload as UserResponseEnvelope
        const nestedValue = envelope.data ?? envelope.items ?? envelope.users ?? envelope.result

        if (isUserLike(nestedValue)) {
            return hydrateUserResponse(nestedValue)
        }
    }

    if (Array.isArray(payload) && payload.length > 0) {
        return isUserLike(payload[0]) ? hydrateUserResponse(payload[0]) : null
    }

    return isUserLike(payload) ? hydrateUserResponse(payload) : null
}

export const UserService = {
    getAll: async () => normalizeUsersListResponse(await ApiService.get<unknown>('/users')),
    getById: async (id: string) => normalizeSingleUserResponse(await ApiService.get<unknown>(`/users/${id}`)),
    create: async (data: UserFormData) =>
        normalizeSingleUserResponse(
            await ApiService.post<unknown, UserCreatePayload>('/users', mapFormToCreateUserPayload(data)),
        ),
    update: async (id: string, data: UserUpdatePayload) =>
        normalizeSingleUserResponse(await ApiService.put<unknown, UserUpdatePayload>(`/users/${id}`, data)),
    remove: (id: string) => ApiService.delete<void>(`/users/${id}`),
}
