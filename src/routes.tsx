import { Navigate, createHashRouter } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { GmudCreatePage } from './pages/GmudCreatePage'
import { GmudEditPage } from './pages/GmudEditPage'
import { GmudsListPage } from './pages/GmudsListPage'
import { LoginPage } from './pages/LoginPage'
import { UserSettingsPage } from './pages/UserSettingsPage'
import { canEditGmuds, isAuthenticated } from './services/auth'

function RequireAuth() {
    return isAuthenticated() ? <AppLayout /> : <Navigate to="/login" replace />
}

function PublicOnlyLogin() {
    return isAuthenticated() ? <Navigate to="/gmuds" replace /> : <LoginPage />
}

function RequireGmudEditPermission() {
    return canEditGmuds() ? <GmudEditPage /> : <Navigate to="/gmuds" replace />
}

function FallbackRoute() {
    return <Navigate to={isAuthenticated() ? '/gmuds' : '/login'} replace />
}

export const router = createHashRouter([
    {
        path: '/login',
        element: <PublicOnlyLogin />,
    },
    {
        path: '/',
        element: <RequireAuth />,
        children: [
            { index: true, element: <Navigate to="/gmuds" replace /> },
            { path: 'usuarios/configuracao', element: <UserSettingsPage /> },
            { path: 'gmuds', element: <GmudsListPage /> },
            { path: 'gmuds/nova', element: <GmudCreatePage /> },
            { path: 'gmuds/:gmudId/editar', element: <RequireGmudEditPermission /> },
        ],
    },
    {
        path: '*',
        element: <FallbackRoute />,
    },
])
