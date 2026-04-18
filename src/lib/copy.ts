import type {
  Confidence,
  InvestigationRecord,
  Source,
  Urgency,
} from '../types/records'
import type { EdgeKind } from './graph'

export type Locale = 'en' | 'tr'

export const DEFAULT_LOCALE: Locale = 'en'

export const LOCALE_TAG: Record<Locale, string> = {
  en: 'en-US',
  tr: 'tr-TR',
}

const COPY = {
  en: {
    appName: 'Missing Podo',
    appTag: 'The Ankara Case',
    language: 'Language',
    langEnglish: 'EN',
    langTurkish: 'TR',
    nav: {
      overview: 'Overview',
      people: 'People',
      locations: 'Locations',
      timeline: 'Timeline',
      map: 'Map',
      board: 'Board',
    },
    search: {
      placeholder: 'Search…',
      label: 'Search',
      clear: 'Clear search',
      clearShort: 'Clear',
    },
    sourceFilter: {
      ariaLabel: 'Filter by source',
    },
    source: {
      checkin: 'Checkin',
      message: 'Message',
      sighting: 'Sighting',
      note: 'Personal Note',
      tip: 'Anonymous Tip',
    },
    edge: {
      sighting: 'Sightings',
      message: 'Messages',
      mention: 'Note mentions',
      accusation: 'Accusations',
    },
    state: {
      emptyTitle: 'Nothing here yet',
      errorTitle: 'Failed to load some sources.',
      retry: 'Retry',
    },
    severity: {
      low: 'low',
      medium: 'medium',
      high: 'high',
    },
    common: {
      loading: 'Loading…',
      loadingInline: 'loading…',
      unknown: 'unknown',
      total: (count: number) => `${count} total`,
      ofTotal: (count: number, total: number) => `${count} of ${total}`,
      recordCount: (count: number) => `${count} record${count === 1 ? '' : 's'}`,
      eventCount: (count: number) => `${count} event${count === 1 ? '' : 's'}`,
      personCount: (count: number) => `${count} ${count === 1 ? 'person' : 'people'}`,
      placeCount: (count: number) => `${count} place${count === 1 ? '' : 's'}`,
      resultCount: (count: number) => `${count} result${count === 1 ? '' : 's'}`,
      suspicionScore: (count: number) => `suspicion ${count}`,
      totalScore: (count: number) => `total ${count}`,
      lastSeen: 'Last seen',
      lastSeenWith: 'Last seen with',
      allRecords: 'All records',
      evidence: 'Evidence',
      connectedTo: 'Connected to',
      noValue: '—',
      backToPeople: '← Back to people',
      backToLocations: '← Back to locations',
      clearSelection: 'Clear selection',
    },
    home: {
      title: 'Overview',
      subtitle: "Tracking Podo's last known movements across five data sources.",
      latestActivity: 'Latest activity',
      matchingRecords: 'Matching records',
      searchPlaceholder: 'Search people, places, notes…',
      emptyTitle: 'No records yet',
      emptyHint: 'Submissions will appear here once they arrive.',
      noMatchTitle: 'No matching records',
      noMatchHint: 'Try clearing the search or adjusting the source filters.',
    },
    people: {
      title: 'People',
      searchPlaceholder: 'Search by name…',
      matchCount: (count: number, total: number, query: string) =>
        `${count} of ${total} people match "${query}".`,
      totalCount: (count: number) =>
        `${count} people mentioned across all sources.`,
      emptyTitle: 'No people yet',
      emptyHint: 'People are derived from submitted records.',
      noMatchTitle: (query: string) => `No people match "${query}"`,
      noMatchHint: 'Try a shorter or different name.',
    },
    person: {
      missingTitle: (name: string) => `No person named "${name}"`,
      missingHint: 'This person may have been removed or the URL is wrong.',
      breakdownAria: 'Suspicion score breakdown',
      breakdownTitle: 'Why suspicion is high',
    },
    locations: {
      title: 'Locations',
      searchPlaceholder: 'Search by place name…',
      matchCount: (count: number, total: number, query: string) =>
        `${count} of ${total} locations match "${query}".`,
      totalCount: (count: number) =>
        `${count} place${count === 1 ? '' : 's'} mentioned across all records.`,
      emptyTitle: 'No locations yet',
      emptyHint: 'Locations are derived from submitted records.',
      noMatchTitle: (query: string) => `No locations match "${query}"`,
      noMatchHint: 'Try a shorter or different place name.',
      locationMissingTitle: (name: string) => `No location "${name}"`,
      locationMissingHint: 'This place may have been removed or the URL is wrong.',
      eventsAtLocation: 'Events at this location',
    },
    timeline: {
      title: 'Timeline',
      subtitlePodo: 'Chronological trail of every record where Podo appears.',
      subtitleAll: 'Every record in chronological order.',
      scopeAria: 'Timeline scope',
      podoTrail: "Podo's trail",
      allRecords: 'All records',
      emptyTitle: 'Nothing on this timeline yet',
      emptyHintPodo: 'No records mention Podo. Try "All records" to see everything.',
      emptyHintAll: 'No records with timestamps were found.',
    },
    map: {
      title: 'Map',
      subtitle: (count: number) =>
        `${count} event${count === 1 ? '' : 's'} plotted across Ankara. Click any pin or list row, the other view follows.`,
      searchPlaceholder: 'Search by person, location, or text…',
      emptyTitle: 'No mappable events',
      emptyHint: 'No records have coordinates for the current filter.',
      listAria: 'Mapped records',
      noMatches: 'No events match the current filter.',
      popupOthers: (count: number) =>
        `${count} other event${count === 1 ? '' : 's'} at this spot`,
      popupViewLocation: (location: string) => `View ${location} →`,
    },
    board: {
      title: 'Detective Board',
      subtitle:
        'Every person pinned, every relationship strung. Click a pin to focus their network and see the evidence behind each connection.',
      filterAria: 'Edge filter',
      emptyTitle: 'No one on the board yet',
      emptyHint: 'People appear here once any record names them.',
      legendPodo: 'Podo',
      legendHighSuspicion: 'High suspicion',
      legendClean: 'Clean',
      legendTips: 'Anonymous tips',
      panelTitle: 'The board',
      panelText: (people: number, links: number) =>
        `${people} ${people === 1 ? 'person' : 'people'} pinned · ${links} relationship${links === 1 ? '' : 's'} traced.`,
      hint1: 'Pin size grows with suspicion and record count.',
      hint2: 'Red dots around a pin mark anonymous tips against them.',
      hint3: 'Solid lines are sightings, blue arrows are messages, dashed lines are note mentions.',
      hint4: 'Red lines mean a high-urgency message.',
      missingTag: 'missing',
      whySuspicious: 'Why suspicious',
      profileMeta: (records: number, suspicion: number, tips: number) =>
        `${records} record${records === 1 ? '' : 's'} · suspicion ${suspicion}${
          tips > 0 ? ` · ${tips} tip${tips === 1 ? '' : 's'}` : ''
        }`,
      fullProfile: (count: number) =>
        `View full profile (${count} record${count === 1 ? '' : 's'}) →`,
    },
    podoFeed: {
      ariaLabel: "Podo's recent activity",
      title: 'Where is Podo?',
      hint: 'most recent mentions',
      empty: 'No records mention Podo yet.',
    },
    suspicionPanel: {
      ariaLabel: 'Top suspects',
      title: 'Top suspects',
      hint: 'by transparent suspicion score',
      empty: 'No suspicion signals in the current data.',
    },
    notFound: {
      title: 'This trail has gone cold.',
      body: "The page you're looking for doesn't exist in the investigation.",
      back: '← Return to the overview',
    },
    record: {
      openOnMap: 'Open on map',
      viewOnMap: 'View on map →',
      checkedIn: 'checked in',
      seenWith: 'seen with',
      wroteNote: 'wrote a note',
      noteBy: (name: string) => `${name}'s note`,
      tipOn: (name: string) => `Tip on ${name}`,
      confidence: 'confidence',
      urgency: 'urgency',
      mentions: 'mentions:',
      checkedInAt: 'checked in at',
      messaged: 'messaged',
      from: 'from',
      at: 'at',
      wroteAboutPodoAt: 'wrote about Podo at',
      near: 'near',
      noted: 'noted',
      tipOnLower: 'tip on',
      unknownPlace: 'unknown place',
    },
    suspicion: {
      anonymousTip: (level: string) => `${level}-confidence anonymous tip`,
      sightedWithPodo: (location: string) => `sighted with Podo at ${location}`,
      urgentMessage: (name: string) => `sent high-urgency message to ${name}`,
    },
    relative: {
      justNow: 'just now',
      inMoment: 'in a moment',
      past: (count: number, unit: string) => `${count}${unit} ago`,
      future: (count: number, unit: string) => `in ${count}${unit}`,
      unit: {
        minute: 'min',
        hour: 'h',
        day: 'd',
        month: 'mo',
        year: 'y',
      },
    },
  },
  tr: {
    appName: 'Kayıp Podo',
    appTag: 'Ankara Dosyası',
    language: 'Dil',
    langEnglish: 'EN',
    langTurkish: 'TR',
    nav: {
      overview: 'Genel Bakış',
      people: 'Kişiler',
      locations: 'Konumlar',
      timeline: 'Zaman Akışı',
      map: 'Harita',
      board: 'Tahta',
    },
    search: {
      placeholder: 'Ara…',
      label: 'Ara',
      clear: 'Aramayı temizle',
      clearShort: 'Temizle',
    },
    sourceFilter: {
      ariaLabel: 'Kaynağa göre filtrele',
    },
    source: {
      checkin: 'Giriş',
      message: 'Mesaj',
      sighting: 'Görülme',
      note: 'Kişisel Not',
      tip: 'Anonim İhbar',
    },
    edge: {
      sighting: 'Görülmeler',
      message: 'Mesajlar',
      mention: 'Not anmaları',
      accusation: 'İthamlar',
    },
    state: {
      emptyTitle: 'Henüz burada bir şey yok',
      errorTitle: 'Bazı kaynaklar yüklenemedi.',
      retry: 'Tekrar dene',
    },
    severity: {
      low: 'düşük',
      medium: 'orta',
      high: 'yüksek',
    },
    common: {
      loading: 'Yükleniyor…',
      loadingInline: 'yükleniyor…',
      unknown: 'bilinmiyor',
      total: (count: number) => `toplam ${count}`,
      ofTotal: (count: number, total: number) => `${total} kaydın ${count} tanesi`,
      recordCount: (count: number) => `${count} kayıt`,
      eventCount: (count: number) => `${count} olay`,
      personCount: (count: number) => `${count} kişi`,
      placeCount: (count: number) => `${count} yer`,
      resultCount: (count: number) => `${count} sonuç`,
      suspicionScore: (count: number) => `şüphe ${count}`,
      totalScore: (count: number) => `toplam ${count}`,
      lastSeen: 'Son görülme',
      lastSeenWith: 'En son birlikte görüldüğü kişiler',
      allRecords: 'Tüm kayıtlar',
      evidence: 'Kanıtlar',
      connectedTo: 'Bağlantılı kişiler',
      noValue: '—',
      backToPeople: '← Kişilere dön',
      backToLocations: '← Konumlara dön',
      clearSelection: 'Seçimi temizle',
    },
    home: {
      title: 'Genel Bakış',
      subtitle: "Podo'nun beş veri kaynağındaki son hareketleri izleniyor.",
      latestActivity: 'Son hareketler',
      matchingRecords: 'Eşleşen kayıtlar',
      searchPlaceholder: 'Kişi, yer, not ara…',
      emptyTitle: 'Henüz kayıt yok',
      emptyHint: 'Başvurular geldikçe burada görünecek.',
      noMatchTitle: 'Eşleşen kayıt yok',
      noMatchHint: 'Aramayı temizlemeyi veya kaynak filtrelerini değiştirmeyi deneyin.',
    },
    people: {
      title: 'Kişiler',
      searchPlaceholder: 'İsme göre ara…',
      matchCount: (count: number, total: number, query: string) =>
        `"${query}" için ${total} kişinin ${count} tanesi eşleşiyor.`,
      totalCount: (count: number) =>
        `Tüm kaynaklarda adı geçen ${count} kişi var.`,
      emptyTitle: 'Henüz kişi yok',
      emptyHint: 'Kişiler gönderilen kayıtlardan türetilir.',
      noMatchTitle: (query: string) => `"${query}" ile eşleşen kişi yok`,
      noMatchHint: 'Daha kısa veya farklı bir isim deneyin.',
    },
    person: {
      missingTitle: (name: string) => `"${name}" adında bir kişi yok`,
      missingHint: 'Bu kişi kaldırılmış olabilir veya URL yanlış olabilir.',
      breakdownAria: 'Şüphe puanı dökümü',
      breakdownTitle: 'Şüphe neden yüksek',
    },
    locations: {
      title: 'Konumlar',
      searchPlaceholder: 'Yer adına göre ara…',
      matchCount: (count: number, total: number, query: string) =>
        `"${query}" için ${total} konumun ${count} tanesi eşleşiyor.`,
      totalCount: (count: number) =>
        `Tüm kayıtlarda adı geçen ${count} yer var.`,
      emptyTitle: 'Henüz konum yok',
      emptyHint: 'Konumlar gönderilen kayıtlardan türetilir.',
      noMatchTitle: (query: string) => `"${query}" ile eşleşen konum yok`,
      noMatchHint: 'Daha kısa veya farklı bir yer adı deneyin.',
      locationMissingTitle: (name: string) => `"${name}" adında bir konum yok`,
      locationMissingHint: 'Bu yer kaldırılmış olabilir veya URL yanlış olabilir.',
      eventsAtLocation: 'Bu konumdaki olaylar',
    },
    timeline: {
      title: 'Zaman Akışı',
      subtitlePodo: "Podo'nun geçtiği tüm kayıtların kronolojik izi.",
      subtitleAll: 'Tüm kayıtların kronolojik sırası.',
      scopeAria: 'Zaman akışı kapsamı',
      podoTrail: "Podo'nun izi",
      allRecords: 'Tüm kayıtlar',
      emptyTitle: 'Bu zaman akışında henüz bir şey yok',
      emptyHintPodo:
        'Hiçbir kayıt Podo’dan bahsetmiyor. Her şeyi görmek için "Tüm kayıtlar"ı deneyin.',
      emptyHintAll: 'Zaman damgası olan kayıt bulunamadı.',
    },
    map: {
      title: 'Harita',
      subtitle: (count: number) =>
        `Ankara genelinde ${count} olay işaretlendi. Herhangi bir pine veya liste satırına tıklayın, diğer görünüm de onu takip eder.`,
      searchPlaceholder: 'Kişi, konum veya metin ara…',
      emptyTitle: 'Haritalanabilir olay yok',
      emptyHint: 'Geçerli filtre için koordinatı olan kayıt bulunmuyor.',
      listAria: 'Haritadaki kayıtlar',
      noMatches: 'Geçerli filtreyle eşleşen olay yok.',
      popupOthers: (count: number) =>
        `Bu noktada ${count} başka olay daha var`,
      popupViewLocation: (location: string) => `${location} konumunu aç →`,
    },
    board: {
      title: 'Dedektif Tahtası',
      subtitle:
        'Her kişi raptiyelenmiş, her ilişki bağlanmış durumda. Ağlarına odaklanmak ve her bağlantının arkasındaki kanıtı görmek için bir pine tıklayın.',
      filterAria: 'Bağ filtresi',
      emptyTitle: 'Tahtada henüz kimse yok',
      emptyHint: 'Bir kayıtta isim geçtiğinde burada görünür.',
      legendPodo: 'Podo',
      legendHighSuspicion: 'Yüksek şüphe',
      legendClean: 'Temiz',
      legendTips: 'Anonim ihbarlar',
      panelTitle: 'Tahta',
      panelText: (people: number, links: number) =>
        `${people} kişi raptiyelendi · ${links} ilişki izlendi.`,
      hint1: 'Pin boyutu şüphe puanı ve kayıt sayısıyla büyür.',
      hint2: 'Bir pinin etrafındaki kırmızı noktalar o kişiye yönelik anonim ihbarları gösterir.',
      hint3: 'Düz çizgiler görülmeleri, mavi oklar mesajları, kesik çizgiler not anmalarını gösterir.',
      hint4: 'Kırmızı çizgiler yüksek aciliyetli mesaj anlamına gelir.',
      missingTag: 'kayıp',
      whySuspicious: 'Şüphe nedenleri',
      profileMeta: (records: number, suspicion: number, tips: number) =>
        `${records} kayıt · şüphe ${suspicion}${tips > 0 ? ` · ${tips} ihbar` : ''}`,
      fullProfile: (count: number) => `Tam profili aç (${count} kayıt) →`,
    },
    podoFeed: {
      ariaLabel: "Podo'nun son hareketleri",
      title: 'Podo nerede?',
      hint: 'en son bahsedilen kayıtlar',
      empty: 'Henüz hiçbir kayıt Podo’dan bahsetmiyor.',
    },
    suspicionPanel: {
      ariaLabel: 'Başlıca şüpheliler',
      title: 'Başlıca şüpheliler',
      hint: 'şeffaf şüphe puanına göre',
      empty: 'Mevcut veride şüphe sinyali yok.',
    },
    notFound: {
      title: 'Bu iz burada soğudu.',
      body: 'Aradığınız sayfa soruşturmada mevcut değil.',
      back: '← Genel bakışa dön',
    },
    record: {
      openOnMap: 'Haritada aç',
      viewOnMap: 'Haritada görüntüle →',
      checkedIn: 'giriş yaptı',
      seenWith: 'şununla görüldü',
      wroteNote: 'bir not yazdı',
      noteBy: (name: string) => `${name} notu`,
      tipOn: (name: string) => `${name} hakkında ihbar`,
      confidence: 'güven',
      urgency: 'aciliyet',
      mentions: 'anıyor:',
      checkedInAt: 'şurada giriş yaptı',
      messaged: 'şuna mesaj attı',
      from: 'şuradan',
      at: 'şurada',
      wroteAboutPodoAt: 'Podo hakkında burada yazdı',
      near: 'yakınında',
      noted: 'not düştü',
      tipOnLower: 'hakkında ihbar',
      unknownPlace: 'bilinmeyen konum',
    },
    suspicion: {
      anonymousTip: (level: string) => `${level} güvenli anonim ihbar`,
      sightedWithPodo: (location: string) => `Podo ile ${location} konumunda görüldü`,
      urgentMessage: (name: string) => `${name} kişisine yüksek aciliyetli mesaj gönderdi`,
    },
    relative: {
      justNow: 'az önce',
      inMoment: 'birazdan',
      past: (count: number, unit: string) => `${count} ${unit} önce`,
      future: (count: number, unit: string) => `${count} ${unit} sonra`,
      unit: {
        minute: 'dk',
        hour: 'sa',
        day: 'gün',
        month: 'ay',
        year: 'yıl',
      },
    },
  },
} as const

export function getCopy(locale: Locale) {
  return COPY[locale]
}

export function getSourceLabel(locale: Locale, source: Source): string {
  return COPY[locale].source[source]
}

export function getEdgeLabel(locale: Locale, edge: EdgeKind): string {
  return COPY[locale].edge[edge]
}

export function getSeverityLabel(
  locale: Locale,
  level: Confidence | Urgency,
): string {
  return COPY[locale].severity[level]
}

export function recordHeadlineForLocale(
  record: InvestigationRecord,
  locale: Locale,
): string {
  const copy = getCopy(locale)
  switch (record.source) {
    case 'checkin':
      return `${record.person} ${copy.record.checkedIn}`
    case 'message':
      return `${record.sender} → ${record.recipient}`
    case 'sighting':
      return `${record.person} ${copy.record.seenWith} ${record.seenWith}`
    case 'note':
      return copy.record.noteBy(record.author)
    case 'tip':
      return copy.record.tipOn(record.suspect)
  }
}
