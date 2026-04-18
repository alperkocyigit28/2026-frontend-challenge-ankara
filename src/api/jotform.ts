import { API_BASE, API_KEY } from './forms'

export interface RawAnswer {
  name?: string
  text?: string
  answer?: string | Record<string, string>
  type?: string
  order?: string
}

export interface RawSubmission {
  id: string
  form_id: string
  created_at: string
  answers: Record<string, RawAnswer>
}

interface JotformResponse<T> {
  responseCode: number
  message: string
  content: T
}

export async function fetchSubmissions(
  formId: string,
  limit = 1000,
): Promise<RawSubmission[]> {
  const url = `${API_BASE}/form/${formId}/submissions?apiKey=${API_KEY}&limit=${limit}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Jotform ${formId} request failed: ${res.status}`)
  }
  const json = (await res.json()) as JotformResponse<RawSubmission[]>
  if (json.responseCode !== 200) {
    throw new Error(`Jotform ${formId} error: ${json.message}`)
  }
  return json.content
}
