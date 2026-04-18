const PERSON_ALIAS_BY_KEY: Record<string, string> = {
  'kagan a': 'kagan',
}

const PREFERRED_PERSON_NAME_BY_KEY: Record<string, string> = {
  kagan: 'Kağan',
  podo: 'Podo',
}

const TURKISH_FOLD_MAP: Record<string, string> = {
  ı: 'i',
  İ: 'i',
  ğ: 'g',
  Ğ: 'g',
  ş: 's',
  Ş: 's',
  ç: 'c',
  Ç: 'c',
  ö: 'o',
  Ö: 'o',
  ü: 'u',
  Ü: 'u',
}

export function cleanPersonName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}

function foldTurkish(value: string): string {
  return value.replace(
    /[ıİğĞşŞçÇöÖüÜ]/g,
    (char) => TURKISH_FOLD_MAP[char] ?? char,
  )
}

function basePersonKey(name: string): string {
  const cleaned = cleanPersonName(name)
  if (!cleaned) return ''

  // Collapse diacritics, punctuation, and spacing so near-identical names
  // map to a single identity key.
  return foldTurkish(cleaned)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['.`’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function personKey(name: string): string {
  const key = basePersonKey(name)
  // Apply explicit aliases after normalization so one-off dataset variants can
  // be merged without changing the raw records.
  return PERSON_ALIAS_BY_KEY[key] ?? key
}

export function canonicalPersonName(name: string): string {
  const cleaned = cleanPersonName(name)
  const key = personKey(cleaned)
  if (!key) return ''
  return PREFERRED_PERSON_NAME_BY_KEY[key] ?? cleaned
}
