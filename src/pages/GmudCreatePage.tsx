import { useState, type ChangeEvent, type SyntheticEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { InputField, SelectField, type SelectOption } from '../components/form'
import { PageHeader } from '../components/ui'
import { i18n } from '../i18'
import {
    ChangeService,
    ChangeStatus,
    ProjectType,
    toDisplayChangeStatus,
    toDisplayProjectType,
    type ChangeFormData,
} from '../services/changeService'

const checklist = i18n.gmuds.createPage.checklist

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

const initialFormData: ChangeFormData = {
    titulo: '',
    projeto: '',
    sprint: '',
    numero_change: '',
    solicitante: '',
    responsavel: '',
    status: ChangeStatus.Aberta,
    tipo_projeto: ProjectType.Fix,
    data_abertura: '',
    data_execucao: '',
}

export function GmudCreatePage() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState<ChangeFormData>(initialFormData)
    const [feedback, setFeedback] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (
        event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = event.target

        const normalizedValue =
            name === 'projeto' || name === 'numero_change' ? value.toUpperCase() : value

        setFormData((current) => ({
            ...current,
            [name]: normalizedValue,
        }))

        setFeedback('')
    }

    const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsSubmitting(true)
        setFeedback('')

        try {
            const created = await ChangeService.create(formData)

            navigate(created?.id ? `/gmuds/${created.id}/editar` : '/gmuds', { replace: true })
        } catch {
            setFeedback('Não foi possível criar a GMUD no backend.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section className="page-section">
            <PageHeader
                eyebrow={i18n.gmuds.createPage.eyebrow}
                title={i18n.gmuds.createPage.title}
                description={i18n.gmuds.createPage.description}
            />

            <div className="gmud-create-layout">
                <form className="card gmud-form" onSubmit={handleSubmit}>
                    <div className="form-section">
                        <div className="form-section-header">
                            <div>
                                <h3>{i18n.gmuds.createPage.projectData}</h3>
                                <p className="muted-text">{i18n.gmuds.createPage.projectDataDescription}</p>
                            </div>
                            <span className="section-chip">{i18n.gmuds.createPage.required}</span>
                        </div>

                        <div className="form-grid form-grid--two-columns">
                            <InputField
                                label={i18n.gmuds.table.projectName}
                                name="titulo"
                                type="text"
                                placeholder={i18n.gmuds.createPage.projectNamePlaceholder}
                                value={formData.titulo}
                                onChange={handleChange}
                                fullWidth
                                required
                            />

                            <InputField
                                label={i18n.gmuds.editPage.projectNumber}
                                name="projeto"
                                type="text"
                                placeholder={i18n.gmuds.createPage.projectNumberPlaceholder}
                                value={formData.projeto}
                                onChange={handleChange}
                                required
                            />

                            <InputField
                                label={i18n.gmuds.table.sprint}
                                name="sprint"
                                type="text"
                                placeholder={i18n.gmuds.createPage.sprintPlaceholder}
                                value={formData.sprint}
                                onChange={handleChange}
                                required
                            />

                            <InputField
                                label={i18n.gmuds.editPage.changeNumber}
                                name="numero_change"
                                type="text"
                                placeholder={i18n.gmuds.createPage.changeNumberPlaceholder}
                                value={formData.numero_change}
                                onChange={handleChange}
                                required
                            />

                            <SelectField
                                label={i18n.gmuds.editPage.changeStatus}
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                options={changeStatusOptions}
                            />

                            <SelectField
                                label={i18n.gmuds.createPage.projectType}
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
                                <h3>{i18n.gmuds.createPage.ownersAndExecution}</h3>
                                <p className="muted-text">{i18n.gmuds.createPage.ownersAndExecutionDescription}</p>
                            </div>
                        </div>

                        <div className="form-grid form-grid--two-columns">
                            <InputField
                                label={i18n.gmuds.createPage.novaDeveloper}
                                name="solicitante"
                                type="text"
                                placeholder={i18n.gmuds.createPage.novaDeveloperPlaceholder}
                                value={formData.solicitante}
                                onChange={handleChange}
                                required
                            />

                            <InputField
                                label={i18n.gmuds.createPage.brasilsegOwner}
                                name="responsavel"
                                type="text"
                                placeholder={i18n.gmuds.createPage.brasilsegOwnerPlaceholder}
                                value={formData.responsavel}
                                onChange={handleChange}
                                required
                            />

                            <InputField
                                label={i18n.gmuds.createPage.openedAt}
                                name="data_abertura"
                                type="date"
                                value={formData.data_abertura}
                                onChange={handleChange}
                                required
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

                    {feedback ? <p className="form-feedback form-feedback--error">{feedback}</p> : null}

                    <div className="form-actions">
                        <button type="submit" className="button" disabled={isSubmitting}>
                            {isSubmitting ? 'Salvando...' : i18n.gmuds.createPage.createRecord}
                        </button>
                    </div>
                </form>

                <aside className="gmud-side-panel">
                    <article className="card">
                        <h3>{i18n.gmuds.createPage.goal}</h3>
                        <p className="muted-text">{i18n.gmuds.createPage.goalDescription}</p>
                    </article>

                    <article className="card">
                        <h3>{i18n.gmuds.createPage.checklistTitle}</h3>
                        <ul className="check-list">
                            {checklist.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </article>
                </aside>
            </div>
        </section>
    )
}
