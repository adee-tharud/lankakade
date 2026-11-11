import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { LanguageContext } from '../../lib/i18n/language-context'
import { translate, type Language } from '../../lib/i18n/messages'

function initialLanguage(): Language {
  try {
    return localStorage.getItem('lankakade.language') === 'en' ? 'en' : 'ro'
  } catch {
    return 'ro'
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState(initialLanguage)
  useEffect(() => {
    document.documentElement.lang = language
    try {
      localStorage.setItem('lankakade.language', language)
    } catch {
      // The selector still works when the browser blocks preference storage.
    }
  }, [language])

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (
        key: Parameters<typeof translate>[1],
        values?: Record<string, string | number>,
      ) => translate(language, key, values),
    }),
    [language],
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}
