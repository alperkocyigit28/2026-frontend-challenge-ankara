import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'
import { fetchSubmissions } from '../api/jotform'
import { FORM_IDS, SOURCES } from '../api/forms'
import { normalizeAll } from '../lib/normalize'
import type { InvestigationRecord, Source } from '../types/records'

export interface AllRecordsState {
  records: InvestigationRecord[]
  bySource: Record<Source, InvestigationRecord[]>
  isLoading: boolean
  isError: boolean
  errors: Error[]
  refetch: () => void
}

export function useAllRecords(): AllRecordsState {
  const queries = useQueries({
    queries: SOURCES.map((source) => ({
      queryKey: ['submissions', source] as const,
      queryFn: async () => {
        const raw = await fetchSubmissions(FORM_IDS[source])
        return normalizeAll(source, raw)
      },
    })),
  })

  return useMemo(() => {
    const bySource = {} as Record<Source, InvestigationRecord[]>
    const all: InvestigationRecord[] = []
    const errors: Error[] = []
    let isLoading = false
    let isError = false

    SOURCES.forEach((source, i) => {
      const q = queries[i]
      const data = q.data ?? []
      bySource[source] = data
      all.push(...data)
      if (q.isLoading) isLoading = true
      if (q.isError) {
        isError = true
        if (q.error instanceof Error) errors.push(q.error)
      }
    })

    all.sort((a, b) => {
      const ta = a.at?.getTime() ?? 0
      const tb = b.at?.getTime() ?? 0
      return tb - ta
    })

    return {
      records: all,
      bySource,
      isLoading,
      isError,
      errors,
      refetch: () => queries.forEach((q) => q.refetch()),
    }
  }, [queries])
}
