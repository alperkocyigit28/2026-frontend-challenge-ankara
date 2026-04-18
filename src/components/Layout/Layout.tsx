import { NavLink, Link, Outlet } from 'react-router-dom'
import clsx from 'clsx'
import { useI18n } from '../../i18n'
import type { Locale } from '../../lib/copy'
import styles from './style.module.css'

export default function Layout() {
  const { locale, setLocale, copy } = useI18n()
  const nav = [
    { to: '/', label: copy.nav.overview, end: true },
    { to: '/people', label: copy.nav.people },
    { to: '/locations', label: copy.nav.locations },
    { to: '/timeline', label: copy.nav.timeline },
    { to: '/map', label: copy.nav.map },
    { to: '/board', label: copy.nav.board },
  ]

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          <span>
            {copy.appName.split(' ')[0]} <em>Podo</em>
          </span>
          <span className={styles.tag}>{copy.appTag}</span>
        </Link>
        <nav className={styles.nav}>
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(styles.navLink, isActive && styles.navLinkActive)
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.langSwitch} role="group" aria-label={copy.language}>
          {(['en', 'tr'] as Locale[]).map((option) => (
            <button
              key={option}
              type="button"
              className={clsx(styles.langBtn, locale === option && styles.langBtnActive)}
              onClick={() => setLocale(option)}
              aria-pressed={locale === option}
            >
              {option === 'en' ? copy.langEnglish : copy.langTurkish}
            </button>
          ))}
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
