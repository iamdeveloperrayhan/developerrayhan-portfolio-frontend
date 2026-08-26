import { Link } from 'react-router-dom'
import {
  FileText,
  FolderKanban,
  Wrench,
  Eye,
  Heart,
  MessageSquare,
  Mail,
  Clock,
  Plus,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { useStats } from '@/hooks/useInbox'
import { compactNumber, relativeTime } from '@/lib/format'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useAuth } from '@/context/AuthContext'
import { PageHeader, StatCard } from '@/components/dashboard/DashUI'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { Loading } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/ui/States'

function monthLabel(ym) {
  const [y, m] = ym.split('-')
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-US', { month: 'short' })
}

export default function Overview() {
  const { user } = useAuth()
  const { data: stats, isLoading, isError, refetch } = useStats()
  usePageMeta('Dashboard')

  if (isLoading) return <Loading label="Loading dashboard…" />
  if (isError || !stats) return <ErrorState onRetry={refetch} />

  const maxMonth = Math.max(1, ...stats.posts_per_month.map((m) => m.count))

  const cards = [
    { label: 'Published posts', value: stats.published_posts, icon: FileText, tone: 'accent', hint: `${stats.draft_posts} draft${stats.draft_posts === 1 ? '' : 's'}` },
    { label: 'Projects', value: stats.total_projects, icon: FolderKanban, tone: 'sky' },
    { label: 'Skills', value: stats.total_skills, icon: Wrench, tone: 'green' },
    { label: 'Total views', value: compactNumber(stats.total_views), icon: Eye, tone: 'amber' },
    { label: 'Total likes', value: compactNumber(stats.total_likes), icon: Heart, tone: 'pink' },
    { label: 'Comments', value: stats.total_comments, icon: MessageSquare, tone: 'accent', hint: `${stats.pending_comments} pending` },
  ]

  return (
    <div>
      <PageHeader title={`Welcome back, ${user?.username} 👋`} subtitle="Here's how your site is doing.">
        <Button as={Link} to="/dashboard/posts/new" size="sm">
          <Plus size={16} /> New post
        </Button>
      </PageHeader>

      {/* Alerts */}
      {(stats.pending_comments > 0 || stats.unread_messages > 0) && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          {stats.pending_comments > 0 && (
            <Link to="/dashboard/comments" className="card card-hover flex items-center gap-4 p-5">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-500/10 text-amber-500">
                <MessageSquare size={20} />
              </span>
              <div className="flex-1">
                <p className="font-semibold text-body">{stats.pending_comments} comment{stats.pending_comments === 1 ? '' : 's'} awaiting review</p>
                <p className="text-sm text-muted">Approve or remove them</p>
              </div>
              <ArrowRight size={18} className="text-muted" />
            </Link>
          )}
          {stats.unread_messages > 0 && (
            <Link to="/dashboard/messages" className="card card-hover flex items-center gap-4 p-5">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-sky-500/10 text-sky-500">
                <Mail size={20} />
              </span>
              <div className="flex-1">
                <p className="font-semibold text-body">{stats.unread_messages} unread message{stats.unread_messages === 1 ? '' : 's'}</p>
                <p className="text-sm text-muted">Check your inbox</p>
              </div>
              <ArrowRight size={18} className="text-muted" />
            </Link>
          )}
        </div>
      )}

      {/* Stat grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Posts per month */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-body">Posts published</h3>
          <p className="text-sm text-muted">Last 6 months</p>
          <div className="mt-6 flex h-44 items-end justify-between gap-3">
            {stats.posts_per_month.map((m) => (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-lg bg-gradient-brand transition-all"
                    style={{ height: `${(m.count / maxMonth) * 100}%`, minHeight: m.count > 0 ? '8px' : '2px' }}
                    title={`${m.count} post${m.count === 1 ? '' : 's'}`}
                  />
                </div>
                <span className="text-xs font-medium text-muted">{monthLabel(m.month)}</span>
                <span className="text-xs font-bold text-body">{m.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top posts */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-body">Top posts</h3>
          <p className="text-sm text-muted">By views</p>
          <ul className="mt-5 space-y-3">
            {stats.top_posts.length === 0 && <li className="text-sm text-muted">No posts yet.</li>}
            {stats.top_posts.map((p, i) => (
              <li key={p.slug} className="flex items-center gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-surface-2 text-xs font-bold text-muted">
                  {i + 1}
                </span>
                <Link to={`/blog/${p.slug}`} className="min-w-0 flex-1 truncate text-sm font-medium text-body hover:text-accent">
                  {p.title}
                </Link>
                <span className="inline-flex items-center gap-1 text-xs text-muted"><Eye size={13} /> {compactNumber(p.views_count)}</span>
                <span className="inline-flex items-center gap-1 text-xs text-muted"><Heart size={13} /> {compactNumber(p.likes_count)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent comments */}
      <div className="card mt-6 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-body">Recent comments</h3>
          <Link to="/dashboard/comments" className="text-sm font-semibold text-accent link-underline">View all</Link>
        </div>
        <ul className="mt-5 divide-y divide-line">
          {stats.recent_comments.length === 0 && <li className="py-3 text-sm text-muted">No comments yet.</li>}
          {stats.recent_comments.map((c) => (
            <li key={c.id} className="flex items-start gap-3 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-body">{c.name}</span>
                  <span className="inline-flex items-center gap-1 text-xs text-muted">
                    <Clock size={12} /> {relativeTime(c.created_at)}
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-1 text-sm text-muted">{c.content}</p>
                <p className="mt-0.5 text-xs text-muted/80">on “{c.post__title}”</p>
              </div>
              {c.is_approved ? (
                <Badge tone="green"><CheckCircle2 size={12} /> Approved</Badge>
              ) : (
                <Badge tone="amber">Pending</Badge>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
