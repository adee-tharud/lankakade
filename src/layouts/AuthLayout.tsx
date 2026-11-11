import { useLanguage } from '../lib/i18n/language-context'
import type { ReactNode } from 'react'
import { Leaf, MapPin, ShieldCheck, ArrowDownRight } from 'lucide-react'
import hero from '../assets/herosectionphoto.png'

export function AuthLayout({ children }: { children: ReactNode }) {
  const { t } = useLanguage()

  return (
    <div className="px-0 mx-auto my-0 w-[min(1180px,_90%)] pt-6.75 pb-16.25 mobile:px-4.5 mobile:w-full mobile:pt-5.5 mobile:pb-10">
      <div className="gap-3 flex text-muted text-[0.66rem] mb-6.75 mobile:mb-5 mobile:text-[0.61rem]">
        Lanka Kade <span aria-hidden="true">/</span> {t('Contul tău')}{' '}
      </div>
      <div className="grid grid-cols-[1fr_1fr] bg-surface border border-border rounded-[22px] overflow-hidden shadow-panel mobile:flex mobile:flex-col mobile:rounded-2xl">
        <aside
          className="px-8.75 bg-brand text-on-brand flex flex-col justify-between pt-11 pb-6 min-h-147.5 tablet:px-6.25 tablet:pt-8.75 tablet:pb-6 mobile:hidden"
          aria-label={t('Bine ai venit la Lanka Kade')}
        >
          <div>
            <span className="gap-1.75 inline-flex items-center text-[0.59rem] font-bold tracking-[0.13em] leading-[1.7]">
              <Leaf size={15} aria-hidden="true" />{' '}
              {t('FAMILIAR. AUTENTIC. APROAPE.')}{' '}
            </span>
            <h2 className="mx-0 text-[clamp(2rem,_3.5vw,_3.25rem)] leading-[1.16] mt-6 mb-4.5 tracking-[-0.045em]">
              {t('Gustul de acasă.')} <br />
              {t('La tine')} <span className="text-accent">{t('acasă.')}</span>
            </h2>
            <p className="text-on-brand-muted text-[0.82rem] max-w-87.5">
              {t(
                'Ingredientele pe care le iubești și micile lucruri care îți lipsesc. Acum, mai aproape.',
              )}{' '}
            </p>
          </div>
          <div className="mx-0 mt-8 mb-5 rounded-xl overflow-hidden">
            <img
              className="block w-full h-auto aspect-[2] object-contain"
              src={hero}
              width="1774"
              height="887"
              alt={t(
                'Produse Sri Lanka, orez, mirodenii și ceai de Ceylon, alături de o sacoșă Lanka Kade',
              )}
            />
          </div>
          <div className="flex items-center justify-between border-t border-t-brand-border pt-4.5">
            <span className="gap-2 flex items-center text-[0.66rem] text-on-brand-muted">
              <MapPin size={16} aria-hidden="true" />{' '}
              {t('Din Sri Lanka, în România')}{' '}
            </span>
            <ArrowDownRight size={25} aria-hidden="true" />
          </div>
        </aside>
        <section className="px-[clamp(25px,_4vw,_62px)] pt-11 pb-6.5 flex flex-col justify-center tablet:px-7 tablet:pt-8.75 tablet:pb-6.5 mobile:px-5.75 mobile:pt-7.5 mobile:pb-6 mobile:min-h-133.75">
          {children}
          <div className="gap-1.5 flex justify-center items-center mt-8 pt-4.5 border-t border-t-border text-[0.62rem] text-muted">
            <ShieldCheck size={16} aria-hidden="true" />{' '}
            {t('Conectare sigură. Date protejate.')}{' '}
          </div>
        </section>
      </div>
    </div>
  )
}
