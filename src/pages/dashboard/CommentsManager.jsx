import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, X, Trash2, MessageSquare, Clock, Mail, Globe, CornerDownRight } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { useModerationComments, useCommentModeration } from '@/hooks/useInbox'
import { asList, pageCount } from '@/lib/paginated'
import { apiError } from '@/lib/api'
import { relativeTime } from '@/lib/format'
import { usePageMeta } from '@/hooks/usePageMeta'
import { PageHeader } from '@/components/dashboard/DashUI'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Pagination from '@/components/ui/Pagination'
import { ConfirmDialog } from '@/components/ui/Modal'
import { Loading } from '@/components/ui/Spinner'
import { EmptyState, ErrorState } from '@/components/ui/States'

const FILTERS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'all', label: 'All' },
]
const PAGE_SIZE = 10

export default function CommentsManager() {
  const [filter, setFilter] = useState('pending')
  const [page, setPage] = useState(1)
  const [toDelete, setToDelete] = useState(null)

  usePageMeta('Moderate comments')

  const params = { page }
  if (filter === 'pending') params.is_approved = 'false'
  else if (filter === 'approved') params.is_approved = 'true'

  const { data, isLoading, isError, refetch } = useModerationComments(params)
  const { setApproved, remove } = useCommentModeration()
  const comments = asList(data)
  const count = pageCount(data)

  const toggleApproval = (c) => {
    setApproved.mutate(
      { id: c.id, is_approved: !c.is_approved },
      {
        onSuccess: () => toast.success(c.is_approved ? 'Comment hidden' : 'Comment approved'),
        onError: (err) => toast.error(apiError(err)),
      }
    )
  }

  const confirmDelete = () => {
    remove.mutate(toDelete.id, {
      onSuccess: () => {
        toast.success('Comment deleted')
        setToDelete(null)
      },
      onError: (err) => toast.error(apiError(err)),
    })
  }

  return (
    <div>
      <PageHeader title="Comments" subtitle="Approve or remove comments before they appear publicly." />

      <div className="mb-6 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setFilter(f.value); setPage(1) }}
            className={clsx(
              'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
              filter === f.value
                ? 'border-transparent bg-gradient-brand text-white shadow-glow'
                : 'border-line text-muted hover:text-body'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Loading />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : comments.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title={filter === 'pending' ? 'Nothing to moderate' : 'No comments here'}
          message={filter === 'pending' ? "You're all caught up — no comments awaiting review." : 'Comments will show up here.'}
        />
      ) : (
        <>
          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-body">{c.name}</span>
                      {c.parent && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted"><CornerDownRight size={12} /> reply</span>
                      )}
                      {c.is_approved ? <Badge tone="green">Approved</Badge> : <Badge tone="amber">Pending</Badge>}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                      <span className="inline-flex items-center gap-1"><Mail size={12} /> {c.email}</span>
                      {c.website && (
                        <a href={c.website} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 hover:text-accent">
                          <Globe size={12} /> Website
                        </a>
                      )}
                      <span className="inline-flex items-center gap-1"><Clock size={12} /> {relativeTime(c.created_at)}</span>
                    </div>
                  </div>
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm text-body/90">{c.content}</p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                  <p className="text-xs text-muted">
                    on{' '}
                    <Link to={`/blog/${c.post_slug}`} target="_blank" className="font-medium text-accent hover:underline">
                      {c.post_title}
                    </Link>
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={c.is_approved ? 'secondary' : 'primary'}
                      size="sm"
                      loading={setApproved.isPending && setApproved.variables?.id === c.id}
                      onClick={() => toggleApproval(c)}
                    >
                      {c.is_approved ? <><X size={15} /> Unapprove</> : <><Check size={15} /> Approve</>}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setToDelete(c)} aria-label="Delete" className="text-red-500 hover:bg-red-500/10">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination count={count} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={remove.isPending}
        title="Delete this comment?"
        message={`The comment by ${toDelete?.name} will be permanently removed.`}
      />
    </div>
  )
}
