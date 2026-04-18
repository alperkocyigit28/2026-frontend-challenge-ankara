# Jotform Frontend Challenge Project

## User Information
Please fill in your information after forking this repository:

- **Name**: Alper Koçyiğit

## Project Description
**Missing Podo — The Ankara Case.** An investigation dashboard. Podo, Jotform's mascot, has gone missing in Ankara. Five eyewitness forms feed data into this app: check-ins, messages, sightings, personal notes, and anonymous tips. The dashboard normalizes submissions into a single record stream, cross-links every person and location, and surfaces who's been seen with Podo, where, and who looks suspicious.

## Getting Started

```bash
npm install
cp .env.example .env.local   # then paste your Jotform API key
npm run dev                  # dev server with HMR
npm run build                # production build
```

`.env.local` needs one variable:

```
VITE_JOTFORM_API_KEY=<your-jotform-api-key>
```

The app fetches from `https://api.jotform.com/form/{formId}/submissions` for each of the five forms in `src/api/forms.ts`.

### Scripts

- `npm run dev` — Vite dev server on `:5173`
- `npm run build` — type-check + production bundle to `dist/`
- `npm run preview` — serve the built bundle
- `npm run lint` — ESLint

## Features

- **Overview** (`/`) — record counts per source, Podo's latest activity feed, top suspects, fuzzy search/filter, and a paginated activity grid (9 cards per page).
- **People** (`/people`, `/people/:name`) — every named person extracted from every form. Each profile shows their records, a transparent suspicion breakdown, and a "last seen with" relationship row.
- **Locations** (`/locations`, `/locations/:name`) — every place that appears in a submission, ranked by activity, with all events at that spot.
- **Timeline** (`/timeline`) — day-grouped chronological view. Defaults to Podo's trail; toggle to all records.
- **Map** (`/map`) — Leaflet + OpenStreetMap. Markers colored by source; Podo-linked events get an accent halo. Source filter is URL-synced.
- **Board** (`/board`) — force-graph relationship view showing people, sightings, message links, note mentions, and suspicion signals in one place.
- **Search + filter** — debounced fuzzy search with Turkish/ASCII normalization; state reflected in `?q=` and `?source=` so every view is shareable and survives refresh.
- **Localization** — English and Turkish UI with persisted language preference.
- **Loading / empty / error** — skeletons while fetching, retry on error, helpful empty hints.

## Stack

- **Vite + React 19 + TypeScript** 
- **TanStack Query** — five parallel `useQueries` (one per form), merged in a memo, five-minute `staleTime`
- **React Router v7** — nested layout, `useSearchParams` for URL-state, route-level page transitions
- **CSS Modules** — one folder per component/page (`X.tsx`, `style.module.css`, `index.ts` barrel)
- **Leaflet** — divIcon markers so no bundler image workarounds needed
- **react-force-graph-2d** — detective-board relationship graph
- **clsx** for conditional class names


## Architecture

```
src/
  api/              jotform.ts fetcher + forms.ts (FORM_IDS + API_KEY)
  types/            records.ts (discriminated union), entities.ts (derived)
  lib/              normalize, parse, derive, person, search, format, graph, copy
  hooks/            useAllRecords, useUrlQuery, useDebounced
  i18n/             locale provider + hook
  components/       Layout, RecordCard, SourceBadge, PersonChip, LocationChip,
                    SearchInput, SourceFilter, Skeleton, StateView,
                    SuspicionPanel, PodoFeed
  pages/            HomePage, PeoplePage, PersonPage,
                    LocationsPage, LocationPage,
                    TimelinePage, MapPage, BoardPage, NotFoundPage
  App.tsx           Router + QueryClient + routes
  index.css         design tokens (light dossier theme)
```

**Data flow:** every submission is normalized into a discriminated-union `InvestigationRecord` tagged by `source`. `buildPeople(records)` unions every name-bearing field across records and uses `person.ts` to merge spelling/diacritic variants into canonical identities; `buildLocations(records)` groups records by place; `graph.ts` derives the detective-board nodes and links. Fuzzy search lives in `search.ts`, and UI copy/localization lives in `copy.ts` plus `i18n/`. These derived views run inside `useMemo`, so recomputation only happens when the merged record list or URL-driven filters change.

**Suspicion scoring** is transparent by design — the inputs appear on the person page. +3/+2/+1 for high/medium/low-confidence tips naming them, +1 per sighting with Podo, +1 per high-urgency message they sent. 



---

# 🚀 Challenge Duyurusu

## 📅 Tarih ve Saat
Cumartesi günü başlama saatinden itibaren üç saattir.

## 🎯 Challenge Konsepti
Bu challenge'da, size özel hazırlanmış bir senaryo üzerine web uygulaması geliştirmeniz istenecektir. Challenge başlangıcında senaryo detayları paylaşılacaktır.Katılımcılar, verilen GitHub reposunu fork ederek kendi geliştirme ortamlarını oluşturacaklardır.

## 📦 GitHub Reposu
Challenge için kullanılacak repo: https://github.com/cemjotform/2026-frontend-challenge-ankara

## 🛠️ Hazırlık Süreci
1. GitHub reposunu fork edin
2. Tercih ettiğiniz framework ile geliştirme ortamınızı hazırlayın
3. Hazırladığınız setup'ı fork ettiğiniz repoya gönderin

## 💡 Önemli Notlar
- Katılımcılar kendi tercih ettikleri framework'leri kullanabilirler
