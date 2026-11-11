import { useLanguage } from '../lib/i18n/language-context'
import { useId, useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: string
  error?: string
}
export function FormField({
  label,
  hint,
  error,
  type = 'text',
  id: suppliedId,
  ...props
}: Props) {
  const { t } = useLanguage()

  const generatedId = useId()
  const id = suppliedId ?? generatedId
  const [visible, setVisible] = useState(false)
  const password = type === 'password'
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <input
          {...props}
          id={id}
          type={password && visible ? 'text' : type}
          className={password ? 'password-input' : ''}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${id}-help` : undefined}
        />
        {password && (
          <button
            type="button"
            className="password-toggle"
            aria-label={visible ? t('Ascunde parola') : t('Arată parola')}
            aria-pressed={visible}
            onClick={() => setVisible(!visible)}
          >
            {visible ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        )}
      </div>
      {(error || hint) && (
        <p id={`${id}-help`} className={error ? 'field-error' : 'field-hint'}>
          {error ?? hint}
        </p>
      )}
    </div>
  )
}
