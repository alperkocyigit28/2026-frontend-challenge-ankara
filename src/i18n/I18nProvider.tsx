import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  getCopy,
  LOCALE_TAG,
  type Locale,
} from '../lib/copy'

interface I18nContextValue {
  locale: Locale
  localeTag: string
  copy: ReturnType<typeof getCopy>
  setLocale: (locale: Locale) => void
}

const STORAGE_KEY = 'jotform-locale'

const I18nContext = createContext<I18nContextValue | null>(null)

function detectInitialLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'en' || stored === 'tr') return stored
  // Fall back to the browser locale on first visit so Turkish users land on
  // the localized UI without needing to flip the switch manually.
  return navigator.language.toLowerCase().startsWith('tr') ? 'tr' : 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(detectInitialLocale)

  useEffect(() => {
    // Persist the choice and keep the document language in sync for browser
    // affordances like spellcheck and assistive tech.
    localStorage.setItem(STORAGE_KEY, locale)
    document.documentElement.lang = LOCALE_TAG[locale]
  }, [locale])

  const value = useMemo(
    () => ({
      locale,
      localeTag: LOCALE_TAG[locale],
      copy: getCopy(locale),
      setLocale,
    }),
    [locale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const value = useContext(I18nContext)
  if (!value) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return value
}
