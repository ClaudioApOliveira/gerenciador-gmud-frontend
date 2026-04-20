import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ButtonLink, Card, DataTable, PageHeader, StatusBadge, SummaryItem, TableActions } from '../components/ui'
import { IncidentStatus, incidents } from '../data/operationsData'
import { i18n } from '../i18'
import { canEditGmuds } from '../services/auth'
import {
    ChangeService,
    ChangeStatus,
    ProjectType,
    toDisplayChangeStatus,
    toDisplayProjectType,
    type ChangeRecord,
} from '../services/changeService'

const DEFAULT_PER_PAGE = 20

function normalizeDateValue(value?: string | null) {
    if (!value) {
        return ''
    }

    const parsedDate = new Date(value)

    if (Number.isNaN(parsedDate.getTime())) {
        return value.slice(0, 10)
    }

    return parsedDate.toISOString().slice(0, 10)
}

function formatDateLabel(value?: string | null) {
    const normalizedValue = normalizeDateValue(value)

    if (!normalizedValue) {
        return '—'
    }

    const [year, month, day] = normalizedValue.split('-')
    return `${day}/${month}/${year}`
}

export function GmudsListPage() {
    const [changes, setChanges] = useState<ChangeRecord[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('todos')
    const [typeFilter, setTypeFilter] = useState('todos')
    const [openedAtStart, setOpenedAtStart] = useState('')
    const [openedAtEnd, setOpenedAtEnd] = useState('')
    const [closedAtStart, setClosedAtStart] = useState('')
    const [closedAtEnd, setClosedAtEnd] = useState('')
    const [novaFilter, setNovaFilter] = useState('')
    const [brasilsegFilter, setBrasilsegFilter] = useState('')

    useEffect(() => {
        let isMounted = true

        const loadChanges = async () => {
            try {
                const response = await ChangeService.getAll(currentPage, DEFAULT_PER_PAGE)

                if (isMounted) {
                    setChanges(response.items)
                    setTotalItems(response.total)
                    setTotalPages(response.total_pages)
                    setError('')
                }
            } catch {
                if (isMounted) {
                    setError('Não foi possível carregar as GMUDs do backend.')
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }

        void loadChanges()

        return () => {
            isMounted = false
        }
    }, [currentPage])

    const safeChanges = useMemo(() => (Array.isArray(changes) ? changes : []), [changes])
    const canEditChanges = canEditGmuds()

    const filteredChanges = useMemo(() => {
        return safeChanges.filter((change) => {
            const matchesSearch =
                searchTerm.trim().length === 0 ||
                [change.titulo, change.projeto, change.sprint, change.numero_change, change.solicitante]
                    .filter(Boolean)
                    .some((value) => value.toLowerCase().includes(searchTerm.trim().toLowerCase()))

            const openedAtValue = normalizeDateValue(change.data_abertura)
            const closedAtValue = normalizeDateValue(change.data_execucao)

            const matchesStatus = statusFilter === 'todos' || change.status === statusFilter
            const matchesType = typeFilter === 'todos' || change.tipo_projeto === typeFilter
            const matchesOpenedAt =
                (!openedAtStart || (openedAtValue && openedAtValue >= openedAtStart)) &&
                (!openedAtEnd || (openedAtValue && openedAtValue <= openedAtEnd))
            const matchesClosedAt =
                (!closedAtStart || (closedAtValue && closedAtValue >= closedAtStart)) &&
                (!closedAtEnd || (closedAtValue && closedAtValue <= closedAtEnd))
            const matchesNova =
                novaFilter.trim().length === 0 ||
                (change.solicitante ?? '').toLowerCase().includes(novaFilter.trim().toLowerCase())
            const matchesBrasilseg =
                brasilsegFilter.trim().length === 0 ||
                (change.responsavel ?? '').toLowerCase().includes(brasilsegFilter.trim().toLowerCase())

            return (
                matchesSearch &&
                matchesStatus &&
                matchesType &&
                matchesOpenedAt &&
                matchesClosedAt &&
                matchesNova &&
                matchesBrasilseg
            )
        })
    }, [
        safeChanges,
        searchTerm,
        statusFilter,
        typeFilter,
        openedAtStart,
        openedAtEnd,
        closedAtStart,
        closedAtEnd,
        novaFilter,
        brasilsegFilter,
    ])

    const summary = useMemo(() => {
        const concluidas = safeChanges.filter((item) => item.status === ChangeStatus.Concluida).length
        const pendentes = safeChanges.filter(
            (item) => item.status === ChangeStatus.Aberta || item.status === ChangeStatus.EmAndamento,
        ).length
        const canceladas = safeChanges.filter((item) => item.status === ChangeStatus.Cancelada).length

        return {
            concluidas,
            pendentes,
            canceladas,
        }
    }, [safeChanges])

    const resolvidas = incidents.filter((item) => item.statusIM === IncidentStatus.Resolvido).length
    const recentIncidents = incidents.slice(0, 5)

    return (
        <section className="page-section">
            <PageHeader eyebrow={i18n.layout.panel} title={i18n.gmuds.title} compact />

            <div className="summary-strip">
                <SummaryItem label={i18n.gmuds.changes} value={totalItems} />
                <SummaryItem label={i18n.gmuds.completed} value={summary.concluidas} />
                <SummaryItem label={i18n.gmuds.pending} value={summary.pendentes + summary.canceladas} />
                <SummaryItem label={i18n.gmuds.resolvedIms} value={resolvidas} />
            </div>

            <Card
                title={i18n.gmuds.projects}
                action={<ButtonLink to="/gmuds/nova">{i18n.gmuds.new}</ButtonLink>}
            >
                {isLoading ? <p className="muted-text">Carregando GMUDs do backend...</p> : null}
                {error ? <p className="form-feedback form-feedback--error">{error}</p> : null}

                {!isLoading && !error ? (
                    <>
                        <div className="filters-panel">
                            <div className="filters-bar filters-bar--compact">
                                <label className="field">
                                    <span>Buscar</span>
                                    <input
                                        type="text"
                                        placeholder="Título ou change"
                                        value={searchTerm}
                                        onChange={(event) => setSearchTerm(event.target.value)}
                                    />
                                </label>

                                <label className="field">
                                    <span>Status</span>
                                    <select
                                        value={statusFilter}
                                        onChange={(event) => setStatusFilter(event.target.value)}
                                    >
                                        <option value="todos">Todos</option>
                                        <option value={ChangeStatus.Aberta}>Aberta</option>
                                        <option value={ChangeStatus.EmAndamento}>Em andamento</option>
                                        <option value={ChangeStatus.Concluida}>Concluída</option>
                                        <option value={ChangeStatus.Cancelada}>Cancelada</option>
                                    </select>
                                </label>

                                <label className="field">
                                    <span>Tipo</span>
                                    <select
                                        value={typeFilter}
                                        onChange={(event) => setTypeFilter(event.target.value)}
                                    >
                                        <option value="todos">Todos</option>
                                        <option value={ProjectType.Implantacao}>Implantação</option>
                                        <option value={ProjectType.Fix}>Fix</option>
                                    </select>
                                </label>

                                <label className="field">
                                    <span>Nova</span>
                                    <input
                                        type="text"
                                        placeholder="Solicitante"
                                        value={novaFilter}
                                        onChange={(event) => setNovaFilter(event.target.value)}
                                    />
                                </label>

                                <label className="field">
                                    <span>Brasilseg</span>
                                    <input
                                        type="text"
                                        placeholder="Responsável"
                                        value={brasilsegFilter}
                                        onChange={(event) => setBrasilsegFilter(event.target.value)}
                                    />
                                </label>
                            </div>

                            <div className="filters-range-row">
                                <label className="field">
                                    <span>Abertura de</span>
                                    <input
                                        type="date"
                                        value={openedAtStart}
                                        onChange={(event) => setOpenedAtStart(event.target.value)}
                                    />
                                </label>

                                <label className="field">
                                    <span>Abertura até</span>
                                    <input
                                        type="date"
                                        value={openedAtEnd}
                                        onChange={(event) => setOpenedAtEnd(event.target.value)}
                                    />
                                </label>

                                <label className="field">
                                    <span>Fechamento de</span>
                                    <input
                                        type="date"
                                        value={closedAtStart}
                                        onChange={(event) => setClosedAtStart(event.target.value)}
                                    />
                                </label>

                                <label className="field">
                                    <span>Fechamento até</span>
                                    <input
                                        type="date"
                                        value={closedAtEnd}
                                        onChange={(event) => setClosedAtEnd(event.target.value)}
                                    />
                                </label>

                                <div className="filters-actions filters-actions--compact">
                                    <button
                                        type="button"
                                        className="button button--ghost"
                                        onClick={() => {
                                            setSearchTerm('')
                                            setStatusFilter('todos')
                                            setTypeFilter('todos')
                                            setOpenedAtStart('')
                                            setOpenedAtEnd('')
                                            setClosedAtStart('')
                                            setClosedAtEnd('')
                                            setNovaFilter('')
                                            setBrasilsegFilter('')
                                        }}
                                    >
                                        Limpar
                                    </button>
                                </div>
                            </div>
                        </div>

                        <DataTable
                            headers={[
                                i18n.gmuds.table.projectName,
                                i18n.gmuds.table.project,
                                i18n.gmuds.table.sprint,
                                i18n.gmuds.table.change,
                                'Abertura',
                                'Fechamento',
                                i18n.gmuds.table.status,
                                i18n.gmuds.table.type,
                                i18n.gmuds.table.nova,
                                i18n.gmuds.table.brasilseg,
                                i18n.gmuds.table.actions,
                            ]}
                        >
                            {filteredChanges.length > 0 ? (
                                filteredChanges.map((change) => (
                                    <tr key={change.id}>
                                        <td>
                                            <div className="project-name-cell">
                                                <strong>{change.titulo}</strong>
                                            </div>
                                        </td>
                                        <td>{change.projeto}</td>
                                        <td>{change.sprint}</td>
                                        <td>{change.numero_change}</td>
                                        <td>{formatDateLabel(change.data_abertura)}</td>
                                        <td>{formatDateLabel(change.data_execucao)}</td>
                                        <td>
                                            <StatusBadge status={toDisplayChangeStatus(change.status)} />
                                        </td>
                                        <td>{toDisplayProjectType(change.tipo_projeto)}</td>
                                        <td>{change.solicitante}</td>
                                        <td>{change.responsavel}</td>
                                        <td>
                                            <TableActions>
                                                {change.id && canEditChanges ? (
                                                    <Link to={`/gmuds/${change.id}/editar`}>{i18n.gmuds.edit}</Link>
                                                ) : (
                                                    <span className="muted-text">Somente gerente/admin</span>
                                                )}
                                            </TableActions>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={11} className="muted-text">
                                        Nenhuma GMUD encontrada com os filtros aplicados.
                                    </td>
                                </tr>
                            )}
                        </DataTable>

                        <div className="pagination-bar">
                            <span className="muted-text">
                                Página {currentPage} de {totalPages} • {filteredChanges.length} de {totalItems} registro(s)
                            </span>

                            <div className="pagination-actions">
                                <button
                                    type="button"
                                    className="button button--ghost"
                                    disabled={currentPage <= 1 || isLoading}
                                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                >
                                    Anterior
                                </button>
                                <button
                                    type="button"
                                    className="button"
                                    disabled={currentPage >= totalPages || isLoading}
                                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                >
                                    Próxima
                                </button>
                            </div>
                        </div>
                    </>
                ) : null}
            </Card>

            <Card title={i18n.gmuds.latestIms}>
                <DataTable
                    headers={[
                        i18n.gmuds.table.group,
                        i18n.gmuds.table.im,
                        i18n.gmuds.table.status,
                        i18n.gmuds.table.openedAt,
                        i18n.gmuds.table.change,
                    ]}
                >
                    {recentIncidents.map((incident) => {
                        const linkedChange = safeChanges.find((change) => change.numero_change === incident.changeId)

                        return (
                            <tr key={incident.id}>
                                <td>{incident.grupoAtribuicao}</td>
                                <td>{incident.numeroIM}</td>
                                <td>
                                    <StatusBadge status={incident.statusIM} />
                                </td>
                                <td>{incident.dataAbertura}</td>
                                <td>
                                    {linkedChange?.id ? (
                                        <Link to={`/gmuds/${linkedChange.id}/editar`}>{incident.changeId}</Link>
                                    ) : (
                                        <span>{incident.changeId}</span>
                                    )}
                                </td>
                            </tr>
                        )
                    })}
                </DataTable>
            </Card>
        </section>
    )
}
