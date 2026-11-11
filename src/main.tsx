import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource/plus-jakarta-sans/400.css'
import '@fontsource/plus-jakarta-sans/500.css'
import '@fontsource/plus-jakarta-sans/600.css'
import '@fontsource/plus-jakarta-sans/700.css'
import { LanguageProvider } from './app/providers/LanguageProvider'
import { App } from './App'
import { store } from './app/store'
import { clearSession, restoreSession } from './features/auth/state/session'
import { handleSessionExpiry } from './services/api/request'
import './index.css'

// Capture email-link secrets once, before rendering, and remove them from history.
const path = window.location.pathname
const emailRoute = path === '/verify-email' || path === '/reset-password'
const token = emailRoute
  ? new URLSearchParams(window.location.hash.slice(1)).get('token')
  : null
if (emailRoute) window.history.replaceState(null, '', path)

handleSessionExpiry(() => store.dispatch(clearSession()))
void store.dispatch(restoreSession())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <LanguageProvider>
        <BrowserRouter>
          <App emailLink={{ path, token }} />
        </BrowserRouter>
      </LanguageProvider>
    </Provider>
  </StrictMode>,
)
