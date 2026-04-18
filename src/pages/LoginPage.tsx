import { useState, type ChangeEvent, type SyntheticEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import novaLogo from '../assets/nova-logo.svg'
import { InputField } from '../components/form'
import { i18n } from '../i18'
import { authApi } from '../services/api'

export function LoginPage() {
    const navigate = useNavigate()
    const [credentials, setCredentials] = useState({
        email: '',
        senha: '',
    })
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target

        setCredentials((current) => ({
            ...current,
            [name]: value,
        }))

        setError('')
    }

    const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsSubmitting(true)
        setError('')

        try {
            await authApi.login(credentials)
            navigate('/gmuds', { replace: true })
        } catch {
            setError('Não foi possível autenticar com o backend.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section className="login-page">
            <div className="login-card login-card--wide">
                <div className="login-hero">
                    <img className="login-logo" src={novaLogo} alt="NOVA" />
                    <span className="badge">{i18n.login.secureAccess}</span>
                    <h1>{i18n.login.title}</h1>
                    <p className="muted-text">{i18n.login.description}</p>
                </div>

                <form className="login-form-area" onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <InputField
                            label={i18n.login.email}
                            name="email"
                            type="email"
                            placeholder={i18n.login.emailPlaceholder}
                            value={credentials.email}
                            onChange={handleChange}
                            required
                        />

                        <InputField
                            label={i18n.login.password}
                            name="senha"
                            type="password"
                            placeholder="••••••••"
                            value={credentials.senha}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {error ? <p className="form-feedback form-feedback--error">{error}</p> : null}

                    <div className="actions">
                        <button className="button" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Entrando...' : i18n.login.enter}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    )
}
