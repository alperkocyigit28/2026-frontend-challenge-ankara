import type { Source } from '../types/records'

export const FORM_IDS: Record<Source, string> = {
  checkin: '261065067494966',
  message: '261065765723966',
  sighting: '261065244786967',
  note: '261065509008958',
  tip: '261065875889981',
}

export const SOURCES = Object.keys(FORM_IDS) as Source[]

export const API_KEY: string = import.meta.env.VITE_JOTFORM_API_KEY ?? ''

export const API_BASE = 'https://api.jotform.com'
