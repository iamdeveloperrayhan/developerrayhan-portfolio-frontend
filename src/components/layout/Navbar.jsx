import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, LayoutDashboard, Sparkles } from 'lucide-react'
import clsx from 'clsx'
import ThemeToggle from '../ui/ThemeToggle'
import Button from '../ui/Button'
import { useAuth } from '@/context/AuthContext'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated } = useAuth()

  const linkClass = ({ isActive }) =>
    clsx(
      'link-underline text-sm font-medium transition-colors',
      isActive ? 'text-body' : 'text-muted hover:text-body'
    )

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-bg/70 backdrop-blur-xl">
      <nav className="container-page flex h-16 items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand text-white shadow-glow">
            <Sparkles size={18} />
          </span>
          <span className="gradient-text">DevFolio</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          {isAuthenticated && (
            <Button as={Link} to="/dashboard" size="sm" variant="secondary" className="hidden sm:inline-flex">
              <LayoutDashboard size={15} /> Dashboard
            </Button>
          )}
          <ThemeToggle />
          <button
            onClick={() => setOpen((o) => !o)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface text-muted md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-line bg-bg/95 backdrop-blur-xl md:hidden">
          <div className="container-page flex flex-col gap-1 py-4">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    'rounded-xl px-4 py-2.5 text-sm font-medium',
                    isActive ? 'bg-surface-2 text-body' : 'text-muted hover:bg-surface-2'
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
            {isAuthenticated && (
              <NavLink
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-accent"
              >
                Dashboard
              </NavLink>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
