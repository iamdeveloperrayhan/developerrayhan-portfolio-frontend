import { Link } from 'react-router-dom'
import { Eye, Heart, MessageCircle, Clock, Star } from 'lucide-react'
import { formatDate, compactNumber } from '@/lib/format'
import Badge from './ui/Badge'

// Card for a blog post (PostList shape from the API).
export default function PostCard({ post }) {
  const to = `/blog/${post.slug}`
  return (
    <article className="card card-hover group flex flex-col overflow-hidden">
      <Link to={to} className="relative block overflow-hidden">
        <div className="aspect-[16/10] w-full overflow-hidden bg-surface-2">
          {post.cover_image ? (
            <img
              src={post.cover_image}
              alt={post.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-brand-soft" />
          )}
        </div>
        <div className="absolute left-3 top-3 flex gap-2">
          {post.category && <Badge tone="accent">{post.category.name}</Badge>}
          {post.is_featured && (
            <Badge tone="amber">
              <Star size={12} /> Featured
            </Badge>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-3 text-xs text-muted">
          <span>{formatDate(post.published_at || post.created_at)}</span>
          <span className="inline-flex items-center gap-1">
            <Clock size={13} /> {post.reading_time} min read
          </span>
        </div>

        <h3 className="text-lg font-bold tracking-tight text-body">
          <Link to={to} className="hover:text-accent">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted">{post.excerpt}</p>

        <div className="mt-4 flex items-center gap-4 border-t border-line pt-4 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5" title="Views">
            <Eye size={14} /> {compactNumber(post.views_count)}
          </span>
          <span className="inline-flex items-center gap-1.5" title="Likes">
            <Heart size={14} /> {compactNumber(post.likes_count)}
          </span>
          <span className="inline-flex items-center gap-1.5" title="Comments">
            <MessageCircle size={14} /> {compactNumber(post.comments_count)}
          </span>
          <Link to={to} className="ml-auto font-semibold text-accent link-underline">
            Read
          </Link>
        </div>
      </div>
    </article>
  )
}
