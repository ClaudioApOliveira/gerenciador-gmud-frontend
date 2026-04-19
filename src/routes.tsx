import { Navigate, createHashRouter } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { GmudCreatePage } from './pages/GmudCreatePage'
import { GmudEditPage } from './pages/GmudEditPage'
import { GmudsListPage } from './pages/GmudsListPage'
import { LoginPage } from './pages/LoginPage'
import { UserSettingsPage } from './pages/UserSettingsPage'
import { isAuthenticated } from './services/auth'

export const router = createHashRouter([
    {
        path: '/login',
        element: isAuthenticated() ? <Navigate to="/gmuds" replace /> : <LoginPage />,
    },
    {
        path: '/',
        element: isAuthenticated() ? <AppLayout /> : <Navigate to="/login" replace />,
        children: [
            { index: true, element: <Navigate to="/gmuds" replace /> },
            { path: 'usuarios/configuracao', element: <UserSettingsPage /> },
            { path: 'gmuds', element: <GmudsListPage /> },
            { path: 'gmuds/nova', element: <GmudCreatePage /> },
            { path: 'gmuds/:gmudId/editar', element: <GmudEditPage /> },
        ],
    },
    {
        path: '*',
        element: <Navigate to={isAuthenticated() ? '/gmuds' : '/login'} replace />,
    },
])
