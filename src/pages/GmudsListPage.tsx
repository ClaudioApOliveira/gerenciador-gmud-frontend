import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ButtonLink, Card, DataTable, PageHeader, StatusBadge, SummaryItem, TableActions } from '../components/ui'
import { IncidentStatus, incidents } from '../data/operationsData'
import { i18n } from '../i18'
import {
    ChangeService,
    ChangeStatus,
    toDisplayChangeStatus,
    toDisplayProjectType,
    type ChangeRecord,
} from '../services/changeService'

const DEFAULT_PER_PAGE = 20

export function GmudsListPage() {
    const [changes, setChanges] = useState<ChangeRecord[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [totalPages, setTotalPages] = useState(1)

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
                        <DataTable
                            headers={[
                                i18n.gmuds.table.projectName,
                                i18n.gmuds.table.project,
                                i18n.gmuds.table.sprint,
                                i18n.gmuds.table.change,
                                i18n.gmuds.table.status,
                                i18n.gmuds.table.type,
                                i18n.gmuds.table.nova,
                                i18n.gmuds.table.brasilseg,
                                i18n.gmuds.table.actions,
                            ]}
                        >
                            {safeChanges.length > 0 ? (
                                safeChanges.map((change) => (
                                    <tr key={change.id}>
                                        <td>
                                            <div className="project-name-cell">
                                                <strong>{change.titulo}</strong>
                                            </div>
                                        </td>
                                        <td>{change.projeto}</td>
                                        <td>{change.sprint}</td>
                                        <td>{change.numero_change}</td>
                                        <td>
                                            <StatusBadge status={toDisplayChangeStatus(change.status)} />
                                        </td>
                                        <td>{toDisplayProjectType(change.tipo_projeto)}</td>
                                        <td>{change.solicitante}</td>
                                        <td>{change.responsavel}</td>
                                        <td>
                                            <TableActions>
                                                {change.id ? (
                                                    <>
                                                        <Link to={`/gmuds/${change.id}/editar`}>{i18n.gmuds.edit}</Link>
                                                        <Link to={`/gmuds/${change.id}/editar`}>{i18n.gmuds.ims}</Link>
                                                    </>
                                                ) : (
                                                    <span className="muted-text">Indisponível</span>
                                                )}
                                            </TableActions>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={9} className="muted-text">
                                        Nenhuma GMUD encontrada no backend.
                                    </td>
                                </tr>
                            )}
                        </DataTable>

                        <div className="pagination-bar">
                            <span className="muted-text">
                                Página {currentPage} de {totalPages} • {totalItems} registro(s)
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
