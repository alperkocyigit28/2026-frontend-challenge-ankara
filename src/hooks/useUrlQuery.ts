import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

export function useUrlQuery(
  key: string,
): [string, (next: string) => void] {
  const [params, setParams] = useSearchParams()
  const value = params.get(key) ?? ''
  const set = useCallback(
    (next: string) => {
      setParams(
        (prev) => {
          const p = new URLSearchParams(prev)
          if (next) p.set(key, next)
          else p.delete(key)
          return p
        },
        { replace: true },
      )
    },
    [key, setParams],
  )
  return [value, set]
}

export function useUrlList(
  key: string,
): [string[], (next: string[]) => void] {
  const [params, setParams] = useSearchParams()
  const raw = params.get(key) ?? ''
  const value = raw ? raw.split(',').filter(Boolean) : []
  const set = useCallback(
    (next: string[]) => {
      setParams(
        (prev) => {
          const p = new URLSearchParams(prev)
          if (next.length) p.set(key, next.join(','))
          else p.delete(key)
          return p
        },
        { replace: true },
      )
    },
    [key, setParams],
  )
  return [value, set]
}
