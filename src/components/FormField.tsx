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
    <div data-slot="field" className="mx-0 mt-0 mb-4.75">
      <label className="block text-[0.72rem] font-semibold mb-2" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          {...props}
          id={id}
          type={password && visible ? 'text' : type}
          className={`w-full min-h-12.25 rounded-lg border border-border bg-surface py-3.25 pl-3.5 text-[0.79rem] text-text placeholder:text-muted placeholder:opacity-90 focus:outline-2 focus:outline-focus focus:outline-offset-1 aria-invalid:border-error ${password ? 'pr-12' : 'pr-3.5'}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${id}-help` : undefined}
        />
        {password && (
          <button
            type="button"
            className="absolute right-0.5 top-0.5 bottom-0.5 w-11 grid place-items-center border-0 bg-clear text-muted rounded-md"
            aria-label={visible ? t('Ascunde parola') : t('Arată parola')}
            aria-pressed={visible}
            onClick={() => setVisible(!visible)}
          >
            {visible ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        )}
      </div>
      {(error || hint) && (
        <p
          id={`${id}-help`}
          className={
            error
              ? 'text-[0.67rem] mt-1.5 text-error'
              : 'text-[0.67rem] mt-1.5 text-muted'
          }
        >
          {error ?? hint}
        </p>
      )}
    </div>
  )
}
