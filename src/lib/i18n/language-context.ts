import { createContext, useContext } from 'react'
import type { Language, MessageKey } from './messages'

export type LanguageContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: MessageKey | '', values?: Record<string, string | number>) => string
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)

export function useLanguage() {
  const value = useContext(LanguageContext)
  if (!value) throw new Error('LanguageProvider is required')
  return value
}
