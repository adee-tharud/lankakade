import type { MessageKey } from '../../../lib/i18n/messages'
import { useLanguage } from '../../../lib/i18n/language-context'
import { useEffect, useRef, useState } from 'react'
import { MapPin, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react'
import { accountApi, type Address } from '../services/account-api'
import { Button } from '../../../components/Button'
import { Notice } from '../../../components/Notice'
import { errorMessage } from '../../../services/api/request'
import { AddressForm } from './AddressForm'

export function Addresses() {
  const { t } = useLanguage()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [reload, setReload] = useState(0)
  const [error, setError] = useState<MessageKey | ''>('')
  const [notice, setNotice] = useState<MessageKey | ''>('')
  const [editor, setEditor] = useState<Address | 'new' | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const deleteActive = useRef(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const listHeading = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    void accountApi
      .addresses(controller.signal)
      .then((data) => {
        if (active) setAddresses(data)
      })
      .catch((failure) => {
        if (active) setError(errorMessage(failure))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
      controller.abort()
    }
  }, [reload])
  useEffect(() => {
    if (editor) editorRef.current?.querySelector('input')?.focus()
  }, [editor])

  async function remove(id: string) {
    if (deleteActive.current) return
    deleteActive.current = true
    setDeleting(true)
    setError('')
    setNotice('')
    try {
      await accountApi.removeAddress(id)
      setAddresses((items) => items.filter((item) => item.id !== id))
      setConfirmDelete(null)
      setNotice('Adresa a fost ștearsă.')
      listHeading.current?.focus()
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      deleteActive.current = false
      setDeleting(false)
    }
  }

  function closeEditor() {
    setEditor(null)
    listHeading.current?.focus()
  }

  return (
    <div>
      <div
        data-slot="panel-heading"
        className="gap-3.5 flex justify-between items-center mb-3 mobile:items-start mobile:flex-wrap"
      >
        <div>
          <span className="gap-1.75 inline-flex items-center text-[0.59rem] font-bold tracking-[0.13em] leading-[1.7]">
            {t('PREGĂTIT PENTRU DATA VIITOARE')}
          </span>
          <h2 className="mt-2" ref={listHeading} tabIndex={-1}>
            {t('Adrese salvate')}{' '}
          </h2>
        </div>
        <Button
          className="mobile:w-full"
          variant="secondary"
          disabled={Boolean(editor) || loading || addresses.length >= 20}
          onClick={() => {
            setNotice('')
            setEditor('new')
          }}
        >
          <Plus size={17} aria-hidden="true" /> {t('Adaugă adresă')}{' '}
        </Button>
      </div>
      <p className="text-[0.78rem] text-muted mb-6.25">
        {t('Adresele tale, la îndemână pentru următoarea comandă.')}{' '}
      </p>
      {error && <Notice>{t(error)}</Notice>}
      {notice && <Notice tone="success">{t(notice)}</Notice>}
      {loading ? (
        <p className="px-0 py-11.25 text-muted text-[0.8rem]" role="status">
          {t('Se încarcă adresele…')}{' '}
        </p>
      ) : (
        <>
          {!error && addresses.length === 0 && !editor && (
            <div className="px-5 py-12.5 bg-surface border border-dashed border-border rounded-[14px] text-center [&_>_svg]:mx-auto [&_>_svg]:mt-0 [&_>_svg]:mb-5 [&_>_svg]:text-muted">
              <MapPin size={32} aria-hidden="true" />
              <h3>{t('Unde trimitem gustul de acasă?')}</h3>
              <p className="mx-0 text-[0.78rem] mt-2.5 mb-6 text-muted">
                {t('Adaugă prima adresă de livrare. O poți modifica oricând.')}
              </p>
              <Button onClick={() => setEditor('new')}>
                {t('Adaugă prima adresă')}{' '}
              </Button>
            </div>
          )}
          <div className="gap-4 grid grid-cols-[repeat(2,_minmax(0,_1fr))] tablet:grid-cols-[1fr]">
            {addresses.map((address) => (
              <article
                className="p-5.5 bg-surface border border-border rounded-xl wrap-anywhere"
                key={address.id}
              >
                <div className="gap-2.5 flex items-center mb-5">
                  <span className="grid place-items-center w-8.75 h-8.75 rounded-[10px] bg-brand-soft">
                    <MapPin size={20} aria-hidden="true" />
                  </span>
                  <h3>{address.label || t('Adresă de livrare')}</h3>
                </div>
                <strong className="text-[0.77rem]">
                  {address.recipientName}
                </strong>
                <p className="text-[0.71rem] text-muted mt-1.25">
                  {address.addressLine1}
                  {address.addressLine2 && `, ${address.addressLine2}`}
                </p>
                <p className="text-[0.71rem] text-muted mt-1.25">
                  {address.locality}, {address.region}, {address.postalCode}
                </p>
                <p className="text-[0.71rem] text-muted mt-1.25">
                  {address.countryCode} <span aria-hidden="true">·</span>{' '}
                  {address.recipientPhone}
                </p>
                {confirmDelete === address.id ? (
                  <div className="border-t border-t-border pt-3.75 mt-3.75 [&_[data-slot=button]]:p-2.5 [&_[data-slot=button]]:min-h-10.5 [&_[data-slot=button]]:text-[0.65rem]">
                    <p className="text-[0.74rem] mb-2.5">
                      {t('Ștergi această adresă?')}
                    </p>
                    <div className="gap-2.5 flex flex-wrap mobile:[&_>_[data-slot=button]]:flex-1">
                      <Button
                        variant="danger"
                        pending={deleting}
                        onClick={() => void remove(address.id)}
                      >
                        {t('Da, șterge')}{' '}
                      </Button>
                      <Button
                        variant="quiet"
                        disabled={deleting}
                        onClick={() => setConfirmDelete(null)}
                      >
                        {t('Păstrează')}{' '}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="gap-2.5 flex mt-3.75 pt-2.5 border-t border-t-border [&_[data-slot=button]]:text-[0.66rem]">
                    <Button
                      variant="quiet"
                      disabled={deleting || Boolean(editor)}
                      onClick={() => {
                        setEditor(address)
                        setConfirmDelete(null)
                      }}
                    >
                      <Pencil size={15} /> {t('Editează')}{' '}
                    </Button>
                    <Button
                      variant="quiet"
                      disabled={deleting || Boolean(editor)}
                      onClick={() => setConfirmDelete(address.id)}
                    >
                      <Trash2 size={15} /> {t('Șterge')}{' '}
                    </Button>
                  </div>
                )}
              </article>
            ))}
          </div>
          {addresses.length >= 20 && (
            <p className="mx-0 my-4.75 text-muted text-[0.7rem]">
              {t('Ai atins limita de 20 de adrese.')}
            </p>
          )}
        </>
      )}
      {!loading && (
        <Button
          variant="quiet"
          disabled={deleting || Boolean(editor)}
          onClick={() => {
            setLoading(true)
            setError('')
            setReload((value) => value + 1)
            setNotice('')
          }}
        >
          <RefreshCw size={15} aria-hidden="true" />{' '}
          {t('Reîncarcă adresele')}{' '}
        </Button>
      )}
      {editor && (
        <div ref={editorRef}>
          <AddressForm
            key={editor === 'new' ? 'new' : editor.id}
            address={editor === 'new' ? undefined : editor}
            onCancel={closeEditor}
            onSave={(saved) => {
              setAddresses((items) => [
                ...items.filter((item) => item.id !== saved.id),
                saved,
              ])
              closeEditor()
              setNotice('Adresa a fost salvată.')
            }}
          />
        </div>
      )}
    </div>
  )
}
