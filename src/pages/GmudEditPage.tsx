import { useEffect, useState, type ChangeEvent, type SyntheticEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { InputField, SelectField, type SelectOption } from '../components/form'
import { PageHeader, StatusBadge, SummaryItem } from '../components/ui'
import { IncidentStatus, getIncidentsByChange, type IncidentRecord } from '../data/operationsData'
import {
    getIncidentFieldErrors,
    incidentSchema,
    initialIncidentForm,
    type IncidentFormData,
    type IncidentFormErrors,
} from '../schemas/incidentSchema'
import { i18n } from '../i18'
import {
    ChangeService,
    ChangeStatus,
    ProjectType,
    mapApiChangeToForm,
    toDisplayChangeStatus,
    toDisplayProjectType,
    type ChangeFormData,
} from '../services/changeService'

const changeStatusOptions: ReadonlyArray<SelectOption> = [
    { value: ChangeStatus.Aberta, label: toDisplayChangeStatus(ChangeStatus.Aberta) },
    { value: ChangeStatus.EmAndamento, label: toDisplayChangeStatus(ChangeStatus.EmAndamento) },
    { value: ChangeStatus.Concluida, label: toDisplayChangeStatus(ChangeStatus.Concluida) },
    { value: ChangeStatus.Cancelada, label: toDisplayChangeStatus(ChangeStatus.Cancelada) },
]

const projectTypeOptions: ReadonlyArray<SelectOption> = [
    { value: ProjectType.Fix, label: toDisplayProjectType(ProjectType.Fix) },
    { value: ProjectType.Implantacao, label: toDisplayProjectType(ProjectType.Implantacao) },
]

const incidentStatusOptions: ReadonlyArray<SelectOption> = [
    { value: IncidentStatus.Acompanhando, label: IncidentStatus.Acompanhando },
    { value: IncidentStatus.Resolvido, label: IncidentStatus.Resolvido },
]

export function GmudEditPage() {
    const { gmudId } = useParams()
    const [formData, setFormData] = useState<ChangeFormData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [saveFeedback, setSaveFeedback] = useState('')
    const [relatedIncidents, setRelatedIncidents] = useState<IncidentRecord[]>([])
    const [incidentForm, setIncidentForm] = useState<IncidentFormData>(initialIncidentForm)
    const [incidentErrors, setIncidentErrors] = useState<IncidentFormErrors>({})
    const [incidentFeedback, setIncidentFeedback] = useState('')
    const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false)

    useEffect(() => {
        if (!gmudId) {
            setLoadError(i18n.gmuds.editPage.notFoundDescription)
            setIsLoading(false)
            return
        }

        let isMounted = true

        const loadChange = async () => {
            try {
                const change = await ChangeService.getById(gmudId)

                if (!change) {
                    throw new Error('GMUD não encontrada')
                }

                if (isMounted) {
                    const nextFormData = mapApiChangeToForm(change)
                    setFormData(nextFormData)
                    setRelatedIncidents(getIncidentsByChange(change.numero_change))
                    setLoadError('')
                }
            } catch {
                if (isMounted) {
                    setLoadError('Não foi possível carregar a GMUD no backend.')
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }

        void loadChange()

        return () => {
            isMounted = false
        }
    }, [gmudId])

    const handleChange = (
        event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = event.target

        const normalizedValue =
            name === 'projeto' || name === 'numero_change' ? value.toUpperCase() : value

        setFormData((current) =>
            current
                ? {
                    ...current,
                    [name]: normalizedValue,
                }
                : current,
        )

        setSaveFeedback('')
    }

    const handleSave = async (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!gmudId || !formData) {
            return
        }

        setIsSaving(true)
        setSaveFeedback('')

        try {
            const updated = await ChangeService.update(gmudId, formData)

            if (!updated) {
                setSaveFeedback('GMUD atualizada com sucesso.')
                return
            }

            const nextFormData = mapApiChangeToForm(updated)

            setFormData(nextFormData)
            setRelatedIncidents(getIncidentsByChange(updated.numero_change))
            setSaveFeedback('GMUD atualizada com sucesso.')
        } catch {
            setSaveFeedback('Não foi possível atualizar a GMUD no backend.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleIncidentChange = (
        event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const fieldName = event.target.name as keyof IncidentFormData

        setIncidentForm((current) => ({
            ...current,
            [fieldName]: event.target.value,
        }))

        setIncidentErrors((current) => ({
            ...current,
            [fieldName]: undefined,
        }))

        setIncidentFeedback('')
    }

    const handleIncidentSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()

        const result = incidentSchema.safeParse(incidentForm)

        if (!result.success) {
            setIncidentErrors(getIncidentFieldErrors(result.error))
            setIncidentFeedback(i18n.gmuds.editPage.validationSummary)
            return
        }

        if (!formData) {
            return
        }

        const newIncident: IncidentRecord = {
            id: result.data.numeroIM,
            changeId: formData.numero_change,
            grupoAtribuicao: result.data.grupoAtribuicao,
            numeroIM: result.data.numeroIM,
            statusIM: result.data.statusIM,
            dataAbertura: new Date().toLocaleString('pt-BR'),
            dataFechamento: '—',
            job: result.data.job,
        }

        setRelatedIncidents((current) => [newIncident, ...current])
        setIncidentForm(initialIncidentForm)
        setIncidentErrors({})
        setIncidentFeedback(i18n.gmuds.editPage.imAdded)
        setIsIncidentModalOpen(false)
    }

    if (isLoading) {
        return (
            <section className="page-section">
                <PageHeader
                    eyebrow={i18n.gmuds.editPage.eyebrow}
                    title="Carregando GMUD..."
                    description={i18n.gmuds.editPage.description}
                />
            </section>
        )
    }

    if (!formData || loadError) {
        return (
            <section className="page-section">
                <PageHeader
                    eyebrow={i18n.gmuds.editPage.eyebrow}
                    title={i18n.gmuds.editPage.notFound}
                    description={loadError || i18n.gmuds.editPage.notFoundDescription}
                />
            </section>
        )
    }

    return (
        <section className="page-section">
            <PageHeader
                eyebrow={i18n.gmuds.editPage.eyebrow}
                title={`${i18n.gmuds.editPage.titlePrefix} ${formData.numero_change}`}
                description={i18n.gmuds.editPage.description}
                compact
            />

            <div className="summary-strip summary-strip--details">
                <SummaryItem label={i18n.gmuds.editPage.currentStatus} value={toDisplayChangeStatus(formData.status)} />
                <SummaryItem label={i18n.gmuds.table.project} value={formData.projeto} />
                <SummaryItem label={i18n.gmuds.table.sprint} value={formData.sprint} />
                <SummaryItem label={i18n.gmuds.editPage.linkedIms} value={relatedIncidents.length} />
            </div>

            <div className="gmud-create-layout">
                <form className="card gmud-form" onSubmit={handleSave}>
                    <div className="form-section">
                        <div className="form-section-header">
                            <div>
                                <h3>{i18n.gmuds.editPage.mainData}</h3>
                                <p className="muted-text">{i18n.gmuds.editPage.mainDataDescription}</p>
                            </div>
                            <StatusBadge status={toDisplayChangeStatus(formData.status)} />
                        </div>

                        <div className="form-grid form-grid--two-columns">
                            <InputField
                                label={i18n.gmuds.table.projectName}
                                name="titulo"
                                type="text"
                                value={formData.titulo}
                                onChange={handleChange}
                                fullWidth
                            />

                            <InputField
                                label={i18n.gmuds.editPage.changeNumber}
                                name="numero_change"
                                type="text"
                                value={formData.numero_change}
                                onChange={handleChange}
                            />

                            <InputField
                                label={i18n.gmuds.editPage.projectNumber}
                                name="projeto"
                                type="text"
                                value={formData.projeto}
                                onChange={handleChange}
                            />

                            <InputField
                                label={i18n.gmuds.table.sprint}
                                name="sprint"
                                type="text"
                                value={formData.sprint}
                                onChange={handleChange}
                            />

                            <SelectField
                                label={i18n.gmuds.editPage.changeStatus}
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                options={changeStatusOptions}
                            />

                            <SelectField
                                label={i18n.gmuds.editPage.projectType}
                                name="tipo_projeto"
                                value={formData.tipo_projeto}
                                onChange={handleChange}
                                options={projectTypeOptions}
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="form-section-header">
                            <div>
                                <h3>{i18n.gmuds.editPage.owners}</h3>
                                <p className="muted-text">{i18n.gmuds.editPage.ownersDescription}</p>
                            </div>
                        </div>

                        <div className="form-grid form-grid--two-columns">
                            <InputField
                                label={i18n.gmuds.editPage.novaDeveloper}
                                name="solicitante"
                                type="text"
                                value={formData.solicitante}
                                onChange={handleChange}
                            />

                            <InputField
                                label={i18n.gmuds.editPage.brasilsegOwner}
                                name="responsavel"
                                type="text"
                                value={formData.responsavel}
                                onChange={handleChange}
                            />

                            <InputField
                                label={i18n.gmuds.createPage.closedAt}
                                name="data_execucao"
                                type="date"
                                value={formData.data_execucao}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {saveFeedback ? (
                        <p className={`form-feedback${saveFeedback.includes('Não') ? ' form-feedback--error' : ' form-feedback--success'}`}>
                            {saveFeedback}
                        </p>
                    ) : null}

                    <div className="form-actions">
                        <Link className="button button--ghost" to="/gmuds">
                            {i18n.gmuds.editPage.back}
                        </Link>
                        <button type="submit" className="button" disabled={isSaving}>
                            {isSaving ? 'Salvando...' : i18n.gmuds.editPage.save}
                        </button>
                    </div>
                </form>

                <aside className="gmud-side-panel">
                    <article className="card">
                        <h3>{i18n.gmuds.editPage.quickSummary}</h3>
                        <div className="form-grid">
                            <div className="field-preview">
                                <span>{i18n.gmuds.editPage.type}</span>
                                <strong>{toDisplayProjectType(formData.tipo_projeto)}</strong>
                            </div>
                            <div className="field-preview">
                                <span>{i18n.gmuds.editPage.status}</span>
                                <strong>{toDisplayChangeStatus(formData.status)}</strong>
                            </div>
                            <div className="field-preview">
                                <span>{i18n.gmuds.editPage.owner}</span>
                                <strong>{formData.responsavel}</strong>
                            </div>
                        </div>
                    </article>

                    <article className="card">
                        <h3>{i18n.gmuds.editPage.addImTitle}</h3>
                        <p className="muted-text">{i18n.gmuds.editPage.addImDescription}</p>

                        {incidentFeedback ? (
                            <p
                                className={`form-feedback${Object.keys(incidentErrors).length > 0 ? ' form-feedback--error' : ' form-feedback--success'}`}
                            >
                                {incidentFeedback}
                            </p>
                        ) : null}

                        <div className="form-actions">
                            <button type="button" className="button" onClick={() => setIsIncidentModalOpen(true)}>
                                {i18n.gmuds.editPage.addImButton}
                            </button>
                        </div>
                    </article>

                    <article className="card">
                        <h3>{i18n.gmuds.editPage.relatedIms}</h3>
                        {relatedIncidents.length > 0 ? (
                            <ul className="check-list">
                                {relatedIncidents.map((incident) => (
                                    <li key={incident.id}>
                                        {incident.numeroIM} — {incident.statusIM}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="muted-text">{i18n.gmuds.editPage.noRelatedIms}</p>
                        )}
                    </article>
                </aside>
            </div>

            {isIncidentModalOpen ? (
                <dialog className="modal-overlay" open aria-labelledby="incident-modal-title">
                    <div className="card modal-card">
                        <div className="form-section-header">
                            <div>
                                <h3 id="incident-modal-title">{i18n.gmuds.editPage.addImTitle}</h3>
                                <p className="muted-text">{i18n.gmuds.editPage.addImDescription}</p>
                            </div>
                            <button
                                type="button"
                                className="button button--ghost"
                                onClick={() => setIsIncidentModalOpen(false)}
                            >
                                Fechar
                            </button>
                        </div>

                        <form onSubmit={handleIncidentSubmit}>
                            <div className="form-grid">
                                <InputField
                                    label={i18n.gmuds.editPage.imNumber}
                                    name="numeroIM"
                                    type="text"
                                    value={incidentForm.numeroIM}
                                    onChange={handleIncidentChange}
                                    error={incidentErrors.numeroIM}
                                />

                                <InputField
                                    label={i18n.gmuds.editPage.assignmentGroup}
                                    name="grupoAtribuicao"
                                    type="text"
                                    value={incidentForm.grupoAtribuicao}
                                    onChange={handleIncidentChange}
                                    error={incidentErrors.grupoAtribuicao}
                                />

                                <SelectField
                                    label={i18n.gmuds.editPage.imStatus}
                                    name="statusIM"
                                    value={incidentForm.statusIM}
                                    onChange={handleIncidentChange}
                                    options={incidentStatusOptions}
                                    error={incidentErrors.statusIM}
                                />

                                <InputField
                                    label={i18n.gmuds.editPage.job}
                                    name="job"
                                    type="text"
                                    value={incidentForm.job}
                                    onChange={handleIncidentChange}
                                    error={incidentErrors.job}
                                />
                            </div>

                            {incidentFeedback ? (
                                <p
                                    className={`form-feedback${Object.keys(incidentErrors).length > 0 ? ' form-feedback--error' : ' form-feedback--success'}`}
                                >
                                    {incidentFeedback}
                                </p>
                            ) : null}

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="button button--ghost"
                                    onClick={() => setIsIncidentModalOpen(false)}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="button">
                                    {i18n.gmuds.editPage.addImButton}
                                </button>
                            </div>
                        </form>
                    </div>
                </dialog>
            ) : null}
        </section>
    )
}
