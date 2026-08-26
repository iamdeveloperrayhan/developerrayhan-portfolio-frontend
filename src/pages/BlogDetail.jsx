import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Heart,
  Eye,
  Clock,
  Calendar,
  MessageCircle,
  User,
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { usePost, useLikePost, useComments, useAddComment } from '@/hooks/useBlog'
import { apiError } from '@/lib/api'
import { formatDate, compactNumber } from '@/lib/format'
import { usePageMeta } from '@/hooks/usePageMeta'
import Markdown from '@/components/Markdown'
import CommentThread from '@/components/CommentThread'
import CommentForm from '@/components/CommentForm'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Loading } from '@/components/ui/Spinner'
import { ErrorState, EmptyState } from '@/components/ui/States'

export default function BlogDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [replyingTo, setReplyingTo] = useState(null)

  const { data: post, isLoading, isError, refetch } = usePost(slug)
  const { data: comments = [], isLoading: commentsLoading } = useComments(slug)
  const like = useLikePost(slug)
  const addComment = useAddComment(slug)

  usePageMeta(post?.title, post?.excerpt)

  if (isLoading) return <div className="container-page py-16"><Loading label="Loading article…" /></div>
  if (isError || !post)
    return (
      <div className="container-page py-16">
        <ErrorState message="This article couldn't be found." onRetry={refetch} />
        <div className="mt-6 text-center">
          <Button as={Link} to="/blog" variant="secondary">Back to blog</Button>
        </div>
      </div>
    )

  const submitComment = (form, reset, parent = null) => {
    addComment.mutate(
      { ...form, parent },
      {
        onSuccess: (res) => {
          toast.success(res?.detail || 'Your comment is awaiting approval.')
          reset()
          setReplyingTo(null)
        },
        onError: (err) => toast.error(apiError(err, 'Could not post your comment.')),
      }
    )
  }

  return (
    <article className="py-16">
      <div className="container-page max-w-3xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-accent"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Header */}
        <header>
          {post.category && (
            <Link to={`/blog?category=${post.category.slug}`}>
              <Badge tone="accent">{post.category.name}</Badge>
            </Link>
          )}
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight text-body sm:text-5xl">
            {post.title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5"><User size={15} /> {post.author}</span>
            <span className="inline-flex items-center gap-1.5"><Calendar size={15} /> {formatDate(post.published_at || post.created_at)}</span>
            <span className="inline-flex items-center gap-1.5"><Clock size={15} /> {post.reading_time} min read</span>
            <span className="inline-flex items-center gap-1.5"><Eye size={15} /> {compactNumber(post.views_count)} views</span>
          </div>
        </header>

        {post.cover_image && (
          <div className="mt-8 overflow-hidden rounded-3xl border border-line">
            <img src={post.cover_image} alt={post.title} className="w-full object-cover" />
          </div>
        )}

        {/* Content */}
        <div className="mt-10">
          <Markdown>{post.content}</Markdown>
        </div>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <Link key={t.id} to={`/blog?tag=${t.slug}`} className="badge hover:border-accent/40 hover:text-accent">
                #{t.name}
              </Link>
            ))}
          </div>
        )}

        {/* Like bar */}
        <div className="mt-10 flex items-center justify-between border-y border-line py-5">
          <button
            onClick={() => like.mutate()}
            disabled={like.isPending}
            className={clsx(
              'group inline-flex items-center gap-2.5 rounded-2xl border px-5 py-2.5 text-sm font-semibold transition-all',
              post.is_liked
                ? 'border-transparent bg-accent-2/10 text-accent-2'
                : 'border-line text-muted hover:border-accent-2/40 hover:text-accent-2'
            )}
            aria-pressed={post.is_liked}
          >
            <Heart
              size={18}
              className={clsx('transition-transform group-active:scale-125', post.is_liked && 'fill-current')}
            />
            {post.is_liked ? 'Liked' : 'Like'}
            <span className="tabular-nums">· {compactNumber(post.likes_count)}</span>
          </button>
          <span className="inline-flex items-center gap-1.5 text-sm text-muted">
            <MessageCircle size={16} /> {compactNumber(post.comments_count)} comments
          </span>
        </div>
      </div>

      {/* Related posts */}
      {post.related_posts?.length > 0 && (
        <div className="container-page mt-14 max-w-3xl">
          <h2 className="mb-5 text-xl font-bold text-body">Related reading</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {post.related_posts.map((r) => (
              <Link key={r.id} to={`/blog/${r.slug}`} className="card card-hover p-4">
                <h3 className="line-clamp-2 font-semibold text-body">{r.title}</h3>
                <p className="mt-1.5 text-xs text-muted">{r.reading_time} min read</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <section className="container-page mt-16 max-w-3xl">
        <h2 className="mb-6 text-2xl font-bold text-body">
          Comments {post.comments_count > 0 && <span className="text-muted">({post.comments_count})</span>}
        </h2>

        {commentsLoading ? (
          <Loading />
        ) : comments.length > 0 ? (
          <CommentThread
            comments={comments}
            replyingTo={replyingTo}
            onReply={setReplyingTo}
            replyForm={
              <CommentForm
                compact
                isPending={addComment.isPending}
                onCancel={() => setReplyingTo(null)}
                onSubmit={(form, reset) => submitComment(form, reset, replyingTo)}
              />
            }
          />
        ) : (
          <EmptyState
            icon={MessageCircle}
            title="No comments yet"
            message="Be the first to share your thoughts."
          />
        )}

        {/* New top-level comment */}
        <div className="mt-10">
          <h3 className="mb-4 text-lg font-bold text-body">Leave a comment</h3>
          <p className="mb-4 text-sm text-muted">
            Comments are reviewed before they appear. Your email is never published.
          </p>
          <CommentForm
            isPending={addComment.isPending}
            onSubmit={(form, reset) => submitComment(form, reset, null)}
          />
        </div>
      </section>
    </article>
  )
}
