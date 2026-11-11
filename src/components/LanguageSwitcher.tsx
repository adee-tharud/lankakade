import { useId } from 'react'
import { Languages } from 'lucide-react'
import { useLanguage } from '../lib/i18n/language-context'

export function LanguageSwitcher() {
  const id = useId()
  const { language, setLanguage, t } = useLanguage()
  return (
    <div className="language-switcher">
      <Languages size={17} aria-hidden="true" />
      <label className="sr-only" htmlFor={id}>
        {t('Limba site-ului')}
      </label>
      <select
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
