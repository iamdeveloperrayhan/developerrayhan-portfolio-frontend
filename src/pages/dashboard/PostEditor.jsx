import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Save, Eye, Pencil, Image as ImageIcon, X, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { usePost, usePostMutations, useCategories, useTags } from '@/hooks/useBlog'
import { asList } from '@/lib/paginated'
import { apiError } from '@/lib/api'
import { usePageMeta } from '@/hooks/usePageMeta'
import { PageHeader } from '@/components/dashboard/DashUI'
import { Field, Input, Textarea, Select, Checkbox } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import Markdown from '@/components/Markdown'
import { Loading } from '@/components/ui/Spinner'

const EMPTY = {
  title: '',
  excerpt: '',
  content: '',
  category_id: '',
  tag_ids: [],
  status: 'DRAFT',
  is_featured: false,
}

export default function PostEditor() {
  const { slug } = useParams()
  const isEdit = !!slug
  const navigate = useNavigate()

  const { data: post, isLoading: loadingPost } = usePost(isEdit ? slug : null)
  const { data: categoriesData } = useCategories()
  const { data: tagsData } = useTags()
  const { create, update } = usePostMutations()

  const categories = asList(categoriesData)
  const tags = asList(tagsData)

  const [form, setForm] = useState(EMPTY)
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [removeCover, setRemoveCover] = useState(false)
  const [errors, setErrors] = useState({})
  const [tab, setTab] = useState('write')
  const [hydratedId, setHydratedId] = useState(null)

  usePageMeta(isEdit ? 'Edit post' : 'New post')

  // Hydrate the form once the post has loaded (render-phase, so the fields are
  // populated before first paint). Runs again only if the target post changes.
  if (isEdit && post && hydratedId !== post.id) {
    setHydratedId(post.id)
    setForm({
      title: post.title || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      category_id: post.category?.id || '',
      tag_ids: (post.tags || []).map((t) => t.id),
      status: post.status || 'DRAFT',
      is_featured: !!post.is_featured,
    })
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const toggleTag = (id) =>
    setForm((f) => ({
      ...f,
      tag_ids: f.tag_ids.includes(id) ? f.tag_ids.filter((t) => t !== id) : [...f.tag_ids, id],
    }))

  const onCover = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
    setRemoveCover(false)
  }

  const buildPayload = () => {
    // Use multipart only when a new cover file is attached.
    if (coverFile) {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('excerpt', form.excerpt)
      fd.append('content', form.content)
      if (form.category_id) fd.append('category_id', form.category_id)
      fd.append('status', form.status)
      fd.append('is_featured', form.is_featured)
      form.tag_ids.forEach((id) => fd.append('tag_ids', id))
      fd.append('cover_image', coverFile)
      return fd
    }
    const payload = {
      title: form.title,
      excerpt: form.excerpt,
      content: form.content,
      category_id: form.category_id || null,
      status: form.status,
      is_featured: form.is_featured,
      tag_ids: form.tag_ids,
    }
    if (removeCover) payload.cover_image = null
    return payload
  }

  const submit = (e) => {
    e.preventDefault()
    setErrors({})
    const payload = buildPayload()
    const opts = {
      onSuccess: () => {
        toast.success(isEdit ? 'Post updated' : 'Post created')
        navigate('/dashboard/posts')
      },
      onError: (err) => {
        const data = err?.response?.data
        if (data && typeof data === 'object' && !Array.isArray(data)) setErrors(data)
        toast.error(apiError(err, 'Please fix the errors and try again.'))
      },
    }
    if (isEdit) update.mutate({ slug, data: payload }, opts)
    else create.mutate(payload, opts)
  }

  const err = (k) => (Array.isArray(errors[k]) ? errors[k][0] : errors[k])
  const saving = create.isPending || update.isPending
  const existingCover = isEdit && post?.cover_image && !removeCover ? post.cover_image : null

  if (isEdit && loadingPost) return <Loading label="Loading post…" />

  return (
    <form onSubmit={submit}>
      <Link to="/dashboard/posts" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-accent">
        <ArrowLeft size={16} /> Back to posts
      </Link>

      <PageHeader title={isEdit ? 'Edit post' : 'New post'}>
        <Button type="button" variant="secondary" size="sm" onClick={() => navigate('/dashboard/posts')}>
          Cancel
        </Button>
        <Button type="submit" size="sm" loading={saving}>
          <Save size={16} /> {form.status === 'PUBLISHED' ? 'Save & publish' : 'Save draft'}
        </Button>
      </PageHeader>

      {err('detail') && (
        <p className="mb-4 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {err('detail')}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main column */}
        <div className="space-y-5">
          <div className="card p-6">
            <Field label="Title" htmlFor="title" required error={err('title')}>
              <Input id="title" value={form.title} onChange={set('title')} placeholder="An engaging title…" required />
            </Field>
            <Field label="Excerpt" htmlFor="excerpt" required error={err('excerpt')} hint="A short summary shown in listings (max 300 chars)." className="mt-5">
              <Textarea id="excerpt" rows={2} value={form.excerpt} onChange={set('excerpt')} maxLength={300} placeholder="What's this post about?" required />
            </Field>
          </div>

          <div className="card p-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="label mb-0">Content (Markdown)</span>
              <div className="flex gap-1 rounded-xl border border-line p-1">
                <button type="button" onClick={() => setTab('write')} className={clsx('inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold', tab === 'write' ? 'bg-gradient-brand text-white' : 'text-muted')}>
                  <Pencil size={13} /> Write
                </button>
                <button type="button" onClick={() => setTab('preview')} className={clsx('inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold', tab === 'preview' ? 'bg-gradient-brand text-white' : 'text-muted')}>
                  <Eye size={13} /> Preview
                </button>
              </div>
            </div>
            {tab === 'write' ? (
              <Textarea
                rows={20}
                value={form.content}
                onChange={set('content')}
                className="font-mono text-sm"
                placeholder="Write your post in Markdown…"
              />
            ) : (
              <div className="min-h-[20rem] rounded-2xl border border-line bg-surface p-5">
                {form.content ? <Markdown>{form.content}</Markdown> : <p className="text-sm text-muted">Nothing to preview yet.</p>}
              </div>
            )}
            {err('content') && <p className="mt-2 text-xs font-medium text-red-500">{err('content')}</p>}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="card p-6">
            <h3 className="mb-4 font-bold text-body">Publish</h3>
            <Field label="Status" htmlFor="status" error={err('status')}>
              <Select id="status" value={form.status} onChange={set('status')}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </Select>
            </Field>
            <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm text-body">
              <Checkbox
                checked={form.is_featured}
                onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))}
                label={<span className="inline-flex items-center gap-1"><Star size={14} /> Featured post</span>}
              />
            </label>
          </div>

          <div className="card p-6">
            <Field label="Category" htmlFor="category" required error={err('category_id')}>
              <Select id="category" value={form.category_id} onChange={set('category_id')}>
                <option value="">Select a category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </Field>

            <div className="mt-5">
              <span className="label">Tags</span>
              <div className="flex flex-wrap gap-2">
                {tags.length === 0 && <p className="text-xs text-muted">No tags yet — add them in Django admin.</p>}
                {tags.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTag(t.id)}
                    className={clsx(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      form.tag_ids.includes(t.id)
                        ? 'border-transparent bg-gradient-brand text-white'
                        : 'border-line text-muted hover:text-body'
                    )}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card p-6">
            <span className="label">Cover image</span>
            {existingCover || coverPreview ? (
              <div className="relative overflow-hidden rounded-xl border border-line">
                <img src={coverPreview || existingCover} alt="" className="aspect-[16/10] w-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setCoverFile(null)
                    setCoverPreview(null)
                    if (existingCover) setRemoveCover(true)
                  }}
                  className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-slate-950/60 text-white hover:bg-red-500"
                  aria-label="Remove cover"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-line py-8 text-center text-muted hover:border-accent/40 hover:text-accent">
                <ImageIcon size={24} />
                <span className="text-sm font-medium">Upload a cover</span>
                <input type="file" accept="image/*" onChange={onCover} className="hidden" />
              </label>
            )}
            {err('cover_image') && <p className="mt-2 text-xs font-medium text-red-500">{err('cover_image')}</p>}
          </div>
        </div>
      </div>
    </form>
  )
}
