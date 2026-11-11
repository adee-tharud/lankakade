import { Minus, Plus } from 'lucide-react'
import { useLanguage } from '../lib/i18n/language-context'

export function QuantityStepper({
  value,
  max,
  onChange,
  disabled,
}: {
  value: number
  max: number
  onChange: (value: number) => void
  disabled?: boolean
}) {
  const { t } = useLanguage()
  return (
    <div
      className="flex items-center justify-between border border-border rounded-lg bg-surface w-33.75 shrink-0 mobile:w-28.75"
      role="group"
      aria-label={t('Cantitate')}
    >
      <button
        className="min-h-11.5 w-10.5 grid place-items-center border-0 bg-clear text-brand rounded-[7px]"
        type="button"
        disabled={disabled || value <= 1 || max < 1}
        onClick={() => onChange(Math.min(value - 1, max))}
        aria-label={t('Scade cantitatea')}
      >
        <Minus size={16} />
      </button>
      <span className="text-[0.8rem]" aria-live="polite">
        {value}
      </span>
      <button
        className="min-h-11.5 w-10.5 grid place-items-center border-0 bg-clear text-brand rounded-[7px]"
        type="button"
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
        aria-label={t('Crește cantitatea')}
      >
        <Plus size={16} />
      </button>
    </div>
  )
}
