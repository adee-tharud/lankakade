import { useId } from 'react'
import { Languages } from 'lucide-react'
import { useLanguage } from '../lib/i18n/language-context'

export function LanguageSwitcher() {
  const id = useId()
  const { language, setLanguage, t } = useLanguage()
  return (
    <div
      data-slot="language-switcher"
      className="gap-1.75 flex items-center text-brand mobile:gap-1.25"
    >
      <Languages size={17} aria-hidden="true" />
      <label className="sr-only" htmlFor={id}>
        {t('Limba site-ului')}
      </label>
      <select
        className="px-1.5 py-2 min-h-11 max-w-30 border border-border rounded-lg bg-surface text-text text-[0.75rem] cursor-pointer"
        id={id}
        value={language}
        onChange={(event) => {
          const value = event.target.value
          if (value === 'en' || value === 'ro') setLanguage(value)
        }}
      >
        <option value="en" lang="en">
          English
        </option>
        <option value="ro" lang="ro">
          Română
        </option>
      </select>
    </div>
  )
}
