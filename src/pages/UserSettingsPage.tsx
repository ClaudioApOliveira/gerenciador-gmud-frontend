import { useCallback, useEffect, useState, type ChangeEvent, type SyntheticEvent } from 'react'
import { InputField, SelectField } from '../components/form'
import { DataTable } from '../components/ui'
import { i18n } from '../i18'
import { getAuthSession } from '../services/auth'
import { UserRole, UserService, type UserApiResponse, type UserFormData } from '../services/userService'

const roleOptions = [
    { value: UserRole.Common, label: i18n.userSettings.roles.common },
    { value: UserRole.Manager, label: i18n.userSettings.roles.manager },
    { value: UserRole.Admin, label: i18n.userSettings.roles.admin },
]

const initialFormState: UserFormData = {
    nome: '',
    email: '',
    senha: '',
    role: UserRole.Common,
}

function getResponseStatus(error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as { response?: { status?: number } }).response
        return response?.status
    }

    return undefined
}

function getRoleLabel(role: string) {
    switch (role) {
        case UserRole.Admin:
            return i18n.userSettings.roles.admin
        case UserRole.Manager:
            return i18n.userSettings.roles.manager
        case UserRole.Common:
            return i18n.userSettings.roles.common
        default:
            return role
    }
}

export function UserSettingsPage() {
    const currentRole = getAuthSession()?.user?.role?.toLowerCase() ?? ''
    const [formData, setFormData] = useState<UserFormData>(initialFormState)
    const [users, setUsers] = useState<UserApiResponse[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [feedback, setFeedback] = useState('')
    const [error, setError] = useState('')
    const [accessDenied, setAccessDenied] = useState(currentRole.length > 0 && currentRole !== UserRole.Admin)

    const loadUsers = useCallback(async () => {
        setIsLoading(true)
        setError('')

        try {
            const data = await UserService.getAll()
            setUsers(data)
        } catch (loadError) {
            if (getResponseStatus(loadError) === 403) {
                setAccessDenied(true)
                setError(i18n.userSettings.accessDenied)
            } else {
                setError(i18n.userSettings.loadError)
            }
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        if (accessDenied) {
            setIsLoading(false)
            return
        }

        void loadUsers()
    }, [accessDenied, loadUsers])

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target

        setFormData((current) => ({
            ...current,
            [name]: name === 'email' ? value.trim().toLowerCase() : value,
        }))

        setFeedback('')
        setError('')
    }

    const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (accessDenied) {
            setError(i18n.userSettings.accessDenied)
            return
        }

        if (!formData.nome.trim() || !formData.email.trim() || !formData.senha.trim()) {
            setError(i18n.userSettings.validation)
            return
        }

        setIsSubmitting(true)
        setFeedback('')
        setError('')

        try {
            await UserService.create(formData)
            setFormData(initialFormState)
            setFeedback(i18n.userSettings.createdSuccess)
            await loadUsers()
        } catch (submitError) {
            if (getResponseStatus(submitError) === 403) {
                setAccessDenied(true)
                setError(i18n.userSettings.accessDenied)
            } else {
                setError(i18n.userSettings.submitError)
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    if (accessDenied) {
        return (
            <section className="page-section">
                <div className="section-header">
                    <span className="eyebrow">{i18n.layout.user}</span>
                    <h2>{i18n.userSettings.title}</h2>
                    <p className="muted-text">{i18n.userSettings.description}</p>
                </div>

                <div className="card">
                    <h3>{i18n.userSettings.listTitle}</h3>
                    <p className="form-feedback form-feedback--error">{i18n.userSettings.accessDenied}</p>
                </div>
            </section>
        )
    }

    let usersContent = <p className="muted-text">{i18n.userSettings.loading}</p>

    if (!isLoading && users.length === 0) {
        usersContent = <p className="muted-text">{i18n.userSettings.empty}</p>
    }

    if (!isLoading && users.length > 0) {
        usersContent = (
            <DataTable
                headers={[
                    i18n.userSettings.table.name,
                    i18n.userSettings.table.email,
                    i18n.userSettings.table.role,
                    i18n.userSettings.table.status,
                ]}
            >
                {users.map((user) => (
                    <tr key={user.id || user.email}>
                        <td>{user.nome}</td>
                        <td>{user.email}</td>
                        <td>
                            <span className={`user-role user-role--${user.role}`}>
                                {getRoleLabel(user.role)}
                            </span>
                        </td>
                        <td>
                            <span className={`user-active${user.ativo ? ' is-active' : ''}`}>
                                {user.ativo ? i18n.userSettings.statusActive : i18n.userSettings.statusInactive}
                            </span>
                        </td>
                    </tr>
                ))}
            </DataTable>
        )
    }

    return (
        <section className="page-section">
            <div className="section-header">
                <span className="eyebrow">{i18n.layout.user}</span>
                <h2>{i18n.userSettings.title}</h2>
                <p className="muted-text">{i18n.userSettings.description}</p>
            </div>

            <div className="user-settings-layout">
                <form className="card gmud-form" onSubmit={handleSubmit}>
                    <div className="form-section">
                        <div className="form-section-header">
                            <div>
                                <h3>{i18n.userSettings.registerTitle}</h3>
                                <p className="muted-text">{i18n.userSettings.registerDescription}</p>
                            </div>
                            <span className="section-chip">{users.length} usuários</span>
                        </div>

                        <div className="form-grid form-grid--two-columns">
                            <InputField
                                label={i18n.userSettings.name}
                                name="nome"
                                placeholder="Nome completo"
                                value={formData.nome}
                                onChange={handleChange}
                                fullWidth
                                required
                            />

                            <InputField
                                label={i18n.userSettings.email}
                                name="email"
                                type="email"
                                placeholder="usuario@empresa.com"
                                value={formData.email}
                                onChange={handleChange}
                                fullWidth
                                required
                            />

                            <InputField
                                label={i18n.userSettings.password}
                                name="senha"
                                type="password"
                                placeholder="••••••••"
                                value={formData.senha}
                                onChange={handleChange}
                                required
                            />

                            <SelectField
                                label={i18n.userSettings.role}
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                options={roleOptions}
                            />
                        </div>
                    </div>

                    {feedback ? <p className="form-feedback form-feedback--success">{feedback}</p> : null}
                    {error ? <p className="form-feedback form-feedback--error">{error}</p> : null}

                    <div className="actions">
                        <button className="button" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? i18n.userSettings.submitting : i18n.userSettings.create}
                        </button>
                    </div>
                </form>

                <div className="card">
                    <div className="card-header">
                        <div>
                            <h3>{i18n.userSettings.listTitle}</h3>
                            <p className="muted-text">{i18n.userSettings.listDescription}</p>
                        </div>
                    </div>

                    {usersContent}
                </div>
            </div>
        </section>
    )
}
