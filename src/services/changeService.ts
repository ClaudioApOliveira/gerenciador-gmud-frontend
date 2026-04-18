import { ApiService } from './apiService'

export const ChangeStatus = {
    Aberta: 'aberta',
    EmAndamento: 'em_andamento',
    Concluida: 'concluida',
    Cancelada: 'cancelada',
} as const

export type ChangeStatus = (typeof ChangeStatus)[keyof typeof ChangeStatus]

export const ProjectType = {
    Fix: 'fix',
    Implantacao: 'implantacao',
} as const

export type ProjectType = (typeof ProjectType)[keyof typeof ProjectType]

export interface ChangeApiResponse {
    id: string
    titulo: string
    projeto: string
    sprint: string
    numero_change: string
    solicitante: string
    responsavel: string
    status: ChangeStatus
    tipo_projeto: ProjectType
    data_abertura: string
    data_execucao: string | null
    criado_em: string
    atualizado_em: string
    user_id_inclusao: string
    user_id_alteracao: string
    audit?: {
        id: string
        criado_em: string
        atualizado_em: string
        user_id_inclusao: string
        user_id_alteracao: string
    }
}

export interface ChangeFormData {
    titulo: string
    projeto: string
    sprint: string
    numero_change: string
    solicitante: string
    responsavel: string
    status: ChangeStatus
    tipo_projeto: ProjectType
    data_abertura: string
    data_execucao: string
}

export type ChangeRecord = ChangeApiResponse

export interface PaginatedChangeResponse {
    items: ChangeApiResponse[]
    total: number
    page: number
    per_page: number
    total_pages: number
}

type ChangeResponseEnvelope = {
    data?: unknown
    items?: unknown
    gmuds?: unknown
    changes?: unknown
    result?: unknown
}

type ChangePageEnvelope = {
    items?: unknown
    total?: unknown
    page?: unknown
    per_page?: unknown
    total_pages?: unknown
}

function isChangeLike(value: unknown): value is ChangeApiResponse {
    return Boolean(
        value &&
            typeof value === 'object' &&
            'titulo' in value &&
            'projeto' in value &&
            'numero_change' in value,
    )
}

function hydrateChangeResponse(change: ChangeApiResponse): ChangeApiResponse {
    return {
        ...change,
        id: change.id || change.audit?.id || '',
        criado_em: change.criado_em || change.audit?.criado_em || '',
        atualizado_em: change.atualizado_em || change.audit?.atualizado_em || '',
        user_id_inclusao: change.user_id_inclusao || change.audit?.user_id_inclusao || '',
        user_id_alteracao: change.user_id_alteracao || change.audit?.user_id_alteracao || '',
    }
}

function extractChangeListPayload(payload: unknown) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return payload
    }

    const envelope = payload as ChangeResponseEnvelope
    return envelope.data ?? envelope.items ?? envelope.gmuds ?? envelope.changes ?? envelope.result ?? payload
}

function toPositiveNumber(value: unknown, fallback: number) {
    return typeof value === 'number' && value > 0 ? value : fallback
}

export type ChangeCreatePayload = {
    titulo: string
    projeto: string
    sprint: string
    numero_change: string
    solicitante: string
    responsavel: string
    status: ChangeStatus
    tipo_projeto: ProjectType
    data_abertura: string
    data_execucao: string | null
}

export type ChangeUpdatePayload = Partial<
    Omit<ChangeCreatePayload, 'data_abertura'> & {
        status: ChangeStatus | null
        tipo_projeto: ProjectType | null
    }
>

function formatDateTimeForInput(value: string | null) {
    if (!value) {
        return ''
    }

    const date = new Date(value)
    const timezoneOffset = date.getTimezoneOffset() * 60_000

    return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10)
}

function toApiDateTime(value: string) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return `${value}T00:00:00`
    }

    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
        return `${value}:00`
    }

    return value.replace(/\.\d{3}Z$/, '').replace(/Z$/, '')
}

export function toDisplayChangeStatus(status: ChangeStatus) {
    switch (status) {
        case ChangeStatus.Aberta:
            return 'Aberta'
        case ChangeStatus.EmAndamento:
            return 'Em andamento'
        case ChangeStatus.Concluida:
            return 'Concluída'
        case ChangeStatus.Cancelada:
            return 'Cancelada'
        default:
            return status
    }
}

export function toDisplayProjectType(type: ProjectType) {
    switch (type) {
        case ProjectType.Implantacao:
            return 'Implantação/Projeto'
        case ProjectType.Fix:
            return 'Fix'
        default:
            return type
    }
}

export function mapApiChangeToForm(change: ChangeApiResponse): ChangeFormData {
    return {
        titulo: change.titulo,
        projeto: change.projeto,
        sprint: change.sprint,
        numero_change: change.numero_change,
        solicitante: change.solicitante,
        responsavel: change.responsavel,
        status: change.status,
        tipo_projeto: change.tipo_projeto,
        data_abertura: formatDateTimeForInput(change.data_abertura),
        data_execucao: formatDateTimeForInput(change.data_execucao),
    }
}

export function mapFormToCreatePayload(formData: ChangeFormData): ChangeCreatePayload {
    return {
        titulo: formData.titulo,
        projeto: formData.projeto,
        sprint: formData.sprint,
        numero_change: formData.numero_change,
        solicitante: formData.solicitante,
        responsavel: formData.responsavel,
        status: formData.status,
        tipo_projeto: formData.tipo_projeto,
        data_abertura: toApiDateTime(formData.data_abertura),
        data_execucao: formData.data_execucao ? toApiDateTime(formData.data_execucao) : null,
    }
}

export function mapFormToUpdatePayload(formData: Partial<ChangeFormData>): ChangeUpdatePayload {
    const payload: ChangeUpdatePayload = {}

    if (formData.titulo !== undefined) payload.titulo = formData.titulo
    if (formData.projeto !== undefined) payload.projeto = formData.projeto
    if (formData.sprint !== undefined) payload.sprint = formData.sprint
    if (formData.numero_change !== undefined) payload.numero_change = formData.numero_change
    if (formData.solicitante !== undefined) payload.solicitante = formData.solicitante
    if (formData.responsavel !== undefined) payload.responsavel = formData.responsavel
    if (formData.status !== undefined) payload.status = formData.status
    if (formData.tipo_projeto !== undefined) payload.tipo_projeto = formData.tipo_projeto
    if (formData.data_execucao !== undefined) {
        payload.data_execucao = formData.data_execucao ? toApiDateTime(formData.data_execucao) : null
    }

    return payload
}

export function normalizeChangeListResponse(payload: unknown): ChangeApiResponse[] {
    const listPayload = extractChangeListPayload(payload)

    if (Array.isArray(listPayload)) {
        return listPayload.filter(isChangeLike).map(hydrateChangeResponse)
    }

    if (listPayload && typeof listPayload === 'object') {
        const pageEnvelope = listPayload as ChangePageEnvelope

        if (Array.isArray(pageEnvelope.items)) {
            return pageEnvelope.items.filter(isChangeLike).map(hydrateChangeResponse)
        }
    }

    return []
}

export function normalizePaginatedChangeResponse(payload: unknown): PaginatedChangeResponse {
    const items = normalizeChangeListResponse(payload)
    const listPayload = extractChangeListPayload(payload)

    if (listPayload && typeof listPayload === 'object' && !Array.isArray(listPayload)) {
        const pageEnvelope = listPayload as ChangePageEnvelope

        return {
            items,
            total: toPositiveNumber(pageEnvelope.total, items.length),
            page: toPositiveNumber(pageEnvelope.page, 1),
            per_page: toPositiveNumber(pageEnvelope.per_page, 20),
            total_pages: toPositiveNumber(pageEnvelope.total_pages, 1),
        }
    }

    return {
        items,
        total: items.length,
        page: 1,
        per_page: 20,
        total_pages: 1,
    }
}

export function normalizeSingleChangeResponse(payload: unknown): ChangeApiResponse | null {
    if (!payload) {
        return null
    }

    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
        const envelope = payload as ChangeResponseEnvelope
        const nestedValue = envelope.data ?? envelope.items ?? envelope.gmuds ?? envelope.changes ?? envelope.result

        if (isChangeLike(nestedValue)) {
            return hydrateChangeResponse(nestedValue)
        }
    }

    if (Array.isArray(payload) && payload.length > 0) {
        return isChangeLike(payload[0]) ? hydrateChangeResponse(payload[0]) : null
    }

    return isChangeLike(payload) ? hydrateChangeResponse(payload) : null
}

export const ChangeService = {
    getAll: async (page = 1, perPage = 20) =>
        normalizePaginatedChangeResponse(
            await ApiService.get<unknown>('/gmuds', { page, per_page: perPage }),
        ),
    getById: async (id: string) => normalizeSingleChangeResponse(await ApiService.get<unknown>(`/gmuds/${id}`)),
    create: async (data: ChangeFormData) =>
        normalizeSingleChangeResponse(
            await ApiService.post<unknown, ChangeCreatePayload>('/gmuds', mapFormToCreatePayload(data)),
        ),
    update: async (id: string, data: Partial<ChangeFormData>) =>
        normalizeSingleChangeResponse(
            await ApiService.put<unknown, ChangeUpdatePayload>(`/gmuds/${id}`, mapFormToUpdatePayload(data)),
        ),
    remove: (id: string) => ApiService.delete<void>(`/gmuds/${id}`),
}