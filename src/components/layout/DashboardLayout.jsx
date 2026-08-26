import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  Wrench,
  Briefcase,
  GraduationCap,
  MessageSquare,
  Mail,
  UserCog,
  ExternalLink,
  LogOut,
  Menu,
  Sparkles,
} from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'
import { useStats } from '@/hooks/useInbox'
import ThemeToggle from '../ui/ThemeToggle'

const nav = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/posts', label: 'Posts', icon: FileText },
  { to: '/dashboard/projects', label: 'Projects', icon: FolderKanban },
  { to: '/dashboard/skills', label: 'Skills', icon: Wrench },
  { to: '/dashboard/experience', label: 'Experience', icon: Briefcase },
  { to: '/dashboard/education', label: 'Education', icon: GraduationCap },
  { to: '/dashboard/comments', label: 'Comments', icon: MessageSquare, badge: 'pending_comments' },
  { to: '/dashboard/messages', label: 'Messages', icon: Mail, badge: 'unread_messages' },
  { to: '/dashboard/profile', label: 'Profile', icon: UserCog },
]

export default function DashboardLayout() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const { data: stats } = useStats()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Signed out')
    navigate('/')
  }

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <Link to="/dashboard" className="flex items-center gap-2 px-6 py-5 font-display text-lg font-extrabold">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand text-white shadow-glow">
          <Sparkles size={18} />
        </span>
        <span className="gradient-text">DevFolio</span>
      </Link>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {nav.map(({ to, label, icon: Icon, end, badge }) => {
          const count = badge ? stats?.[badge] : 0
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-gradient-brand text-white shadow-glow'
                    : 'text-muted hover:bg-surface-2 hover:text-body'
                )
              }
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {count > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent-2 px-1.5 text-[11px] font-bold text-white">
                  {count}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="space-y-1 border-t border-line p-3">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-muted hover:bg-surface-2 hover:text-body"
        >
          <ExternalLink size={18} /> View site
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10"
        >
          <LogOut size={18} /> Sign out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-line bg-surface/60 backdrop-blur-xl lg:block">
        {SidebarContent}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 border-r border-line bg-surface">
            {SidebarContent}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-line bg-bg/70 px-5 backdrop-blur-xl">
          <button
            onClick={() => setOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-line text-muted lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-muted sm:block">
              Signed in as <span className="font-semibold text-body">{user?.username}</span>
            </span>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 px-5 py-8 sm:px-8">
          <div className="mx-auto w-full max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
