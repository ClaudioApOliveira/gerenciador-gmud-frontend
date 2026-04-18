import { describe, expect, it } from 'bun:test'
import {
    mapApiChangeToForm,
    mapFormToCreatePayload,
    normalizeChangeListResponse,
    normalizeSingleChangeResponse,
    toDisplayChangeStatus,
    toDisplayProjectType,
    type ChangeApiResponse,
    type ChangeFormData,
} from './changeService'

describe('changeService contract helpers', () => {
    it('maps backend change data to the frontend form shape', () => {
        const apiChange: ChangeApiResponse = {
            id: '7c9c7b6f-1111-2222-3333-444444444444',
            titulo: 'Ajuste no processamento',
            projeto: 'PRJ0282499',
            sprint: 'Sprint 6',
            numero_change: 'CHG0068836',
            solicitante: 'Claudio',
            responsavel: 'Luana',
            status: 'em_andamento',
            tipo_projeto: 'implantacao',
            data_abertura: '2026-04-18T10:00:00Z',
            data_execucao: null,
            criado_em: '2026-04-18T10:00:00Z',
            atualizado_em: '2026-04-18T10:00:00Z',
            user_id_inclusao: '7c9c7b6f-1111-2222-3333-444444444445',
            user_id_alteracao: '7c9c7b6f-1111-2222-3333-444444444446',
        }

        const result = mapApiChangeToForm(apiChange)

        expect(result.numero_change).toBe('CHG0068836')
        expect(result.status).toBe('em_andamento')
        expect(result.tipo_projeto).toBe('implantacao')
        expect(result.data_abertura).toBe('2026-04-18')
    })

    it('builds the backend payload from the frontend form', () => {
        const formData: ChangeFormData = {
            titulo: 'Nova implantação',
            projeto: 'PRJ0304753',
            sprint: 'Parcerias',
            numero_change: 'CHG0070521',
            solicitante: 'Sergio',
            responsavel: 'Alcides',
            status: 'aberta',
            tipo_projeto: 'fix',
            data_abertura: '2026-04-18T09:30',
            data_execucao: '',
        }

        const payload = mapFormToCreatePayload(formData)

        expect(payload.data_abertura).toBe('2026-04-18T09:30:00')
        expect(payload.data_execucao).toBeNull()
    })

    it('accepts date-only values from the form inputs', () => {
        const formData: ChangeFormData = {
            titulo: 'Nova implantação',
            projeto: 'PRJ0304753',
            sprint: 'Parcerias',
            numero_change: 'CHG0070521',
            solicitante: 'Sergio',
            responsavel: 'Alcides',
            status: 'aberta',
            tipo_projeto: 'fix',
            data_abertura: '2026-04-18',
            data_execucao: '2026-04-19',
        }

        const payload = mapFormToCreatePayload(formData)

        expect(payload.data_abertura).toBe('2026-04-18T00:00:00')
        expect(payload.data_execucao).toBe('2026-04-19T00:00:00')
    })

    it('normalizes wrapped backend list responses to an array', () => {
        const apiChange: ChangeApiResponse = {
            id: '',
            titulo: 'Ajuste no processamento',
            projeto: 'PRJ0282499',
            sprint: 'Sprint 6',
            numero_change: 'CHG0068836',
            solicitante: 'Claudio',
            responsavel: 'Luana',
            status: 'em_andamento',
            tipo_projeto: 'implantacao',
            data_abertura: '2026-04-18T10:00:00Z',
            data_execucao: null,
            criado_em: '',
            atualizado_em: '',
            user_id_inclusao: '',
            user_id_alteracao: '',
            audit: {
                id: '7c9c7b6f-1111-2222-3333-444444444444',
                criado_em: '2026-04-18T10:00:00Z',
                atualizado_em: '2026-04-18T10:00:00Z',
                user_id_inclusao: '7c9c7b6f-1111-2222-3333-444444444445',
                user_id_alteracao: '7c9c7b6f-1111-2222-3333-444444444446',
            },
        }

        const result = normalizeChangeListResponse({ data: [apiChange] })

        expect(Array.isArray(result)).toBe(true)
        expect(result).toHaveLength(1)
        expect(result[0]?.id).toBe('7c9c7b6f-1111-2222-3333-444444444444')
    })

    it('normalizes paginated backend list responses with data.items metadata', () => {
        const apiChange: ChangeApiResponse = {
            id: '7c9c7b6f-1111-2222-3333-444444444444',
            titulo: 'Paginated change',
            projeto: 'PRJ0282499',
            sprint: 'Sprint 7',
            numero_change: 'CHG0069999',
            solicitante: 'Claudio',
            responsavel: 'Luana',
            status: 'aberta',
            tipo_projeto: 'fix',
            data_abertura: '2026-04-18T10:00:00Z',
            data_execucao: null,
            criado_em: '2026-04-18T10:00:00Z',
            atualizado_em: '2026-04-18T10:00:00Z',
            user_id_inclusao: '7c9c7b6f-1111-2222-3333-444444444445',
            user_id_alteracao: '7c9c7b6f-1111-2222-3333-444444444446',
        }

        const result = normalizeChangeListResponse({
            data: {
                items: [apiChange],
                total: 100,
                page: 1,
                per_page: 20,
                total_pages: 5,
            },
        })

        expect(result).toHaveLength(1)
        expect(result[0]?.numero_change).toBe('CHG0069999')
    })

    it('handles empty create responses without crashing', () => {
        const result = normalizeSingleChangeResponse(null)

        expect(result).toBeNull()
    })

    it('ignores success payloads that do not contain a GMUD id', () => {
        const result = normalizeSingleChangeResponse({ message: 'GMUD criada com sucesso' })

        expect(result).toBeNull()
    })

    it('formats backend enums for display', () => {
        expect(toDisplayChangeStatus('aberta')).toBe('Aberta')
        expect(toDisplayChangeStatus('em_andamento')).toBe('Em andamento')
        expect(toDisplayProjectType('implantacao')).toBe('Implantação/Projeto')
    })
})
