import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Lock, LogIn, ArrowLeft, Sparkles, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'
import { apiError } from '@/lib/api'
import { usePageMeta } from '@/hooks/usePageMeta'
import { Field, Input } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import ThemeToggle from '@/components/ui/ThemeToggle'

export default function Login() {
  const { login, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ username: '', password: '' })
  const [submitting, setSubmitting] = useState(false)

  usePageMeta('Sign in')

  const from = location.state?.from?.pathname || '/dashboard'

  // Already signed in → skip the form.
  useEffect(() => {
    if (!loading && isAuthenticated) navigate(from, { replace: true })
  }, [loading, isAuthenticated, from, navigate])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await login(form.username, form.password)
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(apiError(err, 'Invalid username or password.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-accent-2/20 blur-3xl" />
      </div>

      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-accent">
          <ArrowLeft size={16} /> Back to site
        </Link>

        <div className="card p-8">
          <div className="flex flex-col items-center text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand text-white shadow-glow">
              <Sparkles size={26} />
            </span>
            <h1 className="mt-5 text-2xl font-bold text-body">Owner sign in</h1>
            <p className="mt-1.5 text-sm text-muted">
              This area is restricted to the site owner.
            </p>
          </div>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <Field label="Username" htmlFor="username" required>
              <Input
                id="username"
                value={form.username}
                onChange={set('username')}
                required
                autoComplete="username"
                autoFocus
                placeholder="owner"
              />
            </Field>
            <Field label="Password" htmlFor="password" required>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={set('password')}
                required
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </Field>
            <Button type="submit" size="lg" loading={submitting} className="w-full">
              <LogIn size={18} /> Sign in
            </Button>
          </form>

          <div className="mt-6 flex items-start gap-2 rounded-2xl border border-line bg-surface-2/60 p-4 text-xs text-muted">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-accent" />
            <p>
              No public registration exists — DevFolio is a single-owner site. Visitors can
              browse, comment, and get in touch without an account.
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-dashed border-line p-4 text-xs text-muted">
            <Lock size={14} className="shrink-0" />
            <p>
              <span className="font-semibold text-body">Demo:</span> owner&nbsp;/&nbsp;DevFolioDemo!2026
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
