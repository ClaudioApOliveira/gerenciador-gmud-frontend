import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import novaLogo from '../assets/nova-logo.svg'
import { ButtonLink } from '../components/ui'
import { i18n } from '../i18'
import { authApi } from '../services/api'
import { getAuthSession } from '../services/auth'

export function AppLayout() {
    const navigate = useNavigate()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const currentRole = getAuthSession()?.user?.role?.toLowerCase() ?? ''
    const menu = [
        { to: '/gmuds', label: i18n.layout.panel },
        ...(currentRole === '' || currentRole === 'admin'
            ? [{ to: '/usuarios/configuracao', label: i18n.layout.user }]
            : []),
    ]

    const handleLogout = () => {
        void authApi.logout()
        setIsMenuOpen(false)
        navigate('/login', { replace: true })
    }

    return (
        <div className="shell">
            {isMenuOpen ? (
                <button
                    type="button"
                    className="sidebar-backdrop"
                    aria-label={i18n.layout.closeMenu}
                    onClick={() => setIsMenuOpen(false)}
                />
            ) : null}

            <aside className={`sidebar${isMenuOpen ? ' sidebar--open' : ''}`}>
                <div className="brand-panel brand-panel--minimal">
                    <img className="brand-logo" src={novaLogo} alt="NOVA" />
                    <div className="brand-copy">
                        <span className="badge">{i18n.layout.operation}</span>
                        <h2 className="sidebar-title">{i18n.layout.appTitle}</h2>
                    </div>
                </div>

                <nav className="menu">
                    {menu.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setIsMenuOpen(false)}
                            className={({ isActive }) =>
                                `menu-link${isActive ? ' menu-link--active' : ''}`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <span className="muted-text sidebar-mini-note">{i18n.layout.changesAndIms}</span>
                    <ButtonLink
                        variant="secondary"
                        to="/login"
                        onClick={handleLogout}
                    >
                        {i18n.layout.logout}
                    </ButtonLink>
                </div>
            </aside>

            <div className="content">
                <header className="topbar topbar-panel">
                    <div className="topbar-main">
                        <button
                            type="button"
                            className="menu-toggle"
                            aria-label={i18n.layout.openMenu}
                            onClick={() => setIsMenuOpen((current) => !current)}
                        >
                            ☰
                        </button>

                        <div>
                            <span className="eyebrow">{i18n.layout.panel}</span>
                            <h1>{i18n.layout.headerTitle}</h1>
                        </div>
                    </div>

                    <div className="topbar-actions">
                        <div className="status-pill">{i18n.layout.updated}</div>
                    </div>
                </header>

                <main>
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
