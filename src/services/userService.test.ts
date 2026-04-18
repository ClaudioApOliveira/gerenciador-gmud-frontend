import { describe, expect, it } from 'bun:test'
import {
    mapFormToCreateUserPayload,
    normalizeSingleUserResponse,
    normalizeUsersListResponse,
    type UserApiResponse,
    type UserFormData,
} from './userService'

describe('userService contract helpers', () => {
    it('normalizes wrapped backend user list responses', () => {
        const apiUser: UserApiResponse = {
            id: '1',
            nome: 'Administrador',
            email: 'admin@empresa.com',
            role: 'admin',
            ativo: true,
            criado_em: '2026-04-18T10:00:00Z',
            atualizado_em: '2026-04-18T10:00:00Z',
            user_id_inclusao: '10',
            user_id_alteracao: '10',
        }

        const result = normalizeUsersListResponse({ data: [apiUser] })

        expect(result).toHaveLength(1)
        expect(result[0]?.role).toBe('admin')
    })

    it('builds the backend payload from the user form', () => {
        const formData: UserFormData = {
            nome: 'Novo Usuário',
            email: 'novo@empresa.com',
            senha: '123456',
            role: 'manager',
        }

        const payload = mapFormToCreateUserPayload(formData)

        expect(payload).toEqual({
            nome: 'Novo Usuário',
            email: 'novo@empresa.com',
            senha: '123456',
            role: 'manager',
        })
    })

    it('extracts a single user from success payloads', () => {
        const apiUser: UserApiResponse = {
            id: '2',
            nome: 'Operador',
            email: 'operador@empresa.com',
            role: 'common',
            ativo: true,
            criado_em: '2026-04-18T10:00:00Z',
            atualizado_em: '2026-04-18T10:00:00Z',
            user_id_inclusao: '10',
            user_id_alteracao: '10',
        }

        const result = normalizeSingleUserResponse({ data: apiUser })

        expect(result?.email).toBe('operador@empresa.com')
    })
})
