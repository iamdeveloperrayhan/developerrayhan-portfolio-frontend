import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Eye, Heart, MessageCircle, ExternalLink, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { usePosts, usePostMutations } from '@/hooks/useBlog'
import { asList, pageCount } from '@/lib/paginated'
import { apiError } from '@/lib/api'
import { formatDate, compactNumber } from '@/lib/format'
import { usePageMeta } from '@/hooks/usePageMeta'
import { PageHeader } from '@/components/dashboard/DashUI'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Pagination from '@/components/ui/Pagination'
import { ConfirmDialog } from '@/components/ui/Modal'
import { Loading } from '@/components/ui/Spinner'
import { EmptyState, ErrorState } from '@/components/ui/States'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'DRAFT', label: 'Drafts' },
]

export default function PostsManager() {
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [toDelete, setToDelete] = useState(null)

  usePageMeta('Manage posts')

  const { data, isLoading, isError, refetch } = usePosts({ status, page })
  const { remove } = usePostMutations()
  const posts = asList(data)
  const count = pageCount(data)

  const confirmDelete = () => {
    remove.mutate(toDelete.slug, {
      onSuccess: () => {
        toast.success('Post deleted')
        setToDelete(null)
      },
      onError: (err) => toast.error(apiError(err)),
    })
  }

  return (
    <div>
      <PageHeader title="Posts" subtitle="Write, edit, and publish your articles.">
        <Button as={Link} to="/dashboard/posts/new" size="sm">
          <Plus size={16} /> New post
        </Button>
      </PageHeader>

      <div className="mb-6 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setStatus(f.value); setPage(1) }}
            className={clsx(
              'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
              status === f.value
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
      ) : posts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No posts yet"
          message="Start writing your first article."
          action={<Button as={Link} to="/dashboard/posts/new" size="sm"><Plus size={16} /> New post</Button>}
        />
      ) : (
        <>
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <div className="h-16 w-full shrink-0 overflow-hidden rounded-xl bg-surface-2 sm:w-24">
                  {post.cover_image ? (
                    <img src={post.cover_image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-brand-soft" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {post.status === 'PUBLISHED' ? (
                      <Badge tone="green">Published</Badge>
                    ) : (
                      <Badge tone="amber">Draft</Badge>
                    )}
                    {post.category && <span className="text-xs text-muted">{post.category.name}</span>}
                  </div>
                  <h3 className="mt-1 truncate font-semibold text-body">{post.title}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                    <span>{post.published_at ? formatDate(post.published_at) : 'Not published'}</span>
                    <span className="inline-flex items-center gap-1"><Eye size={12} /> {compactNumber(post.views_count)}</span>
                    <span className="inline-flex items-center gap-1"><Heart size={12} /> {compactNumber(post.likes_count)}</span>
                    <span className="inline-flex items-center gap-1"><MessageCircle size={12} /> {compactNumber(post.comments_count)}</span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {post.status === 'PUBLISHED' && (
                    <Button as={Link} to={`/blog/${post.slug}`} target="_blank" variant="ghost" size="sm" aria-label="View">
                      <ExternalLink size={16} />
                    </Button>
                  )}
                  <Button as={Link} to={`/dashboard/posts/${post.slug}/edit`} variant="secondary" size="sm">
                    <Pencil size={15} /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setToDelete(post)} aria-label="Delete" className="text-red-500 hover:bg-red-500/10">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Pagination count={count} page={page} pageSize={6} onChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={remove.isPending}
        title="Delete this post?"
        message={`“${toDelete?.title}” will be permanently removed. This cannot be undone.`}
      />
    </div>
  )
}
