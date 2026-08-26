import { useState } from 'react'
import { Send } from 'lucide-react'
import { Field, Input, Textarea } from './ui/Form'
import Button from './ui/Button'

const EMPTY = { name: '', email: '', website: '', content: '' }

// Reusable comment / reply form. Manages its own local state; the parent owns
// submission and the "held for moderation" messaging.
export default function CommentForm({ onSubmit, isPending, compact, onCancel, errors = {} }) {
  const [form, setForm] = useState(EMPTY)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    onSubmit(form, () => setForm(EMPTY))
  }

  return (
    <form onSubmit={submit} className="card p-5">
      <div className={compact ? 'space-y-4' : 'grid gap-4 sm:grid-cols-2'}>
        <Field label="Name" htmlFor="c-name" required error={errors.name}>
          <Input id="c-name" value={form.name} onChange={set('name')} required placeholder="Your name" />
        </Field>
        <Field label="Email" htmlFor="c-email" required error={errors.email} hint="Never shown publicly.">
          <Input id="c-email" type="email" value={form.email} onChange={set('email')} required placeholder="you@example.com" />
        </Field>
        {!compact && (
          <Field label="Website" htmlFor="c-website" className="sm:col-span-2" error={errors.website}>
            <Input id="c-website" type="url" value={form.website} onChange={set('website')} placeholder="https://…" />
          </Field>
        )}
        <Field label="Comment" htmlFor="c-content" required error={errors.content} className={compact ? '' : 'sm:col-span-2'}>
          <Textarea
            id="c-content"
            rows={compact ? 3 : 4}
            value={form.content}
            onChange={set('content')}
            required
            placeholder="Share your thoughts…"
          />
        </Field>
      </div>
      <div className="mt-4 flex items-center justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="sm" loading={isPending}>
          <Send size={15} /> {compact ? 'Reply' : 'Post comment'}
        </Button>
      </div>
    </form>
  )
}
