import { Reply, Globe } from 'lucide-react'
import Avatar from './ui/Avatar'
import { relativeTime } from '@/lib/format'

function CommentItem({ comment, isReply, replyingTo, onReply, replyForm }) {
  return (
    <li className={isReply ? 'ml-6 sm:ml-12' : ''}>
      <div className="card p-5">
        <div className="flex items-start gap-3">
          <Avatar name={comment.name} size={40} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="font-semibold text-body">{comment.name}</span>
              {comment.website && (
                <a
                  href={comment.website}
                  target="_blank"
                  rel="noreferrer noopener nofollow"
                  className="inline-flex items-center gap-1 text-xs text-muted hover:text-accent"
                >
                  <Globe size={12} /> Website
                </a>
              )}
              <span className="text-xs text-muted">· {relativeTime(comment.created_at)}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-body/90">{comment.content}</p>
            {!isReply && onReply && (
              <button
                onClick={() => onReply(replyingTo === comment.id ? null : comment.id)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
              >
                <Reply size={13} /> {replyingTo === comment.id ? 'Cancel' : 'Reply'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inline reply form for this comment */}
      {!isReply && replyingTo === comment.id && replyForm && (
        <div className="ml-6 mt-3 sm:ml-12">{replyForm}</div>
      )}

      {/* Nested replies (one level deep) */}
      {comment.replies?.length > 0 && (
        <ul className="mt-3 space-y-3">
          {comment.replies.map((r) => (
            <CommentItem key={r.id} comment={r} isReply />
          ))}
        </ul>
      )}
    </li>
  )
}

export default function CommentThread({ comments, replyingTo, onReply, replyForm }) {
  return (
    <ul className="space-y-4">
      {comments.map((c) => (
        <CommentItem
          key={c.id}
          comment={c}
          replyingTo={replyingTo}
          onReply={onReply}
          replyForm={replyForm}
        />
      ))}
    </ul>
  )
}
