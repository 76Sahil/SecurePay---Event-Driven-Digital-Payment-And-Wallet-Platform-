import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRouter from './app/AppRouter'
import { AuthProvider } from './context/AuthProvider'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AuthProvider>
            <AppRouter />
        </AuthProvider>
    </StrictMode>,
)