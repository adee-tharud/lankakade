import { useEffect, useState } from 'react'

export function useResource<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    let active = true
    void load(controller.signal)
      .then((result) => {
        if (active) setData(result)
      })
      .catch((failure) => {
        if (active) setError(failure)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
      controller.abort()
    }
  }, [load, revision])
  function retry() {
    setError(null)
    setLoading(true)
    setRevision((value) => value + 1)
  }
  return { data, error, loading, retry }
}
