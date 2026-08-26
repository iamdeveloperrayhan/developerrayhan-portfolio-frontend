import { useState } from 'react'
import { Mail, MailOpen, Trash2, Clock, Reply, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { useMessages, useMessageMutations } from '@/hooks/useInbox'
import { asList, pageCount } from '@/lib/paginated'
import { apiError } from '@/lib/api'
import { relativeTime, formatDate } from '@/lib/format'
import { usePageMeta } from '@/hooks/usePageMeta'
import { PageHeader } from '@/components/dashboard/DashUI'
import Button from '@/components/ui/Button'
import Pagination from '@/components/ui/Pagination'
import { ConfirmDialog } from '@/components/ui/Modal'
import { Loading } from '@/components/ui/Spinner'
import { EmptyState, ErrorState } from '@/components/ui/States'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
]
const PAGE_SIZE = 10

export default function MessagesManager() {
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [openId, setOpenId] = useState(null)
  const [toDelete, setToDelete] = useState(null)

  usePageMeta('Inbox')

  const params = { page }
  if (filter === 'unread') params.is_read = 'false'

  const { data, isLoading, isError, refetch } = useMessages(params)
  const { markRead, remove } = useMessageMutations()
  const messages = asList(data)
  const count = pageCount(data)

  const open = (m) => {
    if (openId === m.id) {
      setOpenId(null)
      return
    }
    setOpenId(m.id)
    if (!m.is_read) markRead.mutate({ id: m.id, is_read: true })
  }

  const setRead = (m, is_read) => {
    markRead.mutate(
      { id: m.id, is_read },
      {
        onSuccess: () => toast.success(is_read ? 'Marked as read' : 'Marked as unread'),
        onError: (err) => toast.error(apiError(err)),
      }
    )
  }

  const confirmDelete = () => {
    remove.mutate(toDelete.id, {
      onSuccess: () => {
        toast.success('Message deleted')
        setToDelete(null)
      },
      onError: (err) => toast.error(apiError(err)),
    })
  }

  return (
    <div>
      <PageHeader title="Inbox" subtitle="Messages sent through your contact form." />

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
      ) : messages.length === 0 ? (
        <EmptyState
          icon={Mail}
          title={filter === 'unread' ? 'No unread messages' : 'Inbox is empty'}
          message={filter === 'unread' ? "You've read everything." : 'Messages from your contact form will appear here.'}
        />
      ) : (
        <>
          <div className="space-y-3">
            {messages.map((m) => {
              const isOpen = openId === m.id
              return (
                <div key={m.id} className={clsx('card overflow-hidden', !m.is_read && 'ring-1 ring-accent/30')}>
                  <button
                    onClick={() => open(m)}
                    className="flex w-full items-center gap-4 p-4 text-left"
                  >
                    <span className={clsx('grid h-10 w-10 shrink-0 place-items-center rounded-xl', m.is_read ? 'bg-surface-2 text-muted' : 'bg-gradient-brand-soft text-accent')}>
                      {m.is_read ? <MailOpen size={18} /> : <Mail size={18} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {!m.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />}
                        <span className={clsx('truncate', m.is_read ? 'font-medium text-body' : 'font-bold text-body')}>{m.subject}</span>
                      </div>
                      <p className="mt-0.5 truncate text-sm text-muted">
                        {m.name} · {m.email}
                      </p>
                    </div>
                    <span className="hidden shrink-0 items-center gap-1 text-xs text-muted sm:inline-flex">
                      <Clock size={12} /> {relativeTime(m.created_at)}
                    </span>
                    <ChevronDown size={18} className={clsx('shrink-0 text-muted transition-transform', isOpen && 'rotate-180')} />
                  </button>

                  {isOpen && (
                    <div className="border-t border-line px-4 pb-4 pt-4">
                      <p className="whitespace-pre-wrap text-sm text-body/90">{m.message}</p>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                        <span className="text-xs text-muted">Received {formatDate(m.created_at)}</span>
                        <div className="flex items-center gap-2">
                          <Button
                            as="a"
                            href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`}
                            variant="primary"
                            size="sm"
                          >
                            <Reply size={15} /> Reply
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => setRead(m, !m.is_read)}>
                            {m.is_read ? 'Mark unread' : 'Mark read'}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setToDelete(m)} aria-label="Delete" className="text-red-500 hover:bg-red-500/10">
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <Pagination count={count} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={remove.isPending}
        title="Delete this message?"
        message={`The message from ${toDelete?.name} will be permanently removed.`}
      />
    </div>
  )
}
