import { NavLink, Link, Outlet } from 'react-router-dom'
import clsx from 'clsx'
import styles from './style.module.css'

const NAV = [
  { to: '/', label: 'Overview', end: true },
  { to: '/people', label: 'People' },
  { to: '/locations', label: 'Locations' },
]

export default function Layout() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          <span>
            Missing <em>Podo</em>
          </span>
          <span className={styles.tag}>The Ankara Case</span>
        </Link>
        <nav className={styles.nav}>
          {NAV.map((item) => (
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
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
