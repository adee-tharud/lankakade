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
    <div className="addresses-section">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">{t('PREGĂTIT PENTRU DATA VIITOARE')}</span>
          <h2 ref={listHeading} tabIndex={-1}>
            {t('Adrese salvate')}{' '}
          </h2>
        </div>
        <Button
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
      <p className="panel-description">
        {t('Adresele tale, la îndemână pentru următoarea comandă.')}{' '}
      </p>
      {error && <Notice>{t(error)}</Notice>}
      {notice && <Notice tone="success">{t(notice)}</Notice>}
      {loading ? (
        <p className="loading-copy" role="status">
          {t('Se încarcă adresele…')}{' '}
        </p>
      ) : (
        <>
          {!error && addresses.length === 0 && !editor && (
            <div className="empty-state">
              <MapPin size={32} aria-hidden="true" />
              <h3>{t('Unde trimitem gustul de acasă?')}</h3>
              <p>
                {t('Adaugă prima adresă de livrare. O poți modifica oricând.')}
              </p>
              <Button onClick={() => setEditor('new')}>
                {t('Adaugă prima adresă')}{' '}
              </Button>
            </div>
          )}
          <div className="address-list">
            {addresses.map((address) => (
              <article className="address-card" key={address.id}>
                <div className="address-card-heading">
                  <span className="address-icon">
                    <MapPin size={20} aria-hidden="true" />
                  </span>
                  <h3>{address.label || t('Adresă de livrare')}</h3>
                </div>
                <strong>{address.recipientName}</strong>
                <p>
                  {address.addressLine1}
                  {address.addressLine2 && `, ${address.addressLine2}`}
                </p>
                <p>
                  {address.locality}, {address.region}, {address.postalCode}
                </p>
                <p>
                  {address.countryCode} <span aria-hidden="true">·</span>{' '}
                  {address.recipientPhone}
                </p>
                {confirmDelete === address.id ? (
                  <div className="delete-confirm">
                    <p>{t('Ștergi această adresă?')}</p>
                    <div className="button-row">
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
                  <div className="address-actions">
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
            <p className="help-copy">{t('Ai atins limita de 20 de adrese.')}</p>
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
